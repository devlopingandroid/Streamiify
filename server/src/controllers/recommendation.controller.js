/**
 * recommendation.controller.js
 *
 * Layer: CONTROLLER
 *
 * Responsibility:
 *  - ONLY HTTP concerns: read request data, call the service, return an
 *    ApiResponse.
 *  - No business logic, no DB access.
 */

import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import recommendationService from "../services/recommendation.service.js";
/**
 * GET /recommendations/home
 * Personalized home feed for the authenticated user.
 */
const getHomeFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  const feed = await recommendationService.getHomeFeed(userId, { page, limit });

  return res
    .status(200)
    .json(new ApiResponse(200, feed, "Home feed fetched successfully"));
});

/**
 * GET /recommendations/trending
 * Platform-wide trending videos (no personalization required).
 */
const getTrending = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  const feed = await recommendationService.getTrending({ page, limit });

  return res
    .status(200)
    .json(new ApiResponse(200, feed, "Trending videos fetched successfully"));
});

/**
 * GET /recommendations/similar/:videoId
 * Videos similar to the given reference video.
 */
const getSimilarVideos = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  const feed = await recommendationService.getSimilarVideos(videoId, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, feed, "Similar videos fetched successfully"));
});

/**
 * GET /recommendations/subscriptions
 * Videos from channels the authenticated user is subscribed to.
 */
const getSubscriptionFeed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;

  const feed = await recommendationService.getSubscriptionFeed(userId, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, feed, "Subscription feed fetched successfully"));
});

export default {
  getHomeFeed,
  getTrending,
  getSimilarVideos,
  getSubscriptionFeed,
};
