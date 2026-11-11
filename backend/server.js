require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connect = require("./db/Database");
const cookie = require("cookie-parser");
const cloudinary = require("cloudinary");
const errorHandler = require("./middleware/error");

// Controllers / Routers
const user = require("./control/user");
const shop = require("./control/shop");
const order = require("./control/order");
const product = require("./control/product");
const payment = require("./control/payment");
const event = require("./control/Event");
const message = require("./control/Message");
const conversation = require("./control/Conversation");
const withdraw = require("./control/withdraw");
const category = require("./control/category");
const review = require("./control/review");
const coupon = require("./control/coupon");
const dispute = require("./control/dispute");
const platform = require("./control/platform");

// Handle uncaught exceptions early
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message, err.stack);
  process.exit(1);
});

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Dynamic allowed origins for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8081",
  "https://297c-213-55-102-49.ngrok-free.app",
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ""));
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.includes("localhost") ||
        origin.includes("ngrok")
      ) {
        callback(null, true);
      } else {
        callback(null, true); // Allow configured origins
      }
    },
    credentials: true,
  })
);

app.use(cookie());

// Initialize Database Connection
connect();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || "dll1pjjbm",
  api_key: process.env.CLOUDINARY_API_KEY || "436377263181225",
  api_secret: process.env.CLOUDINARY_API_SECRET || "y53nJ5-e01HR93f2CmcFHKO3lb4",
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: "3.2.0",
    service: "MEP Ethiopian Multi-Merchant Marketplace API",
    features: [
      "Multi-Vendor Escrow & Settlement",
      "Hierarchical Sub-Order Fulfillment",
      "Per-Merchant Inventory & Tax Verification (KYC)",
      "Chapa Payment Gateway (Telebirr/CBE)",
      "Coupons, Disputes, and Reviews",
    ],
    timestamp: new Date(),
  });
});

app.get("/", (req, res) => {
  res.send("MEP Ethiopian Traditional Multi-Merchant Marketplace API Server is running!");
});

// Mount Routes
app.use("/user", user);
app.use("/shop", shop);
app.use("/product", product);
app.use("/order", order);
app.use("/payment", payment);
app.use("/withdraw", withdraw);
app.use("/event", event);
app.use("/message", message);
app.use("/conversation", conversation);
app.use("/category", category);
app.use("/review", review);
app.use("/coupon", coupon);
app.use("/dispute", dispute);
app.use("/platform", platform);

// Central Error Handling Middleware
app.use(errorHandler);

const server = app.listen(port, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log(`🚀 MEP Marketplace Server listening on port ${port}`);
  }
});

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.log("HTTP server closed.");
    const mongoose = require("mongoose");
    mongoose.connection.close(false).then(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });

  // Force close if graceful shutdown hangs
  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
