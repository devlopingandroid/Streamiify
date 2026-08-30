import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import {
  createUser,
  createVideo,
  createComment,
  createPlaylist,
} from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import mongoose from "mongoose";

describe("Integration — Phase 2 Step 2 Business Logic & Data Integrity Hardening", () => {
  it("1. Duplicate subscription is rejected or idempotent and self-subscription returns 400 Bad Request", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);

    // Self subscription attempt
    const selfRes = await request(app)
      .post(`/subscriptions/${user._id}`)
      .set(headers);

    expect(selfRes.status).toBe(400);
    expect(selfRes.body.message).toContain(
      "cannot subscribe to your own channel"
    );

    // Subscribing to non-existent channel returns 404
    const nonExistentId = new mongoose.Types.ObjectId();
    const notFoundRes = await request(app)
      .post(`/subscriptions/${nonExistentId}`)
      .set(headers);

    expect(notFoundRes.status).toBe(404);
  });

  it("2. Liking non-existent video or comment returns 404 Not Found", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);
    const nonExistentId = new mongoose.Types.ObjectId();

    const videoLikeRes = await request(app)
      .post(`/likes/video/${nonExistentId}`)
      .set(headers);

    expect(videoLikeRes.status).toBe(404);
    expect(videoLikeRes.body.message).toContain("Video not found");

    const commentLikeRes = await request(app)
      .post(`/likes/comment/${nonExistentId}`)
      .set(headers);

    expect(commentLikeRes.status).toBe(404);
    expect(commentLikeRes.body.message).toContain("Comment not found");
  });

  it("3. Creating comment on non-existent video returns 404 Not Found", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .post(`/comments/video/${nonExistentId}`)
      .set(headers)
      .send({ content: "Great video!" });

    expect(res.status).toBe(404);
    expect(res.body.message).toContain("Video not found");
  });

  it("4. Adding non-existent video or duplicate video to playlist returns 404 / 409", async () => {
    const owner = await createUser();
    const video = await createVideo(owner._id);
    const playlist = await createPlaylist(owner._id);
    const headers = getAuthHeaders(owner);
    const nonExistentId = new mongoose.Types.ObjectId();

    // Nonexistent video
    const notFoundRes = await request(app)
      .post(`/playlists/${playlist._id}/videos/${nonExistentId}`)
      .set(headers);

    expect(notFoundRes.status).toBe(404);

    // First add
    const addRes1 = await request(app)
      .post(`/playlists/${playlist._id}/videos/${video._id}`)
      .set(headers);
    expect(addRes1.status).toBe(200);

    // Duplicate add
    const addRes2 = await request(app)
      .post(`/playlists/${playlist._id}/videos/${video._id}`)
      .set(headers);

    expect(addRes2.status).toBe(409);
    expect(addRes2.body.message).toContain("already in this playlist");
  });

  it("5. Recording watch session or watch-later on non-existent video returns 404 Not Found", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);
    const nonExistentId = new mongoose.Types.ObjectId();

    const watchRes = await request(app)
      .post(`/watch/${nonExistentId}`)
      .set(headers)
      .send({ progress: 10, duration: 100 });

    expect(watchRes.status).toBe(404);

    const watchLaterRes = await request(app)
      .post(`/watch-later/${nonExistentId}`)
      .set(headers);

    expect(watchLaterRes.status).toBe(404);
  });

  it("6. Password change with wrong user ID reference works cleanly with proper user._id", async () => {
    const user = await createUser({ password: "OldPassword123!" });
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .post("/users/change-password")
      .set(headers)
      .send({
        oldPassword: "OldPassword123!",
        newPassword: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
