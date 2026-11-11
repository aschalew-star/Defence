const express = require("express");
const router = express.Router();
const Dispute = require("../model/dispute");
const Order = require("../model/Order");
const SubOrder = require("../model/SubOrder");
const Shop = require("../model/Shop");
const ActivityLog = require("../model/activityLog");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");

// 1. Customer Raise Dispute for an Order or SubOrder
router.post(
  "/raise-dispute",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { orderId, subOrderId, shopId, reason, details, requestedResolution, evidence } =
        req.body;

      if (!orderId || !reason || !details) {
        return next(
          new ErrorHandler("Order ID, dispute reason, and details are required!", 400)
        );
      }

      // Check order
      const order = await Order.findById(orderId);
      if (!order) {
        return next(new ErrorHandler("Order not found!", 404));
      }

      // Upload evidence photos if any
      const evidenceLinks = [];
      if (evidence && Array.isArray(evidence)) {
        for (const item of evidence) {
          if (typeof item === "string" && item.startsWith("data:image")) {
            const upload = await cloudinary.v2.uploader.upload(item, {
              folder: "disputes",
              width: 1000,
            });
            evidenceLinks.push({
              public_id: upload.public_id,
              url: upload.secure_url,
            });
          }
        }
      }

      const dispute = await Dispute.create({
        parentOrder: order._id,
        subOrder: subOrderId || null,
        customer: req.user._id,
        shop: shopId || order.cart?.[0]?.shopId || order.cart?.[0]?.shop?._id,
        reason,
        details,
        requestedResolution: requestedResolution || "Full Refund",
        evidence: evidenceLinks,
        messages: [
          {
            sender: "Customer",
            senderId: req.user._id.toString(),
            senderName: req.user.name,
            message: details,
            attachments: evidenceLinks,
            createdAt: new Date(),
          },
        ],
      });

      // Update order status & freeze escrow immediately
      if (subOrderId) {
        await SubOrder.findByIdAndUpdate(subOrderId, {
          status: "Disputed",
          "financials.payoutStatus": "Disputed Frozen",
        });
      }
      order.status = "Disputed";
      if (order.financials) {
        order.financials.payoutStatus = "Disputed Frozen";
      }
      await order.save();

      res.status(201).json({
        success: true,
        dispute,
        message: "Dispute opened successfully. The merchant has been notified.",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Merchant View Disputes
router.get(
  "/seller-disputes",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const disputes = await Dispute.find({ shop: req.seller._id })
        .populate("customer", "name email phoneNumber")
        .populate("parentOrder", "orderNumber totalPrice")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        disputes,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Merchant Respond to Dispute
router.put(
  "/seller-respond/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { message } = req.body;
      const dispute = await Dispute.findById(req.params.id);

      if (!dispute) {
        return next(new ErrorHandler("Dispute not found!", 404));
      }

      if (dispute.shop.toString() !== req.seller._id.toString()) {
        return next(new ErrorHandler("Unauthorized dispute response!", 403));
      }

      dispute.messages.push({
        sender: "Merchant",
        senderId: req.seller._id.toString(),
        senderName: req.seller.name,
        message,
        createdAt: new Date(),
      });

      dispute.merchantResponse = {
        response: message,
        respondedAt: new Date(),
      };
      dispute.status = "Merchant Responded";

      await dispute.save();

      res.status(200).json({
        success: true,
        dispute,
        message: "Response submitted to dispute!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Admin View All Disputes
router.get(
  "/admin-all-disputes",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const disputes = await Dispute.find()
        .populate("customer", "name email phoneNumber")
        .populate("shop", "name email phoneNumber availableBalance")
        .populate("parentOrder", "orderNumber totalPrice")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        disputes,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Admin Resolve Dispute (Arbitration & Balance Adjustment)
router.put(
  "/admin-resolve/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { decision, refundAmount, note } = req.body;
      const dispute = await Dispute.findById(req.params.id);

      if (!dispute) {
        return next(new ErrorHandler("Dispute not found!", 404));
      }

      dispute.adminDecision = {
        decision,
        refundAmount: Number(refundAmount) || 0,
        note: note || "",
        decidedAt: new Date(),
        decidedBy: req.user._id,
      };

      if (decision === "Refund Approved") {
        dispute.status = "Resolved - Refunded";

        // Deduct from merchant balance
        if (refundAmount && Number(refundAmount) > 0) {
          await Shop.findByIdAndUpdate(dispute.shop, {
            $inc: { availableBalance: -Number(refundAmount) },
          });
        }

        // Update SubOrder/Order status
        if (dispute.subOrder) {
          await SubOrder.findByIdAndUpdate(dispute.subOrder, {
            status: "Refund Success",
          });
        }
        await Order.findByIdAndUpdate(dispute.parentOrder, {
          status: "Refund Success",
        });
      } else {
        dispute.status = "Resolved - Rejected";
      }

      await dispute.save();

      // Log arbitration action
      await ActivityLog.create({
        actorId: req.user._id,
        actorType: "Admin",
        actorName: req.user.name,
        action: "DISPUTE_RESOLVED",
        targetId: dispute._id,
        targetType: "Dispute",
        details: { decision, refundAmount },
      }).catch(() => {});

      res.status(200).json({
        success: true,
        dispute,
        message: `Dispute resolved: ${decision}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

