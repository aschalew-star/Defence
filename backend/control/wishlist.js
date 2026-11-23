const express = require("express");
const router = express.Router();
const WishlistItem = require("../model/wishlistItem");
const Product = require("../model/product");
const Notification = require("../model/notification");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated } = require("../middleware/auth");

// 1. Add to Wishlist (with price snapshot)
router.post(
  "/add",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId, notes } = req.body;

      if (!productId) {
        return next(new ErrorHandler("Product ID is required!", 400));
      }

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found!", 404));
      }

      // Check if already in wishlist
      const existing = await WishlistItem.findOne({
        user: req.user._id,
        product: productId,
      });

      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Item already in your wishlist!",
          wishlistItem: existing,
        });
      }

      const wishlistItem = await WishlistItem.create({
        user: req.user._id,
        product: productId,
        priceWhenAdded: product.discountPrice,
        currentPrice: product.discountPrice,
        productSnapshot: {
          name: product.name,
          image: product.images?.[0]?.url || product.featuredImage?.url || "",
          shopId: product.shopId,
          shopName: product.shop?.name || "",
        },
        notes: notes || "",
      });

      // Increment product wishlist count
      await Product.findByIdAndUpdate(productId, {
        $inc: { "confidenceSignals.totalWishlistCount": 1 },
      }).catch(() => {});

      res.status(201).json({
        success: true,
        wishlistItem,
        message: "Added to wishlist!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Remove from Wishlist
router.delete(
  "/remove/:productId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const deleted = await WishlistItem.findOneAndDelete({
        user: req.user._id,
        product: req.params.productId,
      });

      if (deleted) {
        await Product.findByIdAndUpdate(req.params.productId, {
          $inc: { "confidenceSignals.totalWishlistCount": -1 },
        }).catch(() => {});
      }

      res.status(200).json({
        success: true,
        message: "Removed from wishlist.",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Get User's Wishlist
router.get(
  "/my-wishlist",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const wishlist = await WishlistItem.find({ user: req.user._id })
        .populate("product", "name images discountPrice originalPrice ratings stock status flashSale")
        .sort({ createdAt: -1 });

      // Update current prices and detect price drops
      const updated = [];
      for (const item of wishlist) {
        if (item.product) {
          const currentPrice = item.product.discountPrice;
          const hasDropped = currentPrice < item.priceWhenAdded;

          if (item.currentPrice !== currentPrice || item.priceDrop !== hasDropped) {
            item.currentPrice = currentPrice;
            item.priceDrop = hasDropped;
            item.priceDropPercent = hasDropped
              ? Math.round(((item.priceWhenAdded - currentPrice) / item.priceWhenAdded) * 100)
              : 0;
            await item.save().catch(() => {});
          }
        }
        updated.push(item);
      }

      res.status(200).json({
        success: true,
        wishlist: updated,
        totalItems: updated.length,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Check if product is in wishlist
router.get(
  "/check/:productId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const exists = await WishlistItem.findOne({
        user: req.user._id,
        product: req.params.productId,
      });

      res.status(200).json({
        success: true,
        isWishlisted: Boolean(exists),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Process Price Drop Notifications (cron job)
router.post(
  "/process-price-drops",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const droppedItems = await WishlistItem.find({
        priceDrop: true,
        priceDropNotified: false,
      }).populate("product", "name discountPrice");

      let notified = 0;
      for (const item of droppedItems) {
        if (item.product) {
          await Notification.create({
            recipient: item.user,
            recipientType: "user",
            title: "Price Drop Alert! 🏷️",
            message: `${item.productSnapshot?.name || item.product.name} dropped ${item.priceDropPercent}% from ETB ${item.priceWhenAdded} to ETB ${item.product.discountPrice}!`,
            type: "wishlist_price_drop",
            referenceId: item.product._id.toString(),
            priority: "medium",
          }).catch(() => {});

          item.priceDropNotified = true;
          await item.save().catch(() => {});
          notified++;
        }
      }

      res.status(200).json({
        success: true,
        notifiedCount: notified,
        message: `Sent ${notified} price drop notification(s).`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
