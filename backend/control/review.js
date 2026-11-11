const express = require("express");
const router = express.Router();
const Review = require("../model/review");
const Product = require("../model/product");
const Order = require("../model/Order");
const Shop = require("../model/Shop");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const cloudinary = require("cloudinary");

// 1. Get Reviews for a Product
router.get(
  "/product-reviews/:productId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const reviews = await Review.find({ productId: req.params.productId })
        .populate("user", "name avatar")
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

// 3. Post a Review (Customer, with verified purchase check)
router.post(
  "/create-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId, rating, comment, images } = req.body;

      if (!productId || !rating || !comment) {
        return next(
          new ErrorHandler("Product ID, rating (1-5), and review comment are required!", 400)
        );
      }

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found!", 404));
      }

      // Check if customer ordered this product
      const hasPurchased = await Order.findOne({
        $or: [{ "user._id": req.user._id.toString() }, { userRef: req.user._id }],
        "cart._id": productId,
        status: "Delivered",
      });

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

      if (review) {
        review.rating = Number(rating);
        review.comment = comment;
        if (imagesLinks.length > 0) review.images = imagesLinks;
        review.isVerifiedPurchase = Boolean(hasPurchased);
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
          isVerifiedPurchase: Boolean(hasPurchased),
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

      res.status(201).json({
        success: true,
        review,
        message: "Review submitted successfully!",
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

module.exports = router;

