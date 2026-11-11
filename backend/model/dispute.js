const mongoose = require("mongoose");

const disputeSchema = new mongoose.Schema(
  {
    disputeNumber: {
      type: String,
      default: function () {
        return "DIS-" + Date.now().toString().slice(-6) + "-" + Math.floor(100 + Math.random() * 900);
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
    reason: {
      type: String,
      enum: [
        "Damaged item",
        "Item not as described",
        "Wrong size / tailoring",
        "Late delivery",
        "Item not received",
        "Quality issue",
        "Other",
      ],
      required: true,
    },
    details: {
      type: String,
      required: [true, "Please describe the dispute or reason for return"],
      maxlength: [2000, "Details cannot exceed 2000 characters"],
    },
    evidence: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],
    requestedResolution: {
      type: String,
      enum: ["Full Refund", "Partial Refund", "Replacement / Re-tailoring", "Return"],
      default: "Full Refund",
    },
    status: {
      type: String,
      enum: [
        "Open",
        "Merchant Responded",
        "Under Admin Review",
        "Resolved - Refunded",
        "Resolved - Rejected",
        "Closed",
      ],
      default: "Open",
      index: true,
    },
    messages: [
      {
        sender: { type: String, enum: ["Customer", "Merchant", "Admin"], required: true },
        senderId: { type: String },
        senderName: { type: String },
        message: { type: String, required: true },
        attachments: [{ public_id: String, url: String }],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    merchantResponse: {
      response: { type: String, default: "" },
      respondedAt: { type: Date },
    },
    adminDecision: {
      decision: {
        type: String,
        enum: ["Refund Approved", "Refund Rejected", "Custom Resolution", ""],
        default: "",
      },
      refundAmount: { type: Number, default: 0 },
      note: { type: String, default: "" },
      decidedAt: { type: Date },
      decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Dispute", disputeSchema);

