const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const Order = require("../model/Order");
const SubOrder = require("../model/SubOrder");
const Shop = require("../model/Shop");
const LedgerEntry = require("../model/ledgerEntry");
const ActivityLog = require("../model/activityLog");
const eventBus = require("../services/eventBus");

const router = express.Router();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_WEBHOOK_SECRET = process.env.CHAPA_WEBHOOK_SECRET || CHAPA_SECRET_KEY;
const CHAPA_BASE_URL = "https://api.chapa.co/v1/transaction";

// In-memory processed transaction cache for high-scale idempotency
const processedTransactions = new Set();

// Mask sensitive account/phone details for PCI-DSS & NBE compliance
const maskPaymentDetails = (str) => {
  if (!str || typeof str !== "string") return "";
  if (str.length <= 4) return "****";
  return str.slice(0, 3) + "****" + str.slice(-4);
};

const verifyChapaTransaction = (txRef) =>
  axios.get(`${CHAPA_BASE_URL}/verify/${encodeURIComponent(txRef)}`, {
    headers: {
      Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
    },
  });

// Helper: Handle Payment Confirmation for Orders and SubOrders
const handleSuccessfulPayment = async (tx_ref, chapaId) => {
  // Find orders with this transaction reference
  const orders = await Order.find({
    $or: [{ "paymentInfo.tx_ref": tx_ref }, { "paymentInfo.id": tx_ref }],
  });

  for (const order of orders) {
    // Idempotency: skip if already succeeded
    if (order.paymentInfo && order.paymentInfo.status === "Succeeded") {
      continue;
    }

    order.paymentInfo.status = "Succeeded";
    if (chapaId) order.paymentInfo.id = chapaId;
    order.paidAt = new Date();
    await order.save();

    // Update all matching SubOrders for merchants
    const subOrders = await SubOrder.find({
      $or: [
        { parentOrder: order._id },
        { "paymentInfo.tx_ref": tx_ref },
      ],
    });

    for (const subOrder of subOrders) {
      if (subOrder.paymentInfo.status !== "Succeeded") {
        subOrder.paymentInfo.status = "Succeeded";
        subOrder.paidAt = new Date();
        if (!subOrder.milestones) subOrder.milestones = {};
        subOrder.milestones.confirmedAt = new Date();
        await subOrder.save();

        // Create an immutable ledger entry for each merchant
        const seller = await Shop.findById(subOrder.shopId || subOrder.shop);
        if (seller) {
          const earnings = subOrder.financials?.merchantNetEarnings || subOrder.subTotal * 0.9;
          await LedgerEntry.create({
            shop: seller._id,
            shopId: seller._id.toString(),
            entryType: "ESCROW_HOLD",
            amount: earnings,
            balanceType: "pendingBalance",
            balanceBefore: seller.pendingBalance - earnings,
            balanceAfter: seller.pendingBalance,
            parentOrder: order._id,
            subOrder: subOrder._id,
            referenceCode: tx_ref,
            description: `Escrow hold for Order #${order.orderNumber} (Sub-Order #${subOrder.subOrderNumber})`,
            metadata: {
              subTotal: subOrder.subTotal,
              platformFee: subOrder.financials?.platformFeeAmount,
            },
          }).catch(() => {});
        }
      }
    }

    // Activity log
    await ActivityLog.create({
      actorId: order.userRef || null,
      actorType: "User",
      actorName: order.user?.name || "Customer",
      action: "PAYMENT_SUCCEEDED",
      targetId: order._id,
      targetType: "Order",
      details: { tx_ref, amount: order.totalPrice, chapaId },
    }).catch(() => {});

    // Asynchronously dispatch multi-channel notifications (In-App, Email, SMS)
    eventBus.publish("PAYMENT_SUCCESS", {
      order,
      subOrders,
      tx_ref,
      chapaId,
    });
  }
};

// Validate request body
const validateRequestBody = (req, res, next) => {
  const { amount, currency, first_name, last_name, tx_ref, return_url } =
    req.body;

  if (
    !amount ||
    !currency ||
    !first_name ||
    !last_name ||
    !tx_ref ||
    !return_url
  ) {
    return res.status(400).json({ error: "All required payment fields must be provided" });
  }

  next();
};

// Check payment gateway status
router.get("/config", (req, res) => {
  res.status(200).json({
    status: "ok",
    gateway: "Chapa Ethiopia",
    configured: Boolean(CHAPA_SECRET_KEY),
    supportedMethods: ["Telebirr", "CBE Birr", "Awash Bank", "Bank of Abyssinia", "Debit/Credit Card"],
  });
});

