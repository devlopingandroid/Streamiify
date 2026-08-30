import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import Subscription from "../../src/models/subscription.model.js";

describe("Integration — Subscription API", () => {
  it("1. Authenticated user can subscribe to a channel (creates Subscription in DB)", async () => {
    const subscriber = await createUser();
    const channel = await createUser();
    const headers = getAuthHeaders(subscriber);

    const res = await request(app)
      .post(`/subscriptions/${channel._id}`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subscribed).toBe(true);

    // Database state verification
    const dbSub = await Subscription.findOne({
      subscriber: subscriber._id,
      channel: channel._id,
    });
    expect(dbSub).not.toBeNull();
  });

  it("2. Toggling subscription a second time unsubscribes channel (removes Subscription from DB)", async () => {
    const subscriber = await createUser();
    const channel = await createUser();
    const headers = getAuthHeaders(subscriber);

    // Subscribe
    await request(app).post(`/subscriptions/${channel._id}`).set(headers);
    let dbSub = await Subscription.findOne({
      subscriber: subscriber._id,
      channel: channel._id,
    });
    expect(dbSub).not.toBeNull();

    // Unsubscribe
    const res = await request(app)
      .post(`/subscriptions/${channel._id}`)
      .set(headers);
    expect(res.status).toBe(200);
    expect(res.body.data.subscribed).toBe(false);

    dbSub = await Subscription.findOne({
      subscriber: subscriber._id,
      channel: channel._id,
    });
    expect(dbSub).toBeNull(); // Cleanly removed from DB!
  });

  it("3. Database unique compound index prevents duplicate subscription documents", async () => {
    const subscriber = await createUser();
    const channel = await createUser();

    // Create initial subscription directly in DB
    await Subscription.create({
      subscriber: subscriber._id,
      channel: channel._id,
    });

    // Attempt to insert duplicate document directly via Mongoose model
    let duplicateError = null;
    try {
      await Subscription.create({
        subscriber: subscriber._id,
        channel: channel._id,
      });
    } catch (err) {
      duplicateError = err;
    }

    expect(duplicateError).not.toBeNull();
    expect(duplicateError.code).toBe(11000); // MongoDB duplicate key error code E11000!
  });
});
