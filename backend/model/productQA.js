const mongoose = require("mongoose");

const productQASchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      default: "Customer",
    },
    userAvatar: {
      type: String,
      default: "",
    },
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      maxlength: [500, "Question cannot exceed 500 characters"],
    },
    answers: [
      {
        responder: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        responderType: {
          type: String,
          enum: ["merchant", "admin", "buyer"],
          default: "merchant",
        },
        responderName: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          required: [true, "Answer text is required"],
          trim: true,
          maxlength: [1000, "Answer cannot exceed 1000 characters"],
        },
        isVerifiedSeller: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["published", "pending", "hidden"],
      default: "published",
      index: true,
    },
  },
  { timestamps: true }
);

productQASchema.index({ product: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("ProductQA", productQASchema);
