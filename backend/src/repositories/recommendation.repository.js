import Video from "../models/video.model.js";
import WatchSession from "../models/watchSession.model.js";
import WatchLater from "../models/watchLater.model.js";
import Like from "../models/like.model.js";
import Subscription from "../models/subscription.model.js";
import Comment from "../models/comment.model.js";
import logger from "../utils/logger.js";
const PUBLISHED = "published";

/**
 * Fetch a user's most recent watch history entries.
 * Used by the service to derive category/tag interest signals and to
 * exclude recently watched videos from candidate pools.
 *
 * @param {String} userId
 * @param {Number} limit
 * @returns {Promise<Array>} WatchSession docs populated with minimal video fields
 */
const getRecentWatchHistory = async (userId, limit = 30) => {
  return WatchSession.find({ user: userId })
    .sort({ lastWatchedAt: -1 })
    .limit(limit)
    .populate({
      path: "video",
      select: "owner category tags status views createdAt",
    })
    .select("video progress watchCount completed lastWatchedAt")
    .lean();
};

/**
 * Fetch all videos a user has liked.
 * Used by the service to derive category/tag interest signals.
 *
 * @param {String} userId
 * @returns {Promise<Array>} Like docs populated with minimal video fields
 */
const getLikedVideos = async (userId) => {
  return Like.find({ likedBy: userId })
    .populate({
      path: "video",
      select: "owner category tags status views createdAt",
    })
    .select("video")
    .lean();
};

/**
 * Fetch all videos a user has saved to Watch Later.
 * Used by the service to derive category/tag interest signals.
 *
 * @param {String} userId
 * @returns {Promise<Array>} WatchLater docs populated with minimal video fields
 */
const getWatchLaterVideos = async (userId) => {
  return WatchLater.find({ owner: userId })
    .populate({
      path: "video",
      select: "owner category tags status views createdAt",
    })
    .select("video")
    .lean();
};

/**
 * Fetch the list of channels (owners) a user is subscribed to.
 *
 * @param {String} userId
 * @returns {Promise<Array>} Subscription docs containing only the `channel` field
 */
const getSubscribedChannels = async (userId) => {
  return Subscription.find({ subscriber: userId }).select("channel").lean();
};

/**
 * Fetch a broad pool of candidate videos for the home feed, prior to
 * scoring/ranking in the service layer.
 *
 * Applies only hard exclusion filters (not scoring):
 *  - status must be published
 *  - excludes the requesting user's own videos
 *  - excludes an explicit list of video ids (e.g. already watched / duplicates)
 *  - optionally narrows to a set of relevant categories/tags to keep the
 *    candidate pool bounded (still just a filter, not a ranking decision)
 *
 * @param {Object} params
 * @param {String} params.ownerId - current user id, to exclude own videos
 * @param {Array<String>} params.excludeVideoIds - video ids to exclude
 * @param {Array<String>} [params.categories] - optional category filter
 * @param {Array<String>} [params.tags] - optional tag filter
 * @param {Number} [params.sampleSize] - cap on candidate pool size fetched from DB
 * @returns {Promise<Array>} lean Video docs
 */
const getCandidateVideos = async ({
  ownerId,
  excludeVideoIds = [],
  categories = [],
  tags = [],
  sampleSize = 300,
}) => {
  const query = {
    status: PUBLISHED,
    owner: { $ne: ownerId },
    _id: { $nin: excludeVideoIds },
  };

  if (categories.length || tags.length) {
    query.$or = [];
    if (categories.length) query.$or.push({ category: { $in: categories } });
    if (tags.length) query.$or.push({ tags: { $in: tags } });
  }

  return Video.find(query)
    .populate("owner", "fullname username avatar")
    .select(
      "title description thumbnail duration views owner createdAt category tags"
    )
    .sort({ createdAt: -1 })
    .limit(sampleSize)
    .lean();
  logger.info(videos[0]);
};

