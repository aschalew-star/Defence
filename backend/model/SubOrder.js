const mongoose = require("mongoose");

const subOrderSchema = new mongoose.Schema(
  {
    subOrderNumber: {
      type: String,
      default: function () {
        return (
          "SUB-" +
          Date.now().toString().slice(-6) +
          "-" +
          Math.floor(100 + Math.random() * 900)
        );
      },
      index: true,
      unique: true,
    },
    parentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    parentOrderNumber: {
      type: String,
      index: true,
    },
    shopId: {
      type: String,
      required: true,
      index: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      index: true,
    },
    shopData: {
      name: String,
      email: String,
      phoneNumber: String,
      address: String,
      city: String,
      tinNumber: String,
      vatNumber: String,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userData: {
      name: String,
      email: String,
      phoneNumber: String,
    },
    items: [
      {
        _id: { type: String },
        name: { type: String, required: true },
        description: { type: String },
        sku: { type: String },
        discountPrice: { type: Number, required: true },
        originalPrice: { type: Number },
        qty: { type: Number, required: true, default: 1 },
        selectedSize: { type: String },
        selectedColor: { type: String },
        images: [{ public_id: String, url: String }],
        customMeasurements: {
          bust: { type: String, default: "" },
          waist: { type: String, default: "" },
          hips: { type: String, default: "" },
          heightOrLength: { type: String, default: "" },
          shoulderToShoulder: { type: String, default: "" },
          armLength: { type: String, default: "" },
          additionalInstructions: { type: String, default: "" },
        },
      },
    ],
    itemsTotal: {
      type: Number,
      required: true,
      min: [0, "Items total cannot be negative"],
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: [0, "Shipping fee cannot be negative"],
    },
    subTotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },

    // Multi-Vendor Merchant Escrow Accounting & Taxes (Ethiopian Proclamation Compliance)
    financials: {
      subTotal: { type: Number, default: 0 },
      shippingFee: { type: Number, default: 0 },
      platformCommissionRate: { type: Number, default: 10 },
      platformFeeAmount: { type: Number, default: 0 },
      vatRate: { type: Number, default: 0 }, // 0% or 15% VAT if registered
      vatAmount: { type: Number, default: 0 },
      merchantNetEarnings: { type: Number, default: 0 },
      payoutStatus: {
        type: String,
        enum: [
          "Pending Escrow",
          "Inspection Period",
          "Eligible for Payout",
          "Payout Requested",
          "Paid Out",
          "Refunded",
          "Disputed Frozen",
        ],
        default: "Pending Escrow",
        index: true,
      },
      payoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Withdraw",
      },
      escrowReleasedAt: {
        type: Date,
      },
    },

    // Fraud Prevention: Secure Delivery Verification & Handover Code
    deliveryVerification: {
      deliveryOtp: {
        type: String,
        default: function () {
          return Math.floor(100000 + Math.random() * 900000).toString();
        },
      },
      isOtpVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date },
      verifiedBy: {
        type: String,
        enum: ["Customer", "CourierOTP", "AutoReleaseTimer", "AdminArbitration", "None"],
        default: "None",
      },
      inspectionWindowEndsAt: { type: Date },
      preShipmentProof: {
        photoUrl: { type: String, default: "" },
        note: { type: String, default: "" },
        uploadedAt: { type: Date },
      },
    },

    // Ethiopian Tax Law (Ministry of Revenues & Proclamation 1205/2020) E-Invoice
    taxInvoice: {
      invoiceNumber: {
        type: String,
        default: function () {
          return "MEP-INV-" + Date.now().toString().slice(-8);
        },
        index: true,
      },
      platformTin: { type: String, default: "0064291845" },
      merchantTin: { type: String, default: "" },
      vatRegistered: { type: Boolean, default: false },
      vatRate: { type: Number, default: 0 },
      vatAmount: { type: Number, default: 0 },
      issuedAt: { type: Date, default: Date.now },
    },

    // Ethiopian Logistics & Courier Tracking
    deliveryDetails: {
      provider: { type: String, default: "Direct Merchant Delivery" },
      trackingCode: { type: String, default: "" },
      estimatedDeliveryDate: { type: Date },
      deliveryNotes: { type: String, default: "" },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    deliveryProvider: { type: String, default: "Direct Merchant Delivery" },
    trackingCode: { type: String, default: "" },
    deliveryNotes: { type: String, default: "" },

    // Fulfillment Status Lifecycle
    status: {
      type: String,
      enum: [
        "Processing",
        "Confirmed",
        "Tailoring & Handweaving",
        "Quality Checked",
        "Transferred to delivery partner",
        "Out for delivery",
        "Delivered - Pending Inspection",
        "Delivered",
        "Disputed",
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

    // Fulfillment Milestone Dates
    milestones: {
      placedAt: { type: Date, default: Date.now },
      confirmedAt: { type: Date },
      tailoringStartedAt: { type: Date },
      qualityCheckedAt: { type: Date },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
      confirmedDeliveredAt: { type: Date },
    },

    // Cancellation
    cancellation: {
      isCancelled: { type: Boolean, default: false },
      cancelledBy: { type: String, enum: ["Customer", "Merchant", "Admin", "None"], default: "None" },
      reason: { type: String, default: "" },
      cancelledAt: { type: Date },
    },

    shippingAddress: {
      type: Object,
      required: true,
    },
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

module.exports = mongoose.model("SubOrder", subOrderSchema);
