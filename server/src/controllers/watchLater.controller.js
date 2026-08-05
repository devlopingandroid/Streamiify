import watchLaterService from "../services/watchLater.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * ============================================================================
 * WatchLater Controller
 *
 * Thin controller.
 * Responsibilities:
 * 1. Read request data
 * 2. Call service
 * 3. Return ApiResponse
 *
 * No business logic.
 * ============================================================================
 */

/**
 * ----------------------------------------------------------------------------
 * Toggle Watch Later
 * POST /watch-later/:videoId
 * ----------------------------------------------------------------------------
 */
const toggleWatchLater = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const result = await watchLaterService.toggleWatchLater(
    req.user._id,
    videoId
  );

  const message = result.saved
    ? "Video added to Watch Later."
    : "Video removed from Watch Later.";

  return res.status(200).json(new ApiResponse(200, result, message));
});

/**
 * ----------------------------------------------------------------------------
 * Remove From Watch Later
 * DELETE /watch-later/:videoId
 * ----------------------------------------------------------------------------
 */
const removeWatchLater = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const result = await watchLaterService.removeWatchLater(
    req.user._id,
    videoId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Video removed successfully."));
});

/**
 * ----------------------------------------------------------------------------
 * Get Watch Later
 * GET /watch-later
 * ----------------------------------------------------------------------------
 */
const getWatchLater = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 20;

  const result = await watchLaterService.getWatchLater(
    req.user._id,
    page,
    limit
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Watch Later fetched successfully."));
});

/**
 * ----------------------------------------------------------------------------
 * Check Saved Status
 * GET /watch-later/:videoId/status
 * ----------------------------------------------------------------------------
 */
const getWatchLaterStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const result = await watchLaterService.isSaved(req.user._id, videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Watch Later status fetched."));
});

export {
  toggleWatchLater,
  removeWatchLater,
  getWatchLater,
  getWatchLaterStatus,
};