// Endpoint to create a payment session (Chapa Initialize)
router.post("/init", validateRequestBody, async (req, res) => {
  if (!CHAPA_SECRET_KEY) {
    return res.status(503).json({ error: "Payment gateway is not configured." });
  }

  try {
    const {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref,
      return_url,
      customization,
    } = req.body;

    // Chapa Strict Validation Rules:
    // 1. customization.title MUST NOT exceed 16 characters.
    // 2. customization.description may ONLY contain letters, numbers, hyphens, underscores, spaces, and dots.
    let sanitizedTitle = "MEP Crafts";
    let sanitizedDesc = "Payment for Ethiopian artisan craft items.";

    if (customization?.title) {
      sanitizedTitle = String(customization.title)
        .replace(/[^a-zA-Z0-9\s\-_]/g, "")
        .trim()
        .slice(0, 16);
      if (!sanitizedTitle) sanitizedTitle = "MEP Crafts";
    }

    if (customization?.description) {
      sanitizedDesc = String(customization.description)
        .replace(/[^a-zA-Z0-9\s\-_\.]/g, "")
        .trim();
      if (!sanitizedDesc) sanitizedDesc = "Payment for Ethiopian artisan craft items.";
    }

    const payload = {
      amount,
      currency: currency || "ETB",
      email: email || "customer@mep.et",
      first_name,
      last_name,
      tx_ref,
      return_url,
      customization: {
        title: sanitizedTitle,
        description: sanitizedDesc,
      },
    };

    if (phone_number) {
      payload.phone_number = String(phone_number).trim();
    }

    const response = await axios.post(`${CHAPA_BASE_URL}/initialize`, payload, {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || "Payment initialization failed with payment gateway",
    });
  }
});

// Webhook to handle payment notifications from Chapa (HMAC-SHA256 Protected & Idempotent)
router.post("/success", async (req, res) => {
  try {
    const event = req.body;
    const txRef = event?.tx_ref || event?.data?.tx_ref;

    if (!CHAPA_SECRET_KEY) {
      return res.status(503).json({ error: "Payment gateway is not configured." });
    }

    if (!txRef) {
      return res.status(400).json({ error: "Transaction reference is required." });
    }

    // Enterprise Webhook Cryptographic Signature Verification
    const signature = req.headers["x-chapa-signature"] || req.headers["chapa-signature"];
    if (signature && CHAPA_WEBHOOK_SECRET) {
      const expectedSignature = crypto
        .createHmac("sha256", CHAPA_WEBHOOK_SECRET)
        .update(JSON.stringify(req.body))
        .digest("hex");

      if (signature !== expectedSignature) {
        console.warn(`⚠️ Webhook signature mismatch for tx_ref: ${txRef}`);
        return res.status(401).json({ error: "Invalid webhook cryptographic signature" });
      }
    }

    // Idempotency: skip re-processing if already handled in memory
    if (processedTransactions.has(txRef)) {
      return res.status(200).json({ message: "Transaction already processed" });
    }

    const response = await verifyChapaTransaction(txRef);
    const chapaData = response?.data?.data;
    if (chapaData?.status !== "success" || chapaData.tx_ref !== txRef) {
      return res.status(400).json({ error: "Payment could not be verified." });
    }

    processedTransactions.add(txRef);
    // Keep memory cache bound
    if (processedTransactions.size > 10000) {
      const oldest = Array.from(processedTransactions).slice(0, 1000);
      oldest.forEach((t) => processedTransactions.delete(t));
    }

    await handleSuccessfulPayment(txRef, chapaData.reference || chapaData.id);
    return res.sendStatus(200);
  } catch (err) {
    console.error("Payment webhook error:", err.message);
    return res.status(500).json({ error: "Payment notification verification failed." });
  }
});

// Verify Payment
router.post("/verify", async (req, res) => {
  const { tx_ref } = req.body;

  if (!tx_ref) {
    return res.status(400).json({ status: "error", message: "Transaction reference is required" });
  }
  if (!CHAPA_SECRET_KEY) {
    return res.status(503).json({ status: "error", message: "Payment gateway is not configured." });
  }

  try {
    const response = await verifyChapaTransaction(tx_ref);

    const chapaData = response?.data?.data;

    if (!chapaData) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid transaction data from payment gateway" });
    }

    if (chapaData.status === "success" && chapaData.tx_ref === tx_ref) {
      // Mark as processed in idempotency set
      processedTransactions.add(tx_ref);

      // Complete confirmation across both master order and merchant sub-orders
      await handleSuccessfulPayment(tx_ref, chapaData.reference || chapaData.id);

      return res.status(200).json({
        status: "success",
        ref_id: chapaData.tx_ref,
        data: chapaData,
      });
    } else {
      return res.status(400).json({
        status: "failed",
        message: "Payment transaction was not successful",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.response?.data?.message || "Payment verification failed",
    });
  }
});

module.exports = router;
