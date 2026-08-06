import { apiClient } from "./apiClient";

/**
 * Fetch the user's paginated watch history.
 */
export const getWatchHistoryApi = async (page = 1, limit = 20) => {
  const response = await apiClient.get("/watch/history", {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Remove a single video from the watch history.
 */
export const deleteHistoryItemApi = async (videoId) => {
  const response = await apiClient.delete(`/watch/history/${videoId}`);
  return response.data;
};

/**
 * Clear the entire watch history.
 */
export const clearWatchHistoryApi = async () => {
  const response = await apiClient.delete("/watch/history");
  return response.data;
};

/**
 * Record or update active watch session progress.
 */
export const recordWatchProgressApi = async (videoId, progress, duration) => {
  const response = await apiClient.post(`/watch/${videoId}`, { progress, duration });
  return response.data;
};

/**
 * Fetch the last recorded watch position for a video.
 */
export const getResumePositionApi = async (videoId) => {
  const response = await apiClient.get(`/watch/${videoId}/resume`);
  return response.data;
};

/**
 * Fetch the user's continue watching videos (limited).
 */
export const getContinueWatchingApi = async (limit = 10) => {
  const response = await apiClient.get("/watch/continue-watching", {
    params: { limit },
  });
  return response.data;
};
