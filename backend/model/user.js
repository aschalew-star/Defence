const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { signAuthToken } = require("../config/jwt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name!"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email!"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [
        function () {
          return this.authProvider === "local" || !this.authProvider;
        },
        "Please enter your password",
      ],
      minLength: [6, "Password should be at least 6 characters"],
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    addresses: [
      {
        country: {
          type: String,
          default: "Ethiopia",
        },
        city: {
          type: String,
          default: "Addis Ababa",
        },
        address1: {
          type: String,
        },
        address2: {
          type: String,
        },
        zipCode: {
          type: String,
          default: "1000",
        },
        addressType: {
          type: String,
          default: "Home",
        },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
      index: true,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    customMeasurements: {
      bust: { type: String, default: "" },
      waist: { type: String, default: "" },
      hips: { type: String, default: "" },
      length: { type: String, default: "" },
      shoulders: { type: String, default: "" },
      height: { type: String, default: "" },
      notes: { type: String, default: "" },
      unit: { type: String, default: "cm" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // AliExpress Enterprise E-Commerce Features:
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
    loyaltyCoins: {
      type: Number,
      default: 100, // 100 bonus welcome coins
      min: [0, "Coins cannot be negative"],
    },
    followedShops: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
      },
    ],
    recentlyViewed: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notificationPreferences: {
      channels: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
      },
      categories: {
        orderUpdates: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: true },
        },
        artisanUpdates: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
        promotionsDeals: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
        disputesReturns: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: true },
        },
        accountSecurity: {
          inApp: { type: Boolean, default: true },
          email: { type: Boolean, default: true },
          sms: { type: Boolean, default: false },
        },
      },
      // Backward-compatibility keys
      email: { type: Boolean, default: true },
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      priceDrop: { type: Boolean, default: true },
    },
    shoppingPreferences: {
      favoriteCategories: [{ type: String }],
      preferredSizing: {
        type: String,
        enum: ["Petite", "Regular", "Plus Size", "Custom Bespoke Tailored"],
        default: "Regular",
      },
      isDiaspora: {
        type: Boolean,
        default: false,
      },
      preferredCurrency: {
        type: String,
        enum: ["ETB", "USD", "EUR", "GBP"],
        default: "ETB",
      },
      preferredDeliveryCity: {
        type: String,
        default: "Addis Ababa",
      },
      preferredLanguage: {
        type: String,
        enum: ["en", "am", "om", "ti"],
        default: "en",
      },
    },
    welcomeBonusClaimed: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordTime: Date,

    // === AliExpress-Grade Trust & Engagement Fields ===

    // Trust level (computed from order history)
    trustLevel: {
      type: String,
      enum: ["new", "bronze", "silver", "gold", "platinum"],
      default: "new",
      index: true,
    },

    // Buyer stats (gives sellers confidence in the buyer)
    buyerStats: {
      totalOrders: { type: Number, default: 0 },
      completedOrders: { type: Number, default: 0 },
      disputesFiled: { type: Number, default: 0 },
      returnsRequested: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      memberSince: { type: Date },
    },

    // Alert preferences (price drop / back-in-stock / flash sale alerts)
    alertPreferences: {
      priceDropAlert: { type: Boolean, default: true },
      backInStockAlert: { type: Boolean, default: true },
      flashSaleAlert: { type: Boolean, default: true },
      deliveryUpdateSMS: { type: Boolean, default: false },
      weeklyDigest: { type: Boolean, default: true },
    },

    // Saved searches (AliExpress "Following" a search)
    savedSearches: [
      {
        query: { type: String },
        filters: { type: Object },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Auto-generate unique referral code if not present
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = "HABESHA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token method
userSchema.methods.getJwtToken = function () {
  return signAuthToken(this._id);
};

module.exports = mongoose.model("User", userSchema);
