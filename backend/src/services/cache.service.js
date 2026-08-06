import redisClient from "../config/redis.js";
import logger from "../utils/logger.js";

/**
 * ============================================================================
 * Cache Service
 * ============================================================================
 * Wrapper around Redis
 *
 * Supports:
 * - Get Cache
 * - Set Cache
 * - Delete Cache
 * - Delete by Pattern
 * - TTL
 * ============================================================================
 */

/**
 * --------------------------------------------------------------------------
 * Get Cache
 * --------------------------------------------------------------------------
 */

export const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);

    if (!data) {
      return null;
    }

    logger.debug(`Cache HIT → ${key}`);

    return JSON.parse(data);
  } catch (error) {
    logger.error({
      message: "Redis GET Error",
      key,
      error: error.message,
    });

    return null;
  }
};

/**
 * --------------------------------------------------------------------------
 * Set Cache
 * --------------------------------------------------------------------------
 */

export const setCache = async (key, value, ttl = 300) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));

    logger.debug(`Cache SET → ${key}`);
  } catch (error) {
    logger.error({
      message: "Redis SET Error",
      key,
      error: error.message,
    });
  }
};

/**
 * --------------------------------------------------------------------------
 * Delete Single Cache
 * --------------------------------------------------------------------------
 */

export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);

    logger.debug(`Cache DELETE → ${key}`);
  } catch (error) {
    logger.error({
      message: "Redis DELETE Error",
      key,
      error: error.message,
    });
  }
};

/**
 * --------------------------------------------------------------------------
 * Delete Multiple Keys
 * --------------------------------------------------------------------------
 */

export const deletePattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);

    if (!keys.length) return;

    await redisClient.del(keys);

    logger.debug(`Cache Pattern DELETE → ${pattern}`);
  } catch (error) {
    logger.error({
      message: "Redis Pattern Delete Error",
      pattern,
      error: error.message,
    });
  }
};

/**
 * --------------------------------------------------------------------------
 * Check Key Exists
 * --------------------------------------------------------------------------
 */

export const hasCache = async (key) => {
  try {
    const exists = await redisClient.exists(key);

    return exists === 1;
  } catch (error) {
    logger.error({
      message: "Redis EXISTS Error",
      key,
      error: error.message,
    });

    return false;
  }
};

/**
 * --------------------------------------------------------------------------
 * Get TTL
 * --------------------------------------------------------------------------
 */

export const getTTL = async (key) => {
  try {
    return await redisClient.ttl(key);
  } catch (error) {
    logger.error({
      message: "Redis TTL Error",
      key,
      error: error.message,
    });

    return -1;
  }
};
