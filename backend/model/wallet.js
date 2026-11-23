const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Wallet balance cannot be negative"],
    },
    currency: {
      type: String,
      default: "ETB",
    },
    loyaltyCoins: {
      type: Number,
      default: 100, // 100 free welcome coins upon creation
      min: [0, "Coins cannot be negative"],
    },

    // ─── AliExpress-Grade Loyalty & Cashback ───────────────────

    // Tiered loyalty system (auto-upgraded based on spending)
    loyaltyTier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"],
      default: "Bronze",
    },
    // Cashback percentage for this tier
    cashbackRate: {
      type: Number,
      default: 1, // 1% base cashback
      min: 0,
      max: 25,
    },
    // Lifetime cashback earned
    totalCashbackEarned: {
      type: Number,
      default: 0,
    },
    // Referral tracking
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    transactions: [
      {
        transactionType: {
          type: String,
          enum: [
            // Original types
            "topup",
            "purchase_debit",
            "refund_credit",
            "cashback",
            "referral_reward",
            "coins_redemption",
            "dispute_settlement",
            // New AliExpress-grade types
            "loyalty_tier_bonus",
            "review_reward",
            "promotion_cashback",
            "birthday_bonus",
          ],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        coinsChange: {
          type: Number,
          default: 0,
        },
        referenceId: {
          type: String,
          default: "",
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
          default: null,
        },
        description: {
          type: String,
          default: "",
        },
        status: {
          type: String,
          enum: ["completed", "pending", "failed"],
          default: "completed",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Pending cashback that unlocks after inspection window
    pendingCashback: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },
        amount: {
          type: Number,
          required: true,
        },
        unlocksAt: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ["pending", "credited", "expired"],
          default: "pending",
        },
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

walletSchema.index({ "transactions.createdAt": -1 });
walletSchema.index({ loyaltyTier: 1 });
walletSchema.index({ "pendingCashback.unlocksAt": 1, "pendingCashback.status": 1 });

// Auto-generate referral code on first save if missing
walletSchema.pre("save", function (next) {
  if (!this.referralCode) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "MEP-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.referralCode = code;
  }
  next();
});

module.exports = mongoose.model("Wallet", walletSchema);
