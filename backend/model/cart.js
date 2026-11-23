const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        shopRef: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },
        shopId: { type: String },

        // Selected variant
        name: { type: String, required: true },
        image: { type: String, default: "" },
        selectedSize: { type: String, default: "" },
        selectedColor: { type: String, default: "" },
        variantSku: { type: String, default: "" },

        // Pricing (snapshot at add time + current)
        priceWhenAdded: { type: Number, required: true },
        currentPrice: { type: Number },
        originalPrice: { type: Number },

        qty: { type: Number, required: true, min: 1, default: 1 },

        // Custom measurements (for Ethiopian tailored garments)
        customMeasurements: {
          bust: { type: String, default: "" },
          waist: { type: String, default: "" },
          hips: { type: String, default: "" },
          length: { type: String, default: "" },
          shoulders: { type: String, default: "" },
          height: { type: String, default: "" },
          notes: { type: String, default: "" },
        },

        // Status flags
        isAvailable: { type: Boolean, default: true },
        priceChanged: { type: Boolean, default: false },

        addedAt: { type: Date, default: Date.now },
      },
    ],

    // Applied coupon (optional, pre-checkout)
    appliedCoupon: {
      code: { type: String, default: "" },
      discountType: { type: String, default: "" },
      discountValue: { type: Number, default: 0 },
    },

    // Metadata
    itemCount: { type: Number, default: 0 },
    estimatedTotal: { type: Number, default: 0 },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Pre-save middleware to auto-compute itemCount and estimatedTotal
cartSchema.pre("save", function (next) {
  this.itemCount = this.items.reduce((sum, item) => sum + item.qty, 0);
  this.estimatedTotal = this.items.reduce((sum, item) => {
    const price = item.currentPrice || item.priceWhenAdded;
    return sum + price * item.qty;
  }, 0);
  this.lastUpdatedAt = new Date();
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
