const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    recipientType: {
      type: String,
      enum: ["user", "seller", "admin"],
      default: "user",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        // Original types
        "order_update",
        "price_drop",
        "flash_deal",
        "qa_reply",
        "wallet_credit",
        "review_reply",
        "system_notice",
        "dispute_update",
        // AliExpress-grade trust & engagement types
        "buyer_protection_expiring",
        "delivery_confirmed",
        "return_requested",
        "return_status_update",
        "seller_score_change",
        "sla_warning",
        "payout_processed",
        "wishlist_price_drop",
        "wishlist_back_in_stock",
        "promotion_started",
        "new_follower",
        "referral_reward",
        "account_milestone",
        "review_received",
        "cart_abandoned",
      ],
      default: "order_update",
      index: true,
    },
    // Priority-based notification routing
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    // Deep-link action for mobile & web
    actionUrl: {
      type: String,
      default: "",
    },
    actionText: {
      type: String,
      default: "",
    },
    referenceId: {
      type: String,
      default: "",
    },
    referenceUrl: {
      type: String,
      default: "",
    },
    metadata: {
      type: Object,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    // Auto-expire stale notifications (promotions, flash deals, etc.)
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Composite indexes for performant queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

module.exports = mongoose.model("Notification", notificationSchema);
