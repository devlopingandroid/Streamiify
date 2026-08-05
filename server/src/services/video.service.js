import ApiError from "../utils/ApiError.js";
import videoRepository from "../repositories/video.repository.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";
import { deleteCache } from "./cache.service.js";
import { CACHE_KEYS } from "../constants/cacheKeys.js";
import logger from "../utils/logger.js";
class VideoService {
  /**
   * Publish a new video
   */
  async publishVideo(data, files, user) {
    const { title, description = "" } = data;

    if (!title?.trim()) {
      throw new ApiError(400, "Video title is required");
    }

    if (!files?.videoFile?.[0]) {
      throw new ApiError(400, "Video file is required");
    }

    if (!files?.thumbnail?.[0]) {
      throw new ApiError(400, "Thumbnail is required");
    }

    const videoPath = files.videoFile[0].path;
    const thumbnailPath = files.thumbnail[0].path;

    // Upload both files in parallel
    const [videoUpload, thumbnailUpload] = await Promise.all([
      uploadOnCloudinary(videoPath, "video", "streamify/videos"),
      uploadOnCloudinary(thumbnailPath, "image", "streamify/thumbnails"),
    ]);

    if (!videoUpload || !thumbnailUpload) {
      throw new ApiError(500, "Cloudinary upload failed");
    }

    try {
      const createdVideo = await videoRepository.create({
        title,
        description,
        owner: user._id,

        videoFile: videoUpload.secure_url,
        thumbnail: thumbnailUpload.secure_url,

        videoFilePublicId: videoUpload.public_id,
        thumbnailPublicId: thumbnailUpload.public_id,

        duration: videoUpload.duration || 0,

        views: 0,
        status: "published",
      });
      await deleteCache(CACHE_KEYS.ANALYTICS(user._id));
      logger.info(
        `Analytics Cache Deleted → ${CACHE_KEYS.ANALYTICS(user._id)}`
      );

      return createdVideo;
    } catch (error) {
      // Rollback uploaded files
      await Promise.all([
        deleteFromCloudinary(videoUpload.public_id, "video"),
        deleteFromCloudinary(thumbnailUpload.public_id, "image"),
      ]);

      throw new ApiError(500, "Unable to publish video");
    }
  }

  /**
   * Get single video
   */
  async getVideoById(videoId) {
    const video = await videoRepository.findByIdWithOwner(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    videoRepository.incrementViews(videoId).catch(console.error);

    return video;
  }
  /**
   * Get all published videos or search videos by title, description, or channel name
   */
  async getAllVideos(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      q,
      query: searchParam = "",
      sortBy = "createdAt",
      sortType = "desc",
      userId,
    } = queryParams;

    const searchQuery = (q !== undefined ? q : searchParam).trim();

    const initialMatch = {
      status: "published",
    };

    if (userId) {
      initialMatch.owner = videoRepository.toObjectId(userId);
    }

    const pipeline = [
      {
        $match: initialMatch,
      },

      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                fullname: 1,
                username: 1,
                avatar: 1,
              },
            },
          ],
        },
      },

      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },
    ];

    if (searchQuery) {
      const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = { $regex: escaped, $options: "i" };

      pipeline.push({
        $match: {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { "owner.username": searchRegex },
            { "owner.fullname": searchRegex },
          ],
        },
      });

      pipeline.push({
        $addFields: {
          relevanceScore: {
            $add: [
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$title", ""] },
                      regex: escaped,
                      options: "i",
                    },
                  },
                  3,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$owner.username", ""] },
                      regex: escaped,
                      options: "i",
                    },
                  },
                  2,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$owner.fullname", ""] },
                      regex: escaped,
                      options: "i",
                    },
                  },
                  2,
                  0,
                ],
              },
              {
                $cond: [
                  {
                    $regexMatch: {
                      input: { $ifNull: ["$description", ""] },
                      regex: escaped,
                      options: "i",
                    },
                  },
                  1,
                  0,
                ],
              },
            ],
          },
        },
      });

      pipeline.push({
        $sort: {
          relevanceScore: -1,
          createdAt: -1,
        },
      });
    } else {
      pipeline.push({
        $sort: {
          [sortBy]: sortType === "asc" ? 1 : -1,
        },
      });
    }

    return await videoRepository.getFeed(pipeline, {
      page: Number(page),
      limit: Number(limit),
    });
  }

  /**
   * Update Video
   */
  async updateVideo(videoId, data, files, user) {
    const video = await videoRepository.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== user._id.toString()) {
      throw new ApiError(403, "You are not allowed to update this video.");
    }

    const updateData = {};

    if (data.title) {
      updateData.title = data.title;
    }

    if (data.description) {
      updateData.description = data.description;
    }

    if (files?.thumbnail?.[0]) {
      const thumbnailUpload = await uploadOnCloudinary(
        files.thumbnail[0].path,
        "image",
        "streamify/thumbnails"
      );

      if (!thumbnailUpload) {
        throw new ApiError(500, "Thumbnail upload failed");
      }

      deleteFromCloudinary(video.thumbnailPublicId, "image").catch((err) =>
        logger.error(err)
      );

      updateData.thumbnail = thumbnailUpload.secure_url;
      updateData.thumbnailPublicId = thumbnailUpload.public_id;
    }

    return await videoRepository.update(videoId, updateData);
  }

  /**
   * Delete Video
   */
  async deleteVideo(videoId, user) {
    const video = await videoRepository.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== user._id.toString()) {
      throw new ApiError(403, "You are not allowed to delete this video.");
    }

    await Promise.all([
      deleteFromCloudinary(video.videoFilePublicId, "video"),
      deleteFromCloudinary(video.thumbnailPublicId, "image"),
    ]);

    await videoRepository.delete(videoId);

    return true;
  }

  /**
   * Toggle Publish Status
   */
  async togglePublishStatus(videoId, user) {
    const video = await videoRepository.findById(videoId);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== user._id.toString()) {
      throw new ApiError(403, "You are not allowed to perform this action.");
    }

    return await videoRepository.togglePublish(video);
  }
}

export default new VideoService();
