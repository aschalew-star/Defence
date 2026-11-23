const mongoose = require("mongoose");

const buyerProtectionClaimSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      default: function () {
        return (
          "BPC-" +
          Date.now().toString().slice(-6) +
          "-" +
          Math.floor(100 + Math.random() * 900)
        );
      },
      unique: true,
      index: true,
    },

    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    subOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubOrder",
      index: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    claimType: {
      type: String,
      enum: [
        "Item not received",
        "Item not as described",
        "Counterfeit item",
        "Incomplete order",
        "Damaged in transit",
      ],
      required: true,
    },

    description: {
      type: String,
      required: [true, "Please describe the issue"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    evidence: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],

    // Protection window
    protectionDeadline: { type: Date, required: true },
    autoRefundAt: { type: Date },

    // Amounts
    orderAmount: { type: Number, required: true },
    claimedAmount: { type: Number, required: true },
    approvedAmount: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: [
        "Open",
        "Seller Reviewing",
        "Seller Accepted",
        "Seller Disputed",
        "Platform Reviewing",
        "Refund Approved",
        "Refund Processed",
        "Claim Rejected",
        "Closed",
      ],
      default: "Open",
      index: true,
    },

    // Resolution
    resolution: {
      type: {
        type: String,
        enum: ["Full Refund", "Partial Refund", "Resend Item", "No Action"],
      },
      resolvedBy: {
        type: String,
        enum: ["seller", "platform_auto", "admin"],
      },
      resolvedAt: { type: Date },
      adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      notes: { type: String, default: "" },
    },

    // Communication thread
    messages: [
      {
        sender: {
          type: String,
          enum: ["Buyer", "Seller", "Platform"],
          required: true,
        },
        senderId: { type: String },
        message: { type: String, required: true },
        attachments: [{ public_id: String, url: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

buyerProtectionClaimSchema.index({ customer: 1, createdAt: -1 });
buyerProtectionClaimSchema.index({ shop: 1, status: 1 });
buyerProtectionClaimSchema.index({ autoRefundAt: 1, status: 1 });

module.exports = mongoose.model(
  "BuyerProtectionClaim",
  buyerProtectionClaimSchema
);
