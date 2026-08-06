import mongoose from "mongoose";
import WatchSession from "../../models/watchSession.model.js";

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

  const analytics = await WatchSession.aggregate([
    /**
     * Join Video Collection
     */

    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },

    {
      $unwind: "$video",
    },

    /**
     * Only creator's videos
     */

    {
      $match: {
        "video.owner": ownerObjectId,
      },
    },

    /**
     * Aggregate
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
