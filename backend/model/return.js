const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    returnNumber: {
      type: String,
      default: function () {
        return (
          "RET-" +
          Date.now().toString().slice(-6) +
          "-" +
          Math.floor(100 + Math.random() * 900)
        );
      },
      unique: true,
      index: true,
    },

    // References
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    subOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubOrder",
      required: true,
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

    // What's being returned
    items: [
      {
        productRef: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        productName: { type: String, required: true },
        qty: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        reason: {
          type: String,
          enum: [
            "Changed my mind",
            "Wrong size / doesn't fit",
            "Color/pattern different from photos",
            "Received wrong item",
            "Defective / damaged",
            "Quality not as expected",
            "Other",
          ],
          required: true,
        },
        reasonDetail: { type: String, maxlength: 500 },
        images: [{ public_id: String, url: String }],
      },
    ],

    // Return logistics
    returnMethod: {
      type: String,
      enum: [
        "Ship back to seller",
        "Drop at collection point",
        "Seller arranges pickup",
        "No return needed (refund only)",
      ],
      default: "Ship back to seller",
    },
    returnTrackingCode: { type: String, default: "" },
    returnShippingCost: { type: Number, default: 0 },
    returnShippingPaidBy: {
      type: String,
      enum: ["buyer", "seller", "platform"],
      default: "buyer",
    },

    // Resolution
    refundAmount: { type: Number, required: true },
    refundMethod: {
      type: String,
      enum: ["wallet_credit", "original_payment", "loyalty_coins"],
      default: "wallet_credit",
    },

    // Status flow
    status: {
      type: String,
      enum: [
        "Requested",
        "Seller Approved",
        "Seller Rejected",
        "Buyer Shipped Back",
        "Seller Received",
        "Refund Processing",
        "Refund Completed",
        "Closed",
        "Escalated to Dispute",
      ],
      default: "Requested",
      index: true,
    },

    // Deadlines (AliExpress-style countdown)
    sellerResponseDeadline: { type: Date },
    returnShipDeadline: { type: Date },
    autoApproveAt: { type: Date },

    // Communication
    messages: [
      {
        sender: {
          type: String,
          enum: ["Customer", "Merchant", "System"],
          required: true,
        },
        senderId: { type: String },
        senderName: { type: String },
        message: { type: String, required: true },
        attachments: [{ public_id: String, url: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Merchant response
    sellerResponse: {
      accepted: { type: Boolean },
      reason: { type: String, default: "" },
      respondedAt: { type: Date },
      counterOffer: {
        partialRefundAmount: { type: Number },
        message: { type: String, default: "" },
      },
    },
  },
  { timestamps: true }
);

returnSchema.index({ customer: 1, createdAt: -1 });
returnSchema.index({ shop: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Return", returnSchema);
