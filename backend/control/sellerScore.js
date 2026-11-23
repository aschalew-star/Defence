const express = require("express");
const router = express.Router();
const SellerScore = require("../model/sellerScore");
const Shop = require("../model/Shop");
const SubOrder = require("../model/SubOrder");
const Review = require("../model/review");
const Dispute = require("../model/dispute");
const Return = require("../model/return");
const Notification = require("../model/notification");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");

// 1. Get Seller Score (Public — shown on storefront)
router.get(
  "/score/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      let score = await SellerScore.findOne({ shop: req.params.shopId });

      if (!score) {
        // Auto-create score for shops that don't have one yet
        score = await SellerScore.create({ shop: req.params.shopId });
      }

      res.status(200).json({
        success: true,
        score: {
          overallScore: score.overallScore,
          communicationScore: score.communicationScore,
          shippingScore: score.shippingScore,
          itemAsDescribedScore: score.itemAsDescribedScore,
          trustBadge: score.trustBadge,
          totalOrders: score.totalOrders,
          completedOrders: score.completedOrders,
          avgRating: score.avgRating,
          positiveReviewRate: score.positiveReviewRate,
          avgDeliveryDays: score.avgDeliveryDays,
          responseRate: score.responseRate,
          totalReviews: score.totalReviews,
          lastComputedAt: score.lastComputedAt,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Recompute Seller Score (triggered after order delivery, review, dispute, etc.)
router.post(
  "/recompute/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.params.shopId;
      let score = await SellerScore.findOne({ shop: shopId });

      if (!score) {
        score = await SellerScore.create({ shop: shopId });
      }

      // Gather raw metrics from actual data
      const [
        totalOrders,
        completedOrders,
        cancelledOrders,
        disputes,
        disputesLost,
        returns,
        reviews,
      ] = await Promise.all([
        SubOrder.countDocuments({
          $or: [{ shopId: shopId }, { shop: shopId }],
        }),
        SubOrder.countDocuments({
          $or: [{ shopId: shopId }, { shop: shopId }],
          status: "Delivered",
        }),
        SubOrder.countDocuments({
          $or: [{ shopId: shopId }, { shop: shopId }],
          status: "Cancelled",
        }),
        Dispute.countDocuments({ shop: shopId }),
        Dispute.countDocuments({
          shop: shopId,
          status: "Resolved - Refunded",
        }),
        Return.countDocuments({ shop: shopId }).catch(() => 0),
        Review.find({ $or: [{ shopId: shopId }, { shopRef: shopId }] }),
      ]);

      // Calculate on-time vs late deliveries
      const deliveredOrders = await SubOrder.find({
        $or: [{ shopId: shopId }, { shop: shopId }],
        status: "Delivered",
        "milestones.shippedAt": { $exists: true },
      }).select("milestones sla");

      let onTimeDeliveries = 0;
      let lateDeliveries = 0;
      let totalDeliveryDays = 0;

      for (const order of deliveredOrders) {
        const shipped = order.milestones?.shippedAt;
        const delivered = order.milestones?.deliveredAt || order.milestones?.confirmedDeliveredAt;
        if (shipped && delivered) {
          const days = (new Date(delivered) - new Date(shipped)) / (1000 * 60 * 60 * 24);
          totalDeliveryDays += days;

          if (order.sla?.mustDeliverBy && new Date(delivered) <= new Date(order.sla.mustDeliverBy)) {
            onTimeDeliveries++;
          } else if (days <= 7) {
            onTimeDeliveries++;
          } else {
            lateDeliveries++;
          }
        } else {
          onTimeDeliveries++; // assume on-time if no data
        }
      }

      // Review stats
      const totalReviewCount = reviews.length;
      const avgRating =
        totalReviewCount > 0
          ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / totalReviewCount) * 10) / 10
          : 5;
      const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
      const positiveReviewRate =
        totalReviewCount > 0 ? Math.round((positiveReviews / totalReviewCount) * 100) : 100;

      // Update raw metrics
      score.totalOrders = totalOrders;
      score.completedOrders = completedOrders;
      score.cancelledOrders = cancelledOrders;
      score.onTimeDeliveries = onTimeDeliveries;
      score.lateDeliveries = lateDeliveries;
      score.avgDeliveryDays =
        deliveredOrders.length > 0
          ? Math.round((totalDeliveryDays / deliveredOrders.length) * 10) / 10
          : 0;
      score.totalDisputes = disputes;
      score.disputesLost = disputesLost;
      score.totalReturns = returns;
      score.totalReviews = totalReviewCount;
      score.avgRating = avgRating;
      score.positiveReviewRate = positiveReviewRate;

      await score.save();

      // Run the computation
      const computedScore = await SellerScore.computeScore(shopId);

      // Sync trust badge back to Shop model
      if (computedScore) {
        await Shop.findByIdAndUpdate(shopId, {
          sellerScore: computedScore._id,
          sellerTier:
            computedScore.trustBadge === "Gold Master Weaver"
              ? "Top Rated Master Artisan"
              : computedScore.trustBadge === "Top Rated Artisan"
                ? "Gold Merchant"
                : computedScore.trustBadge === "Trusted Artisan"
                  ? "Verified Guild"
                  : "Standard Artisan",
          ratings: computedScore.avgRating,
          totalReviewsCount: computedScore.totalReviews,
        }).catch(() => {});
      }

      res.status(200).json({
        success: true,
        score: computedScore,
        message: "Seller score recomputed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Admin Issue Penalty to Seller
router.post(
  "/admin-penalty/:shopId",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { type, description, points, expiresInDays } = req.body;
      let score = await SellerScore.findOne({ shop: req.params.shopId });

      if (!score) {
        score = await SellerScore.create({ shop: req.params.shopId });
      }

      score.penalties.push({
        type: type || "Policy Violation",
        description: description || "",
        points: Number(points) || 5,
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + (expiresInDays || 90) * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      await score.save();

      // Recompute after penalty
      await SellerScore.computeScore(req.params.shopId);

      // Notify seller
      try {
        await Notification.create({
          recipient: req.params.shopId,
          recipientType: "seller",
          title: "⚠️ Seller Score Penalty Issued",
          message: `A ${points || 5}-point penalty was issued: ${type || "Policy Violation"}. ${description || ""}`,
          type: "sla_warning",
          priority: "urgent",
        });
      } catch (e) {}

      res.status(200).json({
        success: true,
        score,
        message: "Penalty issued and score updated.",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Admin View All Seller Scores (leaderboard)
router.get(
  "/admin-leaderboard",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const scores = await SellerScore.find()
        .populate("shop", "name avatar city isVerified sellerTier")
        .sort({ overallScore: -1 });

      res.status(200).json({ success: true, scores });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Seller View Own Score
router.get(
  "/my-score",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let score = await SellerScore.findOne({ shop: req.seller._id });

      if (!score) {
        score = await SellerScore.create({ shop: req.seller._id });
      }

      res.status(200).json({ success: true, score });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
