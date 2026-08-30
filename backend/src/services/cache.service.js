import { getRedisClient } from "../config/redis.js";
import logger from "../utils/logger.js";

/**
 * Helper to verify whether Redis client is initialized and connected.
 */
const isRedisReady = () => {
  const client = getRedisClient();
  return client && (client.isReady || client.isOpen);
};

/**
 * --------------------------------------------------------------------------
 * Get Cache
 * --------------------------------------------------------------------------
 */
export const getCache = async (key) => {
  if (!isRedisReady()) {
    return null;
  }

  try {
    const client = getRedisClient();
    const data = await client.get(key);

    if (!data) {
      logger.debug(`Cache MISS → ${key}`);
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
  if (!isRedisReady()) {
    return;
  }

  try {
    const client = getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(value));

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
  if (!isRedisReady()) {
    return;
  }

  try {
    const client = getRedisClient();
    await client.del(key);

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
  if (!isRedisReady()) {
    return;
  }

  try {
    const client = getRedisClient();
    const keys = await client.keys(pattern);

    if (!keys.length) return;

    await client.del(keys);

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
  if (!isRedisReady()) {
    return false;
  }

  try {
    const client = getRedisClient();
    const exists = await client.exists(key);

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
  if (!isRedisReady()) {
    return -1;
  }

  try {
    const client = getRedisClient();
    return await client.ttl(key);
  } catch (error) {
    logger.error({
      message: "Redis TTL Error",
      key,
      error: error.message,
    });

    return -1;
  }
};

