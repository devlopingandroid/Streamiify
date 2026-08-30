import commentRepository from "../repositories/comment.repository.js";
import ApiError from "../utils/ApiError.js";
import notificationService from "./notification.service.js";
import videoRepository from "../repositories/video.repository.js";
import logger from "../utils/logger.js";
import { deleteCache } from "./cache.service.js";
import { CACHE_KEYS } from "../constants/cacheKeys.js";

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
      if (video.owner) {
        await deleteCache(CACHE_KEYS.ANALYTICS(video.owner));
      }
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
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const { comments, total } = await commentRepository.getVideoComments(
      videoId,
      safePage,
      safeLimit
    );

    return {
      comments,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
      hasNextPage: safePage * safeLimit < total,
      hasPrevPage: safePage > 1,
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

    const video = await videoRepository.findById(comment.video);
    if (video?.owner) {
      await deleteCache(CACHE_KEYS.ANALYTICS(video.owner));
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
