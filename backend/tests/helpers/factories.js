import User from "../../src/models/user.model.js";
import Video from "../../src/models/video.model.js";
import Comment from "../../src/models/comment.model.js";
import Playlist from "../../src/models/playlist.model.js";
import Subscription from "../../src/models/subscription.model.js";
import Like from "../../src/models/like.model.js";
import mongoose from "mongoose";

/**
 * Creates a test user document in the in-memory MongoDB database.
 */
export const createUser = async (overrides = {}) => {
  const randomSuffix = Math.floor(Math.random() * 100000);
  const userData = {
    username: `user_${randomSuffix}`,
    email: `user_${randomSuffix}@example.com`,
    password: "Password123!",
    fullname: `Test User ${randomSuffix}`,
    avatar: "http://res.cloudinary.com/demo/image/upload/avatar.jpg",
    coverImage: "http://res.cloudinary.com/demo/image/upload/cover.jpg",
    ...overrides,
  };

  const user = await User.create(userData);
  return user;
};

/**
 * Creates a test video document in the in-memory MongoDB database.
 */
export const createVideo = async (ownerId, overrides = {}) => {
  const randomSuffix = Math.floor(Math.random() * 100000);
  const videoData = {
    title: `Test Video ${randomSuffix}`,
    description: `Test Description ${randomSuffix}`,
    videoFile: "http://res.cloudinary.com/demo/video/upload/sample.mp4",
    thumbnail: "http://res.cloudinary.com/demo/image/upload/thumb.jpg",
    duration: 120,
    status: "published",
    owner: new mongoose.Types.ObjectId(ownerId),
    videoFilePublicId: `video_public_${randomSuffix}`,
    thumbnailPublicId: `thumb_public_${randomSuffix}`,
    views: 0,
    category: "General",
    tags: ["test", "video"],
    slug: `test-video-${randomSuffix}`,
    ...overrides,
  };

  const video = await Video.create(videoData);
  return video;
};

/**
 * Creates a test comment document in the in-memory MongoDB database.
 */
export const createComment = async (ownerId, videoId, overrides = {}) => {
  const commentData = {
    content: "This is a test comment",
    owner: new mongoose.Types.ObjectId(ownerId),
    video: new mongoose.Types.ObjectId(videoId),
    parentComment: null,
    ...overrides,
  };

  const comment = await Comment.create(commentData);
  return comment;
};

/**
 * Creates a test playlist document in the in-memory MongoDB database.
 */
export const createPlaylist = async (ownerId, overrides = {}) => {
  const randomSuffix = Math.floor(Math.random() * 100000);
  const playlistData = {
    name: `Test Playlist ${randomSuffix}`,
    description: `Test Description ${randomSuffix}`,
    owner: new mongoose.Types.ObjectId(ownerId),
    videos: [],
    visibility: "public",
    ...overrides,
  };

  const playlist = await Playlist.create(playlistData);
  return playlist;
};
