/**
 * recommendation.routes.js
 *
 * Layer: ROUTES
 *
 * Responsibility:
 *  - Wire up HTTP routes to auth middleware, validators, and controller
 *    functions. No business logic, no DB access.
 */

import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import recommendationController from "../controllers/recommendation.controller.js";
import recommendationValidator from "../validators/recommendation.validator.js";

const router = Router();
// All recommendation endpoints require an authenticated user, since even
// "trending" is scoped behind the app's auth-gated API surface (consistent
// with the rest of Streamify's routes).
router.use(verifyJWT);

/**
 * GET /recommendations/home
 * Personalized home feed.
 */
router.get(
  "/home",
  recommendationValidator.validateHomeFeed,
  recommendationController.getHomeFeed
);

/**
 * GET /recommendations/trending
 * Trending videos.
 */
router.get(
  "/trending",
  recommendationValidator.validateTrending,
  recommendationController.getTrending
);

/**
 * GET /recommendations/similar/:videoId
 * Videos similar to a given video.
 */
router.get(
  "/similar/:videoId",
  recommendationValidator.validateSimilarVideos,
  recommendationController.getSimilarVideos
);

/**
 * GET /recommendations/subscriptions
 * Videos from subscribed channels.
 */
router.get(
  "/subscriptions",
  recommendationValidator.validateSubscriptionFeed,
  recommendationController.getSubscriptionFeed
);

export default router;
