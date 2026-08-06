import mongoose from "mongoose";
import Subscription from "../../models/subscription.model.js";

/**
 * ============================================================================
 * Subscriber Analytics Repository
 * ============================================================================
 *
 * Supports:
 * - Total Subscribers
 * - Daily Growth
 * - Weekly Growth
 * - Monthly Growth
 * - Yearly Growth
 *
 * ============================================================================
 */

export const getSubscriberAnalytics = async (ownerId, period = "daily") => {
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

  const growth = await Subscription.aggregate([
    {
      $match: {
        channel: ownerObjectId,
      },
    },

    {
      $group: {
        _id: groupId,

        subscribers: {
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

        subscribers: 1,
      },
    },

    {
      $sort: {
        label: 1,
      },
    },
  ]);

  const totalSubscribers = await Subscription.countDocuments({
    channel: ownerObjectId,
  });

  return {
    totalSubscribers,

    growth,
  };
};
