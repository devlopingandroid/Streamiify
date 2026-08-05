import { apiClient } from "./apiClient";

export const getPlaylistsApi = async () => {
  const response = await apiClient.get("/playlists");
  return response.data;
};

export const createPlaylistApi = async (body) => {
  const response = await apiClient.post("/playlists", body);
  return response.data;
};

export const deletePlaylistApi = async (id) => {
  const response = await apiClient.delete(`/playlists/${id}`);
  return response.data;
};

export const addVideoToPlaylistApi = async (playlistId, videoId) => {
  const response = await apiClient.post(`/playlists/${playlistId}/videos/${videoId}`);
  return response.data;
};

export const removeVideoFromPlaylistApi = async (playlistId, videoId) => {
  const response = await apiClient.delete(`/playlists/${playlistId}/videos/${videoId}`);
  return response.data;
};

export const getMyPlaylistsApi = async () => {
  const response = await apiClient.get("/playlists/me");
  return response.data;
};

export const getPlaylistByIdApi = async (playlistId) => {
  const response = await apiClient.get(`/playlists/${playlistId}`);
  return response.data;
};

export const getUserPlaylistsApi = async (userId) => {
  const response = await apiClient.get(`/playlists/user/${userId}`);
  return response.data;
};

export const updatePlaylistApi = async (playlistId, body) => {
  const response = await apiClient.patch(`/playlists/${playlistId}`, body);
  return response.data;
};

export const updatePlaylistVisibilityApi = async (playlistId, visibility) => {
  const response = await apiClient.patch(`/playlists/${playlistId}/visibility`, { visibility });
  return response.data;
};

