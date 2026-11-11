const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your store/artisan brand name!"],
      trim: true,
      maxlength: [80, "Shop name cannot exceed 80 characters"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your shop email address!"],
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
      required: [true, "Please enter your password"],
      minLength: [6, "Password should be at least 6 characters"],
      select: false,
    },
    phoneNumber: {
      type: String,
      required: [true, "Please provide a valid phone number (Telebirr/contact)!"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please provide your workshop or store address!"],
      trim: true,
    },
    city: {
      type: String,
      default: "Addis Ababa",
      trim: true,
    },
    stateOrRegion: {
      type: String,
      default: "Addis Ababa",
      trim: true,
    },
    zipCode: {
      type: String,
      default: "1000",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: [1000, "Store description cannot exceed 1000 characters"],
    },
    story: {
      type: String,
      default: "", // Artisan lineage, handweaving heritage, culture
      maxlength: [3000, "Heritage story cannot exceed 3000 characters"],
    },
    businessType: {
      type: String,
      enum: [
        "Individual Artisan",
        "Registered Boutique",
        "Weaving Cooperative",
        "Fashion House",
        "Traditional Crafts Workshop",
      ],
      default: "Individual Artisan",
    },

    // Ethiopian Merchant Identity, Tax & Regulatory KYC
    tinNumber: {
      type: String,
      default: "",
      trim: true,
    },
    businessRegistrationNumber: {
      type: String,
      default: "",
      trim: true,
    },
    vatRegistered: {
      type: Boolean,
      default: false,
    },
    vatNumber: {
      type: String,
      default: "",
    },
    businessLicense: {
      public_id: { type: String },
      url: { type: String },
    },
    idCard: {
      public_id: { type: String },
      url: { type: String },
    },
    verificationStatus: {
      type: String,
      enum: ["Unverified", "Pending", "Verified", "Rejected"],
      default: "Unverified",
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationNotes: {
      type: String,
      default: "",
    },

    // Store Branding & Presentation
    avatar: {
      public_id: { type: String },
      url: { type: String },
    },
    banner: {
      public_id: { type: String },
      url: { type: String },
    },
    coverBanner: {
      public_id: { type: String },
      url: { type: String },
    },
    openingHours: {
      type: String,
      default: "Mon - Sat: 9:00 AM - 7:00 PM",
    },
    socialLinks: {
      telegram: { type: String, default: "" },
      instagram: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      facebook: { type: String, default: "" },
      phoneWhatsApp: { type: String, default: "" },
    },

    // Production Multi-Merchant Shipping & Delivery Configuration
    shippingSettings: {
      enableCustomShipping: { type: Boolean, default: true },
      addisAbabaRate: { type: Number, default: 150 }, // Flat rate in ETB
      regionalRate: { type: Number, default: 300 }, // Regional cities (Hawassa, Bahir Dar, etc.)
      internationalRate: { type: Number, default: 2500 }, // Ethiopian diaspora overseas
      freeShippingThreshold: { type: Number, default: 3000 }, // Free delivery if vendor subtotal >= threshold
      estimatedDeliveryDaysMin: { type: Number, default: 2 },
      estimatedDeliveryDaysMax: { type: Number, default: 5 },
      preferredCourier: { type: String, default: "Direct Merchant Delivery" },
    },

    // Multi-Merchant Operating Policies
    returnPolicy: {
      type: String,
      default: "Returns accepted within 7 days of delivery for defective items or tailoring sizing discrepancies.",
    },
    shippingPolicy: {
      type: String,
      default: "Standard delivery via courier within 2-5 business days. Custom tailored orders require additional weaving time.",
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "suspended", "vacation_mode", "pending_verification"],
      default: "active",
      index: true,
    },
    badge: {
      type: String,
      enum: [
        "Bronze Artisan",
        "Silver Artisan",
        "Gold Master Weaver",
        "Verified Cooperative",
        "Top Seller",
      ],
      default: "Bronze Artisan",
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Multi-User Staff & Role Management per Store
    staffMembers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String },
        email: { type: String },
        role: {
          type: String,
          enum: ["manager", "fulfillment", "support", "finance"],
          default: "fulfillment",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    // Multi-Merchant Financial Balances & Settlement Escrow
    availableBalance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    pendingBalance: {
      type: Number,
      default: 0, // Escrow held while customer order is in production/transit
      min: [0, "Pending escrow cannot be negative"],
    },
    totalWithdrawn: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    totalOrdersCount: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 10, // Default 10% marketplace commission rate
      min: [0, "Commission cannot be negative"],
      max: [100, "Commission cannot exceed 100%"],
    },
    payoutSchedule: {
      type: String,
      enum: ["manual", "weekly", "bi-weekly", "monthly"],
      default: "manual",
    },

    // Merchant Performance & SLA Metrics
    performanceMetrics: {
      fulfillmentRate: { type: Number, default: 100 }, // Percentage of accepted vs cancelled
      onTimeDeliveryRate: { type: Number, default: 98 }, // Percentage of orders shipped within SLA
      averageFulfillmentDays: { type: Number, default: 3 },
      disputeCount: { type: Number, default: 0 },
    },

    // Supported Ethiopian Merchant Payout Accounts
    payoutMethods: [
      {
        methodType: {
          type: String,
          enum: [
            "Telebirr",
            "CBE Birr",
            "Commercial Bank of Ethiopia (CBE)",
            "Bank of Abyssinia",
            "Dashen Bank",
            "Awash Bank",
          ],
          required: true,
        },
        accountName: { type: String, required: true },
        accountNumber: { type: String, default: "" },
        phoneNumber: { type: String, default: "" },
        bankBranch: { type: String, default: "" },
        isDefault: { type: Boolean, default: false },
      },
    ],
    withdrawMethod: {
      type: Object, // Legacy backwards compatibility
    },
    transections: [
      {
        amount: {
          type: Number,
          required: true,
        },
        status: {
          type: String,
          default: "Processing",
        },
        reference: {
          type: String,
          default: "",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
        },
      },
    ],

    role: {
      type: String,
      default: "Seller",
    },
    ratings: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    totalReviewsCount: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: String,
    resetPasswordTime: Date,
  },
  { timestamps: true }
);

// Auto-generate URL friendly slug before save if not present
shopSchema.pre("save", async function (next) {
  if (!this.slug && this.name) {
    let baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const randomSuffix = Math.random().toString(36).substring(2, 6);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }
  next();
});

// Compare password
shopSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
shopSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "Secret", {
    expiresIn: process.env.JWT_EXPIRES || "90d",
  });
};

module.exports = mongoose.model("Shop", shopSchema);
