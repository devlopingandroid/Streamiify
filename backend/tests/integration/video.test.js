import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser, createVideo } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import Video from "../../src/models/video.model.js";

describe("Integration — Video API", () => {
  it("1. GET /videos returns paginated published videos", async () => {
    const user = await createUser();
    await createVideo(user._id, { title: "Video 1" });
    await createVideo(user._id, { title: "Video 2" });

    const res = await request(app).get("/videos?page=1&limit=10");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.docs).toBeDefined();
    expect(res.body.data.docs.length).toBeGreaterThanOrEqual(2);
  });

  it("2. GET /videos enforces pagination limit ceiling (returns 422 if limit > 50)", async () => {
    const res = await request(app).get("/videos?limit=99999");

    expect(res.status).toBe(422); // express-validator rejects limit > 50
    expect(res.body.success).toBe(false);
  });

  it("3. GET /videos/:videoId returns single published video", async () => {
    const user = await createUser();
    const video = await createVideo(user._id);

    const res = await request(app).get(`/videos/${video._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id).toBe(video._id.toString());
  });

  it("4. GET /videos/:videoId with invalid ObjectId returns HTTP 422 Unprocessable Entity", async () => {
    const res = await request(app).get("/videos/invalid_object_id_123");

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("5. DELETE /videos/:videoId by owner deletes video document from database", async () => {
    const owner = await createUser();
    const video = await createVideo(owner._id);
    const headers = getAuthHeaders(owner);

    const res = await request(app).delete(`/videos/${video._id}`).set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const dbVideo = await Video.findById(video._id);
    expect(dbVideo).toBeNull(); // Cleanly deleted from DB!
  });

  it("6. PATCH /videos/:videoId/toggle-publish by owner toggles publish status", async () => {
    const owner = await createUser();
    const video = await createVideo(owner._id, { status: "published" });
    const headers = getAuthHeaders(owner);

    const res = await request(app)
      .patch(`/videos/${video._id}/toggle-publish`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("private");

    const dbVideo = await Video.findById(video._id);
    expect(dbVideo.status).toBe("private");
  });
});
