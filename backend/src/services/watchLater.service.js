import watchLaterRepository from "../repositories/watchLater.repository.js";
import videoRepository from "../repositories/video.repository.js";
import ApiError from "../utils/ApiError.js";

/**
 * WatchLaterService
 *
 * Business logic layer.
 * Repository handles DB.
 * Controller handles HTTP.
 * Service owns all business rules.
 */

class WatchLaterService {
  /**
   * ------------------------------------------------------------------------
   * Toggle Watch Later
   * ------------------------------------------------------------------------
   * If already saved → remove.
   * Otherwise → save.
   */
  async toggleWatchLater(userId, videoId) {
    const video = await videoRepository.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    const existing = await watchLaterRepository.findByOwnerAndVideo(
      userId,
      videoId
    );

    if (existing) {
      await watchLaterRepository.deleteByOwnerAndVideo(userId, videoId);

      return {
        saved: false,
      };
    }

    try {
      await watchLaterRepository.create({
        owner: userId,
        video: videoId,
      });
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(409, "Video already exists in Watch Later.");
      }

      throw error;
    }

    return {
      saved: true,
    };
  }

  /**
   * ------------------------------------------------------------------------
   * Remove From Watch Later
   * ------------------------------------------------------------------------
   */
  async removeWatchLater(userId, videoId) {
    const existing = await watchLaterRepository.findByOwnerAndVideo(
      userId,
      videoId
    );

    if (!existing) {
      throw new ApiError(404, "Video not found in Watch Later.");
    }

    await watchLaterRepository.deleteByOwnerAndVideo(userId, videoId);

    return {
      removed: true,
    };
  }

  /**
   * ------------------------------------------------------------------------
   * Get Watch Later
   * ------------------------------------------------------------------------
   */
  async getWatchLater(userId, page = 1, limit = 20) {
    this._validatePagination(page, limit);

    const [videos, total] = await Promise.all([
      watchLaterRepository.getWatchLater(userId, page, limit),

      watchLaterRepository.count(userId),
    ]);

    return this._buildPaginatedResponse(videos, total, page, limit);
  }

  /**
   * ------------------------------------------------------------------------
   * Check Saved Status
   * ------------------------------------------------------------------------
   */
  async isSaved(userId, videoId) {
    const exists = await watchLaterRepository.exists(userId, videoId);

    return {
      saved: !!exists,
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private Helpers
  // ──────────────────────────────────────────────────────────────────────────

  _validatePagination(page, limit) {
    if (page < 1) {
      throw new ApiError(400, "Page must be at least 1.");
    }

    if (limit < 1 || limit > 50) {
      throw new ApiError(400, "Limit must be between 1 and 50.");
    }
  }

  _buildPaginatedResponse(data, total, page, limit) {
    return {
      data,

      total,

      page,

      limit,

      totalPages: Math.ceil(total / limit),

      hasNextPage: page * limit < total,

      hasPrevPage: page > 1,
    };
  }
}

export default new WatchLaterService();
