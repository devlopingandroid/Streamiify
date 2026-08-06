import { apiClient } from "./apiClient";

/**
 * Fetch all notifications for the authenticated user (paginated).
 */
export const getNotificationsApi = async (page = 1, limit = 20) => {
  const response = await apiClient.get("/notifications", {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Fetch all unread notifications for the authenticated user.
 */
export const getUnreadNotificationsApi = async () => {
  const response = await apiClient.get("/notifications/unread");
  return response.data;
};

/**
 * Fetch the count of unread notifications.
 */
export const getUnreadCountApi = async () => {
  const response = await apiClient.get("/notifications/unread-count");
  return response.data;
};

/**
 * Mark a single notification as read.
 */
export const markNotificationReadApi = async (notificationId) => {
  const response = await apiClient.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read.
 */
export const markAllNotificationsReadApi = async () => {
  const response = await apiClient.patch("/notifications/read-all");
  return response.data;
};

/**
 * Delete a single notification.
 */
export const deleteNotificationApi = async (notificationId) => {
  const response = await apiClient.delete(`/notifications/${notificationId}`);
  return response.data;
};

/**
 * Clear all notifications of the user.
 */
export const clearNotificationsApi = async () => {
  const response = await apiClient.delete("/notifications");
  return response.data;
};
