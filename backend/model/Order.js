const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      default: function () {
        return (
          "MEP-" +
          Date.now().toString().slice(-6) +
          "-" +
          Math.floor(100 + Math.random() * 900)
        );
      },
      index: true,
      unique: true,
    },
    // Multi-Vendor Architecture: Reference to dedicated sub-orders per merchant
    subOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubOrder",
      },
    ],
    // Snapshot of entire customer cart for backward compatibility
    cart: {
      type: Array,
      required: true,
    },
    shippingAddress: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },
    shippingTotal: {
      type: Number,
      default: 0,
    },
    discountTotal: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: "",
    },

    // Aggregated Marketplace Financials
    financials: {
      subTotal: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      platformCommissionRate: { type: Number, default: 10 },
      platformFeeAmount: { type: Number, default: 0 },
      merchantNetEarnings: { type: Number, default: 0 },
      payoutStatus: {
        type: String,
        enum: [
          "Pending Escrow",
          "Eligible for Payout",
          "Payout Requested",
          "Paid Out",
          "Refunded",
        ],
        default: "Pending Escrow",
        index: true,
      },
    },

    // Ethiopian Logistics & Courier Tracking (Primary/Overall)
    deliveryDetails: {
      provider: { type: String, default: "Direct Merchant Delivery" },
      trackingCode: { type: String, default: "" },
      estimatedDeliveryDate: { type: Date },
      deliveryNotes: { type: String, default: "" },
    },
    deliveryProvider: { type: String, default: "" },
    trackingCode: { type: String, default: "" },
    deliveryNotes: { type: String, default: "" },

    // Custom Body Measurements for Tailored Garments
    customMeasurements: {
      bust: { type: String, default: "" },
      waist: { type: String, default: "" },
      hips: { type: String, default: "" },
      heightOrLength: { type: String, default: "" },
      additionalInstructions: { type: String, default: "" },
    },

    status: {
      type: String,
      enum: [
        "Processing",
        "Partially Fulfilled",
        "Tailoring & Handweaving",
        "Quality Checked",
        "Transferred to delivery partner",
        "Out for delivery",
        "Delivered",
        "Processing refund",
        "Refund Success",
        "Cancelled",
      ],
      default: "Processing",
      index: true,
    },
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
        updatedBy: { type: String, default: "System" },
      },
    ],
    paymentInfo: {
      id: { type: String },
      status: { type: String, default: "Pending" },
      type: { type: String, default: "Chapa" },
      tx_ref: { type: String },
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
