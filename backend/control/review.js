const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Review = require("../model/review");
const Product = require("../model/product");
const Order = require("../model/Order");
const SubOrder = require("../model/SubOrder");
const Shop = require("../model/Shop");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");

// Helper: Check if user purchased and received this product (Anti-Fraud Verified Buyer Gate)
const checkDeliveredPurchase = async (user, productId) => {
  if (!user || !productId) return false;

  const userIdStr = user._id ? user._id.toString() : "";
  const productObjId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : null;
  const userObjId = mongoose.Types.ObjectId.isValid(userIdStr)
    ? new mongoose.Types.ObjectId(userIdStr)
    : null;

  const orderProductQueries = [
    { "cart._id": productId },
    { "cart.id": productId },
    ...(productObjId ? [{ "cart._id": productObjId }] : []),
  ];

  const subOrderProductQueries = [
    { "items._id": productId },
    { "items.id": productId },
    ...(productObjId ? [{ "items._id": productObjId }] : []),
  ];

  const userQueries = [
    { "user._id": userIdStr },
    ...(userObjId ? [{ "user._id": userObjId }, { userRef: userObjId }] : []),
    ...(user.email ? [{ "user.email": user.email }] : []),
  ];

  const subUserQueries = [
    ...(userObjId ? [{ customer: userObjId }] : []),
    ...(user.email ? [{ "userData.email": user.email }] : []),
  ];

  const deliveredStatusQuery = {
    $in: [
      "Delivered",
      "delivered",
      "Delivered - Pending Inspection",
      "Completed",
      "completed",
    ],
  };

  const [deliveredOrder, deliveredSubOrder] = await Promise.all([
    Order.findOne({
      $and: [
        { $or: userQueries },
        { $or: orderProductQueries },
        { status: deliveredStatusQuery },
      ],
    }),
    SubOrder.findOne({
      $and: [
        { $or: subUserQueries },
        { $or: subOrderProductQueries },
        { status: deliveredStatusQuery },
      ],
    }),
  ]);

  return Boolean(deliveredOrder || deliveredSubOrder);
};

