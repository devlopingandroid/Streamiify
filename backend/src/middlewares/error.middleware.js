import fs from "fs";
import logger from "../utils/logger.js";
const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  // Clean up any temporary files uploaded via Multer if request resulted in error
  if (req.file?.path) {
    fs.promises.unlink(req.file.path).catch(() => {});
  }
  if (req.files) {
    if (Array.isArray(req.files)) {
      req.files.forEach((f) => {
        if (f?.path) fs.promises.unlink(f.path).catch(() => {});
      });
    } else if (typeof req.files === "object") {
      Object.values(req.files).forEach((fileArr) => {
        if (Array.isArray(fileArr)) {
          fileArr.forEach((f) => {
            if (f?.path) fs.promises.unlink(f.path).catch(() => {});
          });
        }
      });
    }
  }

  const statusCode = err.statusCode || 500;

  const message =
    err.statusCode && err.statusCode < 500
      ? err.message
      : process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "Internal Server Error";

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      errors: err.errors || [],
    }),
  });
};

export default errorHandler;
