const express = require("express");
const jwt = require("jsonwebtoken");
const asynfun = require("../utils/asynerror");
const bcrypt = require("bcryptjs");
const handleerror = require("../utils/handleerror");
const cloudinary = require("cloudinary");
const Router = express.Router();
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const User = require("../model/user");

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
      const { name, email, password, avatar, phoneNumber } = req.body;

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

      const newUser = new User({
        name: name.trim(),
        password: hashpassword,
        email: email.toLowerCase().trim(),
        phoneNumber: phoneNumber ? phoneNumber.trim() : "",
        avatar: avatarData,
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET || "Secret",
        { expiresIn: process.env.JWT_EXPIRES || "90d" }
      );

      newUser.password = undefined;

      res.status(201).cookie("token", token, getCookieOptions()).json({
        success: true,
        user: newUser,
        token,
      });
    } catch (error) {
      return next(new handleerror(error.message, 500));
    }
  })
);

// 2. User Login
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

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || "Secret",
        { expiresIn: process.env.JWT_EXPIRES || "90d" }
      );

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

// 3. Load Current User
Router.get(
  "/getuser",
  isAuthenticated,
  asynfun(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return next(new handleerror("User doesn't exist!", 400));
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
      const { email, password, phoneNumber, name } = req.body;

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

module.exports = Router;
