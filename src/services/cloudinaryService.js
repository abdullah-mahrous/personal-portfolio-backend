const fs = require("fs");
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");

const cloudinaryService = {
  uploadImage: async (filePath) => {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "portfolio-notes",
        resource_type: "auto",
      });

      // Delete temp file after upload
      fs.unlinkSync(filePath);

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      logger.error("Cloudinary upload error:", error.message);
      throw new AppError("Failed to upload image to Cloudinary", 500);
    }
  },

  deleteImage: async (publicId) => {
    try {
      if (!publicId) {
        return; // No image to delete
      }

      await cloudinary.uploader.destroy(publicId);
      logger.info("Image deleted from Cloudinary:", publicId);
    } catch (error) {
      logger.error("Cloudinary delete error:", error.message);
      // Don't throw error, just log it - image deletion failure shouldn't crash the request
    }
  },
};

module.exports = cloudinaryService;
