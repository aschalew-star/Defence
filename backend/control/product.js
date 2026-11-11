const express = require("express");
const { isSeller, isAuthenticated, isAdmin } = require("../middleware/auth");
const catchAsyncErrors = require("../utils/asynerror");
const router = express.Router();
const Product = require("../model/product");
const Shop = require("../model/Shop");
const Category = require("../model/category");
const cloudinary = require("cloudinary");
const ErrorHandler = require("../utils/handleerror");

// 1. Create Product (Merchant)
router.post(
  "/create-product",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId || (req.seller && req.seller._id);
      if (!shopId) {
        return next(new ErrorHandler("Shop ID is required to create a product!", 400));
      }

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new ErrorHandler("Merchant shop not found with this ID!", 400));
      }

      if (shop.status === "suspended") {
        return next(
          new ErrorHandler("Your shop is currently suspended. Please contact support.", 403)
        );
      }

      let images = [];
      if (req.body.images) {
        if (typeof req.body.images === "string") {
          images.push(req.body.images);
        } else if (Array.isArray(req.body.images)) {
          images = req.body.images;
        }
      }

      if (images.length === 0) {
        return next(new ErrorHandler("At least one product image is required!", 400));
      }

      const imagesLinks = [];

      for (let i = 0; i < images.length; i++) {
        if (typeof images[i] === "object" && images[i].url) {
          imagesLinks.push(images[i]);
        } else if (typeof images[i] === "string" && images[i].startsWith("data:image")) {
          const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
            width: 1000,
            crop: "scale",
          });

          imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url,
          });
        }
      }

      // Reorder & set featured/main image
      let featuredIndex = parseInt(req.body.featuredImageIndex, 10);
      if (isNaN(featuredIndex) || featuredIndex < 0 || featuredIndex >= imagesLinks.length) {
        featuredIndex = 0;
      }

      if (featuredIndex > 0 && featuredIndex < imagesLinks.length) {
        const [chosenMain] = imagesLinks.splice(featuredIndex, 1);
        imagesLinks.unshift(chosenMain);
      }

      imagesLinks.forEach((img, idx) => {
        img.isFeatured = idx === 0;
      });

      const productData = { ...req.body };
      productData.images = imagesLinks;
      if (imagesLinks.length > 0) {
        productData.featuredImage = {
          public_id: imagesLinks[0].public_id,
          url: imagesLinks[0].url,
        };
      }
      productData.shop = {
        _id: shop._id,
        name: shop.name,
        email: shop.email,
        avatar: shop.avatar,
        address: shop.address,
        city: shop.city,
        ratings: shop.ratings,
        isVerified: shop.isVerified,
      };
      productData.shopId = shop._id.toString();
      productData.shopRef = shop._id;

      if (productData.originalPrice) {
        productData.originalPrice = Number(productData.originalPrice);
      }
      if (productData.discountPrice) {
        productData.discountPrice = Number(productData.discountPrice);
      }
      if (productData.stock) {
        productData.stock = Number(productData.stock);
      }

      // Check category reference
      if (productData.category) {
        const cat = await Category.findOne({
          $or: [{ name: productData.category }, { slug: productData.category }],
        });
        if (cat) {
          productData.categoryRef = cat._id;
        }
      }

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        product,
        message: "Artisan product created successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message || error, 400));
    }
  })
);

