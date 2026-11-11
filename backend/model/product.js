const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your product name!"],
      trim: true,
      maxlength: [150, "Product title cannot exceed 150 characters"],
      index: true,
    },
    sku: {
      type: String,
      default: function () {
        return "MEP-" + Math.floor(100000 + Math.random() * 900000);
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, "Please enter your product description!"],
    },
    category: {
      type: String,
      required: [true, "Please enter your product category!"],
      index: true,
    },
    categoryRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    tags: {
      type: String,
      index: true,
    },

    // Pricing & Multi-Currency (ETB Primary + USD for Diaspora)
    originalPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      required: [true, "Please enter your product price in ETB!"],
      min: [0, "Price cannot be negative"],
    },
    currency: {
      type: String,
      default: "ETB",
    },
    usdPrice: {
      type: Number, // Optional international USD price for Ethiopian diaspora
      default: null,
    },

    // Inventory & Stock Controls
    stock: {
      type: Number,
      required: [true, "Please enter your product stock quantity!"],
      min: [0, "Stock cannot be negative"],
      default: 1,
    },
    sold_out: {
      type: Number,
      default: 0,
    },
    inventorySettings: {
      trackInventory: { type: Boolean, default: true },
      lowStockThreshold: { type: Number, default: 2 },
      allowBackorders: { type: Boolean, default: false },
    },

    // Multi-Variant Matrix (SKU, specific size, color, pattern, custom price)
    variants: [
      {
        sku: { type: String },
        title: { type: String }, // e.g. "Size 40 / Gold Tibeb"
        size: { type: String },
        color: { type: String },
        material: { type: String },
        price: { type: Number },
        originalPrice: { type: Number },
        stock: { type: Number, default: 1 },
        image: { public_id: String, url: String },
      },
    ],

    // Authentic Ethiopian Artisan & Heritage Craftsmanship Details
    fabricDetails: {
      shemmaType: {
        type: String,
        enum: [
          "1-fold Lightweight (Sabi)",
          "2-fold Medium Shemma",
          "4-fold Heavy Traditional Shemma",
          "Cotton-Silk Blend (Harer)",
          "Menzo Handspun Wool",
          "Other Traditional Handloom",
        ],
        default: "2-fold Medium Shemma",
      },
      tibebPattern: {
        type: String,
        default: "Traditional Gold Cross (Meskel)",
      },
      craftingTechnique: {
        type: String,
        default: "Traditional Wooden Pit Loom (Shemma Woger)",
      },
      careInstructions: {
        type: String,
        default: "Dry clean or gentle hand wash in cold water with mild detergent. Do not bleach. Cool iron.",
      },
    },

    sizes: {
      type: [String],
      default: ["S", "M", "L", "Custom Sizing"],
    },
    colors: {
      type: [String],
      default: ["Traditional White", "Gold Tibeb"],
    },
    materials: {
      type: [String],
      default: ["100% Hand-Spun Shemma Cotton"],
    },
    isCustomizable: {
      type: Boolean,
      default: true, // Enables customer body measurements for custom tailored kemis
    },
    productionTime: {
      type: String,
      default: "Ready to ship (1-3 days)",
    },

    // Moderation & Quality Approval Workflow
    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
      index: true,
    },
    approvalNotes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "draft", "out_of_stock", "archived"],
      default: "active",
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        isFeatured: {
          type: Boolean,
          default: false,
        },
      },
    ],
    featuredImage: {
      public_id: { type: String },
      url: { type: String },
    },

    // Merchant Relationship & Denormalized Fast Cache
    shopId: {
      type: String,
      required: true,
      index: true,
    },
    shop: {
      type: Object, // Denormalized snapshot for fast reads & legacy compatibility
      required: true,
    },
    shopRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      index: true,
    },

    // Rating & Analytics
    ratings: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },
    totalReviewsCount: {
      type: Number,
      default: 0,
    },

    // Logistics & Shipping Attributes
    weight: {
      type: Number, // in kg
      default: 0.5,
    },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },

    // SEO Meta
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-sync shopRef from shopId if present
productSchema.pre("save", function (next) {
  if (this.shopId && !this.shopRef && mongoose.Types.ObjectId.isValid(this.shopId)) {
    this.shopRef = new mongoose.Types.ObjectId(this.shopId);
  }
  next();
});

// Compound text index for search across titles, descriptions, and tags
productSchema.index({ name: "text", description: "text", tags: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);
