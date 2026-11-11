const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your event product name!"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please enter your event product description!"],
    },
    category: {
      type: String,
      required: [true, "Please enter your event product category!"],
      index: true,
    },
    start_Date: {
      type: Date,
      required: true,
    },
    Finish_Date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Running", "Expired", "Upcoming", "Paused"],
      default: "Running",
      index: true,
    },
    tags: {
      type: String,
      index: true,
    },
    originalPrice: {
      type: Number,
    },
    discountPrice: {
      type: Number,
      required: [true, "Please enter your event product price!"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter your event product stock!"],
    },
    sizes: {
      type: [String],
      default: ["S", "M", "L", "XL", "Custom Sizing"],
    },
    colors: {
      type: [String],
      default: [],
    },
    isCustomizable: {
      type: Boolean,
      default: false,
    },
    productionTime: {
      type: Number,
      default: 3,
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
    shopId: {
      type: String,
      required: true,
      index: true,
    },
    shop: {
      type: Object, // Denormalized snapshot
      required: true,
    },
    shopRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      index: true,
    },
    sold_out: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
