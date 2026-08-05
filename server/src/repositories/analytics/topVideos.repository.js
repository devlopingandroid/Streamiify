import mongoose from "mongoose";
import Video from "../../models/video.model.js";

/**
 * ============================================================================
 * Top Videos Analytics Repository
 * ============================================================================
 *
 * Returns Creator's Best Performing Videos
 *
 * Metrics:
 * - Views
 * - Likes
 * - Comments
 * - Watch Time
 * - Average Watch Duration
 * - Engagement Rate
 *
 * ============================================================================
 */

export const getTopVideos = async (ownerId, limit = 10) => {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const videos = await Video.aggregate([
    {
      $match: {
        owner: ownerObjectId,
        status: "published",
      },
    },

    /**
     * Likes
     */

    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },

    /**
     * Comments
     */

    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },

    /**
     * Watch Sessions
     */

    {
      $lookup: {
        from: "watchsessions",
        localField: "_id",
        foreignField: "video",
        as: "watchSessions",
      },
    },

    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },

        commentsCount: {
          $size: "$comments",
        },

        totalWatchTime: {
          $sum: "$watchSessions.progress",
        },

        averageWatchDuration: {
          $avg: "$watchSessions.progress",
        },
      },
    },

    /**
     * Engagement
     */

    {
      $addFields: {
        engagementRate: {
          $cond: [
            {
              $eq: ["$views", 0],
            },

            0,

            {
              $multiply: [
                {
                  $divide: [
                    {
                      $add: ["$likesCount", "$commentsCount"],
                    },

                    "$views",
                  ],
                },

                100,
              ],
            },
          ],
        },
      },
    },

    {
      $project: {
        title: 1,

        thumbnail: 1,

        category: 1,

        views: 1,

        createdAt: 1,

        duration: 1,

        likesCount: 1,

        commentsCount: 1,

        totalWatchTime: 1,

        averageWatchDuration: {
          $round: ["$averageWatchDuration", 2],
        },

        engagementRate: {
          $round: ["$engagementRate", 2],
        },
      },
    },

    {
      $sort: {
        views: -1,

        engagementRate: -1,
      },
    },

    {
      $limit: Number(limit),
    },
  ]);

  return videos;
};
