/**
 * recommendation.service.js
 *
 * Layer: SERVICE
 *
 * Responsibility:
 *  - ALL business logic for the rule-based recommendation engine lives here.
 *  - Interest extraction, interest scoring, candidate filtering, weighted
 *    ranking, trending score calculation, similarity prioritization,
 *    subscription feed assembly, and cold-start fallback all happen here.
 *  - This file NEVER talks to Mongoose/MongoDB directly — it only calls
 *    recommendation.repository.js.
 */

import recommendationRepository from "../repositories/recommendation.repository.js";
import videoRepository from "../repositories/video.repository.js";
import ApiError from "../utils/ApiError.js";
// ---------------------------------------------------------------------------
// WEIGHTS (rule-based scoring configuration)
// ---------------------------------------------------------------------------
const WEIGHTS = {
  SAME_CATEGORY: 40,
  SAME_TAGS: 25,
  SUBSCRIBED_CREATOR: 30,
  LIKED_SIMILAR_CATEGORY: 20,
  WATCH_LATER_SIMILAR: 15,
  VIEWS_WEIGHT: 10,
  RECENCY_BONUS: 10,
};

const RECENCY_WINDOW_DAYS = 14; // videos uploaded within this window are eligible for a recency bonus
const VIEWS_NORMALIZATION_CAP = 1_000_000; // views count beyond this is treated as "maxed out" for scoring

// ---------------------------------------------------------------------------
// SMALL PURE HELPERS
// ---------------------------------------------------------------------------

/**
 * Increments a Map<key, count> by 1 for the given key (creates entry if absent).
 */
const bumpCount = (map, key) => {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
};

/**
 * Returns true if the video's createdAt falls within the recency window.
 */
const isRecentUpload = (createdAt) => {
  if (!createdAt) return false;
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return ageDays <= RECENCY_WINDOW_DAYS;
};

/**
 * Normalizes a raw view count into a 0-1 range for scoring purposes.
 */
const normalizeViews = (views = 0) =>
  Math.min(views, VIEWS_NORMALIZATION_CAP) / VIEWS_NORMALIZATION_CAP;

/**
 * Applies pagination (page/limit) to an already-sorted in-memory array.
 * The heavy DB-level filtering already happened in the repository; this
 * final slice reflects the ranked order computed by this service.
 */
const paginate = (items, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    results: paginatedItems,
    pagination: {
      page,
      limit,
      totalResults: items.length,
      totalPages: Math.ceil(items.length / limit) || 1,
      hasNextPage: endIndex < items.length,
      hasPrevPage: startIndex > 0,
    },
  };
};

/**
 * Extracts a string video id whether given a populated video object,
 * a raw ObjectId, or a string.
 */
const extractVideoId = (video) => {
  if (!video) return null;
  return (video._id || video).toString();
};

// ---------------------------------------------------------------------------
// INTEREST PROFILE BUILDING
// ---------------------------------------------------------------------------

/**
 * Builds the user's interest profile by combining signals from watch
 * history, liked videos, watch later, and subscriptions.
 *
 * Produces:
 *  - categoryScores: Map<category, count>
 *  - tagScores: Map<tag, count>
 *  - subscribedChannelIds: Array<string>
 *  - watchedVideoIds: Array<string> (for exclusion from candidates)
 *  - likedVideoIds: Array<string>
 *  - watchLaterVideoIds: Array<string>
 *  - isColdStart: boolean (true when the user has no signals at all)
 *
 * @param {String} userId
 * @returns {Promise<Object>} interest profile
 */
