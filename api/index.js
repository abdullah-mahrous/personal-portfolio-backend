const app = require("../src/app");
const { connectDB } = require("../src/config/database");
const logger = require("../src/utils/logger");

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    logger.error("Failed to start server:", error.message);
    throw new Error("Error while connecting DB");
  }
};

startServer();

module.exports = app;