// 0. Check Review Eligibility (Verified Purchase Gate)
router.get(
  "/can-review/:productId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId } = req.params;
      const isVerifiedPurchase = await checkDeliveredPurchase(req.user, productId);
      const canReview = Boolean(isVerifiedPurchase || req.user.role === "admin");
      const existingReview = await Review.findOne({ user: req.user._id, productId });

      res.status(200).json({
        success: true,
        canReview,
        isVerifiedPurchase,
        hasExistingReview: Boolean(existingReview),
        existingReview,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 1. Get Reviews for a Product (with AliExpress Star Breakdown & Fit Statistics)
router.get(
  "/product-reviews/:productId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId } = req.params;
      const reviews = await Review.find({ productId })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 });

      const totalReviews = reviews.length;

      // Rating breakdown: count of 1 to 5 stars
      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      const sizeFeedbackCounts = { true_to_size: 0, runs_small: 0, runs_large: 0, not_applicable: 0 };
      let detailedSum = { itemAsDescribed: 0, communicationScore: 0, shippingSpeed: 0, count: 0 };
      let photoReviewsCount = 0;

      for (const rev of reviews) {
        const star = Math.round(rev.rating);
        if (starCounts[star] !== undefined) starCounts[star]++;

        if (rev.sizeFeedback && sizeFeedbackCounts[rev.sizeFeedback] !== undefined) {
          sizeFeedbackCounts[rev.sizeFeedback]++;
        }

        if (rev.images && rev.images.length > 0) {
          photoReviewsCount++;
        }

        if (rev.detailedRatings?.itemAsDescribed) {
          detailedSum.itemAsDescribed += rev.detailedRatings.itemAsDescribed;
          detailedSum.communicationScore += rev.detailedRatings.communicationScore || rev.detailedRatings.itemAsDescribed;
          detailedSum.shippingSpeed += rev.detailedRatings.shippingSpeed || rev.detailedRatings.itemAsDescribed;
          detailedSum.count++;
        }
      }

      const detailedAverages = detailedSum.count > 0 ? {
        itemAsDescribed: Math.round((detailedSum.itemAsDescribed / detailedSum.count) * 10) / 10,
        communicationScore: Math.round((detailedSum.communicationScore / detailedSum.count) * 10) / 10,
        shippingSpeed: Math.round((detailedSum.shippingSpeed / detailedSum.count) * 10) / 10,
      } : { itemAsDescribed: 4.8, communicationScore: 4.9, shippingSpeed: 4.7 };

      res.status(200).json({
        success: true,
        reviews,
        totalReviews,
        analytics: {
          starCounts,
          sizeFeedbackCounts,
          detailedAverages,
          photoReviewsCount,
          verifiedPurchasesCount: reviews.filter((r) => r.isVerifiedPurchase).length,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Get Reviews for a Merchant Store
router.get(
  "/shop-reviews/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const reviews = await Review.find({ shopId: req.params.shopId })
        .populate("user", "name avatar")
        .populate("productRef", "name images discountPrice")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        reviews,
        totalReviews: reviews.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Post a Review (Customer, with strict verified purchase protection)
router.post(
  "/create-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId, rating, comment, images, detailedRatings, sizeFeedback } = req.body;

      if (!productId || !rating || !comment) {
        return next(
          new ErrorHandler("Product ID, rating (1-5), and review comment are required!", 400)
        );
      }

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found!", 404));
      }

      // Check if customer ordered and received this product (Anti-Fraud Verified Purchase Check)
      const hasPurchased = await checkDeliveredPurchase(req.user, productId);

      // Strict Anti-Fraud Guard: Only verified buyers who received the item can review
      if (!hasPurchased && req.user.role !== "admin") {
        return next(
          new ErrorHandler(
            "Only verified buyers who have ordered and received this item can submit a review and rating.",
            403
          )
        );
      }

      const imagesLinks = [];
      if (images && Array.isArray(images)) {
        for (const img of images) {
          if (typeof img === "string" && img.startsWith("data:image")) {
            const upload = await cloudinary.v2.uploader.upload(img, {
              folder: "reviews",
              width: 800,
              crop: "scale",
            });
            imagesLinks.push({
              public_id: upload.public_id,
              url: upload.secure_url,
            });
          }
        }
      }

      // Upsert review (one per user per product)
      let review = await Review.findOne({
        user: req.user._id,
        productId,
      });

      const parsedDetailedRatings = detailedRatings ? {
        itemAsDescribed: Math.min(Math.max(Number(detailedRatings.itemAsDescribed) || Number(rating), 1), 5),
        communicationScore: Math.min(Math.max(Number(detailedRatings.communicationScore) || Number(rating), 1), 5),
        shippingSpeed: Math.min(Math.max(Number(detailedRatings.shippingSpeed) || Number(rating), 1), 5),
      } : {
        itemAsDescribed: Number(rating),
        communicationScore: Number(rating),
        shippingSpeed: Number(rating),
      };

      if (review) {
        review.rating = Number(rating);
        review.comment = comment;
        if (imagesLinks.length > 0) review.images = imagesLinks;
        review.detailedRatings = parsedDetailedRatings;
        if (sizeFeedback) review.sizeFeedback = sizeFeedback;
        review.isVerifiedPurchase = true;
        await review.save();
      } else {
        review = await Review.create({
          user: req.user._id,
          userData: {
            name: req.user.name,
            avatar: req.user.avatar,
          },
          productId,
          productRef: product._id,
          shopId: product.shopId,
          shopRef: product.shopRef,
          rating: Number(rating),
          comment,
          images: imagesLinks,
          detailedRatings: parsedDetailedRatings,
          sizeFeedback: sizeFeedback || "not_applicable",
          isVerifiedPurchase: true,
          verificationDetails: {
            orderRef: req.body.orderId || null,
            purchaseDate: new Date(),
          },
        });
      }

      // Recalculate product rating
      await Review.calculateProductRating(productId);

      // Recalculate merchant overall rating
      const shopReviews = await Review.aggregate([
        { $match: { shopId: product.shopId } },
        {
          $group: {
            _id: "$shopId",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]);

      if (shopReviews.length > 0) {
        await Shop.findByIdAndUpdate(product.shopId, {
          ratings: Math.round(shopReviews[0].avgRating * 10) / 10,
          ratingsCount: shopReviews[0].count,
          totalReviewsCount: shopReviews[0].count,
        });
      }

      // Trigger seller score recompute after review
      try {
        const SellerScore = require("../model/sellerScore");
        if (product.shopId) {
          await SellerScore.computeScore(product.shopId).catch(() => {});
        }
      } catch (e) {}

      // Update product confidence signals
      try {
        const revCount = await Review.countDocuments({ productId });
        const photoCount = await Review.countDocuments({ productId, "images.0": { $exists: true } });
        await Product.findByIdAndUpdate(productId, {
          "confidenceSignals.hasVerifiedPurchases": true,
          "confidenceSignals.totalSold": product.sold_out || 0,
        }).catch(() => {});
      } catch (e) {}

      // Reward buyer with loyalty coins (AliExpress Review Reward)
      let loyaltyCoinsAwarded = 0;
      try {
        const Wallet = require("../model/wallet");
        const wallet = await Wallet.findOne({ user: req.user._id });
        if (wallet) {
          loyaltyCoinsAwarded = imagesLinks.length > 0 ? 50 : 25;
          wallet.loyaltyCoins = (wallet.loyaltyCoins || 0) + loyaltyCoinsAwarded;
          wallet.transactions.push({
            transactionType: "review_reward",
            amount: 0,
            coinsChange: loyaltyCoinsAwarded,
            description: `Review reward coins for ${product.name}${imagesLinks.length > 0 ? " (with photos)" : ""}`,
            status: "completed",
            createdAt: new Date(),
          });
          await wallet.save();
        }
      } catch (e) {}

      // Mark product as reviewed in customer's order snapshot
      try {
        if (req.body.orderId) {
          await Order.findByIdAndUpdate(
            req.body.orderId,
            { $set: { "cart.$[elem].isReviewed": true } },
            { arrayFilters: [{ $or: [{ "elem._id": productId }, { "elem.id": productId }] }] }
          );
        } else {
          await Order.updateMany(
            {
              $or: [{ "user._id": req.user._id.toString() }, { userRef: req.user._id }],
              $or: [{ "cart._id": productId }, { "cart.id": productId }],
            },
            { $set: { "cart.$[elem].isReviewed": true } },
            { arrayFilters: [{ $or: [{ "elem._id": productId }, { "elem.id": productId }] }] }
          );
        }
      } catch (err) {
        // Non-blocking order flag update
      }

      res.status(201).json({
        success: true,
        review,
        loyaltyCoinsAwarded,
        message: `Review submitted successfully! ${loyaltyCoinsAwarded > 0 ? `+${loyaltyCoinsAwarded} Habesha loyalty coins earned!` : ""}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Merchant Reply to Review
router.put(
  "/merchant-reply/:reviewId",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { comment } = req.body;
      const review = await Review.findById(req.params.reviewId);

      if (!review) {
        return next(new ErrorHandler("Review not found!", 404));
      }

      if (review.shopId !== req.seller._id.toString()) {
        return next(
          new ErrorHandler("You can only reply to reviews for your own crafts!", 403)
        );
      }

      review.merchantReply = {
        comment,
        repliedAt: new Date(),
      };

      await review.save();

      res.status(200).json({
        success: true,
        review,
        message: "Reply posted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Delete Review (Admin Protected)
router.delete(
  "/admin-delete-review/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return next(new ErrorHandler("Review not found!", 404));
      }

      const productId = review.productId;
      await Review.findByIdAndDelete(req.params.id);
      await Review.calculateProductRating(productId);

      res.status(200).json({
        success: true,
        message: "Review removed by administrator!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 6. Vote Review as Helpful (AliExpress Social Proof)
router.post(
  "/vote-helpful/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const review = await Review.findByIdAndUpdate(
        req.params.id,
        { $inc: { helpfulCount: 1 } },
        { new: true }
      );

      if (!review) {
        return next(new ErrorHandler("Review not found!", 404));
      }

      res.status(200).json({
        success: true,
        helpfulCount: review.helpfulCount,
        message: "Thank you for your feedback!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 7. Report Inappropriate Review
router.post(
  "/report-review/:id",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return next(new ErrorHandler("Review not found!", 404));
      }

      if (!review.qualityFlags) review.qualityFlags = {};
      review.qualityFlags.reportCount = (review.qualityFlags.reportCount || 0) + 1;
      if (review.qualityFlags.reportCount >= 3) {
        review.qualityFlags.isFlagged = true;
      }
      await review.save();

      res.status(200).json({
        success: true,
        message: "Review submitted for administrative review.",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

