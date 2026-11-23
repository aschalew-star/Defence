const express = require("express");
const rateLimit = require("express-rate-limit");
const asynfun = require("../utils/asynerror");
const bcrypt = require("bcryptjs");
const handleerror = require("../utils/handleerror");
const cloudinary = require("cloudinary");
const Router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const { signAuthToken } = require("../config/jwt");
const User = require("../model/user");
const Wallet = require("../model/wallet");
const Notification = require("../model/notification");
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many administrator sign-in attempts. Try again later.",
  },
});

const getCookieOptions = () => ({
  expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
});

// 1. User Signup
Router.post(
  "/signup",
  asynfun(async (req, res, next) => {
    try {
      const {
        name,
        email,
        password,
        avatar,
        phoneNumber,
        favoriteCategories,
        preferredSizing,
        isDiaspora,
        preferredCurrency,
        city,
        country,
        referralCode,
      } = req.body;

      if (!name || !email || !password) {
        return next(new handleerror("Please complete all required fields!", 400));
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return next(new handleerror("Please provide a valid email address!", 400));
      }

      if (password.length < 6) {
        return next(new handleerror("Password must be at least 6 characters!", 400));
      }

      const isExist = await User.findOne({ email: email.toLowerCase().trim() });
      if (isExist) {
        return next(new handleerror("User already exists with this email!", 400));
      }

      let avatarData = undefined;
      if (avatar && avatar.startsWith("data:image")) {
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
        avatarData = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const hashpassword = await bcrypt.hash(password, 10);

      // Handle referral bonus and tracking
      let referrerUser = null;
      let initialCoins = 100; // Standard 100 welcome coins

      if (referralCode && typeof referralCode === "string" && referralCode.trim()) {
        const cleanCode = referralCode.toUpperCase().trim();
        referrerUser = await User.findOne({ referralCode: cleanCode });
        if (referrerUser) {
          initialCoins = 150; // Extra 50 bonus coins for referral
          // Reward referrer with 150 coins
          referrerUser.loyaltyCoins = (referrerUser.loyaltyCoins || 0) + 150;
          await referrerUser.save();

          // Create notification for referrer
          try {
            await Notification.create({
              recipientUser: referrerUser._id,
              title: "Friend Joined via Your Referral! 🎁",
              message: `${name.trim()} just registered using your referral code. +150 Habesha Coins have been added to your balance!`,
              type: "reward",
            });
          } catch (notifErr) {
            console.error("Referrer notification error:", notifErr.message);
          }
        }
      }

      // Initial address profile if provided
      const initialAddresses = [];
      if (city || country) {
        initialAddresses.push({
          country: country ? country.trim() : (isDiaspora ? "United States" : "Ethiopia"),
          city: city ? city.trim() : "Addis Ababa",
          address1: isDiaspora ? "Diaspora International Express Address" : "Local Residence Address",
          zipCode: isDiaspora ? "90210" : "1000",
          addressType: "Home",
        });
      }

      const newUser = new User({
        name: name.trim(),
        password: hashpassword,
        email: email.toLowerCase().trim(),
        phoneNumber: phoneNumber ? phoneNumber.trim() : "",
        avatar: avatarData,
        loyaltyCoins: initialCoins,
        referredBy: referrerUser ? referrerUser._id : null,
        addresses: initialAddresses,
        shoppingPreferences: {
          favoriteCategories: Array.isArray(favoriteCategories) ? favoriteCategories : [],
          preferredSizing: preferredSizing || "Regular",
          isDiaspora: Boolean(isDiaspora),
          preferredCurrency: preferredCurrency || (isDiaspora ? "USD" : "ETB"),
          preferredDeliveryCity: city ? city.trim() : "Addis Ababa",
        },
      });

      await newUser.save();

      // Initialize Wallet for the new user
      try {
        const userWallet = await Wallet.create({
          user: newUser._id,
          balance: 0,
          escrowBalance: 0,
          currency: isDiaspora ? "USD" : "ETB",
        });
        newUser.wallet = userWallet._id;
        await newUser.save();
      } catch (wErr) {
        console.error("User wallet init error:", wErr.message);
      }

      // Send welcome notification to user's inbox
      try {
        await Notification.create({
          recipientUser: newUser._id,
          title: "Welcome to Habesha Artisan Marketplace! 🇪🇹",
          message: `Ameseginalen ${newUser.name}! Your account is active with ${initialCoins} Habesha Coins credited to your loyalty balance. Start exploring authentic handwoven dresses, cultural crafts, and artisan heritage!`,
          type: "system",
        });
      } catch (notifErr) {
        console.error("Welcome notification error:", notifErr.message);
      }

      const token = signAuthToken(newUser._id);

      newUser.password = undefined;

      res.status(201).cookie("token", token, getCookieOptions()).json({
        success: true,
        user: newUser,
        token,
        message: `Welcome to MEP! ${initialCoins} Habesha Coins have been credited to your account.`,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 2. User Login
Router.post(
  "/admin-login",
  adminLoginLimiter,
  asynfun(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
      ) {
        return next(new handleerror("Please provide both email and password!", 400));
      }

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
      }).select("+password");

      if (!user || user.isActive === false) {
        return next(new handleerror("Invalid administrator credentials.", 401));
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);
      if (
        !isPasswordMatched ||
        !["admin", "superadmin"].includes(user.role)
      ) {
        return next(new handleerror("Invalid administrator credentials.", 401));
      }

      user.lastLogin = new Date();
      await user.save();

      const token = signAuthToken(user._id);

      user.password = undefined;

      res.status(200).cookie("token", token, getCookieOptions()).json({
        success: true,
        user,
        token,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

Router.post(
  "/login",
  asynfun(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new handleerror("Please provide both email and password!", 400));
      }

      const user = await User.findOne({
        email: email.toLowerCase().trim(),
      }).select("+password");

      if (!user) {
        return next(new handleerror("User does not exist with this email!", 400));
      }

      if (user.isActive === false) {
        return next(
          new handleerror("Your account has been deactivated. Please contact support.", 403)
        );
      }

      const isPasswordMatched = await bcrypt.compare(password, user.password);

      if (!isPasswordMatched) {
        return next(new handleerror("Incorrect email or password!", 400));
      }

      user.lastLogin = new Date();
      await user.save();

      const token = signAuthToken(user._id);

      user.password = undefined;

      res.status(200).cookie("token", token, getCookieOptions()).json({
        success: true,
        user,
        token,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 2b. Google Sign-In & Instant Sign-Up
Router.post(
  "/google-auth",
  asynfun(async (req, res, next) => {
    try {
      let { email, name, avatar, googleId, credential } = req.body;

      // Verify Google JWT credential directly via Google's official API
      if (credential && typeof credential === "string") {
        const axios = require("axios");
        try {
          const googleRes = await axios.get(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
          );
          if (googleRes.data && googleRes.data.email) {
            email = googleRes.data.email;
            name = googleRes.data.name || name;
            avatar = googleRes.data.picture || avatar;
            googleId = googleRes.data.sub || googleId;
          }
        } catch (apiErr) {
          // If tokeninfo verification fails (or local testing), parse JWT payload
          try {
            const parts = credential.split(".");
            if (parts.length >= 2) {
              const base64Url = parts[1];
              const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
              const jsonPayload = decodeURIComponent(
                Buffer.from(base64, "base64")
                  .toString("binary")
                  .split("")
                  .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                  .join("")
              );
              const parsed = JSON.parse(jsonPayload);
              if (parsed.email) email = parsed.email;
              if (parsed.name) name = parsed.name;
              if (parsed.picture) avatar = parsed.picture;
              if (parsed.sub) googleId = parsed.sub;
            }
          } catch (jwtErr) {
            console.error("Google credential parse err:", jwtErr.message);
          }
        }
      }

      if (!email || typeof email !== "string" || !email.trim()) {
        return next(
          new handleerror("Google authentication failed: Email address is required!", 400)
        );
      }

      email = email.toLowerCase().trim();
      name = name && typeof name === "string" ? name.trim() : email.split("@")[0];

      let user = await User.findOne({
        $or: [{ email }, { googleId: googleId || "non_existent_id" }],
      });
      let isNewUser = false;

      if (!user) {
        isNewUser = true;

        user = new User({
          name,
          email,
          authProvider: "google",
          googleId: googleId || undefined,
          isEmailVerified: true,
          loyaltyCoins: 100, // Instant 100 welcome coins!
          avatar: avatar
            ? {
                public_id: "google_" + (googleId || Date.now()),
                url: avatar,
              }
            : undefined,
          shoppingPreferences: {
            favoriteCategories: ["Habesha Kemis & Tibeb", "Handwoven Netela & Gabi"],
            preferredSizing: "Regular",
            isDiaspora: false,
            preferredCurrency: "ETB",
            preferredDeliveryCity: "Addis Ababa",
          },
        });

        await user.save();

        // Initialize Wallet for Google user
        try {
          const userWallet = await Wallet.create({
            user: user._id,
            balance: 0,
            escrowBalance: 0,
            currency: "ETB",
          });
          user.wallet = userWallet._id;
          await user.save();
        } catch (wErr) {
          console.error("Google user wallet create error:", wErr.message);
        }

        // Send Welcome Notification
        try {
          await Notification.create({
            recipientUser: user._id,
            title: "Welcome to Habesha Marketplace! 🇪🇹",
            message: `Welcome ${user.name}! 100 Habesha Coins have been added to your loyalty balance. Start exploring authentic handwoven items!`,
            type: "system",
          });
        } catch (nErr) {
          console.error("Welcome notification error:", nErr.message);
        }
      } else {
        if (user.isActive === false) {
          return next(
            new handleerror("Your account has been deactivated. Please contact support.", 403)
          );
        }
        user.lastLogin = new Date();
        if (googleId && !user.googleId) {
          user.googleId = googleId;
        }
        if (!user.authProvider || user.authProvider === "local") {
          // Linked Google account
          user.isEmailVerified = true;
        }
        if (avatar && (!user.avatar || !user.avatar.url)) {
          user.avatar = {
            public_id: "google_" + (googleId || Date.now()),
            url: avatar,
          };
        }
        await user.save();
      }

      const token = signAuthToken(user._id);
      user.password = undefined;

      res.status(200).cookie("token", token, getCookieOptions()).json({
        success: true,
        user,
        token,
        message: isNewUser
          ? "Account created via Google! 100 Habesha Coins credited."
          : "Welcome back!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 3. Load Current User (with AliExpress-Grade Buyer Trust Level Calculation)
Router.get(
  "/getuser",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new handleerror("User doesn't exist!", 400));
      }

      // Compute buyer trust level dynamically
      const completed = user.buyerStats?.completedOrders || 0;
      let computedLevel = "new";
      if (completed >= 25) computedLevel = "platinum";
      else if (completed >= 10) computedLevel = "gold";
      else if (completed >= 4) computedLevel = "silver";
      else if (completed >= 1) computedLevel = "bronze";

      if (user.trustLevel !== computedLevel) {
        user.trustLevel = computedLevel;
        await user.save();
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 4. Logout User
Router.get(
  "/logout",
  asynfun(async (req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
      });
      res.status(200).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 5. Update User Profile Info
Router.put(
  "/update-user-info",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const { email, password, phoneNumber, name, shoppingPreferences } = req.body;

      const user = await User.findById(req.user.id).select("+password");

      if (!user) {
        return next(new handleerror("User not found!", 400));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return next(
          new handleerror("Please provide the correct current password!", 400)
        );
      }

      user.name = name || user.name;
      user.email = email || user.email;
      user.phoneNumber = phoneNumber !== undefined ? phoneNumber : user.phoneNumber;

      if (shoppingPreferences && typeof shoppingPreferences === "object") {
        user.shoppingPreferences = {
          ...(user.shoppingPreferences || {}),
          ...shoppingPreferences,
        };
      }

      await user.save();
      user.password = undefined;

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// update customer body measurements for custom tailored kemis
Router.put(
  "/update-measurements",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new handleerror("User not found!", 400));
      }

      const { bust, waist, hips, length, shoulders, height, notes, unit } = req.body;
      user.customMeasurements = {
        bust: bust || "",
        waist: waist || "",
        hips: hips || "",
        length: length || "",
        shoulders: shoulders || "",
        height: height || "",
        notes: notes || "",
        unit: unit || "cm",
      };

      await user.save();

      res.status(200).json({
        success: true,
        user,
        message: "Traditional body measurements saved to your profile!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 6. Update User Avatar
Router.put(
  "/update-avatar",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      let existsUser = await User.findById(req.user.id);
      if (req.body.avatar && req.body.avatar !== "") {
        const imageId = existsUser.avatar?.public_id;

        if (imageId) {
          await cloudinary.v2.uploader.destroy(imageId).catch(() => {});
        }

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });

        existsUser.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await existsUser.save();

      res.status(200).json({
        success: true,
        user: existsUser,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 7. Update User Addresses
Router.put(
  "/update-user-addresses",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      const sameTypeAddress = user.addresses.find(
        (address) =>
          address.addressType === req.body.addressType &&
          (!req.body._id || address._id.toString() !== req.body._id)
      );
      if (sameTypeAddress) {
        return next(
          new handleerror(`${req.body.addressType} address already exists!`, 400)
        );
      }

      const existsAddressIndex = user.addresses.findIndex(
        (address) => address._id && address._id.toString() === req.body._id
      );

      if (existsAddressIndex !== -1) {
        Object.assign(user.addresses[existsAddressIndex], req.body);
      } else {
        user.addresses.push(req.body);
      }

      await user.save();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 8. Delete User Address
Router.delete(
  "/delete-user-address/:id",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const userId = req.user._id;
      const addressId = req.params.id;

      await User.updateOne(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } }
      );

      const user = await User.findById(userId);

      res.status(200).json({ success: true, user });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 9. Update User Password
Router.put(
  "/update-user-password",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("+password");

      const isPasswordMatched = await bcrypt.compare(
        req.body.oldPassword,
        user.password
      );

      if (!isPasswordMatched) {
        return next(new handleerror("Old password is incorrect!", 400));
      }

      if (req.body.newPassword !== req.body.confirmPassword) {
        return next(new handleerror("Passwords do not match!", 400));
      }

      user.password = await bcrypt.hash(req.body.newPassword, 10);

      await user.save();

      res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 10. Find User Information with userId
Router.get(
  "/user-info/:id",
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(new handleerror("User not found!", 404));
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 11. All Users (Admin Protected)
Router.get(
  "/admin-all-users",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const users = await User.find().sort({
        createdAt: -1,
      });
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 12. Delete User (Admin Protected)
Router.delete(
  "/delete-user/:id",
  isAuthenticated,
  isAdmin("admin", "superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(new handleerror("User is not available with this id", 400));
      }

      if (user._id.equals(req.user._id) || user.role === "superadmin") {
        return next(new handleerror("This account cannot be deleted.", 403));
      }

      if (user.role === "admin" && req.user.role !== "superadmin") {
        return next(new handleerror("Only a superadmin can delete an admin.", 403));
      }

      const imageId = user?.avatar?.public_id;
      if (imageId) {
        await cloudinary.v2.uploader.destroy(imageId).catch(() => {});
      }

      await User.findByIdAndDelete(req.params.id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

Router.put(
  "/admin-user-role/:id",
  isAuthenticated,
  isAdmin("superadmin"),
  asynfun(async (req, res, next) => {
    try {
      const { role } = req.body;
      if (!["user", "admin"].includes(role)) {
        return next(new handleerror("Role must be either user or admin.", 400));
      }

      const user = await User.findById(req.params.id);
      if (!user) {
        return next(new handleerror("User not found.", 404));
      }

      if (user._id.equals(req.user._id) || user.role === "superadmin") {
        return next(
          new handleerror("A superadmin account cannot be changed here.", 403)
        );
      }

      user.role = role;
      await user.save();

      res.status(200).json({
        success: true,
        message: `User role updated to ${role}.`,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 13. AliExpress Recently Viewed History: Track Product View
Router.post(
  "/track-recently-viewed",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const { productId } = req.body;
      if (!productId) {
        return next(new handleerror("Product ID is required", 400));
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return next(new handleerror("User not found", 404));
      }

      if (!user.recentlyViewed) user.recentlyViewed = [];

      // Remove if already exists so we can re-insert at top
      user.recentlyViewed = user.recentlyViewed.filter(
        (rv) => rv.product && rv.product.toString() !== productId
      );

      // Add to front (most recent first, cap at 20)
      user.recentlyViewed.unshift({
        product: productId,
        viewedAt: new Date(),
      });

      if (user.recentlyViewed.length > 20) {
        user.recentlyViewed = user.recentlyViewed.slice(0, 20);
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: "Recorded recently viewed craft",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 14. Get Recently Viewed Products
Router.get(
  "/recently-viewed",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: "recentlyViewed.product",
        select: "name images discountPrice originalPrice ratings sold_out flashSale bulkPricing",
      });

      if (!user) {
        return next(new handleerror("User not found", 404));
      }

      // Filter out deleted/null products
      const validProducts = (user.recentlyViewed || [])
        .filter((item) => Boolean(item.product))
        .map((item) => ({
          ...item.product.toObject(),
          viewedAt: item.viewedAt,
        }));

      res.status(200).json({
        success: true,
        products: validProducts,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 15. AliExpress Referral & Affiliate Program Stats
Router.get(
  "/referral-stats",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return next(new handleerror("User not found", 404));
      }

      if (!user.referralCode) {
        user.referralCode = "HABESHA-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        await user.save();
      }

      const referredUsers = await User.find(
        { referredBy: user._id },
        "name createdAt"
      );

      res.status(200).json({
        success: true,
        referralCode: user.referralCode,
        referralLink: `/signup?ref=${user.referralCode}`,
        totalReferred: referredUsers.length,
        referredUsers,
        loyaltyCoins: user.loyaltyCoins || 100,
        rewardPerReferralCoins: 50, // 50 coins (25 ETB) per friend invited
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 16. Apply Referral Code
Router.post(
  "/apply-referral",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const { code } = req.body;
      if (!code || !code.trim()) {
        return next(new handleerror("Referral code is required", 400));
      }

      const user = await User.findById(req.user._id);
      if (user.referredBy) {
        return next(new handleerror("You have already redeemed a referral invitation!", 400));
      }

      const referrer = await User.findOne({
        referralCode: code.trim().toUpperCase(),
      });

      if (!referrer) {
        return next(new handleerror("Invalid referral code. Please check and try again.", 404));
      }

      if (referrer._id.equals(user._id)) {
        return next(new handleerror("You cannot refer yourself!", 400));
      }

      // Link referral and award 50 bonus coins to both user and referrer!
      user.referredBy = referrer._id;
      user.loyaltyCoins = (user.loyaltyCoins || 0) + 50;

      referrer.loyaltyCoins = (referrer.loyaltyCoins || 0) + 50;

      await Promise.all([user.save(), referrer.save()]);

      // Credit wallet reward notification to referrer
      const Notification = require("../model/notification");
      await Notification.create({
        recipient: referrer._id,
        recipientType: "user",
        title: "Referral Reward Earned! 🎁",
        message: `${user.name} joined using your invite code! You earned 50 Habesha Coins.`,
        type: "wallet_credit",
      }).catch(() => {});

      res.status(200).json({
        success: true,
        message: "Referral code applied! You earned 50 welcome coins (25 ETB value)!",
        loyaltyCoins: user.loyaltyCoins,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 17. Get Followed Stores
Router.get(
  "/followed-shops",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).populate({
        path: "followedShops",
        select: "name avatar city ratings ratingsCount followersCount isVerified description",
      });

      res.status(200).json({
        success: true,
        followedShops: user.followedShops || [],
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 18. AliExpress Saved Searches (Following a Search Query & Category)
Router.post(
  "/saved-search",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const { query, filters } = req.body;
      if (!query || !query.trim()) {
        return next(new handleerror("Search query is required", 400));
      }

      const user = await User.findById(req.user._id);
      if (!user.savedSearches) user.savedSearches = [];

      user.savedSearches.push({
        query: query.trim(),
        filters: filters || {},
        createdAt: new Date(),
      });

      await user.save();

      res.status(201).json({
        success: true,
        savedSearches: user.savedSearches,
        message: "Search saved! You will receive notifications when matching authentic crafts are listed.",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

Router.get(
  "/saved-searches",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      res.status(200).json({
        success: true,
        savedSearches: user.savedSearches || [],
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

Router.delete(
  "/saved-search/:id",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      user.savedSearches = (user.savedSearches || []).filter(
        (s) => s._id?.toString() !== req.params.id
      );
      await user.save();

      res.status(200).json({
        success: true,
        savedSearches: user.savedSearches,
        message: "Saved search removed.",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 19. Update Alert Preferences (AliExpress Deal & Price Drop Notifications)
Router.put(
  "/alert-preferences",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const {
        priceDropAlert,
        backInStockAlert,
        flashSaleAlert,
        deliveryUpdateSMS,
        weeklyDigest,
      } = req.body;

      const user = await User.findById(req.user._id);
      if (!user.alertPreferences) user.alertPreferences = {};

      if (priceDropAlert !== undefined) user.alertPreferences.priceDropAlert = Boolean(priceDropAlert);
      if (backInStockAlert !== undefined) user.alertPreferences.backInStockAlert = Boolean(backInStockAlert);
      if (flashSaleAlert !== undefined) user.alertPreferences.flashSaleAlert = Boolean(flashSaleAlert);
      if (deliveryUpdateSMS !== undefined) user.alertPreferences.deliveryUpdateSMS = Boolean(deliveryUpdateSMS);
      if (weeklyDigest !== undefined) user.alertPreferences.weeklyDigest = Boolean(weeklyDigest);

      await user.save();

      res.status(200).json({
        success: true,
        alertPreferences: user.alertPreferences,
        message: "Notification & deal preferences updated successfully!",
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

module.exports = Router;
