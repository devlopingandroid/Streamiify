import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { createUser } from "../helpers/factories.js";
import User from "../../src/models/user.model.js";
import crypto from "crypto";

describe("Integration — Email / Password Reset Workflow", () => {
  it("1. POST /users/forgot-password with valid email sets reset token and returns 200 OK", async () => {
    const user = await createUser({ email: "forgotpass@example.com" });

    const res = await request(app)
      .post("/users/forgot-password")
      .send({ email: "forgotpass@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Database verification: token is hashed and stored with expiry
    const dbUser = await User.findById(user._id);
    expect(dbUser.resetPasswordToken).toBeDefined();
    expect(dbUser.resetPasswordExpire).toBeDefined();
    expect(new Date(dbUser.resetPasswordExpire).getTime()).toBeGreaterThan(
      Date.now()
    );
  });

  it("2. POST /users/forgot-password with unknown email returns 404 Not Found", async () => {
    const res = await request(app)
      .post("/users/forgot-password")
      .send({ email: "nonexistent@example.com" });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("3. POST /users/reset-password/:token updates password, invalidates token, and allows login with new password", async () => {
    const rawToken = "my_reset_token_12345";
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const user = await createUser({
      email: "resettest@example.com",
      password: "OldPassword123!",
    });

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins valid
    await user.save({ validateBeforeSave: false });

    // Execute password reset
    const res = await request(app)
      .post(`/users/reset-password/${rawToken}`)
      .send({
        password: "NewPassword123!",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify token is cleared in DB
    const dbUser = await User.findById(user._id);
    expect(dbUser.resetPasswordToken).toBeFalsy();
    expect(dbUser.resetPasswordExpire).toBeFalsy();

    // Verify old password fails
    const oldLoginRes = await request(app)
      .post("/users/login")
      .send({ email: "resettest@example.com", password: "OldPassword123!" });
    expect(oldLoginRes.status).toBe(401);

    // Verify new password succeeds
    const newLoginRes = await request(app)
      .post("/users/login")
      .send({ email: "resettest@example.com", password: "NewPassword123!" });
    expect(newLoginRes.status).toBe(200);
  });

  it("4. POST /users/reset-password/:token with expired token is rejected with 400 Bad Request", async () => {
    const rawToken = "expired_reset_token_999";
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const user = await createUser({
      email: "expiredreset@example.com",
      password: "Password123!",
    });

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() - 1000); // Expired 1 second ago!
    await user.save({ validateBeforeSave: false });

    const res = await request(app)
      .post(`/users/reset-password/${rawToken}`)
      .send({
        password: "NewPassword123!",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
