const express = require("express");
const router = express.Router();
const Coupon = require("../model/coupon");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");

// 1. Validate & Apply Coupon (Public / Customer Checkout)
router.post(
  "/apply-coupon",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { code, cartTotal, shopId, userId } = req.body;

      if (!code) {
        return next(new ErrorHandler("Please provide a coupon code!", 400));
      }

      const coupon = await Coupon.findOne({
        code: code.toUpperCase().trim(),
        isActive: true,
      });

      if (!coupon) {
        return next(new ErrorHandler("Invalid or expired coupon code!", 404));
      }

      const now = new Date();
      if (coupon.endDate && coupon.endDate < now) {
        return next(new ErrorHandler("This coupon code has expired!", 400));
      }

      if (coupon.startDate && coupon.startDate > now) {
        return next(new ErrorHandler("This coupon is not active yet!", 400));
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return next(new ErrorHandler("Coupon redemption limit reached!", 400));
      }

      // Check min order amount
      if (cartTotal && Number(cartTotal) < coupon.minOrderAmount) {
        return next(
          new ErrorHandler(
            `Minimum order amount for this coupon is ${coupon.minOrderAmount} ETB!`,
            400
          )
        );
      }

      // Check if vendor-specific coupon
      if (coupon.shop && shopId && coupon.shop.toString() !== shopId) {
        return next(
          new ErrorHandler("This coupon is only valid for items from a specific merchant store!", 400)
        );
      }

      // Check user usage limit
      if (userId && coupon.usedBy) {
        const userRedemptions = coupon.usedBy.filter(
          (u) => u.user && u.user.toString() === userId.toString()
        ).length;
        if (userRedemptions >= coupon.userUsageLimit) {
          return next(
            new ErrorHandler("You have already used this coupon maximum allowed times!", 400)
          );
        }
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (Number(cartTotal) * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      res.status(200).json({
        success: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount,
          title: coupon.title,
        },
        discountAmount,
        message: "Coupon applied successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Merchant Create Coupon (Self-funded promotion for merchant's store)
router.post(
  "/seller-create-coupon",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        code,
        title,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        usageLimit,
        endDate,
      } = req.body;

      if (!code || !discountValue || !endDate) {
        return next(
          new ErrorHandler("Coupon code, discount value, and expiration date are required!", 400)
        );
      }

      const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
      if (existing) {
        return next(new ErrorHandler("Coupon code already exists! Choose another.", 400));
      }

      const coupon = await Coupon.create({
        code: code.toUpperCase().trim(),
        title: title || "",
        description: description || "",
        discountType: discountType || "percentage",
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        endDate: new Date(endDate),
        shop: req.seller._id,
        isPlatformFunded: false,
      });

      res.status(201).json({
        success: true,
        coupon,
        message: "Merchant coupon created successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Get Merchant's Own Coupons
router.get(
  "/seller-all-coupons",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const coupons = await Coupon.find({ shop: req.seller._id }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        coupons,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Delete Merchant Coupon
router.delete(
  "/delete-coupon/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const coupon = await Coupon.findById(req.params.id);
      if (!coupon) {
        return next(new ErrorHandler("Coupon not found!", 404));
      }

      if (coupon.shop && coupon.shop.toString() !== req.seller._id.toString()) {
        return next(new ErrorHandler("You can only delete your own coupons!", 403));
      }

      await Coupon.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Coupon removed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Admin Create Platform-Wide Coupon
router.post(
  "/admin-create-coupon",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        code,
        title,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount,
        usageLimit,
        endDate,
      } = req.body;

      const coupon = await Coupon.create({
        code: code.toUpperCase().trim(),
        title: title || "",
        description: description || "",
        discountType: discountType || "percentage",
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        endDate: new Date(endDate),
        shop: null, // Platform-wide
        isPlatformFunded: true,
      });

      res.status(201).json({
        success: true,
        coupon,
        message: "Platform coupon created successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 6. Admin Get All Coupons
router.get(
  "/admin-all-coupons",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const coupons = await Coupon.find()
        .populate("shop", "name email")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        coupons,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

