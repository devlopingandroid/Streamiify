import { createClient } from "redis";
import logger from "../utils/logger.js";

let redisClient = null;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on("error", (err) => {
      logger.warn(`Redis unavailable: ${err.message}`);
    });

    await redisClient.connect();

    logger.info("✅ Redis Connected");
  } catch (err) {
    logger.warn("⚠️ Redis not available. Running without cache.");
    redisClient = null;
  }

  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
    logger.info("Redis Connection Closed");
  }
};

export default redisClient;
