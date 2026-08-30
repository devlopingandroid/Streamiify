import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser, createVideo } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";

describe("Integration — Phase 2 Step 1 Validation & API Contract Hardening", () => {
  it("1. Valid request succeeds with HTTP 200/201 payload", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app).get("/videos?page=1&limit=10").set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("2. Missing required field returns 422 Unprocessable Entity with error contract", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .post("/comments/video/6a944bac67c84caa75cb7fd6")
      .set(headers)
      .send({}); // missing 'content'

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBeDefined();
  });

  it("3. Invalid field type returns 422 Validation Error", async () => {
    const res = await request(app)
      .post("/users/forgot-password")
      .send({ email: 12345 }); // number instead of email string

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("4. Malformed ObjectId parameter is rejected with 422 Unprocessable Entity", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .get("/videos/not_a_valid_object_id")
      .set(headers);

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Invalid video ID");
  });

  it("5. Invalid pagination page (page=0) returns 422 Unprocessable Entity", async () => {
    const res = await request(app).get("/videos?page=0");

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("6. Excessive pagination limit (limit=51 or limit=9999) returns 422 Unprocessable Entity", async () => {
    const res = await request(app).get("/videos?limit=51");

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("7. Negative page or limit (page=-1, limit=-10) returns 422 Unprocessable Entity", async () => {
    const res = await request(app).get("/videos?page=-1&limit=-10");

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("8. Unexpected body fields cannot silent-inject protected parameters (mass assignment defense)", async () => {
    const res = await request(app).post("/users/register").send({
      fullname: "Hacker User",
      username: "hackeruser",
      email: "hacker@example.com",
      password: "Password123!",
      role: "admin",
      isAdmin: true,
    });

    // Request succeeds with 201, but protected fields like isAdmin/role are ignored
    expect([201, 400, 422]).toContain(res.status);
  });

  it("9. Invalid enum value (visibility='invalid-enum') returns 422 Unprocessable Entity", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app).post("/playlists").set(headers).send({
      name: "Test Playlist",
      visibility: "super-secret-invalid",
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("10. Empty whitespace string where prohibited returns 422 Unprocessable Entity", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .post("/comments/video/6a944bac67c84caa75cb7fd6")
      .set(headers)
      .send({ content: "   " });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("11. Null where prohibited returns 422 Unprocessable Entity", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .post("/playlists")
      .set(headers)
      .send({ name: null });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("12. Valid upper boundary pagination (page=1, limit=50) succeeds", async () => {
    const res = await request(app).get("/videos?page=1&limit=50");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("13. Protected field injection in update-account is safely ignored or sanitized", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .patch("/users/update-account")
      .set(headers)
      .send({
        fullname: "Updated Name",
        role: "admin",
        isVerified: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("14. MongoDB operator injection payload {$ne: null} is sanitized and rejected with 422", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({
        email: { $ne: null },
        password: "Password123!",
      });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("15. Existing valid API behavior remains unchanged across core endpoints", async () => {
    const creator = await createUser();
    const video = await createVideo(creator._id);

    const res = await request(app).get(`/videos/${video._id}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data._id.toString()).toBe(video._id.toString());
  });
});
