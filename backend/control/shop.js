const express = require("express");
const jwt = require("jsonwebtoken");
const asynfun = require("../utils/asynerror");
const bcrypt = require("bcryptjs");
const handleerror = require("../utils/handleerror");
const cloudinary = require("cloudinary");
const Router = express.Router();
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { getCookieOptions } = require("../config/constants");
const Shop = require("../model/Shop");
const Order = require("../model/Order");
const SubOrder = require("../model/SubOrder");
const Product = require("../model/product");
const LedgerEntry = require("../model/ledgerEntry");
const ActivityLog = require("../model/activityLog");

// 1. Register Merchant Store
Router.post(
  "/shopcreate",
  asynfun(async (req, res, next) => {
    try {
      const {
        name,
        email,
        password,
        zipCode,
        address,
        phoneNumber,
        avatar,
        businessType,
        tinNumber,
      } = req.body;

      if (!name || !email || !password || !phoneNumber || !address) {
        return next(
          new handleerror(
            "Please complete all required fields (Name, Email, Password, Phone Number, and Address)!",
            400
          )
        );
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return next(new handleerror("Please provide a valid email address!", 400));
      }

      if (password.length < 6) {
        return next(new handleerror("Password must be at least 6 characters!", 400));
      }

      const isExist = await Shop.findOne({ email: email.toLowerCase().trim() });
      if (isExist) {
        return next(new handleerror("A merchant already exists with this email!", 400));
      }

      let avatarData = undefined;
      if (avatar && avatar.startsWith("data:image")) {
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 250,
          crop: "scale",
        });
        avatarData = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const hashpassword = await bcrypt.hash(password, 10);

      const newseller = new Shop({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashpassword,
        zipCode: zipCode || "1000",
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        avatar: avatarData,
        businessType: businessType || "Individual Artisan",
        tinNumber: tinNumber || "",
        verificationStatus: tinNumber ? "Pending" : "Unverified",
      });

      await newseller.save();

      const token = jwt.sign(
        { id: newseller._id },
        process.env.JWT_SECRET || "Secret",
        { expiresIn: process.env.JWT_EXPIRES || "90d" }
      );

      newseller.password = undefined;

      res.status(201).cookie("seller_token", token, getCookieOptions()).json({
        success: true,
        user: newseller,
        seller_token: token,
        message: "Merchant account registered successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 2. Merchant Login
Router.post(
  "/login",
  asynfun(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new handleerror("Please provide both email and password!", 400));
      }

      const seller = await Shop.findOne({
        email: email.toLowerCase().trim(),
      }).select("+password");

      if (!seller) {
        return next(new handleerror("No merchant found with this email!", 404));
      }

      if (seller.status === "suspended") {
        return next(
          new handleerror(
            "Your merchant account has been suspended. Please contact marketplace support.",
            403
          )
        );
      }

      const compare = await bcrypt.compare(password, seller.password);
      if (!compare) {
        return next(new handleerror("Incorrect email or password!", 400));
      }

      const token = jwt.sign(
        { id: seller._id },
        process.env.JWT_SECRET || "Secret",
        { expiresIn: process.env.JWT_EXPIRES || "90d" }
      );

      seller.password = undefined;

      res.status(200).cookie("seller_token", token, getCookieOptions()).json({
        success: true,
        user: seller,
        seller_token: token,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 3. Load Current Authenticated Merchant
Router.get(
  "/getSeller",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new handleerror("Seller not found!", 404));
      }

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 4. Merchant Logout
Router.get(
  "/logout",
  asynfun(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.status(200).json({
        success: true,
        message: "Logged out from merchant store successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 5. Public Store Info
Router.get(
  "/get-shop-info/:id",
  asynfun(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.id);
      if (!shop) {
        return next(new handleerror("Store not found!", 404));
      }
      res.status(200).json({
        success: true,
        shop,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 6. Public Storefront with Active Crafts (by ID or Slug)
Router.get(
  "/storefront/:id",
  asynfun(async (req, res, next) => {
    try {
      let shop = null;
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        shop = await Shop.findById(req.params.id);
      }
      if (!shop) {
        shop = await Shop.findOne({ slug: req.params.id });
      }

      if (!shop) {
        return next(new handleerror("Store not found!", 404));
      }

      const products = await Product.find({
        $or: [{ shopId: shop._id.toString() }, { shopRef: shop._id }],
        status: "active",
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        shop,
        products,
        totalProducts: products.length,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 7. Get All Verified Marketplace Merchants (Directory / Discover Stores)
Router.get(
  "/all-shops",
  asynfun(async (req, res, next) => {
    try {
      const { verifiedOnly, featuredOnly, search } = req.query;
      const query = { status: { $ne: "suspended" } };

      if (verifiedOnly === "true") {
        query.isVerified = true;
      }
      if (featuredOnly === "true") {
        query.isFeatured = true;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } },
        ];
      }

      const shops = await Shop.find(query)
        .select("-password")
        .sort({ isFeatured: -1, ratings: -1, totalSales: -1 });

      res.status(200).json({
        success: true,
        shops,
        totalShops: shops.length,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 8. Update Store Profile & Heritage Story
Router.put(
  "/update-seller-info",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const {
        name,
        description,
        story,
        businessType,
        openingHours,
        socialLinks,
        address,
        phoneNumber,
        zipCode,
        banner,
        coverBanner,
        returnPolicy,
        shippingPolicy,
        minOrderAmount,
        status,
      } = req.body;

      const shop = await Shop.findById(req.seller._id);
      if (!shop) {
        return next(new handleerror("Merchant not found!", 404));
      }

      if (name) shop.name = name.trim();
      if (description !== undefined) shop.description = description;
      if (story !== undefined) shop.story = story;
      if (businessType) shop.businessType = businessType;
      if (openingHours) shop.openingHours = openingHours;
      if (address) shop.address = address.trim();
      if (phoneNumber) shop.phoneNumber = phoneNumber.trim();
      if (zipCode) shop.zipCode = zipCode;
      if (returnPolicy !== undefined) shop.returnPolicy = returnPolicy;
      if (shippingPolicy !== undefined) shop.shippingPolicy = shippingPolicy;
      if (minOrderAmount !== undefined) shop.minOrderAmount = Number(minOrderAmount);
      if (status && ["active", "vacation_mode"].includes(status)) shop.status = status;

      if (socialLinks) {
        shop.socialLinks = {
          ...(shop.socialLinks?.toObject ? shop.socialLinks.toObject() : shop.socialLinks || {}),
          ...socialLinks,
        };
      }

      if (banner && banner.startsWith("data:image")) {
        if (shop.banner?.public_id) {
          await cloudinary.v2.uploader.destroy(shop.banner.public_id).catch(() => {});
        }
        const bannerUpload = await cloudinary.v2.uploader.upload(banner, {
          folder: "banners",
        });
        shop.banner = {
          public_id: bannerUpload.public_id,
          url: bannerUpload.secure_url,
        };
      }

      if (coverBanner && coverBanner.startsWith("data:image")) {
        if (shop.coverBanner?.public_id) {
          await cloudinary.v2.uploader.destroy(shop.coverBanner.public_id).catch(() => {});
        }
        const coverUpload = await cloudinary.v2.uploader.upload(coverBanner, {
          folder: "banners",
        });
        shop.coverBanner = {
          public_id: coverUpload.public_id,
          url: coverUpload.secure_url,
        };
      }

      await shop.save();

      res.status(200).json({
        success: true,
        shop,
        message: "Store profile updated successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 9. Update Shipping Settings (Merchant Custom Courier Rates)
Router.put(
  "/update-shipping-settings",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const {
        addisAbabaRate,
        regionalRate,
        internationalRate,
        freeShippingThreshold,
        estimatedDeliveryDaysMin,
        estimatedDeliveryDaysMax,
        preferredCourier,
      } = req.body;

      const shop = await Shop.findById(req.seller._id);
      if (!shop) {
        return next(new handleerror("Merchant not found!", 404));
      }

      if (!shop.shippingSettings) shop.shippingSettings = {};
      if (addisAbabaRate !== undefined) shop.shippingSettings.addisAbabaRate = Number(addisAbabaRate);
      if (regionalRate !== undefined) shop.shippingSettings.regionalRate = Number(regionalRate);
      if (internationalRate !== undefined)
        shop.shippingSettings.internationalRate = Number(internationalRate);
      if (freeShippingThreshold !== undefined)
        shop.shippingSettings.freeShippingThreshold = Number(freeShippingThreshold);
      if (estimatedDeliveryDaysMin !== undefined)
        shop.shippingSettings.estimatedDeliveryDaysMin = Number(estimatedDeliveryDaysMin);
      if (estimatedDeliveryDaysMax !== undefined)
        shop.shippingSettings.estimatedDeliveryDaysMax = Number(estimatedDeliveryDaysMax);
      if (preferredCourier) shop.shippingSettings.preferredCourier = preferredCourier;

      await shop.save();

      res.status(200).json({
        success: true,
        shippingSettings: shop.shippingSettings,
        message: "Shipping settings updated successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 10. Get Merchant Immutable Financial Ledger (Statements & Audit Trail)
Router.get(
  "/ledger",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const { entryType, startDate, endDate, page = 1, limit = 50 } = req.query;
      const query = { shop: req.seller._id };

      if (entryType) query.entryType = entryType;
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const skip = (Number(page) - 1) * Number(limit);

      const entries = await LedgerEntry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const totalEntries = await LedgerEntry.countDocuments(query);

      res.status(200).json({
        success: true,
        entries,
        totalEntries,
        page: Number(page),
        pages: Math.ceil(totalEntries / Number(limit)),
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 11. Update Store Avatar
Router.put(
  "/update-shop-avatar",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.seller._id);

      if (req.body.avatar && req.body.avatar.startsWith("data:image")) {
        if (shop.avatar?.public_id) {
          await cloudinary.v2.uploader.destroy(shop.avatar.public_id).catch(() => {});
        }

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 250,
          crop: "scale",
        });

        shop.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await shop.save();

      res.status(200).json({
        success: true,
        seller: shop,
        message: "Store avatar updated successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 12. Submit TIN & Verification Documents (Merchant KYC)
Router.put(
  "/update-verification",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const { tinNumber, businessRegistrationNumber, businessLicense, idCard, vatRegistered, vatNumber } =
        req.body;
      const shop = await Shop.findById(req.seller._id);

      if (!shop) {
        return next(new handleerror("Merchant not found!", 404));
      }

      if (tinNumber) shop.tinNumber = tinNumber.trim();
      if (businessRegistrationNumber)
        shop.businessRegistrationNumber = businessRegistrationNumber.trim();
      if (vatRegistered !== undefined) shop.vatRegistered = Boolean(vatRegistered);
      if (vatNumber) shop.vatNumber = vatNumber.trim();

      if (businessLicense && businessLicense.startsWith("data:image")) {
        const upload = await cloudinary.v2.uploader.upload(businessLicense, {
          folder: "verification_docs",
        });
        shop.businessLicense = {
          public_id: upload.public_id,
          url: upload.secure_url,
        };
      }

      if (idCard && idCard.startsWith("data:image")) {
        const upload = await cloudinary.v2.uploader.upload(idCard, {
          folder: "verification_docs",
        });
        shop.idCard = {
          public_id: upload.public_id,
          url: upload.secure_url,
        };
      }

      shop.verificationStatus = "Pending";
      await shop.save();

      res.status(200).json({
        success: true,
        message: "Verification documents submitted for admin review!",
        shop,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 13. Admin Review & Verify Merchant (Protected)
Router.put(
  "/admin-verify-seller/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const { isVerified, verificationStatus, verificationNotes, commissionRate, badge, status } =
        req.body;
      const shop = await Shop.findById(req.params.id);

      if (!shop) {
        return next(new handleerror("Merchant not found!", 404));
      }

      if (isVerified !== undefined) shop.isVerified = isVerified;
      if (verificationStatus) shop.verificationStatus = verificationStatus;
      if (verificationNotes !== undefined) shop.verificationNotes = verificationNotes;
      if (commissionRate !== undefined) shop.commissionRate = Number(commissionRate);
      if (badge) shop.badge = badge;
      if (status) shop.status = status;

      await shop.save();

      await ActivityLog.create({
        actorId: req.user._id,
        actorType: "Admin",
        actorName: req.user.name,
        action: "MERCHANT_VERIFIED",
        targetId: shop._id,
        targetType: "Shop",
        details: { verificationStatus, isVerified, commissionRate },
      }).catch(() => {});

      res.status(200).json({
        success: true,
        message: `Merchant verification status updated to ${shop.verificationStatus}`,
        shop,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 14. Merchant Analytics & Escrow Dashboard
Router.get(
  "/analytics",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const shopId = req.seller._id.toString();
      const seller = await Shop.findById(shopId);

      if (!seller) {
        return next(new handleerror("Merchant not found!", 404));
      }

      let orders = await SubOrder.find({
        $or: [{ shopId }, { shop: seller._id }],
      }).sort({ createdAt: -1 });

      if (orders.length === 0) {
        orders = await Order.find({
          $or: [{ "cart.shopId": shopId }, { "cart.shop._id": shopId }],
        }).sort({ createdAt: -1 });
      }

      const totalOrders = orders.length;
      let totalSales = 0;
      let deliveredOrdersCount = 0;
      let pendingOrdersCount = 0;

      for (const ord of orders) {
        if (ord.status === "Delivered") {
          deliveredOrdersCount++;
          totalSales += ord.subTotal || ord.totalPrice || 0;
        } else if (ord.status !== "Processing refund" && ord.status !== "Refund Success") {
          pendingOrdersCount++;
        }
      }

      const commissionRate = seller.commissionRate || 10;
      const netEarnings = totalSales * ((100 - commissionRate) / 100);
      const totalProducts = await Product.countDocuments({
        $or: [{ shopId }, { shopRef: seller._id }],
      });

      res.status(200).json({
        success: true,
        analytics: {
          totalOrders,
          deliveredOrdersCount,
          pendingOrdersCount,
          totalSales,
          netEarnings,
          availableBalance: seller.availableBalance || 0,
          pendingBalance: seller.pendingBalance || 0,
          totalWithdrawn: seller.totalWithdrawn || 0,
          totalProducts,
          isVerified: seller.isVerified,
          verificationStatus: seller.verificationStatus,
          badge: seller.badge,
          status: seller.status,
          shippingSettings: seller.shippingSettings,
          recentOrders: orders.slice(0, 5),
        },
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 15. Admin Get All Sellers (Protected)
Router.get(
  "/admin-all-sellers",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const sellers = await Shop.find().select("-password").sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 16. Admin Delete Seller (Protected)
Router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.params.id);

      if (!seller) {
        return next(new handleerror("Seller not found with this id", 404));
      }

      if (seller.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(seller.avatar.public_id).catch(() => {});
      }

      await Shop.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Merchant account removed successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 17. Update Payout Methods (Telebirr, CBE, Banks)
Router.put(
  "/update-payment-methods",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const { withdrawMethod, payoutMethods } = req.body;

      const updateData = {};
      if (withdrawMethod) updateData.withdrawMethod = withdrawMethod;
      if (payoutMethods) updateData.payoutMethods = payoutMethods;

      const seller = await Shop.findByIdAndUpdate(req.seller._id, updateData, {
        new: true,
      });

      res.status(200).json({
        success: true,
        seller,
        message: "Payout methods updated successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 18. Delete Withdraw Method
Router.delete(
  "/delete-withdraw-method",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new handleerror("Seller not found", 404));
      }

      seller.withdrawMethod = null;
      await seller.save();

      res.status(200).json({
        success: true,
        seller,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

module.exports = Router;
