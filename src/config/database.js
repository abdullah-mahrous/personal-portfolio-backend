const mongoose = require("mongoose");
const config = require("./environment");
const logger = require("../utils/logger");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    logger.info("Using existing MongoDB connection");
    return;
  }

  try {
    await mongoose.connect(config.mongodb.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });

    isConnected = true;
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info("MongoDB disconnected");
  }
};

module.exports = { connectDB, disconnectDB };
