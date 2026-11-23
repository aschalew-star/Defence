const express = require("express");
const router = express.Router();
const Promotion = require("../model/promotion");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isSeller } = require("../middleware/auth");

// 1. Create Promotion (Seller)
router.post(
  "/create",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        title, description, type, discountType, discountValue,
        minOrderAmount, maxDiscountAmount, applicableProducts,
        applicableCategories, isStoreWide, startDate, endDate,
        usageLimit, perUserLimit,
      } = req.body;

      if (!title || !type || !startDate || !endDate) {
        return next(new ErrorHandler("Title, type, start date and end date are required!", 400));
      }

      const promotion = await Promotion.create({
        shop: req.seller._id,
        title, description, type,
        discountType: discountType || "percentage",
        discountValue: Number(discountValue) || 0,
        minOrderAmount: Number(minOrderAmount) || 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        applicableProducts: applicableProducts || [],
        applicableCategories: applicableCategories || [],
        isStoreWide: Boolean(isStoreWide),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        perUserLimit: Number(perUserLimit) || 1,
        status: new Date(startDate) <= new Date() ? "active" : "scheduled",
      });

      res.status(201).json({
        success: true,
        promotion,
        message: "Promotion created successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Get My Promotions (Seller)
router.get(
  "/my-promotions",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const promotions = await Promotion.find({ shop: req.seller._id })
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, promotions });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Get Active Promotions for a Shop (Public)
router.get(
  "/shop/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const now = new Date();
      const promotions = await Promotion.find({
        shop: req.params.shopId,
        isActive: true,
        status: { $in: ["active", "scheduled"] },
        startDate: { $lte: now },
        endDate: { $gte: now },
      }).sort({ discountValue: -1 });

      res.status(200).json({ success: true, promotions });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Update Promotion (Seller)
router.put(
  "/update/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const promotion = await Promotion.findById(req.params.id);
      if (!promotion) {
        return next(new ErrorHandler("Promotion not found!", 404));
      }
      if (promotion.shop.toString() !== req.seller._id.toString()) {
        return next(new ErrorHandler("Unauthorized!", 403));
      }

      const allowedFields = [
        "title", "description", "discountType", "discountValue",
        "minOrderAmount", "maxDiscountAmount", "startDate", "endDate",
        "usageLimit", "perUserLimit", "isActive", "status",
        "applicableProducts", "applicableCategories", "isStoreWide",
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          promotion[field] = req.body[field];
        }
      }

      await promotion.save();

      res.status(200).json({
        success: true,
        promotion,
        message: "Promotion updated!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Delete Promotion (Seller)
router.delete(
  "/delete/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const promotion = await Promotion.findById(req.params.id);
      if (!promotion) {
        return next(new ErrorHandler("Promotion not found!", 404));
      }
      if (promotion.shop.toString() !== req.seller._id.toString()) {
        return next(new ErrorHandler("Unauthorized!", 403));
      }

      await Promotion.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Promotion deleted!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
