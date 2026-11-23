const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userData: {
      name: { type: String },
      avatar: { public_id: String, url: String },
    },
    productId: {
      type: String,
      required: true,
      index: true,
    },
    productRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      index: true,
    },
    shopId: {
      type: String,
      required: true,
      index: true,
    },
    shopRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
    images: [
      {
        public_id: { type: String },
        url: { type: String },
      },
    ],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    merchantReply: {
      comment: { type: String, default: "" },
      repliedAt: { type: Date },
    },

    // ─── AliExpress-Grade Review Enhancements ───────────────────

    // Verification proof linking review to actual purchase
    verificationDetails: {
      purchaseDate: { type: Date },
      deliveryDate: { type: Date },
      orderRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    },

    // Multi-dimension ratings (like AliExpress star breakdown)
    detailedRatings: {
      itemAsDescribed: { type: Number, min: 1, max: 5 },
      communicationScore: { type: Number, min: 1, max: 5 },
      shippingSpeed: { type: Number, min: 1, max: 5 },
    },

    // Size & fit feedback for apparel (Ethiopian garments)
    sizeFeedback: {
      type: String,
      enum: ["true_to_size", "runs_small", "runs_large", "not_applicable"],
      default: "not_applicable",
    },

    // Quality & moderation flags
    qualityFlags: {
      hasPhotos: { type: Boolean, default: false },
      hasDetailedText: { type: Boolean, default: false },
      isTopReview: { type: Boolean, default: false },
      reportCount: { type: Number, default: 0 },
      isFlagged: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

// Prevent duplicate review per user per product
reviewSchema.index({ user: 1, productId: 1 }, { unique: true });
// Shop-level review analytics
reviewSchema.index({ shopId: 1, rating: -1, createdAt: -1 });

// Auto-set qualityFlags on save
reviewSchema.pre("save", function (next) {
  if (this.isModified("images") || this.isModified("comment")) {
    this.qualityFlags = this.qualityFlags || {};
    this.qualityFlags.hasPhotos = Array.isArray(this.images) && this.images.length > 0;
    this.qualityFlags.hasDetailedText = typeof this.comment === "string" && this.comment.length >= 50;
  }
  next();
});

// Static helper to recalculate product rating average
reviewSchema.statics.calculateProductRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { productId: productId } },
    {
      $group: {
        _id: "$productId",
        avgRating: { $avg: "$rating" },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const Product = mongoose.model("Product");
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratings: Math.round(stats[0].avgRating * 10) / 10,
      totalReviewsCount: stats[0].numReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratings: 5,
      totalReviewsCount: 0,
    });
  }
};

module.exports = mongoose.model("Review", reviewSchema);
