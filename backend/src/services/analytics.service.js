import ApiError from "../utils/ApiError.js";
import { getCache, setCache } from "./cache.service.js";
import { getOverviewAnalytics } from "../repositories/analytics/overview.repository.js";

import { getViewsAnalytics } from "../repositories/analytics/views.repository.js";

import { getWatchTimeAnalytics } from "../repositories/analytics/watchTime.repository.js";

import { getTopVideos } from "../repositories/analytics/topVideos.repository.js";

import { getSubscriberAnalytics } from "../repositories/analytics/subscriber.repository.js";

import logger from "../utils/logger.js";

import { CACHE_KEYS } from "../constants/cacheKeys.js";
/**
 * ============================================================================
 * Analytics Service
 * ============================================================================
 * Business Layer
 *
 * Responsibilities
 * - Validate input
 * - Call repositories
 * - Combine repository results
 * - Return clean objects to controllers
 * ============================================================================
 */

/**
 * --------------------------------------------------------------------------
 * Overview
 * --------------------------------------------------------------------------
 */

export const getOverviewService = async (ownerId) => {
  if (!ownerId) {
    throw new ApiError(400, "Owner Id is required");
  }

  const cacheKey = CACHE_KEYS.ANALYTICS(ownerId);

  // Check Redis
  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  // Fetch from MongoDB
  const analytics = await getOverviewAnalytics(ownerId);

  // Store for 5 minutes
  await setCache(cacheKey, analytics, 300);

  return analytics;
};

/**
 * --------------------------------------------------------------------------
 * Views Analytics
 * --------------------------------------------------------------------------
 */

export const getViewsService = async (ownerId, period = "daily") => {
  if (!ownerId) {
    throw new ApiError(400, "Owner Id is required");
  }

  const allowed = ["daily", "weekly", "monthly", "yearly"];

  if (!allowed.includes(period)) {
    throw new ApiError(400, "Invalid period");
  }

  return await getViewsAnalytics(ownerId, period);
};

/**
 * --------------------------------------------------------------------------
 * Watch Time Analytics
 * --------------------------------------------------------------------------
 */

export const getWatchTimeService = async (ownerId) => {
  if (!ownerId) {
    throw new ApiError(400, "Owner Id is required");
  }

  return await getWatchTimeAnalytics(ownerId);
};

/**
 * --------------------------------------------------------------------------
 * Top Videos
 * --------------------------------------------------------------------------
 */

export const getTopVideosService = async (ownerId, limit = 10) => {
  if (!ownerId) {
    throw new ApiError(400, "Owner Id is required");
  }

  limit = Number(limit);

  if (limit <= 0) {
    limit = 10;
  }

  return await getTopVideos(ownerId, limit);
};

/**
 * --------------------------------------------------------------------------
 * Subscribers
 * --------------------------------------------------------------------------
 */

export const getSubscriberService = async (ownerId, period = "daily") => {
  if (!ownerId) {
    throw new ApiError(400, "Owner Id is required");
  }

  const allowed = ["daily", "weekly", "monthly", "yearly"];

  if (!allowed.includes(period)) {
    throw new ApiError(400, "Invalid period");
  }

  return await getSubscriberAnalytics(ownerId, period);
};

/**
 * --------------------------------------------------------------------------
 * Complete Dashboard
 * --------------------------------------------------------------------------
 *
 * One API for complete dashboard
 *
 */

export const getDashboardService = async (ownerId) => {
  if (!ownerId) {
    throw new ApiError(400, "Owner Id is required");
  }
  const cacheKey = CACHE_KEYS.ANALYTICS(ownerId);

  const cachedData = await getCache(cacheKey);

  if (cachedData) {
    logger.info(`Analytics Cache HIT → ${cacheKey}`);
    return cachedData;
  }

  logger.info(`Analytics Cache MISS → ${cacheKey}`);

  const [overview, watchTime, topVideos, subscribers] = await Promise.all([
    getOverviewAnalytics(ownerId),

    getWatchTimeAnalytics(ownerId),

    getTopVideos(ownerId, 5),

    getSubscriberAnalytics(ownerId, "monthly"),
  ]);

  await setCache(
    cacheKey,
    {
      overview,
      watchTime,
      topVideos,
      subscribers,
    },
    300
  );
  return {
    overview,

    watchTime,

    topVideos,

    subscribers,
  };
};
//analytics
