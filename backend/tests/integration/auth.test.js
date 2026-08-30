import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser } from "../helpers/factories.js";
import { getAuthHeaders } from "../helpers/auth.js";
import User from "../../src/models/user.model.js";

describe("Integration — Authentication API", () => {
  // ── Registration ─────────────────────────────────────────────────────────
  describe("POST /users/register", () => {
    it("1. Valid registration creates user in DB and returns 201 Created", async () => {
      const res = await request(app)
        .post("/users/register")
        .field("username", "newuser123")
        .field("email", "newuser123@example.com")
        .field("password", "Password123!")
        .field("fullname", "New User 123")
        .attach("avatar", Buffer.from("fake-avatar-content"), "avatar.jpg");

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.username).toBe("newuser123");
      expect(res.body.data.user.email).toBe("newuser123@example.com");
      expect(res.body.data.user.password).toBeUndefined(); // Password must be excluded!

      // Database verification
      const dbUser = await User.findOne({ username: "newuser123" });
      expect(dbUser).not.toBeNull();
      expect(dbUser.email).toBe("newuser123@example.com");
    });

    it("2. Duplicate registration (same username/email) is rejected with 409 Conflict", async () => {
      await createUser({
        username: "existinguser",
        email: "existing@example.com",
      });

      const res = await request(app)
        .post("/users/register")
        .field("username", "existinguser")
        .field("email", "different@example.com")
        .field("password", "Password123!")
        .field("fullname", "Existing User")
        .attach("avatar", Buffer.from("fake-avatar-content"), "avatar.jpg");

      expect(res.status).toBe(409); // Conflict
      expect(res.body.success).toBe(false);
    });

    it("3. Missing required fields are rejected with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/users/register")
        .field("username", "")
        .field("email", "invalid-email")
        .field("password", "123"); // Too short

      expect(res.status).toBe(400); // Validation error
      expect(res.body.success).toBe(false);
    });
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  describe("POST /users/login", () => {
    it("4. Valid credentials return HTTP 200 OK with access and refresh tokens", async () => {
      const password = "SecretPassword123!";
      const user = await createUser({ password });

      const res = await request(app).post("/users/login").send({
        email: user.email,
        password: password,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(user.email);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.headers["set-cookie"]).toBeDefined(); // HTTP-only cookie set
    });

    it("5. Invalid password returns HTTP 401 Unauthorized", async () => {
      const user = await createUser({ password: "CorrectPassword123!" });

      const res = await request(app).post("/users/login").send({
        email: user.email,
        password: "WrongPassword123!",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("6. Unknown user email returns HTTP 404 Not Found", async () => {
      const res = await request(app).post("/users/login").send({
        email: "nonexistent_user_999@example.com",
        password: "SomePassword123!",
      });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ── Protected Routes & JWT Verification ──────────────────────────────────
  describe("Protected Routes JWT Verification", () => {
    it("7. Request without token returns HTTP 401 Unauthorized", async () => {
      const res = await request(app).get("/users/current-user");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("8. Invalid/malformed JWT token returns HTTP 401 Unauthorized", async () => {
      const res = await request(app)
        .get("/users/current-user")
        .set("Authorization", "Bearer invalid_jwt_token_payload_xyz");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("9. Authenticated request with valid JWT returns current user profile", async () => {
      const user = await createUser();
      const headers = getAuthHeaders(user);

      const res = await request(app).get("/users/current-user").set(headers);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(user._id.toString());
      expect(res.body.data.password).toBeUndefined();
    });
  });
});
