import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser, createVideo } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import Like from "../../src/models/like.model.js";

describe("Integration — Like API", () => {
  it("1. Authenticated user can like a video (creates Like document in DB)", async () => {
    const user = await createUser();
    const video = await createVideo(user._id);
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .post(`/likes/video/${video._id}`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.liked).toBe(true);

    // Database verification: Like document exists in DB
    const dbLike = await Like.findOne({ likedBy: user._id, video: video._id });
    expect(dbLike).not.toBeNull();
  });

  it("2. Toggling like a second time removes the Like document from DB (Unlike)", async () => {
    const user = await createUser();
    const video = await createVideo(user._id);
    const headers = getAuthHeaders(user);

    // Toggle 1: Like
    await request(app).post(`/likes/video/${video._id}`).set(headers);
    let dbLike = await Like.findOne({ likedBy: user._id, video: video._id });
    expect(dbLike).not.toBeNull();

    // Toggle 2: Unlike
    const res = await request(app)
      .post(`/likes/video/${video._id}`)
      .set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data.liked).toBe(false);

    // Database verification: Like document is removed from DB
    dbLike = await Like.findOne({ likedBy: user._id, video: video._id });
    expect(dbLike).toBeNull();
  });

  it("3. Unauthenticated like attempt is rejected with 401 Unauthorized", async () => {
    const user = await createUser();
    const video = await createVideo(user._id);

    const res = await request(app).post(`/likes/video/${video._id}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
