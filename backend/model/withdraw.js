const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },
    shopId: {
      type: String,
      required: true,
      index: true,
    },
    seller: {
      type: Object, // Denormalized snapshot for legacy frontend compatibility
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Please provide the withdrawal amount!"],
      min: [50, "Minimum withdrawal amount is 50 ETB"],
    },
    status: {
      type: String,
      enum: ["Processing", "Approved", "Paid", "Rejected"],
      default: "Processing",
      index: true,
    },
    payoutMethod: {
      methodType: { type: String, required: true },
      accountName: { type: String, required: true },
      accountNumber: { type: String, default: "" },
      phoneNumber: { type: String, default: "" },
      bankBranch: { type: String, default: "" },
    },
    transactionReference: {
      type: String,
      default: "", // Bank ref number / Telebirr transfer confirmation ID
    },
    adminComment: {
      type: String,
      default: "",
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdraw", withdrawSchema);
