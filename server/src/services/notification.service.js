import notificationRepository from "../repositories/notification.repository.js";

class NotificationService {
  /**
   * ============================================================
   * Create Notification
   * ============================================================
   */
  async createNotification({
    recipient,
    sender,
    type,
    title,
    message,
    video = null,
    comment = null,
    playlist = null,
  }) {
    // Don't notify yourself
    if (recipient && sender && recipient.toString() === sender.toString()) {
      return null;
    }

    return await notificationRepository.create({
      recipient,
      sender,
      type,
      title,
      message,
      video,
      comment,
      playlist,
    });
  }

  /**
   * ============================================================
   * Get User Notifications
   * ============================================================
   */
  async getNotifications(userId, page, limit) {
    return await notificationRepository.getUserNotifications(
      userId,
      page,
      limit
    );
  }

  /**
   * ============================================================
   * Get Unread Notifications
   * ============================================================
   */
  async getUnreadNotifications(userId) {
    return await notificationRepository.getUnreadNotifications(userId);
  }

  /**
   * ============================================================
   * Unread Count
   * ============================================================
   */
  async getUnreadCount(userId) {
    const count = await notificationRepository.countUnread(userId);

    return {
      unreadCount: count,
    };
  }

  /**
   * ============================================================
   * Mark One Read
   * ============================================================
   */
  async markAsRead(notificationId) {
    return await notificationRepository.markAsRead(notificationId);
  }

  /**
   * ============================================================
   * Mark All Read
   * ============================================================
   */
  async markAllAsRead(userId) {
    return await notificationRepository.markAllAsRead(userId);
  }

  /**
   * ============================================================
   * Delete One
   * ============================================================
   */
  async deleteNotification(notificationId) {
    return await notificationRepository.delete(notificationId);
  }

  /**
   * ============================================================
   * Delete All
   * ============================================================
   */
  async clearNotifications(userId) {
    return await notificationRepository.deleteAll(userId);
  }

  /**
   * ============================================================
   * Helper Methods
   * ============================================================
   */

  async notifySubscription({ recipient, sender }) {
    return await this.createNotification({
      recipient,
      sender,
      type: "subscribe",
      title: "New Subscriber",
      message: "started following your channel.",
    });
  }

  async notifyLike({ recipient, sender, video }) {
    return await this.createNotification({
      recipient,
      sender,
      video,
      type: "like",
      title: "New Like",
      message: "liked your video.",
    });
  }

  async notifyComment({ recipient, sender, video, comment }) {
    return await this.createNotification({
      recipient,
      sender,
      video,
      comment,
      type: "comment",
      title: "New Comment",
      message: "commented on your video.",
    });
  }

  async notifyReply({ recipient, sender, video, comment }) {
    return await this.createNotification({
      recipient,
      sender,
      video,
      comment,
      type: "reply",
      title: "New Reply",
      message: "replied to your comment.",
    });
  }

  async notifyPlaylist({ recipient, sender, playlist }) {
    return await this.createNotification({
      recipient,
      sender,
      playlist,
      type: "playlist",
      title: "Playlist Update",
      message: "added your video to a playlist.",
    });
  }
}

export default new NotificationService();
