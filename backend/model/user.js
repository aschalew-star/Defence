const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name!"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email!"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [6, "Password should be at least 6 characters"],
      select: false,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    addresses: [
      {
        country: {
          type: String,
          default: "Ethiopia",
        },
        city: {
          type: String,
          default: "Addis Ababa",
        },
        address1: {
          type: String,
        },
        address2: {
          type: String,
        },
        zipCode: {
          type: String,
          default: "1000",
        },
        addressType: {
          type: String,
          default: "Home",
        },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin", "superadmin"],
      default: "user",
      index: true,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordTime: Date,
  },
  {
    timestamps: true,
  }
);

// Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token method
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || "Secret", {
    expiresIn: process.env.JWT_EXPIRES || "90d",
  });
};

module.exports = mongoose.model("User", userSchema);
