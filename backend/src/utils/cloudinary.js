import "../env.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import logger from "./logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const safeUnlink = async (filePath) => {
  if (!filePath) return;

  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    if (err.code !== "ENOENT") {
      logger.warn(`Failed to remove temp file ${filePath}: ${err.message}`);
    }
  }
};

/**
 * Upload large video using Cloudinary chunked upload.
 * User does not need to handle chunks.
 */
const uploadLargeVideo = (localFilePath, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_chunked(
      localFilePath,
      {
        ...options,
        chunk_size: 20 * 1024 * 1024, // 20 MB chunks
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.on("error", reject);
  });
};

/**
 * Upload a file to Cloudinary.
 *
 * Large videos use chunked upload automatically.
 * Images use the normal upload API.
 */
const uploadOnCloudinary = async (
  localFilePath,
  resourceType = "auto",
  folder = "streamify"
) => {
  try {
    if (!localFilePath) return null;

    if (process.env.NODE_ENV === "test") {
      await safeUnlink(localFilePath);

      return {
        url: "http://res.cloudinary.com/demo/image/upload/sample.jpg",
        secure_url: "http://res.cloudinary.com/demo/image/upload/sample.jpg",
        public_id: "test_public_id_123",
        duration: 100,
        format: "jpg",
        resource_type: "image",
      };
    }

    const options = {
      resource_type: resourceType,
      folder,
    };

    let response;

    if (resourceType === "video") {
      // Large/chunked upload for videos.
      response = await uploadLargeVideo(localFilePath, options);
    } else {
      // Normal upload for images and other resources.
      response = await cloudinary.uploader.upload(localFilePath, options);
    }

    // Remove temporary local file after successful upload.
    await safeUnlink(localFilePath);

    return {
      url: response.secure_url,
      secure_url: response.secure_url,
      public_id: response.public_id,
      duration: response.duration,
      width: response.width,
      height: response.height,
      format: response.format,
      resource_type: response.resource_type,
    };
  } catch (error) {
    // Always clean up temporary file on failure.
    await safeUnlink(localFilePath);

    logger.error({
      message: "Cloudinary Upload Error",
      error: error.message,
    });

    return null;
  }
};

/**
 * Delete an uploaded resource from Cloudinary.
 *
 * resourceType:
 * - "image"
 * - "video"
 * - "raw"
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return result;
  } catch (error) {
    logger.error({
      message: "Cloudinary Delete Error",
      error: error.message,
      publicId,
      resourceType,
    });

    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
