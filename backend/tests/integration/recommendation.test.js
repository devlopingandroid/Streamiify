import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser, createVideo } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import Subscription from "../../src/models/subscription.model.js";
import Like from "../../src/models/like.model.js";

describe("Integration — Recommendation API", () => {
  it("1. Cold-start user receives fallback feed (trending & latest published videos)", async () => {
    const creator = await createUser();
    await createVideo(creator._id, { title: "Cold Start Video", views: 100 });

    const newUser = await createUser();
    const headers = getAuthHeaders(newUser);

    const res = await request(app).get("/recommendations/home").set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results).toBeDefined();
    expect(res.body.data.results.length).toBeGreaterThanOrEqual(1);
  });

  it("2. Home feed excludes user's own videos from candidate recommendations", async () => {
    const user = await createUser();
    const ownVideo = await createVideo(user._id, {
      title: "User Own Video",
      category: "Gaming",
    });

    const otherCreator = await createUser();
    const likedVideo = await createVideo(otherCreator._id, {
      title: "Liked Gaming Video",
      category: "Gaming",
    });
    const candidateVideo = await createVideo(otherCreator._id, {
      title: "Candidate Gaming Video",
      category: "Gaming",
    });

    // Give user an interest signal so isColdStart is false
    await Like.create({ likedBy: user._id, video: likedVideo._id });

    const headers = getAuthHeaders(user);

    const res = await request(app).get("/recommendations/home").set(headers);

    expect(res.status).toBe(200);
    const videoIds = res.body.data.results.map((v) => v._id.toString());
    expect(videoIds).not.toContain(ownVideo._id.toString());
  });

  it("3. GET /recommendations/trending returns videos sorted by trending score", async () => {
    const creator = await createUser();
    await createVideo(creator._id, { title: "Low Views", views: 10 });
    await createVideo(creator._id, { title: "High Views", views: 50000 });

    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .get("/recommendations/trending")
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results.length).toBeGreaterThanOrEqual(2);
  });

  it("4. GET /recommendations/similar/:videoId returns candidates matching tags/category", async () => {
    const creator = await createUser();
    const refVideo = await createVideo(creator._id, {
      title: "Reference Video",
      category: "Tech",
      tags: ["javascript", "coding"],
    });

    await createVideo(creator._id, {
      title: "Similar Tech Video",
      category: "Tech",
      tags: ["javascript"],
    });

    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .get(`/recommendations/similar/${refVideo._id}`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results).toBeDefined();
  });

  it("5. GET /recommendations/subscriptions returns published videos from subscribed channels", async () => {
    const subscriber = await createUser();
    const channel = await createUser();

    await Subscription.create({
      subscriber: subscriber._id,
      channel: channel._id,
    });

    const channelVideo = await createVideo(channel._id, {
      title: "Subscribed Channel Video",
    });

    const headers = getAuthHeaders(subscriber);

    const res = await request(app)
      .get("/recommendations/subscriptions")
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.results.length).toBe(1);
    expect(res.body.data.results[0]._id.toString()).toBe(
      channelVideo._id.toString()
    );
  });
});
