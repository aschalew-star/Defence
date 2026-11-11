const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
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
    entryType: {
      type: String,
      enum: [
        "ESCROW_HOLD", // Customer paid, funds held in escrow
        "ESCROW_RELEASE", // Order delivered, funds moved to available balance
        "PLATFORM_COMMISSION", // Marketplace platform fee deducted
        "PAYOUT_REQUEST", // Merchant requested withdrawal
        "PAYOUT_COMPLETED", // Payout disbursed via Telebirr/Bank
        "PAYOUT_REJECTED", // Payout rejected, funds returned to available balance
        "REFUND_DEDUCTION", // Customer refunded, funds deducted
        "DISPUTE_ADJUSTMENT", // Admin arbitration adjustment
        "CORRECTION", // Manual admin accounting correction
      ],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true, // Positive for credit, negative for debit
    },
    balanceType: {
      type: String,
      enum: ["pendingBalance", "availableBalance"],
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "ETB",
    },
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    subOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubOrder",
      index: true,
    },
    withdrawRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Withdraw",
      index: true,
    },
    referenceCode: {
      type: String,
      default: "", // e.g. Chapa tx_ref, Telebirr txn ID, Bank ref
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);

