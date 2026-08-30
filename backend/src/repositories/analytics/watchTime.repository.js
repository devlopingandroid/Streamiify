import mongoose from "mongoose";
import WatchSession from "../../models/watchSession.model.js";
import Video from "../../models/video.model.js";

/**
 * ============================================================================
 * Watch Time Analytics Repository
 * ============================================================================
 *
 * Returns:
 * - Total Watch Time
 * - Average Watch Duration
 * - Completed Views
 * - Incomplete Views
 * - Completion Rate
 * - Total Sessions
 * ============================================================================
 */

export const getWatchTimeAnalytics = async (ownerId) => {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  // Fetch creator's video IDs first to allow index-backed $match on WatchSession
  const creatorVideos = await Video.find({ owner: ownerObjectId })
    .select("_id")
    .lean();

  const creatorVideoIds = creatorVideos.map((v) => v._id);

  if (!creatorVideoIds.length) {
    return {
      totalWatchTime: 0,
      averageWatchDuration: 0,
      completedViews: 0,
      incompleteViews: 0,
      completionRate: 0,
      totalSessions: 0,
    };
  }

  const analytics = await WatchSession.aggregate([
    /**
     * Filter sessions for creator's videos first (Index-backed: { video: 1 })
     */
    {
      $match: {
        video: { $in: creatorVideoIds },
      },
    },

    /**
     * Aggregate metrics directly without full collection joins
     */
    {
      $group: {
        _id: null,

        totalWatchTime: {
          $sum: "$progress",
        },

        averageWatchDuration: {
          $avg: "$progress",
        },

        totalSessions: {
          $sum: 1,
        },

        completedViews: {
          $sum: {
            $cond: [
              {
                $eq: ["$completed", true],
              },

              1,

              0,
            ],
          },
        },

        incompleteViews: {
          $sum: {
            $cond: [
              {
                $eq: ["$completed", false],
              },

              1,

              0,
            ],
          },
        },
      },
    },
  ]);

  if (!analytics.length) {
    return {
      totalWatchTime: 0,

      averageWatchDuration: 0,

      completedViews: 0,

      incompleteViews: 0,

      completionRate: 0,

      totalSessions: 0,
    };
  }

  const result = analytics[0];

  result.averageWatchDuration = Math.round(result.averageWatchDuration || 0);

  result.completionRate =
    result.totalSessions === 0
      ? 0
      : Number(
          ((result.completedViews / result.totalSessions) * 100).toFixed(2)
        );

  return result;
};
