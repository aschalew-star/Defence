const mongoose = require("mongoose");

const shopAnalyticsSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    // Time period
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    periodDate: { type: Date, required: true, index: true },

    // Traffic
    storeViews: { type: Number, default: 0 },
    productViews: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },

    // Conversion
    addToCartCount: { type: Number, default: 0 },
    checkoutCount: { type: Number, default: 0 },
    ordersCount: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },

    // Revenue
    grossRevenue: { type: Number, default: 0 },
    netRevenue: { type: Number, default: 0 },
    commissionPaid: { type: Number, default: 0 },
    refundsIssued: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },

    // Product performance
    topProducts: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String },
        views: { type: Number, default: 0 },
        orders: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
      },
    ],

    // Customer metrics
    newCustomers: { type: Number, default: 0 },
    returningCustomers: { type: Number, default: 0 },
    newFollowers: { type: Number, default: 0 },

    // Chat metrics
    chatConversations: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
  },
  { timestamps: true }
);

shopAnalyticsSchema.index(
  { shop: 1, period: 1, periodDate: -1 },
  { unique: true }
);

module.exports = mongoose.model("ShopAnalytics", shopAnalyticsSchema);
