import mongoose, { Schema } from "mongoose";

/**
 * WatchLater Model
 *
 * One document = One saved video by one user.
 *
 * Compound unique index prevents duplicate saves.
 *
 * owner -> User who saved the video.
 * video -> Saved Video.
 */

const watchLaterSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Prevent duplicate watch later entries.
 */
watchLaterSchema.index(
  {
    owner: 1,
    video: 1,
  },
  {
    unique: true,
  }
);

/**
 * Faster retrieval of user's Watch Later list.
 */
watchLaterSchema.index({
  owner: 1,
  createdAt: -1,
});

const WatchLater = mongoose.model("WatchLater", watchLaterSchema);

export default WatchLater;
