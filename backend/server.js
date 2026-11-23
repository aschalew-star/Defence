const path = require("path");
require("dotenv").config();
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "config", ".env") });

const { getJwtSecret } = require("./config/jwt");
getJwtSecret();
const cors = require("cors");
const express = require("express");
const connect = require("./db/Database");
const mongoose = require("mongoose");
const cookie = require("cookie-parser");
const cloudinary = require("cloudinary");
const compression = require("compression");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const errorHandler = require("./middleware/error");

// Controllers / Routers (Centralized)
const {
  user,
  shop,
  order,
  product,
  payment,
  event,
  message,
  conversation,
  withdraw,
  category,
  review,
  coupon,
  dispute,
  platform,
  wallet,
  notification,
  qa,
  returnCtrl,
  sellerScore,
  wishlist,
  cart,
  promotion,
} = require("./controllers");
const { initSocket } = require("./socket");

// Handle uncaught exceptions early
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message, err.stack);
  process.exit(1);
});

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);
app.use(compression());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(mongoSanitize());
app.use(hpp());

const configuredOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins);

if (process.env.NODE_ENV !== "production") {
  ["http://localhost:3000", "http://localhost:8081"].forEach((origin) =>
    allowedOrigins.add(origin)
  );
} else if (allowedOrigins.size === 0) {
  throw new Error("FRONTEND_URL must contain the allowed production frontend origin(s).");
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const normalized = origin.trim().replace(/\/+$/, "");
      if (
        allowedOrigins.has(normalized) ||
        allowedOrigins.has(normalized.replace(/^https?:\/\/www\./, "https://")) ||
        allowedOrigins.has(normalized.replace(/^https?:\/\//, "https://www."))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(cookie());

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Health check endpoint
app.get("/health", (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    status: databaseReady ? "ok" : "unavailable",
    database: databaseReady ? "connected" : "disconnected",
    version: "4.0.0",
    service: "MEP Ethiopian Multi-Merchant Marketplace API",
    features: [
      "Multi-Vendor Escrow & Settlement",
      "Hierarchical Sub-Order Fulfillment",
      "Per-Merchant Inventory & Tax Verification (KYC)",
      "Chapa Payment Gateway (Telebirr/CBE)",
      "Coupons, Disputes, and Reviews",
      "Buyer Protection & Money-Back Guarantee",
      "Seller Trust Score & Leaderboard",
      "Server-Side Cart & Wishlist",
      "Return & Refund Management",
      "Store Promotions & Campaigns",
    ],
    timestamp: new Date(),
  });
});

app.get("/", (req, res) => {
  res.send("MEP Ethiopian Traditional Multi-Merchant Marketplace API Server is running!");
});

// Mount Routes (Dual-mount root /resource and /api/v2/resource for seamless compatibility)
const routeMap = [
  ["/user", user],
  ["/shop", shop],
  ["/product", product],
  ["/order", order],
  ["/payment", payment],
  ["/withdraw", withdraw],
  ["/event", event],
  ["/message", message],
  ["/conversation", conversation],
  ["/category", category],
  ["/review", review],
  ["/coupon", coupon],
  ["/dispute", dispute],
  ["/platform", platform],
  ["/wallet", wallet],
  ["/notification", notification],
  ["/qa", qa],
  ["/return", returnCtrl],
  ["/seller-score", sellerScore],
  ["/wishlist", wishlist],
  ["/cart", cart],
  ["/promotion", promotion],
];

routeMap.forEach(([path, routerInstance]) => {
  app.use(path, routerInstance);
  app.use(`/api/v2${path}`, routerInstance);
});

// Central Error Handling Middleware
app.use(errorHandler);

let server;
let inspectionInterval;

const startServer = async () => {
  await connect();
  return new Promise((resolve, reject) => {
    const httpServer = app.listen(port, () => resolve(httpServer));
    httpServer.once("error", reject);
  });
};

startServer()
  .then((httpServer) => {
    server = httpServer;
    console.log(`MEP Marketplace Server listening on port ${port}`);

    // Initialize unified real-time Socket.io engine
    const origins = Array.from(allowedOrigins);
    initSocket(httpServer, origins);
    console.log(`⚡ Real-time Socket.io engine merged into backend on port ${port}`);

    // Initialize Event-Driven Multi-Channel Notification Engine (Email, SMS, In-App Socket.io)
    require("./services/notificationService");
    console.log("🔔 Event-driven notification engine initialized and listening to event bus");

    const SubOrder = require("./model/SubOrder");
    const Return = require("./model/return");
    inspectionInterval = setInterval(async () => {
      // 1. Process expired 72-hour customer inspections (Direct in-process escrow release)
      try {
        const expiredSubOrders = await SubOrder.find({
          status: "Delivered - Pending Inspection",
          "deliveryVerification.inspectionWindowEndsAt": { $lte: new Date() },
          "financials.payoutStatus": "Inspection Period",
        });
        if (expiredSubOrders.length > 0) {
          console.log(`[Auto-Escrow] Releasing ${expiredSubOrders.length} order(s) past 72h inspection window.`);
          for (const ord of expiredSubOrders) {
            if (order && order.executeEscrowRelease) {
              await order.executeEscrowRelease(ord, "Auto-Release (72h SLA Elapsed)", { name: "System Automation" });
            }
          }
        }
      } catch (err) {
        console.error("Expired-order processing failed:", err.message);
      }

      // 2. Auto-approve returns past seller response deadline (Direct in-process)
      try {
        const expiredReturns = await Return.find({
          status: "Requested",
          $or: [
            { autoApproveAt: { $lte: new Date() } },
            { "timeline.requestedAt": { $lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) } },
          ],
        });
        if (expiredReturns.length > 0) {
          console.log(`[Auto-Return] Auto-approving ${expiredReturns.length} overdue return(s).`);
          for (const ret of expiredReturns) {
            ret.status = "Seller Approved";
            ret.sellerResponse = {
              accepted: true,
              reason: "Auto-approved (seller did not respond within 3-day SLA)",
              respondedAt: new Date(),
            };
            ret.messages.push({
              sender: "System",
              message: "Return auto-approved because seller did not respond within the 3-day SLA.",
              createdAt: new Date(),
            });
            await ret.save();
          }
        }
      } catch (err) {
        console.error("Return auto-approval processing failed:", err.message);
      }

      // 3. Check for SLA overdue sub-orders
      try {
        const overdueFilter = {
          status: { $in: ["Processing", "Confirmed"] },
          "sla.isOverdue": false,
          $or: [
            { "sla.mustConfirmBy": { $lte: new Date() }, status: "Processing" },
            { "sla.mustShipBy": { $lte: new Date() }, status: "Confirmed" },
          ],
        };
        const overdueCount = await SubOrder.countDocuments(overdueFilter);
        if (overdueCount > 0) {
          await SubOrder.updateMany(overdueFilter, { $set: { "sla.isOverdue": true } });
          console.log(`[SLA Alert] Marked ${overdueCount} sub-order(s) as overdue.`);
        }
      } catch (err) {
        console.error("SLA overdue check failed:", err.message);
      }
    }, 30 * 60 * 1000);
  })
  .catch((err) => {
    console.error("Backend startup failed:", err.message);
    process.exit(1);
  });

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  if (inspectionInterval) clearInterval(inspectionInterval);

  const closeDatabase = () =>
    mongoose.connection.close(false).then(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });

  if (!server) {
    closeDatabase().catch((err) => {
      console.error("MongoDB shutdown failed:", err.message);
      process.exit(1);
    });
    return;
  }

  server.close(() => {
    console.log("HTTP server closed.");
    closeDatabase().catch((err) => {
      console.error("MongoDB shutdown failed:", err.message);
      process.exit(1);
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
  if (!server) {
    process.exit(1);
  } else {
    server.close(() => {
      process.exit(1);
    });
  }
});

module.exports = app;
