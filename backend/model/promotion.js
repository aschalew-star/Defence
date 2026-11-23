const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, "Promotion title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    type: {
      type: String,
      enum: [
        "store_wide_discount",
        "category_sale",
        "buy_x_get_y",
        "bundle_deal",
        "free_shipping",
        "new_customer_deal",
        "flash_sale",
        "loyalty_bonus",
      ],
      required: true,
    },

    // Discount configuration
    discountType: {
      type: String,
      enum: ["percentage", "fixed_amount", "free_shipping"],
      default: "percentage",
    },
    discountValue: { type: Number, default: 0, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscountAmount: { type: Number },

    // Scope
    applicableProducts: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    ],
    applicableCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    ],
    isStoreWide: { type: Boolean, default: false },

    // Duration
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    // Limits
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },

    // Status
    isActive: { type: Boolean, default: true, index: true },
    status: {
      type: String,
      enum: ["draft", "scheduled", "active", "paused", "expired"],
      default: "draft",
      index: true,
    },

    // Analytics
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
  },
  { timestamps: true }
);

promotionSchema.index({ shop: 1, status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Promotion", promotionSchema);
