const express = require("express");
const axios = require("axios");
const Order = require("../model/Order");
const SubOrder = require("../model/SubOrder");
const Shop = require("../model/Shop");
const LedgerEntry = require("../model/ledgerEntry");
const ActivityLog = require("../model/activityLog");

const router = express.Router();

const CHAPA_SECRET_KEY =
  process.env.CHAPA_SECRET_KEY ||
  "CHASECK_TEST-1eSMtwQD3CWqw8SiOJTo73gw1GpD2ZwP";
const CHAPA_BASE_URL = "https://api.chapa.co/v1/transaction";

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
  try {
    const { amount, currency, email, first_name, last_name, tx_ref, return_url } =
      req.body;

    const response = await axios.post(
      `${CHAPA_BASE_URL}/initialize`,
      {
        amount,
        currency: currency || "ETB",
        email: email || "customer@mep.et",
        first_name,
        last_name,
        tx_ref,
        return_url,
      },
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || "Payment initialization failed with payment gateway",
    });
  }
});

// Webhook to handle payment notifications from Chapa
router.post("/success", async (req, res) => {
  try {
    const event = req.body;

    if (event.status === "success" && event.tx_ref) {
      await handleSuccessfulPayment(event.tx_ref, event.id || event.reference);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Payment webhook error:", err.message);
    res.sendStatus(200);
  }
});

// Verify Payment
router.post("/verify", async (req, res) => {
  const { tx_ref } = req.body;

  if (!tx_ref) {
    return res.status(400).json({ status: "error", message: "Transaction reference is required" });
  }

  try {
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
        },
      }
    );

    const chapaData = response?.data?.data;

    if (!chapaData) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid transaction data from payment gateway" });
    }

    if (chapaData.status === "success") {
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
