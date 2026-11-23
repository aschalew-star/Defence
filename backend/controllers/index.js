/**
 * Centralized Controllers Hub
 * Re-exports all route controllers with clean, consistent naming.
 */
const user = require("../control/user");
const shop = require("../control/shop");
const order = require("../control/order");
const product = require("../control/product");
const event = require("../control/Event");
const payment = require("../control/payment");
const message = require("../control/Message");
const conversation = require("../control/Conversation");
const withdraw = require("../control/withdraw");
const category = require("../control/category");
const review = require("../control/review");
const coupon = require("../control/coupon");
const dispute = require("../control/dispute");
const platform = require("../control/platform");
const wallet = require("../control/wallet");
const notification = require("../control/notification");
const qa = require("../control/productqa");

// New AliExpress-Grade Trust & Confidence Controllers
const returnCtrl = require("../control/return");
const sellerScore = require("../control/sellerScore");
const wishlist = require("../control/wishlist");
const cart = require("../control/cart");
const promotion = require("../control/promotion");

module.exports = {
  user,
  shop,
  order,
  product,
  event,
  payment,
  message,
  conversation,
  withdraw,
  category,
  review,
  coupon,
  dispute,
  platform,
  wallet,
  notification,
  qa,
  returnCtrl,
  sellerScore,
  wishlist,
  cart,
  promotion,
};
