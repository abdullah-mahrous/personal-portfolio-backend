const jwt = require("jsonwebtoken");
const config = require("../config/environment");
const Admin = require("../models/Admin");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const responseFormatter = require("../utils/responseFormatter");
const { validateAdminLogin } = require("../utils/validators");

exports.login = asyncHandler(async (req, res, next) => {
  const { error, value } = validateAdminLogin(req.body);

  if (error) {
    return next(new AppError(error.details[0].message, 400));
  }

  const { email, password } = value;

  // Find admin by email
  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Check password
  const isPasswordValid = await admin.matchPassword(password);

  if (!isPasswordValid) {
    return next(new AppError("Invalid email or password", 401));
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: admin._id, email: admin.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expire },
  );

  res
    .status(200)
    .json(
      responseFormatter.success(
        { token, admin: { id: admin._id, email: admin.email } },
        "Login successful",
      ),
    );
});

exports.verifyAdmin = asyncHandler(async (req, res, next) => {
  // If this endpoint is called, it means the token is valid (authMiddleware passed)
  const admin = await Admin.findById(req.admin.id);

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  res
    .status(200)
    .json(
      responseFormatter.success(
        { admin: { id: admin._id, email: admin.email } },
        "Token is valid",
      ),
    );
});