const buildInterestProfile = async (userId) => {
  const [watchHistory, likedVideos, watchLaterVideos, subscriptions] =
    await Promise.all([
      recommendationRepository.getRecentWatchHistory(userId),
      recommendationRepository.getLikedVideos(userId),
      recommendationRepository.getWatchLaterVideos(userId),
      recommendationRepository.getSubscribedChannels(userId),
    ]);

  const categoryScores = new Map();
  const tagScores = new Map();
  const watchedVideoIds = [];
  const likedVideoIds = [];
  const watchLaterVideoIds = [];

  // --- Watch History signals ---
  for (const session of watchHistory) {
    const video = session.video;
    if (!video) continue; // video may have been deleted since the session was recorded
    watchedVideoIds.push(extractVideoId(video));
    bumpCount(categoryScores, video.category);
    (video.tags || []).forEach((tag) => bumpCount(tagScores, tag));
  }

  // --- Liked Videos signals ---
  for (const likeDoc of likedVideos) {
    const video = likeDoc.video;
    if (!video) continue;
    likedVideoIds.push(extractVideoId(video));
    bumpCount(categoryScores, video.category);
    (video.tags || []).forEach((tag) => bumpCount(tagScores, tag));
  }

  // --- Watch Later signals ---
  for (const watchLaterDoc of watchLaterVideos) {
    const video = watchLaterDoc.video;
    if (!video) continue;
    watchLaterVideoIds.push(extractVideoId(video));
    bumpCount(categoryScores, video.category);
    (video.tags || []).forEach((tag) => bumpCount(tagScores, tag));
  }

  // --- Subscription signals ---
  const subscribedChannelIds = subscriptions
    .map((sub) => (sub.channel ? sub.channel.toString() : null))
    .filter(Boolean);

  const isColdStart =
    watchHistory.length === 0 &&
    likedVideos.length === 0 &&
    watchLaterVideos.length === 0 &&
    subscribedChannelIds.length === 0;

  return {
    categoryScores,
    tagScores,
    subscribedChannelIds,
    watchedVideoIds,
    likedVideoIds,
    watchLaterVideoIds,
    isColdStart,
  };
};

// ---------------------------------------------------------------------------
// HOME FEED SCORING
// ---------------------------------------------------------------------------

/**
 * Computes the weighted recommendation score for a single candidate video
 * against the user's interest profile.
 *
 * Weighting rules:
 *  - Same Category                +40
 *  - Same Tags (per matching tag) +25
 *  - Subscribed Creator            +30
 *  - Liked Similar Category        +20
 *  - Watch Later Similar Category  +15
 *  - Views Weight (normalized)     up to +10
 *  - Recency Bonus (<=14 days old) +10
 *
 * @param {Object} video - candidate video (lean doc)
 * @param {Object} profile - interest profile from buildInterestProfile
 * @returns {Number} final weighted score
 */
const scoreVideoForHomeFeed = (video, profile) => {
  let score = 0;

  const topCategories = getTopKeys(profile.categoryScores, 5);
  const topTags = getTopKeys(profile.tagScores, 15);

  // Same Category
  if (video.category && topCategories.includes(video.category)) {
    score += WEIGHTS.SAME_CATEGORY;
  }

  // Same Tags — award once per matching tag, capped implicitly by tag list size
  const videoTags = video.tags || [];
  const matchingTagCount = videoTags.filter((tag) =>
    topTags.includes(tag)
  ).length;
  if (matchingTagCount > 0) {
    score += WEIGHTS.SAME_TAGS * Math.min(matchingTagCount, 3); // cap influence of tag-stuffing
  }

  // Subscribed Creator
  if (
    video.owner &&
    profile.subscribedChannelIds.includes(video.owner.toString())
  ) {
    score += WEIGHTS.SUBSCRIBED_CREATOR;
  }

  // Liked Similar Category — a softer signal than the primary category match above,
  // rewarding categories the user has liked videos in even if not a top category
  if (video.category && profile.categoryScores.has(video.category)) {
    score += WEIGHTS.LIKED_SIMILAR_CATEGORY;
  }

  // Watch Later Similar — reward categories present in the user's watch-later list
  if (
    video.category &&
    profile.tagScores.size > 0 &&
    videoTags.some((tag) => profile.tagScores.has(tag))
  ) {
    score += WEIGHTS.WATCH_LATER_SIMILAR;
  }

  // Views Weight (normalized 0-1, scaled to weight)
  score += normalizeViews(video.views) * WEIGHTS.VIEWS_WEIGHT;

  // Recency Bonus
  if (isRecentUpload(video.createdAt)) {
    score += WEIGHTS.RECENCY_BONUS;
  }

  return score;
};

/**
 * Returns the top-N keys of a Map<string, number> sorted by count descending.
 */
const getTopKeys = (map, n) => {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key]) => key);
};

// ---------------------------------------------------------------------------
// PUBLIC SERVICE METHODS
// ---------------------------------------------------------------------------

