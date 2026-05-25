const app = require("./src/app");
const { connectDB } = require("./src/config/database");
const config = require("./src/config/environment");
const Admin = require("./src/models/Admin");
const logger = require("./src/utils/logger");

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create admin if not exists
    const adminExists = await Admin.findOne({ email: config.admin.email });
    if (!adminExists) {
      const admin = new Admin({
        email: config.admin.email,
        password: config.admin.password,
      });
      await admin.save();
      logger.info("Admin user created successfully");
    } else {
      logger.info("Admin user already exists");
    }

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(
        `API Documentation: http://localhost:${config.port}/api-docs`,
      );
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Shutting down gracefully...");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Shutting down gracefully...");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
