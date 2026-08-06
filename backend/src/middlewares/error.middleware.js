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

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,

    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      errors: err.errors || [],
    }),
  });
};

export default errorHandler;
