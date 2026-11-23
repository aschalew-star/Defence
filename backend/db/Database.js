const mongoose = require("mongoose");

const connect = async (retries = 3, delay = 5000) => {
  const dbUrl =
    process.env.MONGODB_URI ||
    process.env.DB_URL ||
    process.env.MONGO_URI ||
    (process.env.NODE_ENV !== "production"
      ? "mongodb://localhost:27017/MEP"
      : null);

  if (!dbUrl) {
    throw new Error("MONGODB_URI must be configured in production.");
  }

  // Hide credentials from log output
  const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(dbUrl, {
        maxPoolSize: Number(process.env.DB_MAX_POOL_SIZE) || 100,
        minPoolSize: Number(process.env.DB_MIN_POOL_SIZE) || 10,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        autoIndex: process.env.NODE_ENV !== "production", // Disable costly background index rebuilds in high-concurrency production
      });

      console.log(`📦 MongoDB connected successfully to: ${conn.connection.host} (${conn.connection.name})`);
      break;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed (${maskedUrl}):`, err.message);
      if (attempt === retries) {
        throw err;
      } else {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB runtime error:", err.message);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Connection pool will attempt reconnect...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB connection re-established.");
  });
};

module.exports = connect;
