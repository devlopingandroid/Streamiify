import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser, createVideo } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import WatchSession from "../../src/models/watchSession.model.js";

describe("Integration — Analytics API", () => {
  it("1. Creator Overview returns zero-state metrics for new creator", async () => {
    const creator = await createUser();
    const headers = getAuthHeaders(creator);

    const res = await request(app).get("/analytics/overview").set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalVideos).toBe(0);
    expect(res.body.data.totalViews).toBe(0);
    expect(res.body.data.totalSubscribers).toBe(0);
  });

  it("2. Watch-Time Analytics computes metrics scoped strictly to creator's videos", async () => {
    const creatorA = await createUser();
    const creatorB = await createUser();

    const videoA1 = await createVideo(creatorA._id, { duration: 120 });
    const videoA2 = await createVideo(creatorA._id, { duration: 300 });
    const videoB = await createVideo(creatorB._id, { duration: 200 });

    const viewer = await createUser();

    // Create watch sessions for Creator A's videos
    await WatchSession.create({
      user: viewer._id,
      video: videoA1._id,
      progress: 120,
      duration: 120,
      completed: true,
      lastWatchedAt: new Date(),
    });

    await WatchSession.create({
      user: viewer._id,
      video: videoA2._id,
      progress: 150,
      duration: 300,
      completed: false,
      lastWatchedAt: new Date(),
    });

    // Create session for Creator B's video (should NOT count in Creator A's analytics)
    await WatchSession.create({
      user: viewer._id,
      video: videoB._id,
      progress: 200,
      duration: 200,
      completed: true,
      lastWatchedAt: new Date(),
    });

    const headersA = getAuthHeaders(creatorA);

    const res = await request(app).get("/analytics/watch-time").set(headersA);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalWatchTime).toBe(270); // 120 + 150
    expect(res.body.data.totalSessions).toBe(2);
    expect(res.body.data.completedViews).toBe(1);
    expect(res.body.data.incompleteViews).toBe(1);
    expect(res.body.data.completionRate).toBe(50);
  });

  it("3. Top Videos endpoint returns creator's videos sorted by views", async () => {
    const creator = await createUser();

    const v1 = await createVideo(creator._id, { title: "Video 1", views: 50 });
    const v2 = await createVideo(creator._id, { title: "Video 2", views: 500 });
    const v3 = await createVideo(creator._id, { title: "Video 3", views: 200 });

    const headers = getAuthHeaders(creator);

    const res = await request(app)
      .get("/analytics/top-videos?limit=2")
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0]._id.toString()).toBe(v2._id.toString());
    expect(res.body.data[1]._id.toString()).toBe(v3._id.toString());
  });

  it("4. Analytics overview returns cached data on second invocation (Cache HIT)", async () => {
    const creator = await createUser();
    const headers = getAuthHeaders(creator);

    // Call 1 — Cache MISS -> Populates Cache
    const res1 = await request(app).get("/analytics/overview").set(headers);
    expect(res1.status).toBe(200);

    // Call 2 — Cache HIT
    const res2 = await request(app).get("/analytics/overview").set(headers);
    expect(res2.status).toBe(200);
    expect(res2.body.data).toEqual(res1.body.data);
  });
});
