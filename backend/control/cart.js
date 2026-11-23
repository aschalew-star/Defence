const express = require("express");
const router = express.Router();
const Cart = require("../model/cart");
const Product = require("../model/product");
const catchAsyncErrors = require("../utils/asynerror");
const ErrorHandler = require("../utils/handleerror");
const { isAuthenticated } = require("../middleware/auth");

// 1. Get Cart
router.get(
  "/my-cart",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      let cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      // Refresh prices and stock availability
      for (const item of cart.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const newPrice = product.discountPrice;
          item.currentPrice = newPrice;
          item.isAvailable = product.stock > 0 && product.status === "active";
          item.priceChanged = newPrice !== item.priceWhenAdded;
        } else {
          item.isAvailable = false;
        }
      }
      await cart.save();

      res.status(200).json({ success: true, cart });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 2. Add Item to Cart
router.post(
  "/add",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        productId,
        qty,
        selectedSize,
        selectedColor,
        variantSku,
        customMeasurements,
      } = req.body;

      if (!productId) {
        return next(new ErrorHandler("Product ID is required!", 400));
      }

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found!", 404));
      }

      if (product.stock < (qty || 1)) {
        return next(new ErrorHandler("Insufficient stock!", 400));
      }

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
      }

      // Check if already in cart
      const existingIdx = cart.items.findIndex(
        (item) =>
          item.product.toString() === productId &&
          (item.selectedSize || "") === (selectedSize || "") &&
          (item.selectedColor || "") === (selectedColor || "")
      );

      if (existingIdx !== -1) {
        cart.items[existingIdx].qty += qty || 1;
      } else {
        cart.items.push({
          product: productId,
          shopRef: product.shopRef || null,
          shopId: product.shopId,
          name: product.name,
          image: product.images?.[0]?.url || product.featuredImage?.url || "",
          selectedSize: selectedSize || "",
          selectedColor: selectedColor || "",
          variantSku: variantSku || "",
          priceWhenAdded: product.discountPrice,
          currentPrice: product.discountPrice,
          originalPrice: product.originalPrice || null,
          qty: qty || 1,
          customMeasurements: customMeasurements || {},
          isAvailable: true,
          priceChanged: false,
        });
      }

      await cart.save();

      res.status(200).json({
        success: true,
        cart,
        message: "Item added to cart!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Update Cart Item Quantity
router.put(
  "/update-qty",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { productId, qty, selectedSize, selectedColor } = req.body;
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        return next(new ErrorHandler("Cart not found!", 404));
      }

      const item = cart.items.find(
        (i) =>
          i.product.toString() === productId &&
          (i.selectedSize || "") === (selectedSize || "") &&
          (i.selectedColor || "") === (selectedColor || "")
      );

      if (!item) {
        return next(new ErrorHandler("Item not in cart!", 404));
      }

      if (qty <= 0) {
        cart.items = cart.items.filter(
          (i) => !(i.product.toString() === productId &&
            (i.selectedSize || "") === (selectedSize || "") &&
            (i.selectedColor || "") === (selectedColor || ""))
        );
      } else {
        item.qty = qty;
      }

      await cart.save();

      res.status(200).json({ success: true, cart });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Remove Item from Cart
router.delete(
  "/remove/:itemId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return next(new ErrorHandler("Cart not found!", 404));
      }

      cart.items = cart.items.filter(
        (item) => item._id.toString() !== req.params.itemId
      );

      await cart.save();

      res.status(200).json({ success: true, cart, message: "Item removed from cart." });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Clear Cart
router.delete(
  "/clear",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        cart.appliedCoupon = { code: "", discountType: "", discountValue: 0 };
        await cart.save();
      }

      res.status(200).json({ success: true, message: "Cart cleared." });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 6. Apply Coupon to Cart
router.post(
  "/apply-coupon",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { code } = req.body;
      const Coupon = require("../model/coupon");
      const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        endDate: { $gte: new Date() },
      });

      if (!coupon) {
        return next(new ErrorHandler("Invalid or expired coupon code!", 400));
      }

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return next(new ErrorHandler("Cart not found!", 404));
      }

      cart.appliedCoupon = {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      };

      await cart.save();

      res.status(200).json({
        success: true,
        cart,
        message: `Coupon "${coupon.code}" applied!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 7. Sync Cart (merge local cart with server cart on login)
router.post(
  "/sync",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(200).json({ success: true, message: "Nothing to sync." });
      }

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = new Cart({ user: req.user._id, items: [] });
      }

      for (const clientItem of items) {
        if (!clientItem.productId && !clientItem._id) continue;

        const productId = clientItem.productId || clientItem._id;
        const existing = cart.items.find(
          (i) => i.product.toString() === productId
        );

        if (!existing) {
          const product = await Product.findById(productId);
          if (product && product.stock > 0) {
            cart.items.push({
              product: productId,
              shopRef: product.shopRef || null,
              shopId: product.shopId,
              name: product.name,
              image: product.images?.[0]?.url || "",
              selectedSize: clientItem.selectedSize || "",
              selectedColor: clientItem.selectedColor || "",
              priceWhenAdded: product.discountPrice,
              currentPrice: product.discountPrice,
              originalPrice: product.originalPrice || null,
              qty: clientItem.qty || 1,
              isAvailable: true,
            });
          }
        }
      }

      await cart.save();

      res.status(200).json({ success: true, cart, message: "Cart synced!" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
