import "../env.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import logger from "./logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to Cloudinary.
 *
 * @param {string} localFilePath  - temp path from multer
 * @param {string} resourceType   - "image" | "video" | "auto" (default: "auto")
 * @param {string} folder         - Cloudinary folder (default: "streamify")
 * @returns {object|null}         - full Cloudinary response or null on failure
 *
 * Response fields you'll use:
 *   response.url          → CDN URL (store in DB)
 *   response.public_id    → for deletion later (store in DB)
 *   response.duration     → seconds, videos only (store in DB)
 */
const uploadOnCloudinary = async (
  localFilePath,
  resourceType = "auto",
  folder = "streamify"
) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: resourceType,
      folder,
    });
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return {
      secure_url: response.secure_url,
      public_id: response.public_id,
      duration: response.duration,
      width: response.width,
      height: response.height,
      format: response.format,
      resource_type: response.resource_type,
    };
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    logger.error({
      message: "Cloudinary Upload Error",
      error: error.message,
    });
    return null;
  }
};
/**
 * Delete a file from Cloudinary by public_id.
 * Call this when deleting a video, replacing a thumbnail, or replacing avatar.
 *
 * @param {string} publicId      - stored in DB as videoFilePublicId / thumbnailPublicId / etc.
 * @param {string} resourceType  - "image" | "video" (must match what was uploaded)
 * @returns {object|null}        - { result: "ok" } on success, null on failure
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return {
      url: response.secure_url,
      public_id: response.public_id,
      duration: response.duration,
      width: response.width,
      height: response.height,
      format: response.format,
      resource_type: response.resource_type,
    }; // response.result === "ok" means deleted
  } catch (error) {
    logger.error("[Cloudinary Delete Error]", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
