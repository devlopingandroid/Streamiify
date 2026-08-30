import "./env.js";

import connectDB from "./db/index.js";
import mongoose from "mongoose";
import { app } from "./app.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import logger from "./utils/logger.js";

try {
  await connectDB();

  try {
    await connectRedis();
  } catch (redisErr) {
    logger.warn(
      `⚠️ Redis initialization failed: ${redisErr.message}. Running without cache.`
    );
  }

  const PORT = process.env.PORT || 8000;

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running at http://localhost:${PORT}`);
  });

  // =============================
  // Graceful Shutdown
  // =============================
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down...`);

    try {
      // Stop accepting new requests
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      logger.info("✅ HTTP Server Closed");

      // Close MongoDB
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        logger.info("✅ MongoDB Disconnected");
      }

      // Close Redis
      try {
        await disconnectRedis();
        logger.info("✅ Redis Disconnected");
      } catch (err) {
        logger.warn(`Redis disconnect failed: ${err.message}`);
      }

      logger.info("✅ Graceful Shutdown Complete");

      process.exit(0);
    } catch (err) {
      logger.error({
        message: "Shutdown failed",
        error: err.message,
      });

      process.exit(1);
    }
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));

  process.on("unhandledRejection", (reason, promise) => {
    logger.error({
      message: "Unhandled Promise Rejection",
      reason: reason?.message || reason,
    });
    shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (error) => {
    logger.error({
      message: "Uncaught Exception",
      error: error?.message || error,
    });
    shutdown("uncaughtException");
  });
} catch (err) {
  logger.error({
    message: "MongoDB connection failed",
    error: err.message,
  });

  process.exit(1);
}
