import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String,
      required: [true, "Video file is required"],
    },

    thumbnail: {
      type: String,
      required: [true, "Thumbnail is required"],
    },

    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
      default: "",
    },

    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [0, "Duration cannot be negative"],
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["processing", "published", "private"],
      default: "processing",
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    videoFilePublicId: {
      type: String,
      required: true,
    },

    thumbnailPublicId: {
      type: String,
      required: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      trim: true,
      default: "General",
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ============================================================================
   DATABASE INDEXES
============================================================================ */

// Channel videos (Owner Profile)
videoSchema.index({
  owner: 1,
  createdAt: -1,
});

// Latest Published Videos (Home Feed)
videoSchema.index({
  status: 1,
  createdAt: -1,
});

// Trending Videos
videoSchema.index({
  status: 1,
  views: -1,
});

// Full Text Search
videoSchema.index({
  title: "text",
  description: "text",
});

videoSchema.plugin(mongooseAggregatePaginate);

const Video = mongoose.model("Video", videoSchema);

export default Video;
