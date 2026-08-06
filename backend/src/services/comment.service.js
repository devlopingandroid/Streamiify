import commentRepository from "../repositories/comment.repository.js";
import ApiError from "../utils/ApiError.js";
import notificationService from "./notification.service.js";
import videoRepository from "../repositories/video.repository.js";
import logger from "../utils/logger.js";
class CommentService {
  /**
   * ------------------------------------------------------------------------
   * Create Comment
   * ------------------------------------------------------------------------
   */
  async createComment(userId, videoId, content) {
    if (!content?.trim()) {
      throw new ApiError(400, "Comment content is required");
    }

    const comment = await commentRepository.create({
      owner: userId,
      video: videoId,
      content: content.trim(),
    });

    const video = await videoRepository.findById(videoId);

    if (video) {
      try {
        await notificationService.notifyComment({
          recipient: video.owner,
          sender: userId,
          video: videoId,
          comment: comment._id,
        });
      } catch (error) {
        logger.error("Comment notification failed:", error);
      }
    }

    return comment;
  }

  /**
   * ------------------------------------------------------------------------
   * Create Reply
   * ------------------------------------------------------------------------
   */
  async createReply(userId, parentCommentId, content) {
    if (!content?.trim()) {
      throw new ApiError(400, "Reply content is required");
    }

    const parentComment = await commentRepository.findById(parentCommentId);

    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }

    const reply = await commentRepository.create({
      owner: userId,
      video: parentComment.video,
      parentComment: parentComment._id,
      content: content.trim(),
    });

    await commentRepository.incrementReplyCount(parentCommentId);

    if (parentComment.owner) {
      try {
        await notificationService.notifyReply({
          recipient: parentComment.owner,
          sender: userId,
          video: parentComment.video,
          comment: reply._id,
        });
      } catch (error) {
        logger.error("Reply notification failed:", error);
      }
    }

    return reply;
  }

  /**
   * ------------------------------------------------------------------------
   * Get Video Comments
   * ------------------------------------------------------------------------
   */
  async getVideoComments(videoId, page = 1, limit = 10) {
    const { comments, total } = await commentRepository.getVideoComments(
      videoId,
      page,
      limit
    );

    return {
      comments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    };
  }

  /**
   * ------------------------------------------------------------------------
   * Get Replies
   * ------------------------------------------------------------------------
   */
  async getReplies(parentCommentId) {
    const parent = await commentRepository.findById(parentCommentId);

    if (!parent) {
      throw new ApiError(404, "Comment not found");
    }

    return await commentRepository.getReplies(parentCommentId);
  }

  /**
   * ------------------------------------------------------------------------
   * Update Comment
   * ------------------------------------------------------------------------
   */
  async updateComment(userId, commentId, content) {
    if (!content?.trim()) {
      throw new ApiError(400, "Comment content is required");
    }

    const comment = await commentRepository.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not allowed to update this comment.");
    }

    return await commentRepository.update(commentId, {
      content: content.trim(),
      isEdited: true,
    });
  }

  /**
   * ------------------------------------------------------------------------
   * Delete Comment
   * ------------------------------------------------------------------------
   */
  async deleteComment(userId, commentId) {
    const comment = await commentRepository.findById(commentId);

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not allowed to delete this comment.");
    }

    if (comment.parentComment) {
      await commentRepository.decrementReplyCount(comment.parentComment);
    } else {
      await commentRepository.deleteReplies(comment._id);
    }

    await commentRepository.delete(commentId);

    return {
      deleted: true,
    };
  }

  /**
   * ------------------------------------------------------------------------
   * Comment Count
   * ------------------------------------------------------------------------
   */
  async getCommentCount(videoId) {
    const total = await commentRepository.getCommentCount(videoId);

    return {
      totalComments: total,
    };
  }
}

export default new CommentService();
