const jwt = require("jsonwebtoken");
const config = require("../config/environment");
const AppError = require("../utils/AppError");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new AppError("No token provided. Please login.", 401));
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token has expired. Please login again.", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token.", 401));
    }
    next(error);
  }
};

module.exports = authMiddleware;
