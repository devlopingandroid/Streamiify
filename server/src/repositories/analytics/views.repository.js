import mongoose from "mongoose";
import Video from "../../models/video.model.js";

/**
 * ============================================================================
 * Views Analytics Repository
 * ============================================================================
 *
 * Supports:
 * - Daily
 * - Weekly
 * - Monthly
 * - Yearly
 *
 * Returns:
 * [
 *   {
 *      label,
 *      views,
 *      videos
 *   }
 * ]
 * ============================================================================
 */

export const getViewsAnalytics = async (ownerId, period = "daily") => {
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  let groupId = {};
  let label = {};

  switch (period) {
    case "daily":
      groupId = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };

      label = {
        $dateToString: {
          format: "%d-%m-%Y",
          date: "$createdAt",
        },
      };

      break;

    case "weekly":
      groupId = {
        year: { $isoWeekYear: "$createdAt" },
        week: { $isoWeek: "$createdAt" },
      };

      label = {
        $concat: [
          "Week ",
          {
            $toString: {
              $isoWeek: "$createdAt",
            },
          },
        ],
      };

      break;

    case "monthly":
      groupId = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };

      label = {
        $dateToString: {
          format: "%b %Y",
          date: "$createdAt",
        },
      };

      break;

    case "yearly":
      groupId = {
        year: { $year: "$createdAt" },
      };

      label = {
        $toString: {
          $year: "$createdAt",
        },
      };

      break;

    default:
      throw new Error("Invalid period");
  }

  const analytics = await Video.aggregate([
    {
      $match: {
        owner: ownerObjectId,
        status: "published",
      },
    },

    {
      $group: {
        _id: groupId,

        views: {
          $sum: "$views",
        },

        videos: {
          $sum: 1,
        },

        label: {
          $first: label,
        },
      },
    },

    {
      $project: {
        _id: 0,

        label: 1,

        views: 1,

        videos: 1,
      },
    },

    {
      $sort: {
        label: 1,
      },
    },
  ]);

  return analytics;
};
