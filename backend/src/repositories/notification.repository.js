import Notification from "../models/notification.model.js";

class NotificationRepository {
  /**
   * Create Notification
   */
  async create(payload) {
    return await Notification.create(payload);
  }

  /**
   * Find by id
   */
  async findById(notificationId) {
    return await Notification.findById(notificationId)
      .populate("sender", "fullname username avatar")
      .populate("video", "title thumbnail")
      .populate("comment", "content")
      .populate("playlist", "name");
  }

  /**
   * Get notifications of a user
   */
  async getUserNotifications(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({
      recipient: userId,
    })
      .populate("sender", "fullname username avatar")
      .populate("video", "title thumbnail")
      .populate("playlist", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({
      recipient: userId,
    });

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(userId) {
    return await Notification.find({
      recipient: userId,
      isRead: false,
    })
      .populate("sender", "fullname username avatar")
      .populate("video", "title thumbnail")
      .sort({ createdAt: -1 });
  }

  /**
   * Count unread notifications
   */
  async countUnread(userId) {
    return await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
  }

  /**
   * Mark one notification as read
   */
  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      {
        isRead: true,
        readAt: new Date(),
      },
      { new: true }
    );
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    return await Notification.updateMany(
      {
        recipient: userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );
  }

  /**
   * Delete notification
   */
  async delete(notificationId) {
    return await Notification.findByIdAndDelete(notificationId);
  }

  /**
   * Delete all notifications of a user
   */
  async deleteAll(userId) {
    return await Notification.deleteMany({
      recipient: userId,
    });
  }
}

export default new NotificationRepository();
