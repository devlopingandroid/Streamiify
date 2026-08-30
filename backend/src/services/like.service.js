import ApiError from "../utils/ApiError.js";
import likeRepository from "../repositories/like.repository.js";
import notificationService from "./notification.service.js";
import videoRepository from "../repositories/video.repository.js";
import commentRepository from "../repositories/comment.repository.js";
import { deleteCache } from "./cache.service.js";
import { CACHE_KEYS } from "../constants/cacheKeys.js";

class LikeService {
  /**
   * ------------------------------------------------------------------------
   * Toggle Video Like
   * ------------------------------------------------------------------------
   */
  async toggleVideoLike(userId, videoId) {
    if (!likeRepository.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    const video = await videoRepository.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    const existingLike = await likeRepository.findVideoLike(userId, videoId);

    let liked;

    if (existingLike) {
      await likeRepository.delete(existingLike._id);

      liked = false;
    } else {
      await likeRepository.create({
        likedBy: userId,
        video: videoId,
      });

      if (video.owner.toString() !== userId.toString()) {
        await notificationService.notifyLike({
          recipient: video.owner,
          sender: userId,
          video: videoId,
        });
      }

      liked = true;
    }

    if (video.owner) {
      await deleteCache(CACHE_KEYS.ANALYTICS(video.owner));
    }

    const totalLikes = await likeRepository.countVideoLikes(videoId);

    return {
      liked,
      totalLikes,
    };
  }

  /**
   * ------------------------------------------------------------------------
   * Toggle Comment Like
   * ------------------------------------------------------------------------
   */
  async toggleCommentLike(userId, commentId) {
    if (!likeRepository.isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await commentRepository.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    const existingLike = await likeRepository.findCommentLike(
      userId,
      commentId
    );

    let liked;

    if (existingLike) {
      await likeRepository.delete(existingLike._id);

      liked = false;
    } else {
      await likeRepository.create({
        likedBy: userId,
        comment: commentId,
      });

      if (comment.owner.toString() !== userId.toString()) {
        await notificationService.notifyLike({
          recipient: comment.owner,
          sender: userId,
          video: comment.video,
        });
      }

      liked = true;
    }

    const totalLikes = await likeRepository.countCommentLikes(commentId);

    return {
      liked,
      totalLikes,
    };
  }

  /**
   * ------------------------------------------------------------------------
   * Video Like Details
   * ------------------------------------------------------------------------
   */
  async getVideoLikes(userId, videoId) {
    const [totalLikes, likedByCurrentUser] = await Promise.all([
      likeRepository.countVideoLikes(videoId),

      likeRepository.hasLikedVideo(userId, videoId),
    ]);

    return {
      totalLikes,

      likedByCurrentUser: Boolean(likedByCurrentUser),
    };
  }

  /**
   * ------------------------------------------------------------------------
   * Comment Like Details
   * ------------------------------------------------------------------------
   */
  async getCommentLikes(userId, commentId) {
    const [totalLikes, likedByCurrentUser] = await Promise.all([
      likeRepository.countCommentLikes(commentId),

      likeRepository.hasLikedComment(userId, commentId),
    ]);

    return {
      totalLikes,

      likedByCurrentUser: Boolean(likedByCurrentUser),
    };
  }

  /**
   * ------------------------------------------------------------------------
   * User Liked Videos
   * ------------------------------------------------------------------------
   */
  async getLikedVideos(userId, page = 1, limit = 10) {
    const safePage = Math.max(Number(page) || 1, 1);
    const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const { likes, total } = await likeRepository.getLikedVideos(
      userId,
      safePage,
      safeLimit
    );

    return {
      likes,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1,
      hasNextPage: safePage * safeLimit < total,
      hasPrevPage: safePage > 1,
    };
  }
}

export default new LikeService();
