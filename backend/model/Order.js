const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      default: function () {
        return (
          "MEP-" +
          Date.now().toString().slice(-6) +
          "-" +
          Math.floor(100 + Math.random() * 900)
        );
      },
      index: true,
      unique: true,
    },
    // Multi-Vendor Architecture: Reference to dedicated sub-orders per merchant
    subOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubOrder",
      },
    ],
    // Snapshot of entire customer cart for backward compatibility
    cart: {
      type: Array,
      required: true,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },
    shippingTotal: {
      type: Number,
      default: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: "",
    },
    // AliExpress Wallet & Loyalty Rewards Settlement
    walletAmountApplied: {
      type: Number,
      default: 0,
      min: [0, "Wallet discount cannot be negative"],
    },
    coinsRedeemed: {
      type: Number,
      default: 0,
    },
    coinsDiscount: {
      type: Number,
      default: 0,
    },

    // Aggregated Marketplace Financials
    financials: {
      subTotal: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      platformCommissionRate: { type: Number, default: 10 },
      platformFeeAmount: { type: Number, default: 0 },
      merchantNetEarnings: { type: Number, default: 0 },
      payoutStatus: {
        type: String,
        enum: [
          "Pending Escrow",
          "Eligible for Payout",
          "Payout Requested",
          "Paid Out",
          "Refunded",
        ],
        default: "Pending Escrow",
      },
    },

    // Ethiopian Logistics & Courier Tracking (Primary/Overall)
    deliveryDetails: {
      provider: { type: String, default: "Direct Merchant Delivery" },
      trackingCode: { type: String, default: "" },
      estimatedDeliveryDate: { type: Date },
      deliveryNotes: { type: String, default: "" },
    },
    deliveryProvider: { type: String, default: "" },
    trackingCode: { type: String, default: "" },
    deliveryNotes: { type: String, default: "" },

    // Custom Body Measurements for Tailored Garments
    customMeasurements: {
      bust: { type: String, default: "" },
      waist: { type: String, default: "" },
      hips: { type: String, default: "" },
      heightOrLength: { type: String, default: "" },
      additionalInstructions: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: [
        "Processing",
        "Partially Fulfilled",
        "Tailoring & Handweaving",
        "Quality Checked",
        "Transferred to delivery partner",
        "Out for delivery",
        "Delivered",
        "Processing refund",
        "Refund Success",
        "Cancelled",
      ],
      default: "Processing",
      index: true,
    },
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: String, default: "System" },
      },
    ],
    paymentInfo: {
      id: { type: String },
      status: { type: String, default: "Pending" },
      type: { type: String, default: "Chapa" },
      tx_ref: { type: String },
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: {
      type: Date,
    },

    // AliExpress-Grade Enterprise Buyer Protection & Auto-Escrow Settlement
    buyerProtection: {
      protectionStatus: {
        type: String,
        enum: ["Active", "Extended", "Expired", "Claimed", "Voided"],
        default: "Active",
      },
      protectionStartDate: { type: Date },
      protectionEndDate: { type: Date },
      autoConfirmDeadline: {
        type: Date, // 15 days post delivery for escrow auto-release
      },
      returnWindowDays: {
        type: Number,
        default: 15,
      },
      moneyBackGuaranteed: {
        type: Boolean,
        default: true,
      },
      // Buyer can request extension
      extensionRequested: { type: Boolean, default: false },
      extensionDays: { type: Number, default: 0 },
      extensionReason: { type: String, default: "" },
    },

    // Fraud signals (protects merchants from fraudulent buyers)
    fraudSignals: {
      riskScore: { type: Number, default: 0, min: 0, max: 100 },
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "low",
      },
      flaggedReasons: [{ type: String }],
      ipCountry: { type: String, default: "" },
      deviceFingerprint: { type: String, default: "" },
      isFirstOrder: { type: Boolean, default: false },
      paymentVerified: { type: Boolean, default: false },
    },

    // Gift options
    giftOptions: {
      isGift: { type: Boolean, default: false },
      giftMessage: { type: String, default: "" },
      giftWrapping: { type: Boolean, default: false },
      hidePrice: { type: Boolean, default: false },
    },

    // Courier Waybill & Real-Time Tracking Updates
    trackingDetails: {
      waybillNumber: { type: String, index: true },
      carrierName: { type: String, default: "Tikus Express" },
      carrierPhone: { type: String, default: "" },
      trackingEvents: [
        {
          status: { type: String },
          location: { type: String },
          timestamp: { type: Date, default: Date.now },
          note: { type: String },
        },
      ],
    },

    // Enterprise Payment Security & Audit
    security: {
      idempotencyKey: { type: String, index: true },
      ipAddress: { type: String },
      maskedPhone: { type: String },
      webhookVerified: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// High-performance production compound indexes
orderSchema.index({ userRef: 1, createdAt: -1 });
orderSchema.index({ "user._id": 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ "paymentInfo.tx_ref": 1 });
orderSchema.index({ "paymentInfo.id": 1 });
orderSchema.index({ "financials.payoutStatus": 1 });

module.exports = mongoose.model("Order", orderSchema);