/**
 * GET /recommendations/home
 *
 * Builds a personalized home feed:
 *  1. Extract user interests from history, likes, watch later, subscriptions.
 *  2. If the user is a cold-start user, fall back to Trending + Latest Published.
 *  3. Otherwise fetch a bounded candidate pool from top interest categories/tags,
 *     score every candidate with the weighted formula, sort descending, paginate.
 *
 * @param {String} userId
 * @param {Object} options
 * @param {Number} options.page
 * @param {Number} options.limit
 * @returns {Promise<Object>} { results, pagination }
 */
const getHomeFeed = async (userId, { page = 1, limit = 20 } = {}) => {
  const profile = await buildInterestProfile(userId);

  if (profile.isColdStart) {
    return getColdStartFeed({ page, limit });
  }

  const excludeVideoIds = Array.from(
    new Set([
      ...profile.watchedVideoIds,
      ...profile.likedVideoIds,
      ...profile.watchLaterVideoIds,
    ])
  );

  const topCategories = getTopKeys(profile.categoryScores, 5);
  const topTags = getTopKeys(profile.tagScores, 15);

  const candidates = await recommendationRepository.getCandidateVideos({
    ownerId: userId,
    excludeVideoIds,
    categories: topCategories,
    tags: topTags,
    sampleSize: 300,
  });

  if (!candidates.length) {
    return getColdStartFeed({
      page,
      limit,
    });
  }

  // De-duplicate candidates by _id (defensive, in case of overlapping $or matches)
  const uniqueCandidates = dedupeById(candidates);

  const scored = uniqueCandidates
    .map((video) => ({ video, score: scoreVideoForHomeFeed(video, profile) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.video);
  if (!scored.length) {
    return getColdStartFeed({
      page,
      limit,
    });
  }
  return paginate(scored, page, limit);
};

/**
 * Fallback feed for cold-start users: merges Trending videos with the
 * Latest Published videos, de-duplicated, newest/most-trending first.
 *
 * @param {Object} options
 * @param {Number} options.page
 * @param {Number} options.limit
 * @returns {Promise<Object>} { results, pagination }
 */
const getColdStartFeed = async ({ page = 1, limit = 20 } = {}) => {
  const [trending, latest] = await Promise.all([
    recommendationRepository.getTrendingVideos({ limit: 50, skip: 0 }),
    recommendationRepository.getLatestPublishedVideos(50, 0),
  ]);

  const trendingScored = trending
    .map((video) => ({ video, score: calculateTrendingScore(video) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.video);

  const merged = dedupeById([...trendingScored, ...latest]);

  return paginate(merged, page, limit);
};

/**
 * Calculates a rule-based trending score for a single video using views,
 * likes, comments, and a recent-upload bonus. No ML involved.
 *
 * @param {Object} video - video enriched with likesCount/commentsCount
 * @returns {Number} trending score
 */
const calculateTrendingScore = (video) => {
  const viewsComponent = normalizeViews(video.views) * 50;
  const likesComponent = (video.likesCount || 0) * 2;
  const commentsComponent = (video.commentsCount || 0) * 3;
  const recencyComponent = isRecentUpload(video.createdAt) ? 20 : 0;

  return viewsComponent + likesComponent + commentsComponent + recencyComponent;
};

/**
 * GET /recommendations/trending
 *
 * Fetches trending candidates, computes the trending score for each,
 * sorts descending, and paginates.
 *
 * @param {Object} options
 * @param {Number} options.page
 * @param {Number} options.limit
 * @returns {Promise<Object>} { results, pagination }
 */
const getTrending = async ({ page = 1, limit = 20 } = {}) => {
  const candidates = await recommendationRepository.getTrendingVideos({
    limit: 200,
    skip: 0,
  });

  const scored = candidates
    .map((video) => ({ video, score: calculateTrendingScore(video) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.video);

  return paginate(scored, page, limit);
};

/**
 * GET /recommendations/similar/:videoId
 *
 * Priority order: Same Tags > Same Category > Same Owner > Trending fallback.
 * A candidate that matches on multiple axes is only placed in its highest
 * priority bucket (no duplicates across buckets).
 *
 * @param {String} videoId
 * @param {Object} options
 * @param {Number} options.page
 * @param {Number} options.limit
 * @returns {Promise<Object>} { results, pagination }
 */
const getSimilarVideos = async (videoId, { page = 1, limit = 20 } = {}) => {
  const referenceVideo = await getReferenceVideoOrThrow(videoId);

  const rawCandidates = await recommendationRepository.getSimilarVideos({
    videoId,
    ownerId: referenceVideo.owner,
    category: referenceVideo.category,
    tags: referenceVideo.tags || [],
    sampleSize: 150,
  });

  const tagBucket = [];
  const categoryBucket = [];
  const ownerBucket = [];
  const seenIds = new Set();

  const referenceTags = new Set(referenceVideo.tags || []);

  for (const candidate of rawCandidates) {
    const id = extractVideoId(candidate);
    if (seenIds.has(id)) continue;

    const sharesTag = (candidate.tags || []).some((tag) =>
      referenceTags.has(tag)
    );
    const sharesCategory = candidate.category === referenceVideo.category;
    const sharesOwner =
      candidate.owner &&
      candidate.owner.toString() === referenceVideo.owner.toString();

    if (sharesTag) {
      tagBucket.push(candidate);
    } else if (sharesCategory) {
      categoryBucket.push(candidate);
    } else if (sharesOwner) {
      ownerBucket.push(candidate);
    } else {
      continue; // shouldn't normally happen given the repository query, but stay defensive
    }
    seenIds.add(id);
  }

  let ordered = [...tagBucket, ...categoryBucket, ...ownerBucket];

  // Trending fallback: top up the list with trending videos if the
  // similarity pool is smaller than what's needed to fill at least one page.
  if (ordered.length < limit) {
    const trending = await recommendationRepository.getTrendingVideos({
      limit: 50,
      skip: 0,
    });
    const trendingScored = trending
      .filter(
        (video) =>
          extractVideoId(video) !== videoId &&
          !seenIds.has(extractVideoId(video))
      )
      .map((video) => ({ video, score: calculateTrendingScore(video) }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.video);

    ordered = [...ordered, ...trendingScored];
  }

  return paginate(ordered, page, limit);
};

/**
 * GET /recommendations/subscriptions
 *
 * Returns published videos from the user's subscribed channels, newest first.
 * Falls back to an empty paginated result (not an error) if the user has
 * no subscriptions.
 *
 * @param {String} userId
 * @param {Object} options
 * @param {Number} options.page
 * @param {Number} options.limit
 * @returns {Promise<Object>} { results, pagination }
 */
const getSubscriptionFeed = async (userId, { page = 1, limit = 20 } = {}) => {
  const subscriptions =
    await recommendationRepository.getSubscribedChannels(userId);
  const channelIds = subscriptions.map((sub) => sub.channel).filter(Boolean);

  if (channelIds.length === 0) {
    return paginate([], page, limit);
  }

  const skip = (page - 1) * limit;
  const videos = await recommendationRepository.getSubscriptionFeed({
    channelIds,
    limit,
    skip,
  });

  // The repository already applies DB-level pagination here (sorted, bounded
  // list), so we report pagination metadata without re-slicing the array.
  return {
    results: videos,
    pagination: {
      page,
      limit,
      totalResults: videos.length,
      totalPages: undefined, // unknown without a separate count query; omitted intentionally
      hasNextPage: videos.length === limit,
      hasPrevPage: page > 1,
    },
  };
};

// ---------------------------------------------------------------------------
// INTERNAL HELPERS
// ---------------------------------------------------------------------------

/**
 * De-duplicates an array of lean video docs by their _id.
 */
const dedupeById = (videos) => {
  const seen = new Set();
  const result = [];
  for (const video of videos) {
    const id = extractVideoId(video);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(video);
  }
  return result;
};

/**
 * Fetches the reference video for the "similar videos" endpoint via the
 * existing video repository, and throws a 404 if it doesn't exist or
 * isn't published.
 *
 * @param {String} videoId
 * @returns {Promise<Object>} lean video doc with owner, category, tags
 */
const getReferenceVideoOrThrow = async (videoId) => {
  const video = await videoRepository.findById(videoId);

  if (!video || video.status !== "published") {
    throw new ApiError(404, "Video not found or is not published");
  }

  return video;
};

export default {
  getHomeFeed,
  getTrending,
  getSimilarVideos,
  getSubscriptionFeed,
};
