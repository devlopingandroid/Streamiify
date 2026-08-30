import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";

describe("Integration — Security & Input Validation Boundaries", () => {
  it("1. Mongo operator injection payload {$ne: null} in login body does not bypass auth and returns validation error", async () => {
    const res = await request(app)
      .post("/users/login")
      .send({
        email: { $ne: null },
        password: { $ne: null },
      });

    expect([400, 422]).toContain(res.status); // Rejected cleanly with validation error
    expect(res.body.success).toBe(false);
  });

  it("2. Malformed MongoDB ObjectId parameter is rejected with 422 Unprocessable Entity", async () => {
    const user = await createUser();
    const headers = getAuthHeaders(user);

    const res = await request(app)
      .get("/videos/malformed_object_id_9999")
      .set(headers);

    expect(res.status).toBe(422); // express-validator throws 422
    expect(res.body.success).toBe(false);
  });

  it("3. Unauthenticated requests to protected endpoints return 401 Unauthorized", async () => {
    const res = await request(app).get("/users/current-user");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
