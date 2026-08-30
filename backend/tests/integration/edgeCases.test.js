import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";

describe("Integration — Edge Cases & Failure Paths", () => {
  it("1. GET /route-that-does-not-exist returns 404 Not Found with JSON error format", async () => {
    const res = await request(app).get("/route-that-does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain(
      "Route /route-that-does-not-exist not found"
    );
  });

  it("2. GET /videos with excessive pagination limit (limit=9999) returns 422 Unprocessable Entity", async () => {
    const res = await request(app).get("/videos?limit=9999");

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("3. GET /videos/:videoId with malformed ObjectId returns 422 Unprocessable Entity", async () => {
    const res = await request(app).get("/videos/not_a_valid_object_id");

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it("4. POST /users/register with missing required fields returns 400 Bad Request", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({ email: "incomplete@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("5. Protected route returns 401 Unauthorized when Authorization header and cookies are absent", async () => {
    const res = await request(app).get("/users/current-user");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
