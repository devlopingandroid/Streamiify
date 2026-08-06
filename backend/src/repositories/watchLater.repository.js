import WatchLater from "../models/watchLater.model.js";

/**
 * WatchLaterRepository
 *
 * Database layer only.
 * No business logic.
 */

class WatchLaterRepository {
  /**
   * Create new watch later entry.
   */
  async create(data) {
    return WatchLater.create(data);
  }

  /**
   * Find a saved video by owner + video.
   */
  async findByOwnerAndVideo(ownerId, videoId) {
    return WatchLater.findOne({
      owner: ownerId,
      video: videoId,
    });
  }

  /**
   * Check whether video already exists.
   */
  async exists(ownerId, videoId) {
    return WatchLater.exists({
      owner: ownerId,
      video: videoId,
    });
  }

  /**
   * Delete one watch later entry.
   */
  async deleteByOwnerAndVideo(ownerId, videoId) {
    return WatchLater.findOneAndDelete({
      owner: ownerId,
      video: videoId,
    });
  }

  /**
   * Paginated watch later list.
   */
  async getWatchLater(ownerId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const data = await WatchLater.find({
      owner: ownerId,
    })
      .populate({
        path: "video",
        populate: {
          path: "owner",
          select: "fullname username avatar",
        },
      })
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    return data;
  }

  /**
   * Count total saved videos.
   */
  async count(ownerId) {
    return WatchLater.countDocuments({
      owner: ownerId,
    });
  }
}

export default new WatchLaterRepository();
