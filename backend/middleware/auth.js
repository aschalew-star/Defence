const handleerror = require("../utils/handleerror");
const catchAsyncErrors = require("../utils/asynerror");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/Shop");

const getSecret = () => process.env.JWT_SECRET || "Secret";

// Extract token from cookie or Authorization header
const extractToken = (req, cookieName) => {
  if (req.cookies && req.cookies[cookieName]) {
    return req.cookies[cookieName];
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const token = extractToken(req, "token");

  if (!token) {
    return next(new handleerror("Please login to access this resource", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, getSecret());
  } catch (err) {
    return next(new handleerror("Invalid or expired session. Please login again.", 401));
  }

  req.user = await User.findById(decoded.id);

  if (!req.user) {
    return next(new handleerror("User not found with this session", 401));
  }

  next();
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const sellerToken = extractToken(req, "seller_token");

  if (!sellerToken) {
    return next(new handleerror("Please login as a merchant to continue", 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(sellerToken, getSecret());
  } catch (err) {
    return next(new handleerror("Invalid or expired merchant session. Please login again.", 401));
  }

  req.seller = await Shop.findById(decoded.id);

  if (!req.seller) {
    return next(new handleerror("Merchant store not found with this session", 401));
  }

  next();
});

exports.isAdmin = (...roles) => {
  const allowed = roles.length > 0 ? roles : ["admin", "superadmin"];
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !allowed.includes(userRole)) {
      return next(
        new handleerror(
          `Access denied. Role (${userRole || "guest"}) is not authorized to access this resource.`,
          403
        )
      );
    }
    next();
  };
};

exports.isVerifiedSeller = (req, res, next) => {
  if (!req.seller) {
    return next(new handleerror("Merchant authentication required", 401));
  }
  if (!req.seller.isVerified && req.seller.verificationStatus !== "Verified") {
    return next(
      new handleerror(
        "Store verification required. Please submit your TIN and business registration for review.",
        403
      )
    );
  }
  next();
};
