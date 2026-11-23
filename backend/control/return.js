const express = require("express");
const router = express.Router();
const Return = require("../model/return");
const Order = require("../model/Order");
const SubOrder = require("../model/SubOrder");
const Shop = require("../model/Shop");
const Notification = require("../model/notification");
const LedgerEntry = require("../model/ledgerEntry");
const ActivityLog = require("../model/activityLog");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { notifyUser } = require("../socket");

// 1. Customer Request Return (Simple returns without dispute)
router.post(
  "/request-return",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        orderId,
        subOrderId,
        shopId,
        items,
        returnMethod,
        refundAmount,
        refundMethod,
      } = req.body;

      if (!orderId || !subOrderId || !items || !Array.isArray(items) || items.length === 0) {
        return next(
          new ErrorHandler("Order ID, SubOrder ID, and items are required!", 400)
        );
      }

      // Verify suborder exists and belongs to customer
      const subOrder = await SubOrder.findById(subOrderId);
      if (!subOrder) {
        return next(new ErrorHandler("Sub-order not found!", 404));
      }

      // Check if return window is still open
      const deliveredAt = subOrder.milestones?.deliveredAt || subOrder.deliveredAt;
      if (deliveredAt) {
        const daysSinceDelivery = (Date.now() - new Date(deliveredAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDelivery > 15) {
          return next(
            new ErrorHandler("Return window has expired (15 days after delivery).", 400)
          );
        }
      }

      // Calculate refund amount from items
      const calculatedRefund =
        refundAmount ||
        items.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.qty || 1), 0);

      const newReturn = await Return.create({
        parentOrder: orderId,
        subOrder: subOrderId,
        customer: req.user._id,
        shop: shopId || subOrder.shop || subOrder.shopId,
        items,
        returnMethod: returnMethod || "Ship back to seller",
        refundAmount: calculatedRefund,
        refundMethod: refundMethod || "wallet_credit",
        sellerResponseDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        autoApproveAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // auto-approve in 5 days
        messages: [
          {
            sender: "Customer",
            senderId: req.user._id.toString(),
            senderName: req.user.name,
            message: items.map((i) => `${i.productName}: ${i.reason}`).join("; "),
            createdAt: new Date(),
          },
        ],
      });

      // Notify merchant
      const targetShopId = shopId || subOrder.shop || subOrder.shopId;
      try {
        await Notification.create({
          recipient: targetShopId,
          recipientType: "seller",
          title: "New Return Request",
          message: `Customer ${req.user.name} has requested a return for order #${subOrder.subOrderNumber}. Please respond within 3 days.`,
          type: "order_update",
          referenceId: newReturn._id.toString(),
          referenceUrl: `/dashboard-returns`,
          priority: "high",
        });
        notifyUser(targetShopId.toString(), "returnNotification", {
          type: "NEW_RETURN_REQUEST",
          returnNumber: newReturn.returnNumber,
          customerName: req.user.name,
        });
      } catch (e) {}

      // Update buyer stats
      const User = require("../model/user");
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { "buyerStats.returnsRequested": 1 },
      }).catch(() => {});

      res.status(201).json({
        success: true,
        return: newReturn,
        message: "Return request submitted! The merchant will respond within 3 days.",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Customer View Their Returns
router.get(
  "/my-returns",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const returns = await Return.find({ customer: req.user._id })
        .populate("shop", "name avatar")
        .populate("subOrder", "subOrderNumber")
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, returns });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Seller View Returns for Their Shop
router.get(
  "/seller-returns",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const returns = await Return.find({ shop: req.seller._id })
        .populate("customer", "name email phoneNumber")
        .populate("subOrder", "subOrderNumber items")
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, returns });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Seller Approve / Reject Return
router.put(
  "/seller-respond/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { accepted, reason, partialRefundAmount, message } = req.body;
      const returnDoc = await Return.findById(req.params.id);

      if (!returnDoc) {
        return next(new ErrorHandler("Return not found!", 404));
      }
      if (returnDoc.shop.toString() !== req.seller._id.toString()) {
        return next(new ErrorHandler("Unauthorized!", 403));
      }

      returnDoc.sellerResponse = {
        accepted: Boolean(accepted),
        reason: reason || "",
        respondedAt: new Date(),
        counterOffer: partialRefundAmount
          ? { partialRefundAmount: Number(partialRefundAmount), message: message || "" }
          : undefined,
      };

      if (accepted) {
        returnDoc.status = "Seller Approved";
        returnDoc.returnShipDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days to ship back

        if (returnDoc.returnMethod === "No return needed (refund only)") {
          returnDoc.status = "Refund Processing";
        }
      } else {
        returnDoc.status = "Seller Rejected";
      }

      returnDoc.messages.push({
        sender: "Merchant",
        senderId: req.seller._id.toString(),
        senderName: req.seller.name,
        message: accepted
          ? `Return approved. ${returnDoc.returnMethod === "No return needed (refund only)" ? "Refund will be processed." : "Please ship the item back."}`
          : `Return rejected: ${reason || "No reason provided"}`,
        createdAt: new Date(),
      });

      await returnDoc.save();

      // Notify customer
      try {
        await Notification.create({
          recipient: returnDoc.customer,
          recipientType: "user",
          title: accepted ? "Return Approved ✅" : "Return Rejected ❌",
          message: accepted
            ? `Your return for order has been approved. ${returnDoc.returnMethod === "No return needed (refund only)" ? "Refund is being processed." : "Please ship the item back within 7 days."}`
            : `Your return was rejected: ${reason || "Contact support for details."}`,
          type: "return_status_update",
          referenceId: returnDoc._id.toString(),
          priority: "high",
        });
      } catch (e) {}

      res.status(200).json({
        success: true,
        return: returnDoc,
        message: accepted ? "Return approved!" : "Return rejected.",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Seller Confirm Item Received & Process Refund
router.put(
  "/confirm-received/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const returnDoc = await Return.findById(req.params.id);
      if (!returnDoc) {
        return next(new ErrorHandler("Return not found!", 404));
      }

      returnDoc.status = "Refund Processing";
      returnDoc.messages.push({
        sender: "System",
        message: "Item received by seller. Refund is being processed.",
        createdAt: new Date(),
      });

      await returnDoc.save();

      // Process refund to wallet
      const Wallet = require("../model/wallet");
      if (returnDoc.refundMethod === "wallet_credit") {
        const wallet = await Wallet.findOne({ user: returnDoc.customer });
        if (wallet) {
          wallet.balance += returnDoc.refundAmount;
          wallet.transactions.push({
            transactionType: "refund_credit",
            amount: returnDoc.refundAmount,
            referenceId: returnDoc.returnNumber,
            description: `Refund for return #${returnDoc.returnNumber}`,
            status: "completed",
          });
          await wallet.save();
        }
      }

      // Deduct from shop balance
      const shop = await Shop.findById(returnDoc.shop);
      if (shop) {
        const prevBalance = shop.availableBalance || 0;
        shop.availableBalance = Math.max(0, prevBalance - returnDoc.refundAmount);
        await shop.save();

        await LedgerEntry.create({
          shop: shop._id,
          shopId: shop._id.toString(),
          entryType: "REFUND_DEDUCTION",
          amount: -returnDoc.refundAmount,
          balanceType: "availableBalance",
          balanceBefore: prevBalance,
          balanceAfter: shop.availableBalance,
          subOrder: returnDoc.subOrder,
          referenceCode: returnDoc.returnNumber,
          description: `Refund for return #${returnDoc.returnNumber}`,
        }).catch(() => {});
      }

      returnDoc.status = "Refund Completed";
      await returnDoc.save();

      // Notify customer
      try {
        await Notification.create({
          recipient: returnDoc.customer,
          recipientType: "user",
          title: "Refund Processed! 💰",
          message: `Your refund of ETB ${returnDoc.refundAmount} for return #${returnDoc.returnNumber} has been credited to your wallet.`,
          type: "wallet_credit",
          referenceId: returnDoc._id.toString(),
          priority: "high",
        });
      } catch (e) {}

      res.status(200).json({
        success: true,
        return: returnDoc,
        message: "Refund processed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 6. Customer Escalate Rejected Return to Dispute
router.post(
  "/escalate-to-dispute/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const returnDoc = await Return.findById(req.params.id);
      if (!returnDoc) {
        return next(new ErrorHandler("Return not found!", 404));
      }
      if (returnDoc.status !== "Seller Rejected") {
        return next(new ErrorHandler("Only rejected returns can be escalated!", 400));
      }

      const Dispute = require("../model/dispute");
      const dispute = await Dispute.create({
        parentOrder: returnDoc.parentOrder,
        subOrder: returnDoc.subOrder,
        customer: returnDoc.customer,
        shop: returnDoc.shop,
        reason: returnDoc.items[0]?.reason || "Other",
        details: `Escalated from return #${returnDoc.returnNumber}. ${returnDoc.items.map((i) => `${i.productName}: ${i.reason}`).join("; ")}`,
        requestedResolution: "Full Refund",
        linkedReturn: returnDoc._id,
        escalationLevel: "Platform Review",
        deadlines: {
          sellerMustRespondBy: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          platformDecisionBy: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
        messages: [
          {
            sender: "Customer",
            senderId: returnDoc.customer.toString(),
            message: `Return #${returnDoc.returnNumber} was rejected by seller. Requesting platform intervention.`,
            createdAt: new Date(),
          },
        ],
      });

      returnDoc.status = "Escalated to Dispute";
      await returnDoc.save();

      res.status(201).json({
        success: true,
        dispute,
        message: "Return escalated to dispute. Platform will review within 15 days.",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 7. Admin View All Returns
router.get(
  "/admin-all-returns",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const returns = await Return.find()
        .populate("customer", "name email")
        .populate("shop", "name email")
        .populate("subOrder", "subOrderNumber")
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, returns });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 8. Auto-approve expired returns (seller didn't respond)
router.post(
  "/process-auto-approvals",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const expiredReturns = await Return.find({
        status: "Requested",
        autoApproveAt: { $lte: new Date() },
      });

      let count = 0;
      for (const ret of expiredReturns) {
        ret.status = "Seller Approved";
        ret.sellerResponse = {
          accepted: true,
          reason: "Auto-approved (seller did not respond within deadline)",
          respondedAt: new Date(),
        };
        ret.messages.push({
          sender: "System",
          message: "Return auto-approved because seller did not respond within the deadline.",
          createdAt: new Date(),
        });
        await ret.save();
        count++;
      }

      res.status(200).json({
        success: true,
        autoApprovedCount: count,
        message: `Auto-approved ${count} expired return(s).`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
