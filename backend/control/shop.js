const express = require("express");
const asynfun = require("../utils/asynerror");
const bcrypt = require("bcryptjs");
const handleerror = require("../utils/handleerror");
const cloudinary = require("cloudinary");
const Router = express.Router();
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { getCookieOptions } = require("../config/constants");
const { signAuthToken } = require("../config/jwt");
const Shop = require("../model/Shop");
const Order = require("../model/Order");
const SubOrder = require("../model/SubOrder");
const Product = require("../model/product");
const LedgerEntry = require("../model/ledgerEntry");
const ActivityLog = require("../model/activityLog");
const Withdraw = require("../model/withdraw");

// 1. Register Merchant Store
Router.post(
  "/shopcreate",
  asynfun(async (req, res, next) => {
    try {
      const {
        name,
        legalOwnerName,
        legalBusinessName,
        idType,
        idNumber,
        email,
        password,
        zipCode,
        address,
        subCity,
        woreda,
        landmark,
        phoneNumber,
        avatar,
        businessType,
        tinNumber,
        businessRegistrationNumber,
        vatRegistered,
        vatNumber,
        totRegistered,
        taxOffice,
        city,
        stateOrRegion,
        businessLicense,
        idCard,
        craftSpecialization,
        artisanLineage,
        description,
        story,
        bankName,
        accountNumber,
        accountHolderName,
        coverBanner,
        telegram,
        preferredCourier,
        dispatchDays,
      } = req.body;

      if (!name || !email || !password || !phoneNumber || !address) {
        return next(
          new handleerror(
            "Please complete all required fields (Store Name, Email, Password, Phone Number, and Address)!",
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

      // Legal Document: Business License / Registration Scan
      let businessLicenseData = undefined;
      if (businessLicense && businessLicense.startsWith("data:image")) {
        const licenseCloud = await cloudinary.v2.uploader.upload(businessLicense, {
          folder: "legal_docs",
        });
        businessLicenseData = {
          public_id: licenseCloud.public_id,
          url: licenseCloud.secure_url,
        };
      }

      // Legal Document: Owner Kebele ID / National ID Scan
      let idCardData = undefined;
      if (idCard && idCard.startsWith("data:image")) {
        const idCloud = await cloudinary.v2.uploader.upload(idCard, {
          folder: "legal_docs",
        });
        idCardData = {
          public_id: idCloud.public_id,
          url: idCloud.secure_url,
        };
      }

      // Storefront Wide Cover Banner Scan / Photo
      let coverBannerData = undefined;
      if (coverBanner && coverBanner.startsWith("data:image")) {
        const bannerCloud = await cloudinary.v2.uploader.upload(coverBanner, {
          folder: "store_banners",
          width: 1200,
          crop: "scale",
        });
        coverBannerData = {
          public_id: bannerCloud.public_id,
          url: bannerCloud.secure_url,
        };
      }

      const hashpassword = await bcrypt.hash(password, 10);

      const hasLegalDocs = Boolean(
        tinNumber || businessRegistrationNumber || businessLicenseData || idCardData
      );

      const parsedDispatchDays = Number(dispatchDays) || 3;

      const newseller = new Shop({
        name: name.trim(),
        legalOwnerName: legalOwnerName ? legalOwnerName.trim() : "",
        legalBusinessName: legalBusinessName ? legalBusinessName.trim() : (name ? name.trim() : ""),
        idType: idType || "Kebele ID",
        idNumber: idNumber ? idNumber.trim() : "",
        email: email.toLowerCase().trim(),
        password: hashpassword,
        zipCode: zipCode || "1000",
        address: address.trim(),
        subCity: subCity ? subCity.trim() : "",
        woreda: woreda ? woreda.trim() : "",
        landmark: landmark ? landmark.trim() : "",
        city: city ? city.trim() : "Addis Ababa",
        stateOrRegion: stateOrRegion ? stateOrRegion.trim() : "Addis Ababa",
        phoneNumber: phoneNumber.trim(),
        avatar: avatarData,
        coverBanner: coverBannerData,
        businessType: businessType || "Individual Artisan",
        tinNumber: tinNumber ? tinNumber.trim() : "",
        businessRegistrationNumber: businessRegistrationNumber
          ? businessRegistrationNumber.trim()
          : "",
        vatRegistered: Boolean(vatRegistered),
        vatNumber: vatNumber ? vatNumber.trim() : "",
        totRegistered: Boolean(totRegistered),
        taxOffice: taxOffice ? taxOffice.trim() : "",
        businessLicense: businessLicenseData,
        idCard: idCardData,
        description: description ? description.trim() : "",
        story: story ? story.trim() : "",
        artisanLineage: artisanLineage ? artisanLineage.trim() : "",
        craftSpecialization: Array.isArray(craftSpecialization) ? craftSpecialization : [],
        socialLinks: {
          telegram: telegram ? telegram.trim().replace(/^@/, "") : "",
        },
        shippingSettings: {
          enableCustomShipping: true,
          preferredCourier: preferredCourier ? preferredCourier.trim() : "Direct Merchant Delivery",
          estimatedDeliveryDaysMin: Math.max(1, parsedDispatchDays - 1),
          estimatedDeliveryDaysMax: parsedDispatchDays + 2,
        },
        verificationStatus: hasLegalDocs ? "Pending" : "Unverified",
        status: hasLegalDocs ? "pending_verification" : "active",
        withdrawMethod: bankName
          ? {
              bankName: bankName,
              bankAccountNumber: accountNumber || "",
              bankHolderName: accountHolderName || legalOwnerName || name,
            }
          : undefined,
        payoutMethods: bankName
          ? [
              {
                type: bankName === "telebirr" ? "telebirr" : "bank_transfer",
                bankName: bankName,
                accountNumber: accountNumber || "",
                accountHolderName: accountHolderName || legalOwnerName || name,
                isDefault: true,
              },
            ]
          : [],
      });

      await newseller.save();

      // Auto-initialize SellerScore record for new merchant
      try {
        const SellerScore = require("../model/sellerScore");
        const initialScore = await SellerScore.create({
          shop: newseller._id,
          overallScore: 80,
          trustBadge: "Bronze Artisan",
        });
        newseller.sellerScore = initialScore._id;
        await newseller.save();
      } catch (scoreErr) {
        console.error("SellerScore initialization error:", scoreErr.message);
      }

      try {
        await ActivityLog.create({
          shop: newseller._id,
          action: "MERCHANT_REGISTERED",
          details: `Artisan workshop registered: ${newseller.name} (${hasLegalDocs ? "With Ethiopian Legal KYC" : "Standard"})`,
        });
      } catch (logErr) {
        console.error("Merchant activity log error:", logErr.message);
      }

      const token = signAuthToken(newseller._id);

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

      const token = signAuthToken(seller._id);

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

      let sellerScore = null;
      try {
        const SellerScore = require("../model/sellerScore");
        sellerScore = await SellerScore.findOne({ shop: shop._id });
      } catch (e) {}

      res.status(200).json({
        success: true,
        shop,
        sellerScore: sellerScore || null,
        trustBadge: sellerScore?.trustBadge || shop.badge || "Bronze Artisan",
        structuredReturnPolicy: shop.structuredReturnPolicy || null,
        responseGuarantee: shop.responseGuarantee || null,
        specialties: shop.specialties || [],
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

      let sellerScore = null;
      try {
        const SellerScore = require("../model/sellerScore");
        sellerScore = await SellerScore.findOne({ shop: shop._id });
        if (!sellerScore) {
          sellerScore = await SellerScore.computeScore(shop._id).catch(() => null);
        }
      } catch (e) {}

      const products = await Product.find({
        $or: [{ shopId: shop._id.toString() }, { shopRef: shop._id }],
        status: "active",
      }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        shop,
        sellerScore: sellerScore || null,
        trustBadge: sellerScore?.trustBadge || shop.badge || "Bronze Artisan",
        structuredReturnPolicy: shop.structuredReturnPolicy || null,
        responseGuarantee: shop.responseGuarantee || null,
        specialties: shop.specialties || [],
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
const handleVerificationUpdate = asynfun(async (req, res, next) => {
  try {
    const {
      tinNumber,
      businessRegistrationNumber,
      businessLicense,
      idCard,
      vatRegistered,
      vatNumber,
      idType,
      idNumber,
    } = req.body;
    const shop = await Shop.findById(req.seller._id);

    if (!shop) {
      return next(new handleerror("Merchant not found!", 404));
    }

    if (tinNumber) shop.tinNumber = tinNumber.trim();
    if (businessRegistrationNumber)
      shop.businessRegistrationNumber = businessRegistrationNumber.trim();
    if (vatRegistered !== undefined) shop.vatRegistered = Boolean(vatRegistered);
    if (vatNumber) shop.vatNumber = vatNumber.trim();
    if (idType) shop.idType = idType;
    if (idNumber) shop.idNumber = idNumber.trim();

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
    shop.rejectionReason = "";
    await shop.save();

    res.status(200).json({
      success: true,
      message: "Verification documents submitted for admin review!",
      shop,
    });
  } catch (error) {
    return next(new handleerror(error.message, 500));
  }
});

Router.put(["/update-verification", "/submit-verification"], isSeller, handleVerificationUpdate);
Router.post(["/update-verification", "/submit-verification"], isSeller, handleVerificationUpdate);

// 13. Admin Review & Verify Merchant (Protected)
Router.put(
  "/admin-verify-seller/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const {
        isVerified,
        verificationStatus,
        verificationNotes,
        rejectionReason,
        commissionRate,
        badge,
        status,
        isFeatured,
        name,
        phoneNumber,
        address,
        city,
        stateOrRegion,
        subCity,
        woreda,
        landmark,
        legalOwnerName,
        legalBusinessName,
        businessType,
        tinNumber,
        businessRegistrationNumber,
        vatRegistered,
        vatNumber,
        totRegistered,
        taxOffice,
        description,
        story,
        payoutSchedule,
        shippingSettings,
        returnPolicy,
        shippingPolicy,
        balanceAdjustment,
      } = req.body;
      const shop = await Shop.findById(req.params.id);

      if (!shop) {
        return next(new handleerror("Merchant not found!", 404));
      }

      if (verificationStatus) {
        shop.verificationStatus = verificationStatus;
        if (verificationStatus === "Verified") {
          shop.isVerified = true;
          shop.status = status || "active";
          shop.verifiedAt = new Date();
          shop.verifiedBy = req.user._id;
          shop.rejectionReason = "";
          if (badge) shop.badge = badge;
          else if (!shop.badge || shop.badge === "Bronze Artisan") {
            shop.badge = "Bronze Artisan";
          }
        } else if (verificationStatus === "Rejected") {
          shop.isVerified = false;
          shop.status = status || "suspended";
          shop.rejectionReason = rejectionReason || verificationNotes || "Application did not meet compliance criteria.";
        } else if (verificationStatus === "Pending") {
          shop.isVerified = false;
          shop.status = status || "pending_verification";
        } else if (verificationStatus === "Unverified") {
          shop.isVerified = false;
        }
      }

      if (isVerified !== undefined) {
        shop.isVerified = Boolean(isVerified);
        if (shop.isVerified && shop.verificationStatus !== "Verified") {
          shop.verificationStatus = "Verified";
          shop.verifiedAt = new Date();
          shop.verifiedBy = req.user._id;
          shop.rejectionReason = "";
        }
      }

      if (verificationNotes !== undefined) shop.verificationNotes = verificationNotes;
      if (rejectionReason !== undefined) shop.rejectionReason = rejectionReason;
      if (commissionRate !== undefined && !isNaN(commissionRate)) {
        shop.commissionRate = Number(commissionRate);
      }
      if (badge) shop.badge = badge;
      if (status) shop.status = status;
      if (isFeatured !== undefined) shop.isFeatured = Boolean(isFeatured);

      // Editable profile & tax attributes
      if (name) shop.name = name;
      if (phoneNumber) shop.phoneNumber = phoneNumber;
      if (address) shop.address = address;
      if (city) shop.city = city;
      if (stateOrRegion) shop.stateOrRegion = stateOrRegion;
      if (subCity !== undefined) shop.subCity = subCity;
      if (woreda !== undefined) shop.woreda = woreda;
      if (landmark !== undefined) shop.landmark = landmark;
      if (legalOwnerName !== undefined) shop.legalOwnerName = legalOwnerName;
      if (legalBusinessName !== undefined) shop.legalBusinessName = legalBusinessName;
      if (businessType) shop.businessType = businessType;
      if (tinNumber !== undefined) shop.tinNumber = tinNumber;
      if (businessRegistrationNumber !== undefined) shop.businessRegistrationNumber = businessRegistrationNumber;
      if (vatRegistered !== undefined) shop.vatRegistered = Boolean(vatRegistered);
      if (vatNumber !== undefined) shop.vatNumber = vatNumber;
      if (totRegistered !== undefined) shop.totRegistered = Boolean(totRegistered);
      if (taxOffice !== undefined) shop.taxOffice = taxOffice;
      if (description !== undefined) shop.description = description;
      if (story !== undefined) shop.story = story;
      if (payoutSchedule) shop.payoutSchedule = payoutSchedule;
      if (shippingSettings) shop.shippingSettings = { ...shop.shippingSettings, ...shippingSettings };
      if (returnPolicy !== undefined) shop.returnPolicy = returnPolicy;
      if (shippingPolicy !== undefined) shop.shippingPolicy = shippingPolicy;

      // Direct balance adjustment (credit/debit)
      if (balanceAdjustment && balanceAdjustment.amount) {
        const adjAmount = Number(balanceAdjustment.amount);
        const adjType = balanceAdjustment.type === "debit" ? "debit" : "credit";
        const adjReason = balanceAdjustment.reason || "Administrative balance adjustment";

        if (adjType === "credit") {
          shop.availableBalance = (shop.availableBalance || 0) + adjAmount;
        } else {
          shop.availableBalance = Math.max(0, (shop.availableBalance || 0) - adjAmount);
        }

        await LedgerEntry.create({
          seller: shop._id,
          amount: adjAmount,
          type: adjType === "credit" ? "PAYOUT_RELEASE" : "FEE_DEDUCTION",
          status: "COMPLETED",
          reference: `ADMIN-ADJ-${Date.now()}`,
          description: adjReason,
        }).catch(() => {});
      }

      await shop.save();

      await ActivityLog.create({
        actorId: req.user._id,
        actorType: "Admin",
        actorName: req.user.name || "System Admin",
        action: "MERCHANT_MANAGEMENT_UPDATE",
        targetId: shop._id,
        targetType: "Shop",
        details: { verificationStatus, isVerified, commissionRate, status, badge, isFeatured },
      }).catch(() => {});

      res.status(200).json({
        success: true,
        message: `Merchant ${shop.name} updated successfully!`,
        shop,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// Admin Get 360-Degree Merchant Dossier (Shop, Products, Orders, Withdrawals, Logs)
Router.get(
  "/admin-seller-dossier/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const shopId = req.params.id;
      const shop = await Shop.findById(shopId).select("-password");

      if (!shop) {
        return next(new handleerror("Merchant store not found!", 404));
      }

      const products = await Product.find({
        $or: [{ shopId }, { shopRef: shop._id }],
      }).sort({ createdAt: -1 });

      let orders = await SubOrder.find({
        $or: [{ shopId }, { shop: shop._id }],
      }).sort({ createdAt: -1 }).limit(50);

      if (orders.length === 0) {
        orders = await Order.find({
          $or: [{ "cart.shopId": shopId }, { "cart.shop._id": shopId }],
        }).sort({ createdAt: -1 }).limit(50);
      }

      const withdrawals = await Withdraw.find({
        $or: [{ seller: shop._id }, { "seller._id": shop._id }],
      }).sort({ createdAt: -1 }).limit(20);

      const activityLogs = await ActivityLog.find({
        $or: [{ targetId: shop._id }, { actorId: shop._id }],
      }).sort({ createdAt: -1 }).limit(30);

      res.status(200).json({
        success: true,
        dossier: {
          shop,
          products,
          orders,
          withdrawals,
          activityLogs,
          metrics: {
            totalProducts: products.length,
            inStockProducts: products.filter((p) => (p.stock || 0) > 0).length,
            outOfStockProducts: products.filter((p) => (p.stock || 0) <= 0).length,
            totalOrders: orders.length,
            completedOrders: orders.filter((o) => o.status === "Delivered").length,
            pendingOrders: orders.filter((o) => o.status !== "Delivered" && o.status !== "Refund Success").length,
          },
        },
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// Admin Bulk Merchant Operations
Router.post(
  "/admin-bulk-sellers",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const { sellerIds, action, payload = {} } = req.body;

      if (!Array.isArray(sellerIds) || sellerIds.length === 0) {
        return next(new handleerror("Please provide at least one merchant to process!", 400));
      }

      let updateQuery = {};
      let actionLog = "BULK_UPDATE";

      switch (action) {
        case "verify":
          updateQuery = {
            isVerified: true,
            verificationStatus: "Verified",
            status: "active",
            verifiedAt: new Date(),
            verifiedBy: req.user._id,
            rejectionReason: "",
            ...(payload.badge ? { badge: payload.badge } : {}),
            ...(payload.commissionRate ? { commissionRate: Number(payload.commissionRate) } : {}),
          };
          actionLog = "BULK_MERCHANT_VERIFIED";
          break;

        case "suspend":
          updateQuery = {
            status: "suspended",
            verificationNotes: payload.reason || "Suspended during bulk compliance audit.",
          };
          actionLog = "BULK_MERCHANT_SUSPENDED";
          break;

        case "activate":
          updateQuery = {
            status: "active",
          };
          actionLog = "BULK_MERCHANT_ACTIVATED";
          break;

        case "set_commission":
          if (payload.commissionRate === undefined || isNaN(payload.commissionRate)) {
            return next(new handleerror("Please specify a valid commission rate percentage!", 400));
          }
          updateQuery = {
            commissionRate: Number(payload.commissionRate),
          };
          actionLog = "BULK_COMMISSION_UPDATED";
          break;

        case "set_badge":
          if (!payload.badge) {
            return next(new handleerror("Please specify a badge to grant!", 400));
          }
          updateQuery = {
            badge: payload.badge,
          };
          actionLog = "BULK_BADGE_UPDATED";
          break;

        case "feature":
          updateQuery = {
            isFeatured: payload.isFeatured !== false,
          };
          actionLog = "BULK_FEATURE_UPDATED";
          break;

        default:
          return next(new handleerror(`Unknown bulk action: ${action}`, 400));
      }

      const result = await Shop.updateMany(
        { _id: { $in: sellerIds } },
        { $set: updateQuery }
      );

      await ActivityLog.create({
        actorId: req.user._id,
        actorType: "Admin",
        actorName: req.user.name || "System Admin",
        action: actionLog,
        targetType: "Shop",
        details: { count: sellerIds.length, action, payload },
      }).catch(() => {});

      res.status(200).json({
        success: true,
        message: `Successfully processed ${result.modifiedCount} merchants with action "${action}"`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// Admin Send Official Notice / Message to Merchant
Router.post(
  "/admin-seller-send-notice/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const { title, message, noticeType = "info" } = req.body;
      const shop = await Shop.findById(req.params.id);

      if (!shop) {
        return next(new handleerror("Merchant store not found!", 404));
      }

      if (!title || !message) {
        return next(new handleerror("Title and message content are required!", 400));
      }

      await ActivityLog.create({
        actorId: req.user._id,
        actorType: "Admin",
        actorName: req.user.name || "System Admin",
        action: "OFFICIAL_ADMIN_NOTICE",
        targetId: shop._id,
        targetType: "Shop",
        details: { title, message, noticeType },
      }).catch(() => {});

      res.status(200).json({
        success: true,
        message: `Official notice sent to ${shop.name}!`,
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

      let sellerScore = null;
      try {
        const SellerScore = require("../model/sellerScore");
        sellerScore = await SellerScore.findOne({ shop: seller._id });
        if (!sellerScore) {
          sellerScore = await SellerScore.computeScore(seller._id).catch(() => null);
        }
      } catch (e) {}

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
          sellerScore: sellerScore || null,
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

// 18b. Withdraw Request Backward Compatibility Alias
Router.post(
  "/create-withdraw-request",
  isSeller,
  (req, res, next) => {
    const withdrawRouter = require("./withdraw");
    withdrawRouter.handle(req, res, next);
  }
);

// 19. AliExpress Shop Followers: Toggle Follow / Unfollow Store
Router.post(
  "/toggle-follow/:shopId",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const User = require("../model/user");

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return next(new handleerror("Artisan shop not found", 404));
      }

      const user = await User.findById(req.user._id);
      const isFollowing = (user.followedShops || []).some(
        (id) => id.toString() === shopId
      );

      if (isFollowing) {
        user.followedShops = user.followedShops.filter(
          (id) => id.toString() !== shopId
        );
        shop.followersCount = Math.max(0, (shop.followersCount || 1) - 1);
      } else {
        if (!user.followedShops) user.followedShops = [];
        user.followedShops.push(shop._id);
        shop.followersCount = (shop.followersCount || 0) + 1;
      }

      await Promise.all([user.save(), shop.save()]);

      res.status(200).json({
        success: true,
        isFollowing: !isFollowing,
        followersCount: shop.followersCount,
        message: !isFollowing
          ? `You are now following ${shop.name}!`
          : `Unfollowed ${shop.name}`,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 20. Check If Customer Follows Shop
Router.get(
  "/is-following/:shopId",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const User = require("../model/user");
      const user = await User.findById(req.user._id);

      const isFollowing = (user.followedShops || []).some(
        (id) => id.toString() === shopId
      );

      res.status(200).json({
        success: true,
        isFollowing,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 21. AliExpress Vacation Mode: Merchant Temporarily Pauses Shop
Router.put(
  "/vacation-mode",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const { isActive, message, returnDate } = req.body;
      const seller = await Shop.findById(req.seller._id);

      if (!seller) {
        return next(new handleerror("Seller not found", 404));
      }

      seller.vacationMode = {
        isActive: Boolean(isActive),
        message: message || "Our artisan workshop is taking a brief cultural holiday. Orders will be processed upon our return!",
        returnDate: returnDate ? new Date(returnDate) : null,
      };

      seller.status = isActive ? "vacation_mode" : "active";
      await seller.save();

      res.status(200).json({
        success: true,
        vacationMode: seller.vacationMode,
        message: isActive
          ? "Vacation mode activated. Your shop banner is updated."
          : "Vacation mode deactivated. Your shop is live and taking orders!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 22. AliExpress Frequently Bought Together: Create Bundle Deal
Router.post(
  "/bundle-deal",
  isSeller,
  asynfun(async (req, res, next) => {
    try {
      const { title, description, products, discountPercentage } = req.body;

      if (!products || !Array.isArray(products) || products.length < 2) {
        return next(new handleerror("A bundle deal must include at least 2 products", 400));
      }

      const seller = await Shop.findById(req.seller._id);
      if (!seller) {
        return next(new handleerror("Seller not found", 404));
      }

      if (!seller.bundleDeals) seller.bundleDeals = [];

      seller.bundleDeals.push({
        title: title || "Artisan Ensemble Bundle",
        description: description || "Buy together for an exclusive craft discount",
        products,
        discountPercentage: Number(discountPercentage) || 15,
        isActive: true,
        createdAt: new Date(),
      });

      await seller.save();

      // Also cross-link products in bundleProducts for quick lookup
      await Product.updateMany(
        { _id: { $in: products } },
        { $addToSet: { bundleProducts: { $each: products } } }
      );

      res.status(201).json({
        success: true,
        message: "Bundle deal created successfully!",
        bundleDeals: seller.bundleDeals,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 23. Get Bundle Deals for a Shop
Router.get(
  "/bundle-deals/:shopId",
  asynfun(async (req, res, next) => {
    try {
      const shop = await Shop.findById(req.params.shopId).populate(
        "bundleDeals.products",
        "name images discountPrice originalPrice ratings"
      );

      if (!shop) {
        return next(new handleerror("Shop not found", 404));
      }

      const activeBundles = (shop.bundleDeals || []).filter((b) => b.isActive);

      res.status(200).json({
        success: true,
        bundleDeals: activeBundles,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 24. AliExpress-Grade Merchant Trust Profile & Verification Signals
Router.get(
  "/trust-badge/:shopId",
  asynfun(async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const shop = await Shop.findById(shopId).select("-password");

      if (!shop) {
        return next(new handleerror("Merchant not found", 404));
      }

      let sellerScore = null;
      try {
        const SellerScore = require("../model/sellerScore");
        sellerScore = await SellerScore.findOne({ shop: shop._id });
        if (!sellerScore) {
          sellerScore = await SellerScore.computeScore(shop._id).catch(() => null);
        }
      } catch (e) {}

      res.status(200).json({
        success: true,
        trustProfile: {
          shopId: shop._id,
          name: shop.name,
          isVerified: shop.isVerified,
          verificationStatus: shop.verificationStatus,
          trustBadge: sellerScore?.trustBadge || shop.badge || "Bronze Artisan",
          overallScore: sellerScore?.overallScore || 85,
          ratings: shop.ratings || 5,
          ratingsCount: shop.ratingsCount || 0,
          totalSales: shop.totalSales || 0,
          slaCompliance: sellerScore?.slaCompliance?.rate || 98,
          responseGuarantee: shop.responseGuarantee || { avgResponseHours: 24, responseRate: 100 },
          structuredReturnPolicy: shop.structuredReturnPolicy || { acceptsReturns: true, returnWindowDays: 15 },
          specialties: shop.specialties || [],
          establishedYear: shop.createdAt ? new Date(shop.createdAt).getFullYear() : 2024,
        },
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

module.exports = Router;
