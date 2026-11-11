// Centralized configuration and business constants for MEP Marketplace

const PLATFORM_COMMISSION_RATE = 10; // Default 10% platform fee
const MIN_WITHDRAWAL_AMOUNT = 50; // Minimum 50 ETB for payout request
const JWT_COOKIE_EXPIRE_DAYS = 90;

const ETHIOPIAN_CATEGORIES = [
  "Ethiopian Traditional Dresses (Habesha Kemis)",
  "Men's Traditional Attire (Yebahl Libs)",
  "Traditional Shawls & Blankets (Netela & Gabi)",
  "Handcrafted Footwear & Leather",
  "Traditional Jewelry & Accessories",
  "Handwoven Textiles & Home Decor",
  "Cultural Crafts & Mesob",
];

const ORDER_STATUSES = [
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
];

const PAYOUT_METHODS = [
  "Telebirr",
  "CBE Birr",
  "Commercial Bank of Ethiopia (CBE)",
  "Bank of Abyssinia",
  "Dashen Bank",
  "Awash Bank",
];

const DISPUTE_REASONS = [
  "Damaged item",
  "Item not as described",
  "Wrong size / tailoring",
  "Late delivery",
  "Item not received",
  "Quality issue",
  "Other",
];

const getCookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  };
};

module.exports = {
  PLATFORM_COMMISSION_RATE,
  MIN_WITHDRAWAL_AMOUNT,
  JWT_COOKIE_EXPIRE_DAYS,
  ETHIOPIAN_CATEGORIES,
  ORDER_STATUSES,
  PAYOUT_METHODS,
  DISPUTE_REASONS,
  getCookieOptions,
};
