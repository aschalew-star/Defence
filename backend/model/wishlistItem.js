const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // Price snapshot at time of adding (for price drop detection)
    priceWhenAdded: { type: Number, required: true },
    currentPrice: { type: Number },
    priceDrop: { type: Boolean, default: false },
    priceDropPercent: { type: Number, default: 0 },

    // Notification tracking
    priceDropNotified: { type: Boolean, default: false },
    backInStockNotified: { type: Boolean, default: false },

    // Product snapshot (for display even if product is deleted)
    productSnapshot: {
      name: { type: String },
      image: { type: String },
      shopId: { type: String },
      shopName: { type: String },
    },

    notes: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);

wishlistItemSchema.index({ user: 1, product: 1 }, { unique: true });
wishlistItemSchema.index({ product: 1, priceDrop: 1 });

module.exports = mongoose.model("WishlistItem", wishlistItemSchema);
