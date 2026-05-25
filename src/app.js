const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const config = require("./config/environment");
const swaggerSpecs = require("./swagger/swaggerDef");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const noteRoutes = require("./routes/noteRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

// Security Middleware
app.use(helmet());

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many login attempts, please try again later",
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
});

// CORS
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);

// Body parser with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use("/api/auth", loginLimiter, authRoutes);
app.use("/api/notes", apiLimiter, noteRoutes);
app.use("/api/notes", apiLimiter, commentRoutes);
app.use("/api/comments", apiLimiter, commentRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Route not found",
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

module.exports = app;
