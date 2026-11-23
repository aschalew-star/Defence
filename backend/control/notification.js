const express = require("express");
const router = express.Router();
const Notification = require("../model/notification");
const User = require("../model/user");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isUserOrSeller, isAuthenticated } = require("../middleware/auth");
const { normalizePreferences } = require("../services/preferenceService");

const getRecipientId = (req) => {
  return (req.user && req.user._id) || (req.seller && req.seller._id);
};

// 1. Get User/Seller Notifications
router.get(
  "/",
  isUserOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const recipientId = getRecipientId(req);
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;
      const skip = (page - 1) * limit;

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find({ recipient: recipientId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Notification.countDocuments({ recipient: recipientId }),
        Notification.countDocuments({ recipient: recipientId, isRead: false }),
      ]);

      res.status(200).json({
        success: true,
        notifications,
        total,
        unreadCount,
        page,
        pages: Math.ceil(total / limit),
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Get Unread Count Badge
router.get(
  "/unread-count",
  isUserOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const recipientId = getRecipientId(req);
      const unreadCount = await Notification.countDocuments({
        recipient: recipientId,
        isRead: false,
      });

      res.status(200).json({
        success: true,
        unreadCount,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Mark Single Notification as Read
router.put(
  "/read/:id",
  isUserOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const recipientId = getRecipientId(req);
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: recipientId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );

      if (!notification) {
        return next(new ErrorHandler("Notification not found", 404));
      }

      res.status(200).json({
        success: true,
        notification,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Mark All Notifications as Read
router.put(
  "/read-all",
  isUserOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const recipientId = getRecipientId(req);
      await Notification.updateMany(
        { recipient: recipientId, isRead: false },
        { isRead: true, readAt: new Date() }
      );

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Get User Notification Preferences (Channels & Categories)
router.get(
  "/preferences",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      const preferences = normalizePreferences(user?.notificationPreferences);

      res.status(200).json({
        success: true,
        preferences,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 6. Update User Notification Preferences
router.put(
  "/preferences",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }

      const current = normalizePreferences(user.notificationPreferences);
      const incoming = req.body.preferences || req.body || {};

      const updated = {
        channels: {
          ...current.channels,
          ...(incoming.channels || {}),
        },
        categories: {
          orderUpdates: {
            ...current.categories.orderUpdates,
            ...(incoming.categories?.orderUpdates || {}),
          },
          artisanUpdates: {
            ...current.categories.artisanUpdates,
            ...(incoming.categories?.artisanUpdates || {}),
          },
          promotionsDeals: {
            ...current.categories.promotionsDeals,
            ...(incoming.categories?.promotionsDeals || {}),
          },
          disputesReturns: {
            ...current.categories.disputesReturns,
            ...(incoming.categories?.disputesReturns || {}),
          },
          accountSecurity: {
            ...current.categories.accountSecurity,
            ...(incoming.categories?.accountSecurity || {}),
          },
        },
        email: incoming.channels?.email !== undefined ? incoming.channels.email : current.channels.email,
        orderUpdates: incoming.categories?.orderUpdates?.email !== undefined ? incoming.categories.orderUpdates.email : current.categories.orderUpdates.email,
        promotions: incoming.categories?.promotionsDeals?.email !== undefined ? incoming.categories.promotionsDeals.email : current.categories.promotionsDeals.email,
      };

      user.notificationPreferences = updated;
      await user.save();

      res.status(200).json({
        success: true,
        preferences: updated,
        message: "Notification preferences saved successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Send Notification (Helper / Admin)
const sendNotification = async ({
  recipient,
  recipientType = "user",
  title,
  message,
  type = "system_notice",
  referenceId = "",
  referenceUrl = "",
  metadata = {},
}) => {
  try {
    return await Notification.create({
      recipient,
      recipientType,
      title,
      message,
      type,
      referenceId,
      referenceUrl,
      metadata,
    });
  } catch (err) {
    console.error("Failed to create notification:", err.message);
    return null;
  }
};

router.sendNotification = sendNotification;
module.exports = router;
