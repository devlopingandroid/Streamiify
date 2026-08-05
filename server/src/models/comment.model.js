import mongoose, { Schema } from "mongoose";

/**
 * Comment Model
 *
 * Supports:
 * • Video comments
 * • Nested replies
 * • Owner authorization
 * • Dashboard analytics
 * • Like module integration
 */

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },

    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },

    replyCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ============================================================================
   DATABASE INDEXES
============================================================================ */

// Root comments of a video (Latest First)
commentSchema.index({
  video: 1,
  parentComment: 1,
  createdAt: -1,
});

// Replies (Oldest First)
commentSchema.index({
  parentComment: 1,
  createdAt: 1,
});

// User comments
commentSchema.index({
  owner: 1,
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
