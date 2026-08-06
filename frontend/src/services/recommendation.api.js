import { apiClient } from "./apiClient";

/**
 * Fetch the personalized home recommendations feed.
 * @param {Object} [params] - Optional query parameters.
 * @param {number} [params.page] - The page number for pagination.
 * @param {number} [params.limit] - The number of items to return.
 * @returns {Promise<Object>} The response data from the home feed recommendations.
 */
export const getHomeFeedApi = async ({ page, limit } = {}) => {
  const { data } = await apiClient.get("/recommendations/home", {
    params: { page, limit },
  });

  return data.data;
};

/**
 * Fetch the trending recommendations feed.
 * @param {Object} [params] - Optional query parameters.
 * @param {number} [params.page] - The page number for pagination.
 * @param {number} [params.limit] - The number of items to return.
 * @returns {Promise<Object>} The response data from the trending feed.
 */
export const getTrendingApi = async ({ page, limit } = {}) => {
  const { data } = await apiClient.get("/recommendations/trending", {
    params: { page, limit },
  });

  return data.data;
};
/**
 * Fetch similar videos recommendations for a given video ID.
 * @param {string|number} videoId - The ID of the video to find similar recommendations for.
 * @param {Object} [params] - Optional query parameters.
 * @param {number} [params.page] - The page number for pagination.
 * @param {number} [params.limit] - The number of items to return.
 * @returns {Promise<Object>} The response data from similar videos recommendations.
 */
export const getSimilarVideosApi = async (
  videoId,
  { page, limit } = {}
) => {
  const { data } = await apiClient.get(
    `/recommendations/similar/${videoId}`,
    {
      params: { page, limit },
    }
  );

  return data.data;
};
/**
 * Fetch the recommendations feed for the user's subscriptions.
 * @param {Object} [params] - Optional query parameters.
 * @param {number} [params.page] - The page number for pagination.
 * @param {number} [params.limit] - The number of items to return.
 * @returns {Promise<Object>} The response data from subscription recommendations.
 */
export const getSubscriptionFeedApi = async ({ page, limit } = {}) => {
  const { data } = await apiClient.get(
    "/recommendations/subscriptions",
    {
      params: { page, limit },
    }
  );

  return data.data;
};
