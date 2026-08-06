import { apiClient } from "./apiClient";

/**
 * Create a parent comment on a video.
 */
export const createCommentApi = async (videoId, content) => {
  const response = await apiClient.post(`/comments/video/${videoId}`, { content });
  return response.data;
};

/**
 * Fetch paginated comments for a video.
 */
export const getVideoCommentsApi = async (videoId, page = 1, limit = 10) => {
  const response = await apiClient.get(`/comments/video/${videoId}?page=${page}&limit=${limit}`);
  return response.data;
};

/**
 * Fetch the total count of comments for a video.
 */
export const getCommentCountApi = async (videoId) => {
  const response = await apiClient.get(`/comments/video/${videoId}/count`);
  return response.data;
};

/**
 * Create a reply to an existing comment.
 */
export const createReplyApi = async (commentId, content) => {
  const response = await apiClient.post(`/comments/${commentId}/reply`, { content });
  return response.data;
};

/**
 * Fetch all replies for a parent comment.
 */
export const getRepliesApi = async (commentId) => {
  const response = await apiClient.get(`/comments/${commentId}/replies`);
  return response.data;
};

/**
 * Update the text content of a comment or reply.
 */
export const updateCommentApi = async (commentId, content) => {
  const response = await apiClient.patch(`/comments/${commentId}`, { content });
  return response.data;
};

/**
 * Delete a comment or reply.
 */
export const deleteCommentApi = async (commentId) => {
  const response = await apiClient.delete(`/comments/${commentId}`);
  return response.data;
};
