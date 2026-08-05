import { apiClient } from "./apiClient";

/**
 * Fetch the last recorded watch position for a video.
 */
export const getResumePositionApi = async (videoId) => {
  const response = await apiClient.get(`/watch/${videoId}/resume`);
  return response.data;
};

/**
 * Record or update the active watch session progress.
 */
export const recordWatchSessionApi = async (videoId, progress, duration) => {
  const response = await apiClient.post(`/watch/${videoId}`, { progress, duration });
  return response.data;
};

/**
 * Fetch the user's paginated watch history.
 */
export const getWatchHistoryApi = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/watch/history?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Fetch the user's continue watching videos (limited).
 */
export const getContinueWatchingApi = async (limit = 10) => {
  const response = await apiClient.get(`/watch/continue-watching?limit=${limit}`);
  return response.data;
};
