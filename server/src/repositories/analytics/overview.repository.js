import mongoose from "mongoose";
import Video from "../../models/video.model.js";
import WatchSession from "../../models/watchSession.model.js";
import Subscription from "../../models/subscription.model.js";

/**
 * ============================================================================
 * Creator Overview Analytics
 * ============================================================================
 *
 * Returns:
 * - Total Videos
 * - Total Views
 * - Total Likes
 * - Total Comments
 * - Total Subscribers
 * - Total Watch Time
 * - Average Watch Duration
 * - Completed Views
 * - Incomplete Views
 * - Completion Rate
 * - Engagement Rate
 *
 * ============================================================================
 */

export const getOverviewAnalytics = async (ownerId) => {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  /**
   * ------------------------------------------------------------
   * Fetch creator's videos
   * ------------------------------------------------------------
   */

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
      $project: {
        views: 1,

        likesCount: {
          $size: "$likes",
        },

        commentsCount: {
          $size: "$comments",
        },

        watchTime: {
          $sum: "$watchSessions.progress",
        },

        averageWatchDuration: {
          $avg: "$watchSessions.progress",
        },

        completedViews: {
          $size: {
            $filter: {
              input: "$watchSessions",
              as: "session",
              cond: {
                $eq: ["$$session.completed", true],
              },
            },
          },
        },

        incompleteViews: {
          $size: {
            $filter: {
              input: "$watchSessions",
              as: "session",
              cond: {
                $eq: ["$$session.completed", false],
              },
            },
          },
        },
      },
    },
  ]);

  /**
   * ------------------------------------------------------------
   * Subscribers
   * ------------------------------------------------------------
   */

  const totalSubscribers = await Subscription.countDocuments({
    channel: ownerObjectId,
  });

  /**
   * ------------------------------------------------------------
   * Aggregate Metrics
   * ------------------------------------------------------------
   */

  const analytics = videos.reduce(
    (acc, video) => {
      acc.totalVideos += 1;

      acc.totalViews += video.views || 0;

      acc.totalLikes += video.likesCount || 0;

      acc.totalComments += video.commentsCount || 0;

      acc.totalWatchTime += video.watchTime || 0;

      acc.completedViews += video.completedViews || 0;

      acc.incompleteViews += video.incompleteViews || 0;

      acc.averageWatchDuration += video.averageWatchDuration || 0;

      return acc;
    },
    {
      totalVideos: 0,

      totalViews: 0,

      totalLikes: 0,

      totalComments: 0,

      totalWatchTime: 0,

      averageWatchDuration: 0,

      completedViews: 0,

      incompleteViews: 0,
    }
  );

  analytics.totalSubscribers = totalSubscribers;

  /**
   * ------------------------------------------------------------
   * Average Watch Duration
   * ------------------------------------------------------------
   */

  analytics.averageWatchDuration = analytics.totalVideos
    ? Math.round(analytics.averageWatchDuration / analytics.totalVideos)
    : 0;

  /**
   * ------------------------------------------------------------
   * Completion Rate
   * ------------------------------------------------------------
   */

  const totalSessions = analytics.completedViews + analytics.incompleteViews;

  analytics.completionRate =
    totalSessions === 0
      ? 0
      : Number(((analytics.completedViews / totalSessions) * 100).toFixed(2));

  /**
   * ------------------------------------------------------------
   * Engagement Rate
   * ------------------------------------------------------------
   */

  analytics.engagementRate =
    analytics.totalViews === 0
      ? 0
      : Number(
          (
            ((analytics.totalLikes + analytics.totalComments) /
              analytics.totalViews) *
            100
          ).toFixed(2)
        );

  return analytics;
};
