import { Router } from "express";

import {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearNotifications,
} from "../controllers/notification.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  validateNotificationId,
  validatePagination,
} from "../validators/notification.validator.js";

const router = Router();

/**
 * ============================================================================
 * Notification Routes
 * Base URL: /notifications
 *
 * All routes require authentication.
 * ============================================================================
 */

router.use(verifyJWT);

/* -------------------------------------------------------------------------- */
/*                              Notification List                             */
/* -------------------------------------------------------------------------- */

// GET /notifications?page=1&limit=20
router.get("/", validatePagination, getNotifications);

// GET /notifications/unread
router.get("/unread", getUnreadNotifications);

// GET /notifications/unread-count
router.get("/unread-count", getUnreadCount);

/* -------------------------------------------------------------------------- */
/*                              Update Notifications                          */
/* -------------------------------------------------------------------------- */

// PATCH /notifications/:notificationId/read
router.patch(
  "/:notificationId/read",
  validateNotificationId,
  markNotificationAsRead
);

// PATCH /notifications/read-all
router.patch("/read-all", markAllNotificationsAsRead);

/* -------------------------------------------------------------------------- */
/*                              Delete Notifications                          */
/* -------------------------------------------------------------------------- */

// DELETE /notifications/:notificationId
router.delete("/:notificationId", validateNotificationId, deleteNotification);

// DELETE /notifications
router.delete("/", clearNotifications);

export default router;