// 2. Get All Products (Public, with Multi-Merchant Filters & Search)
router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const {
        keyword,
        category,
        minPrice,
        maxPrice,
        ratings,
        sort,
        page = 1,
        limit = 12,
      } = req.query;

      const query = { status: "active" };

      // Text or keyword search
      if (keyword) {
        query.$or = [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
          { tags: { $regex: keyword, $options: "i" } },
        ];
      }

      // Category filter (flexible partial or exact match)
      if (category && category !== "all" && category !== "All") {
        query.category = { $regex: category, $options: "i" };
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.discountPrice = {};
        if (minPrice) query.discountPrice.$gte = Number(minPrice);
        if (maxPrice) query.discountPrice.$lte = Number(maxPrice);
      }

      // Rating filter
      if (ratings) {
        query.ratings = { $gte: Number(ratings) };
      }

      // Sort
      let sortOption = { createdAt: -1 };
      if (sort === "price-low-to-high" || sort === "price-low") {
        sortOption = { discountPrice: 1 };
      } else if (sort === "price-high-to-low" || sort === "price-high") {
        sortOption = { discountPrice: -1 };
      } else if (sort === "top-rated") {
        sortOption = { ratings: -1 };
      } else if (sort === "best-selling" || sort === "popular") {
        sortOption = { sold_out: -1 };
      }

      const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 12));
      const parsedPage = Math.max(1, Number(page) || 1);
      const skip = (parsedPage - 1) * parsedLimit;

      const [products, totalProducts] = await Promise.all([
        Product.find(query)
          .sort(sortOption)
          .skip(skip)
          .limit(parsedLimit)
          .lean(),
        Product.countDocuments(query),
      ]);

      res.status(200).json({
        success: true,
        products,
        totalProducts,
        page: parsedPage,
        pages: Math.ceil(totalProducts / parsedLimit),
        limit: parsedLimit,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 3. Get All Products of a Specific Shop
router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find({
        $or: [{ shopId: req.params.id }, { shopRef: req.params.id }],
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 4. Get Single Product Details
router.get(
  "/product/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id).populate("shopRef");

      if (!product) {
        return next(new ErrorHandler("Product not found with this id", 404));
      }

      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 5. Update Product (Seller)
router.put(
  "/update-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found with this id", 404));
      }

      const sellerIdStr = req.seller._id.toString();
      const productShopId = product.shopId || (product.shopRef && product.shopRef.toString());

      if (productShopId !== sellerIdStr) {
        return next(new ErrorHandler("You are not authorized to update this craft!", 403));
      }

      const updateData = { ...req.body };
      delete updateData._id;
      delete updateData.shopId;
      delete updateData.shop;
      delete updateData.shopRef;

      // Handle image updates if supplied
      if (req.body.images && Array.isArray(req.body.images)) {
        const imagesLinks = [];
        for (const img of req.body.images) {
          if (typeof img === "object" && img.url) {
            imagesLinks.push(img);
          } else if (typeof img === "string" && img.startsWith("data:image")) {
            const result = await cloudinary.v2.uploader.upload(img, {
              folder: "products",
              width: 1000,
              crop: "scale",
            });
            imagesLinks.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
          }
        }
        if (imagesLinks.length > 0) {
          let featuredIndex = parseInt(req.body.featuredImageIndex, 10);
          if (isNaN(featuredIndex) || featuredIndex < 0 || featuredIndex >= imagesLinks.length) {
            featuredIndex = 0;
          }
          if (featuredIndex > 0 && featuredIndex < imagesLinks.length) {
            const [chosenMain] = imagesLinks.splice(featuredIndex, 1);
            imagesLinks.unshift(chosenMain);
          }
          imagesLinks.forEach((img, idx) => {
            img.isFeatured = idx === 0;
          });
          updateData.images = imagesLinks;
          updateData.featuredImage = {
            public_id: imagesLinks[0].public_id,
            url: imagesLinks[0].url,
          };
        }
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        product: updatedProduct,
        message: "Product updated successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 6. Delete Product of a Shop (Seller)
router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found with this id", 404));
      }

      const sellerIdStr = req.seller._id.toString();
      const productShopId = product.shopId || (product.shopRef && product.shopRef.toString());

      if (productShopId !== sellerIdStr) {
        return next(
          new ErrorHandler("You can only delete products from your own store!", 403)
        );
      }

      if (product.images && product.images.length > 0) {
        for (let i = 0; i < product.images.length; i++) {
          if (product.images[i].public_id) {
            await cloudinary.v2.uploader
              .destroy(product.images[i].public_id)
              .catch(() => {});
          }
        }
      }

      await Product.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully from store!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 7. Create New Review for Product
router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { user, rating, comment, productId } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return next(new ErrorHandler("Product not found with this ID", 404));
      }

      const Review = require("../model/review");

      // Check if user already reviewed
      const existingReview = await Review.findOne({
        user: req.user._id,
        productId,
      });

      if (existingReview) {
        existingReview.rating = Number(rating);
        existingReview.comment = comment;
        await existingReview.save();
      } else {
        await Review.create({
          user: req.user._id,
          userData: {
            name: req.user.name,
            avatar: req.user.avatar,
          },
          productId,
          productRef: product._id,
          shopId: product.shopId,
          shopRef: product.shopRef,
          rating: Number(rating),
          comment,
        });
      }

      // Recalculate average
      await Review.calculateProductRating(productId);

      const updatedProduct = await Product.findById(productId);

      res.status(200).json({
        success: true,
        message: "Review added successfully!",
        ratings: updatedProduct.ratings,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 8. Admin Get All Products
router.get(
  "/admin-all-products",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// 9. Admin Moderate Product (Approve/Reject)
router.put(
  "/admin-approve-product/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { approvalStatus, approvalNotes } = req.body;
      const product = await Product.findById(req.params.id);

      if (!product) {
        return next(new ErrorHandler("Product not found with this id", 404));
      }

      product.approvalStatus = approvalStatus || product.approvalStatus;
      if (approvalNotes !== undefined) product.approvalNotes = approvalNotes;

      await product.save();

      res.status(200).json({
        success: true,
        product,
        message: `Product marked as ${product.approvalStatus}`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
