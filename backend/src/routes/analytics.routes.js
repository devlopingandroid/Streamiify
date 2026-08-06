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

router.get("/overview", getOverview);

router.get("/views", getViews);

router.get("/watch-time", getWatchTime);

router.get("/top-videos", getTopVideos);

router.get("/subscribers", getSubscribers);

router.get("/dashboard", getDashboard);

export default router;