/**
 * Fetch published videos along with their like counts and comment counts,
 * as raw ingredients for the service's trending score calculation.
 *
 * This method does NOT compute a trending score and does NOT apply the
 * final descending sort by that score — it only aggregates the counts
 * needed for that computation and provides a stable base ordering.
 *
 * @param {Object} params
 * @param {Number} params.limit
 * @param {Number} params.skip
 * @param {Number} [params.sampleSize] - cap on pool size fetched for scoring
 * @returns {Promise<Array>} videos enriched with likesCount and commentsCount
 */
const getTrendingVideos = async ({
  limit = 20,
  skip = 0,
  sampleSize = 500,
} = {}) => {
  return Video.aggregate([
    { $match: { status: PUBLISHED } },
    { $sort: { createdAt: -1 } },
    { $limit: sampleSize },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likeDocs",
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "commentDocs",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $addFields: {
        likesCount: { $size: "$likeDocs" },
        commentsCount: { $size: "$commentDocs" },
      },
    },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        description: 1,
        category: 1,
        tags: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        likesCount: 1,
        commentsCount: 1,
        owner: {
          _id: "$owner._id",
          fullname: "$owner.fullname",
          username: "$owner.username",
          avatar: "$owner.avatar",
        },
      },
    },
    { $skip: skip },
    { $limit: limit },
  ]);
};

/**
 * Fetch raw candidates for the "similar videos" endpoint, matched by tags,
 * category, or owner. The service layer is responsible for prioritizing
 * (same tags > same category > same owner > trending fallback) and for
 * pulling in trending videos separately if this pool is insufficient.
 *
 * @param {Object} params
 * @param {String} params.videoId - the reference video to exclude from results
 * @param {String} params.ownerId - reference video's owner
 * @param {String} params.category - reference video's category
 * @param {Array<String>} params.tags - reference video's tags
 * @param {Number} [params.sampleSize] - cap on pool size fetched for prioritization
 * @returns {Promise<Array>} lean Video docs matching tags/category/owner
 */
const getSimilarVideos = async ({
  videoId,
  ownerId,
  category,
  tags = [],
  sampleSize = 100,
}) => {
  return Video.find({
    _id: { $ne: videoId },
    status: PUBLISHED,
    $or: [{ tags: { $in: tags } }, { category }, { owner: ownerId }],
  })

    .populate("owner", "fullname username avatar")
    .select(
      "title description thumbnail duration views owner createdAt category tags"
    )
    .sort({ createdAt: -1 })
    .limit(sampleSize)
    .lean();
};

/**
 * Fetch a paginated feed of published videos from a set of subscribed channels,
 * newest first.
 *
 * @param {Object} params
 * @param {Array<String>} params.channelIds
 * @param {Number} params.limit
 * @param {Number} params.skip
 * @returns {Promise<Array>} lean Video docs
 */
const getSubscriptionFeed = async ({ channelIds, limit = 20, skip = 0 }) => {
  return Video.find({
    owner: { $in: channelIds },
    status: PUBLISHED,
  })
    .populate("owner", "fullname username avatar")
    .select(
      "title description thumbnail duration views owner createdAt category tags"
    )

    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

/**
 * Fetch the latest published videos platform-wide.
 * Used by the service as part of the cold-start fallback (no history,
 * no likes, no watch later, no subscriptions).
 *
 * @param {Number} limit
 * @param {Number} skip
 * @returns {Promise<Array>} lean Video docs
 */
const getLatestPublishedVideos = async (limit = 20, skip = 0) => {
  return Video.find({ status: PUBLISHED })
    .select(
      "owner title description category tags views status createdAt duration"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

export default {
  getRecentWatchHistory,
  getLikedVideos,
  getWatchLaterVideos,
  getSubscribedChannels,
  getCandidateVideos,
  getTrendingVideos,
  getSimilarVideos,
  getSubscriptionFeed,
  getLatestPublishedVideos,
};
