import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  getOverviewService,
  getViewsService,
  getWatchTimeService,
  getTopVideosService,
  getSubscriberService,
  getDashboardService,
} from "../services/analytics.service.js";

/**
 * ============================================================================
 * Analytics Controller
 * ============================================================================
 */

/**
 * --------------------------------------------------------------------------
 * Dashboard Overview
 * GET /analytics/overview
 * --------------------------------------------------------------------------
 */

export const getOverview = asyncHandler(async (req, res) => {
  const analytics = await getOverviewService(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        analytics,
        "Overview analytics fetched successfully."
      )
    );
});

/**
 * --------------------------------------------------------------------------
 * Views Analytics
 * GET /analytics/views?period=monthly
 * --------------------------------------------------------------------------
 */

export const getViews = asyncHandler(async (req, res) => {
  const period = req.query.period || "daily";

  const analytics = await getViewsService(req.user._id, period);

  return res
    .status(200)
    .json(
      new ApiResponse(200, analytics, "Views analytics fetched successfully.")
    );
});

/**
 * --------------------------------------------------------------------------
 * Watch Time Analytics
 * GET /analytics/watch-time
 * --------------------------------------------------------------------------
 */

export const getWatchTime = asyncHandler(async (req, res) => {
  const analytics = await getWatchTimeService(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        analytics,
        "Watch time analytics fetched successfully."
      )
    );
});

/**
 * --------------------------------------------------------------------------
 * Top Videos
 * GET /analytics/top-videos?limit=10
 * --------------------------------------------------------------------------
 */

export const getTopVideos = asyncHandler(async (req, res) => {
  const limit = req.query.limit || 10;

  const analytics = await getTopVideosService(req.user._id, limit);

  return res
    .status(200)
    .json(new ApiResponse(200, analytics, "Top videos fetched successfully."));
});

/**
 * --------------------------------------------------------------------------
 * Subscriber Analytics
 * GET /analytics/subscribers?period=monthly
 * --------------------------------------------------------------------------
 */

export const getSubscribers = asyncHandler(async (req, res) => {
  const period = req.query.period || "daily";

  const analytics = await getSubscriberService(req.user._id, period);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        analytics,
        "Subscriber analytics fetched successfully."
      )
    );
});

/**
 * --------------------------------------------------------------------------
 * Complete Dashboard
 * GET /analytics/dashboard
 * --------------------------------------------------------------------------
 */

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getDashboardService(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, dashboard, "Dashboard fetched successfully."));
});
