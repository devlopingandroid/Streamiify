import { createClient } from "redis";
import logger from "../utils/logger.js";

let redisClient = null;

export const connectRedis = async () => {
  try {
    if (redisClient?.isOpen || redisClient?.isReady) {
      return redisClient;
    }

    if (process.env.ENABLE_REDIS === "false") {
      logger.info("ℹ️ Redis disabled via ENABLE_REDIS flag.");
      return null;
    }

    redisClient = createClient({
      url: process.env.REDIS_URL,
      socket: {
        connectTimeout: 2000,
        reconnectStrategy: false,
      },
    });

    redisClient.on("error", (err) => {
      logger.warn(`Redis unavailable: ${err.message}`);
    });

    await redisClient.connect();

    logger.info("✅ Redis Connected");
  } catch (err) {
    logger.warn(
      `⚠️ Redis not available: ${err.message}. Running without cache.`
    );
    redisClient = null;
  }

  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient?.isOpen) {
    try {
      await redisClient.quit();
      logger.info("Redis Connection Closed");
    } catch (err) {
      logger.warn(`Redis disconnect failed: ${err.message}`);
    } finally {
      redisClient = null;
    }
  }
};

export const getRedisClient = () => redisClient;

export default getRedisClient;
