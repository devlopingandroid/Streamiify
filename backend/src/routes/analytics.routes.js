import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  getOverview,
  getViews,
  getWatchTime,
  getTopVideos,
  getSubscribers,
  getDashboard,
} from "../controllers/analytics.controller.js";

import { validateAnalyticsQuery } from "../validators/analytics.validator.js";

const router = Router();

/**
 * All analytics routes require authentication
 */
router.use(verifyJWT);

/**
 * ============================================================================
 * Analytics Routes
 * ============================================================================
 */

router.get("/overview", validateAnalyticsQuery, getOverview);

router.get("/views", validateAnalyticsQuery, getViews);

router.get("/watch-time", validateAnalyticsQuery, getWatchTime);

router.get("/top-videos", validateAnalyticsQuery, getTopVideos);

router.get("/subscribers", validateAnalyticsQuery, getSubscribers);

router.get("/dashboard", validateAnalyticsQuery, getDashboard);

export default router;
