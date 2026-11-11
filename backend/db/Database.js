const mongoose = require("mongoose");

const connect = async (retries = 3, delay = 5000) => {
  const dbUrl =
    process.env.MONGODB_URI ||
    process.env.DB_URL ||
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/MEP";

  // Hide credentials from log output
  const maskedUrl = dbUrl.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(dbUrl, {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      console.log(`📦 MongoDB connected successfully to: ${conn.connection.host} (${conn.connection.name})`);
      break;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed (${maskedUrl}):`, err.message);
      if (attempt === retries) {
        console.error("💥 All MongoDB connection attempts exhausted. Continuing with retry listener...");
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
