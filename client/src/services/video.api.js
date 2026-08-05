import { apiClient } from "./apiClient";

export const getVideosApi = async (query = "") => {
  const response = await apiClient.get(
    `/videos?query=${encodeURIComponent(query)}`
  );
  return response.data;
};

export const getTrendingVideosApi = async () => {
  const response = await apiClient.get(
    "/videos?sortBy=views&sortType=desc"
  );
  return response.data;
};

export const getVideoByIdApi = async (id) => {
  const response = await apiClient.get(`/videos/${id}`);
  return response.data;
};

export const uploadVideoApi = async (formData, onUploadProgress) => {
  const response = await apiClient.post("/videos", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
  return response.data;
};

export const deleteVideoApi = async (videoId) => {
  const response = await apiClient.delete(`/videos/${videoId}`);
  return response.data;
};

export const toggleVideoStatusApi = async (videoId) => {
  const response = await apiClient.patch(`/videos/${videoId}/toggle-publish`);
  return response.data;
};


