import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser, createVideo } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import WatchLater from "../../src/models/watchLater.model.js";
import WatchSession from "../../src/models/watchSession.model.js";

describe("Integration — Watch & Watch Later API", () => {
  // ── Watch Later ──────────────────────────────────────────────────────────
  describe("Watch Later", () => {
    it("1. Toggle Watch Later saves video to Watch Later list in DB", async () => {
      const user = await createUser();
      const video = await createVideo(user._id);
      const headers = getAuthHeaders(user);

      const res = await request(app)
        .post(`/watch-later/${video._id}`)
        .set(headers);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Database verification
      const dbSaved = await WatchLater.findOne({
        owner: user._id,
        video: video._id,
      });
      expect(dbSaved).not.toBeNull();
    });

    it("2. GET /watch-later fetches saved watch later videos", async () => {
      const user = await createUser();
      const video = await createVideo(user._id);
      await WatchLater.create({ owner: user._id, video: video._id });
      const headers = getAuthHeaders(user);

      const res = await request(app).get("/watch-later").set(headers);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toBeDefined();
    });
  });

  // ── Watch History & Progress Sessions ─────────────────────────────────────
  describe("Watch History & Progress Sessions", () => {
    it("3. Recording watch session updates watch progress in DB", async () => {
      const user = await createUser();
      const video = await createVideo(user._id);
      const headers = getAuthHeaders(user);

      const res = await request(app)
        .post(`/watch/${video._id}`)
        .set(headers)
        .send({
          progress: 45,
          duration: 120,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Database verification
      const dbSession = await WatchSession.findOne({
        user: user._id,
        video: video._id,
      });
      expect(dbSession).not.toBeNull();
      expect(dbSession.progress).toBe(45);
    });

    it("4. GET /watch/history retrieves user's watch history", async () => {
      const user = await createUser();
      const video = await createVideo(user._id);
      await WatchSession.create({
        user: user._id,
        video: video._id,
        progress: 60,
        duration: 120,
        completed: false,
      });
      const headers = getAuthHeaders(user);

      const res = await request(app).get("/watch/history").set(headers);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessions).toBeDefined();
    });

    it("5. DELETE /watch/history clears user's watch history from DB", async () => {
      const user = await createUser();
      const video = await createVideo(user._id);
      await WatchSession.create({
        user: user._id,
        video: video._id,
        progress: 60,
        duration: 120,
      });
      const headers = getAuthHeaders(user);

      const res = await request(app).delete("/watch/history").set(headers);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const remainingSessions = await WatchSession.countDocuments({
        user: user._id,
      });
      expect(remainingSessions).toBe(0); // Wiped from DB!
    });
  });
});
