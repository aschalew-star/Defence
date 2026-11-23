const mongoose = require("mongoose");

const sellerScoreSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      unique: true,
      index: true,
    },

    // === Core AliExpress Metrics ===

    // Overall score (0-100) — displayed prominently on storefront
    overallScore: { type: Number, default: 50, min: 0, max: 100 },

    // Breakdown scores (each 0-100)
    communicationScore: { type: Number, default: 50, min: 0, max: 100 },
    shippingScore: { type: Number, default: 50, min: 0, max: 100 },
    itemAsDescribedScore: { type: Number, default: 50, min: 0, max: 100 },

    // Trust badge (computed from overallScore + totalOrders)
    trustBadge: {
      type: String,
      enum: [
        "New Seller",
        "Rising Artisan",
        "Trusted Artisan",
        "Top Rated Artisan",
        "Gold Master Weaver",
      ],
      default: "New Seller",
    },

    // === Raw Metrics (used to compute scores) ===

    totalOrders: { type: Number, default: 0 },
    completedOrders: { type: Number, default: 0 },
    cancelledOrders: { type: Number, default: 0 },

    // Delivery metrics
    onTimeDeliveries: { type: Number, default: 0 },
    lateDeliveries: { type: Number, default: 0 },
    avgDeliveryDays: { type: Number, default: 0 },

    // Dispute & return metrics
    totalDisputes: { type: Number, default: 0 },
    disputesLost: { type: Number, default: 0 },
    totalReturns: { type: Number, default: 0 },

    // Communication metrics
    avgResponseTimeMinutes: { type: Number, default: 0 },
    responseRate: { type: Number, default: 100, min: 0, max: 100 },

    // Review metrics
    totalReviews: { type: Number, default: 0 },
    avgRating: { type: Number, default: 5, min: 0, max: 5 },
    positiveReviewRate: { type: Number, default: 100, min: 0, max: 100 },

    // Financial reliability
    totalPayoutAmount: { type: Number, default: 0 },

    // Penalties & warnings
    penalties: [
      {
        type: {
          type: String,
          enum: [
            "Late Shipment",
            "Counterfeit Claim",
            "Policy Violation",
            "Excessive Cancellation",
          ],
        },
        description: { type: String, default: "" },
        points: { type: Number, default: 0 },
        issuedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date },
        isActive: { type: Boolean, default: true },
      },
    ],

    // History for trend analysis
    scoreHistory: [
      {
        overallScore: Number,
        communicationScore: Number,
        shippingScore: Number,
        itemAsDescribedScore: Number,
        recordedAt: { type: Date, default: Date.now },
      },
    ],

    // Last computed
    lastComputedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Static method to recompute seller score
sellerScoreSchema.statics.computeScore = async function (shopId) {
  const score = await this.findOne({ shop: shopId });
  if (!score) return null;

  // Delivery score: on-time / total deliveries * 100
  const totalDeliveries = score.onTimeDeliveries + score.lateDeliveries;
  const shippingScore =
    totalDeliveries > 0
      ? Math.round((score.onTimeDeliveries / totalDeliveries) * 100)
      : 50;

  // Item as described score: inverse of dispute rate
  const disputeRate =
    score.completedOrders > 0
      ? (score.disputesLost / score.completedOrders) * 100
      : 0;
  const itemAsDescribedScore = Math.max(0, Math.round(100 - disputeRate * 10));

  // Communication score: response rate weighted with response time
  const responseTimePenalty = Math.min(
    30,
    Math.max(0, (score.avgResponseTimeMinutes - 60) / 10)
  );
  const communicationScore = Math.max(
    0,
    Math.round(score.responseRate - responseTimePenalty)
  );

  // Active penalty deductions
  const activePenalties = score.penalties.filter(
    (p) => p.isActive && (!p.expiresAt || p.expiresAt > new Date())
  );
  const penaltyDeduction = activePenalties.reduce(
    (sum, p) => sum + (p.points || 0),
    0
  );

  // Overall score: weighted average
  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        shippingScore * 0.35 +
          itemAsDescribedScore * 0.35 +
          communicationScore * 0.3 -
          penaltyDeduction
      )
    )
  );

  // Determine trust badge
  let trustBadge = "New Seller";
  if (score.totalOrders >= 500 && overallScore >= 95) {
    trustBadge = "Gold Master Weaver";
  } else if (score.totalOrders >= 200 && overallScore >= 85) {
    trustBadge = "Top Rated Artisan";
  } else if (score.totalOrders >= 50 && overallScore >= 70) {
    trustBadge = "Trusted Artisan";
  } else if (score.totalOrders >= 10 && overallScore >= 50) {
    trustBadge = "Rising Artisan";
  }

  // Update
  score.overallScore = overallScore;
  score.shippingScore = shippingScore;
  score.itemAsDescribedScore = itemAsDescribedScore;
  score.communicationScore = communicationScore;
  score.trustBadge = trustBadge;
  score.lastComputedAt = new Date();

  // Record history (keep last 90 entries)
  score.scoreHistory.push({
    overallScore,
    communicationScore,
    shippingScore,
    itemAsDescribedScore,
    recordedAt: new Date(),
  });
  if (score.scoreHistory.length > 90) {
    score.scoreHistory = score.scoreHistory.slice(-90);
  }

  await score.save();
  return score;
};

module.exports = mongoose.model("SellerScore", sellerScoreSchema);
