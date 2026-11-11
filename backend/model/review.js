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
  },
  { timestamps: true }
);

// Prevent duplicate review per user per product
reviewSchema.index({ user: 1, productId: 1 }, { unique: true });

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

