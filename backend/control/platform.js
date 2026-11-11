const express = require("express");
const router = express.Router();
const PlatformConfig = require("../model/platformConfig");
const Shop = require("../model/Shop");
const Order = require("../model/Order");
const Product = require("../model/product");
const SubOrder = require("../model/SubOrder");
const ActivityLog = require("../model/activityLog");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// 1. Get Platform Configuration (Public)
router.get(
  "/config",
  catchAsyncErrors(async (req, res, next) => {
    try {
      let config = await PlatformConfig.findOne();
      if (!config) {
        config = await PlatformConfig.create({});
      }

      res.status(200).json({
        success: true,
        config,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Update Platform Configuration (Admin Protected)
router.put(
  "/admin-update-config",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      let config = await PlatformConfig.findOne();
      if (!config) {
        config = new PlatformConfig();
      }

      const {
        platformName,
        defaultCommissionRate,
        minWithdrawalAmount,
        requireSellerVerification,
        requireProductApproval,
        supportContact,
        announcementBanner,
        maintenanceMode,
      } = req.body;

      if (platformName) config.platformName = platformName;
      if (defaultCommissionRate !== undefined)
        config.defaultCommissionRate = Number(defaultCommissionRate);
      if (minWithdrawalAmount !== undefined)
        config.minWithdrawalAmount = Number(minWithdrawalAmount);
      if (requireSellerVerification !== undefined)
        config.requireSellerVerification = requireSellerVerification;
      if (requireProductApproval !== undefined)
        config.requireProductApproval = requireProductApproval;
      if (supportContact) config.supportContact = supportContact;
      if (announcementBanner) config.announcementBanner = announcementBanner;
      if (maintenanceMode !== undefined) config.maintenanceMode = maintenanceMode;

      await config.save();

      res.status(200).json({
        success: true,
        config,
        message: "Platform settings updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Marketplace Overview & Aggregated Analytics (Admin Protected)
router.get(
  "/admin-overview-metrics",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const totalMerchants = await Shop.countDocuments();
      const verifiedMerchants = await Shop.countDocuments({ isVerified: true });
      const totalProducts = await Product.countDocuments();
      const totalOrders = await Order.countDocuments();

      // Aggregate gross merchandise value (GMV) and platform commissions
      const financialStats = await SubOrder.aggregate([
        {
          $group: {
            _id: null,
            totalGrossSales: { $sum: "$subTotal" },
            totalPlatformFees: { $sum: "$financials.platformFeeAmount" },
            totalMerchantNet: { $sum: "$financials.merchantNetEarnings" },
          },
        },
      ]);

      const recentLogs = await ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10);

      res.status(200).json({
        success: true,
        metrics: {
          totalMerchants,
          verifiedMerchants,
          totalProducts,
          totalOrders,
          grossSales: financialStats[0]?.totalGrossSales || 0,
          platformRevenue: financialStats[0]?.totalPlatformFees || 0,
          merchantDisbursements: financialStats[0]?.totalMerchantNet || 0,
          recentLogs,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;

