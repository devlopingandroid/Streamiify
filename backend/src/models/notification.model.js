import mongoose, { Schema } from "mongoose";

/**
 * Notification Model
 *
 * Supports:
 * - New Subscriber
 * - New Like
 * - New Comment
 * - Reply
 * - Mention
 * - Video Published
 * - Playlist
 * - System Notifications
 */

export const NOTIFICATION_TYPES = Object.freeze({
  SUBSCRIBE: "subscribe",
  LIKE: "like",
  COMMENT: "comment",
  REPLY: "reply",
  MENTION: "mention",
  VIDEO: "video",
  PLAYLIST: "playlist",
  SYSTEM: "system",
});

const notificationSchema = new Schema(
  {
    // Receiver
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Sender (system notifications don't need this)
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Notification Type
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },

    // Message shown to user
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Optional references

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      default: null,
    },

    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    playlist: {
      type: Schema.Types.ObjectId,
      ref: "Playlist",
      default: null,
    },

    subscription: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    // Redirect link

    actionUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // Extra metadata

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// -------------------- Virtual --------------------

notificationSchema.virtual("isUnread").get(function () {
  return !this.isRead;
});

// -------------------- Indexes --------------------

notificationSchema.index({
  recipient: 1,
  isRead: 1,
  createdAt: -1,
});

notificationSchema.index({
  recipient: 1,
  createdAt: -1,
});

notificationSchema.index({
  sender: 1,
});

notificationSchema.index({
  type: 1,
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
