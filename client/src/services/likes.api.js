import { apiClient } from "./apiClient";

/**
 * Fetch all videos liked by the logged-in user (paginated).
 */
export const getLikedVideosApi = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/likes/videos?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Toggle like / unlike status on a video.
 */
export const toggleLikeVideoApi = async (videoId) => {
  const response = await apiClient.post(`/likes/video/${videoId}`);
  return response.data;
};

/**
 * Fetch video likes statistics (total counts and user state).
 */
export const getVideoLikesApi = async (videoId) => {
  const response = await apiClient.get(`/likes/video/${videoId}`);
  return response.data;
};
