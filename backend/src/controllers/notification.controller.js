import notificationService from "../services/notification.service.js";

import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * ============================================================================
 * GET /notifications
 * ============================================================================
 */
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const notifications = await notificationService.getNotifications(
    userId,
    page,
    limit
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, notifications, "Notifications fetched successfully.")
    );
});

/**
 * ============================================================================
 * GET /notifications/unread
 * ============================================================================
 */
export const getUnreadNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUnreadNotifications(
    req.user._id
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notifications,
        "Unread notifications fetched successfully."
      )
    );
});

/**
 * ============================================================================
 * GET /notifications/unread-count
 * ============================================================================
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Unread count fetched successfully."));
});

/**
 * ============================================================================
 * PATCH /notifications/:notificationId/read
 * ============================================================================
 */
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification = await notificationService.markAsRead(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, notification, "Notification marked as read."));
});

/**
 * ============================================================================
 * PATCH /notifications/read-all
 * ============================================================================
 */
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications marked as read."));
});

/**
 * ============================================================================
 * DELETE /notifications/:notificationId
 * ============================================================================
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  const notification =
    await notificationService.deleteNotification(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Notification deleted successfully."));
});

/**
 * ============================================================================
 * DELETE /notifications
 * ============================================================================
 */
export const clearNotifications = asyncHandler(async (req, res) => {
  await notificationService.clearNotifications(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications cleared successfully."));
});
