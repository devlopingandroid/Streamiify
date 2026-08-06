import { apiClient } from "./apiClient";

export const getWatchLaterApi = async () => {
  const response = await apiClient.get("/watch-later");
  return response.data;
};

export const toggleWatchLaterApi = async (videoId) => {
  const response = await apiClient.post(`/watch-later/${videoId}`);
  return response.data;
};

export const removeWatchLaterApi = async (videoId) => {
  const response = await apiClient.delete(`/watch-later/${videoId}`);
  return response.data;
};

export const getWatchLaterStatusApi = async (videoId) => {
  const response = await apiClient.get(`/watch-later/${videoId}/status`);
  return response.data;
};