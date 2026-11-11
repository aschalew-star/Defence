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
      default: false, // If true, only verified merchants can list products
    },
    requireProductApproval: {
      type: Boolean,
      default: false, // If true, all products start as "pending"
    },
    escrowHoldingDays: {
      type: Number,
      default: 0, // Instant on delivery, or buffer days
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformConfig", platformConfigSchema);

