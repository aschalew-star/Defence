const handleerror = require("../utils/handleerror");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || err.status || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong Mongoose Object ID Error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new handleerror(message, 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue || {})} entered`;
    err = new handleerror(message, 400);
  }

  // Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `Invalid token, please try again!`;
    err = new handleerror(message, 401);
  }

  // JWT expired error
  if (err.name === "TokenExpiredError") {
    const message = `Token has expired, please login again!`;
    err = new handleerror(message, 401);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    status: err.statusCode,
  });
};
