const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    actorType: {
      type: String,
      enum: ["User", "Seller", "Admin", "System"],
      default: "System",
      index: true,
    },
    actorName: {
      type: String,
      default: "System",
    },
    action: {
      type: String,
      required: true,
      index: true, // e.g. "ORDER_CREATED", "ESCROW_RELEASED", "WITHDRAWAL_APPROVED", "MERCHANT_VERIFIED"
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      index: true,
    },
    targetType: {
      type: String, // e.g. "Order", "SubOrder", "Shop", "Withdraw", "Product"
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);

