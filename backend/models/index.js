/**
 * Centralized Models Hub
 * Re-exports all Mongoose models with standardized PascalCase naming.
 */
const User = require("../model/user");
const Shop = require("../model/Shop");
const Product = require("../model/product");
const Order = require("../model/Order");
const SubOrder = require("../model/SubOrder");
const Event = require("../model/event");
const Coupon = require("../model/coupon");
const Review = require("../model/review");
const Conversation = require("../model/conversation");
const Message = require("../model/message");
const Withdraw = require("../model/withdraw");
const Dispute = require("../model/dispute");
const Category = require("../model/category");
const PlatformConfig = require("../model/platformConfig");
const LedgerEntry = require("../model/ledgerEntry");
const ActivityLog = require("../model/activityLog");

// New AliExpress-Grade Trust & Confidence Models
const Notification = require("../model/notification");
const Wallet = require("../model/wallet");
const ProductQA = require("../model/productQA");
const Return = require("../model/return");
const SellerScore = require("../model/sellerScore");
const BuyerProtectionClaim = require("../model/buyerProtectionClaim");
const ShopAnalytics = require("../model/shopAnalytics");
const WishlistItem = require("../model/wishlistItem");
const Promotion = require("../model/promotion");
const Cart = require("../model/cart");

module.exports = {
  User,
  Shop,
  Product,
  Order,
  SubOrder,
  Event,
  Coupon,
  Review,
  Conversation,
  Message,
  Withdraw,
  Dispute,
  Category,
  PlatformConfig,
  LedgerEntry,
  ActivityLog,
  Notification,
  Wallet,
  ProductQA,
  Return,
  SellerScore,
  BuyerProtectionClaim,
  ShopAnalytics,
  WishlistItem,
  Promotion,
  Cart,
};
