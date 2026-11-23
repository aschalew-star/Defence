const mongoose = require("mongoose");

const platformConfigSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: "MEP Ethiopian Traditional Marketplace",
    },
    defaultCommissionRate: {
      type: Number,
      default: 10, // 10%
      min: 0,
      max: 100,
    },
    minWithdrawalAmount: {
      type: Number,
      default: 50, // 50 ETB
      min: 10,
    },
    currency: {
      type: String,
      default: "ETB",
    },
    requireSellerVerification: {
      type: Boolean,
      default: false,
    },
    requireProductApproval: {
      type: Boolean,
      default: false,
    },
    escrowHoldingDays: {
      type: Number,
      default: 0,
    },
    supportContact: {
      phone: { type: String, default: "+251911000000" },
      email: { type: String, default: "support@mep.et" },
      telegram: { type: String, default: "@MEPSupport" },
    },
    announcementBanner: {
      enabled: { type: Boolean, default: false },
      text: { type: String, default: "" },
      link: { type: String, default: "" },
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    // ─── AliExpress-Grade Platform Governance ───────────────────

    // Buyer protection defaults (governs Order.buyerProtection)
    buyerProtection: {
      defaultProtectionDays: { type: Number, default: 60 },
      returnWindowDays: { type: Number, default: 15 },
      autoConfirmAfterDays: { type: Number, default: 15 },
      maxProtectionExtensionDays: { type: Number, default: 15 },
      enableMoneyBackGuarantee: { type: Boolean, default: true },
    },

    // Platform-wide return policy rules
    returnPolicy: {
      autoApproveThreshold: { type: Number, default: 500 }, // ETB — auto-approve returns below this
      requirePhotos: { type: Boolean, default: true },
      maxReturnDays: { type: Number, default: 15 },
    },

    // Seller SLA enforcement thresholds
    sellerSLA: {
      mustConfirmOrderHours: { type: Number, default: 48 },
      mustShipDays: { type: Number, default: 5 },
      maxDisputeResponseDays: { type: Number, default: 5 },
      maxReturnResponseDays: { type: Number, default: 3 },
      minSellerScoreToSell: { type: Number, default: 20 },
    },

    // Product listing quality requirements
    quality: {
      minPhotosPerProduct: { type: Number, default: 3 },
      requireSizeGuide: { type: Boolean, default: false },
      enableAuthenticityCert: { type: Boolean, default: false },
    },

    // Referral program configuration
    referralProgram: {
      enabled: { type: Boolean, default: false },
      referrerRewardCoins: { type: Number, default: 200 },
      refereeRewardCoins: { type: Number, default: 100 },
    },

    // Platform fee structure
    fees: {
      buyerServiceFeePercent: { type: Number, default: 0 },
      sellerListingFee: { type: Number, default: 0 },
      promotionFee: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformConfig", platformConfigSchema);
