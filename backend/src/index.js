import "./env.js";

import connectDB from "./db/index.js";
import mongoose from "mongoose";
import { app } from "./app.js";
import { connectRedis, disconnectRedis } from "./config/redis.js";
import logger from "./utils/logger.js";

// -----------------------------
// Redis (optional)
// -----------------------------
connectRedis().catch(() => {
  logger.warn("⚠️ Running without Redis.");
});

try {
  await connectDB();

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
} catch (err) {
  logger.error({
    message: "MongoDB connection failed",
    error: err.message,
  });

  process.exit(1);
}
