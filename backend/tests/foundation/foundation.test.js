import { describe, it, expect } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../src/app.js";
import User from "../../src/models/user.model.js";

describe("Step 4A — Automated Testing Foundation", () => {
  // TEST A: Test Runner
  it("TEST A — Test Runner: Vitest executes assertions successfully", () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  // TEST B: Express App Import
  it("TEST B — Express App: Imports Express app cleanly without HTTP listener", () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe("function");
  });

  // TEST C: Health Endpoint Integration
  it("TEST C — Health Endpoint: GET /health returns HTTP 200 OK and health JSON payload", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("success", true);
    expect(res.body).toHaveProperty("message", "Server is healthy 🚀");
    expect(res.body).toHaveProperty("uptime");
    expect(res.body).toHaveProperty("timestamp");
  });

  // TEST D: Test Database Connection
  it("TEST D — Test Database: Mongoose is connected to in-memory MongoDB", () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = Connected
    expect(mongoose.connection.host).toContain("127.0.0.1");
  });

  // TEST E1: Test Data Creation
  it("TEST E1 — Test Isolation: Creates test document in memory database", async () => {
    const user = await User.create({
      username: "testuser_isolation",
      email: "test_isolation@example.com",
      password: "Password123!",
      fullname: "Test Isolation User",
    });

    expect(user._id).toBeDefined();
    expect(user.username).toBe("testuser_isolation");

    const count = await User.countDocuments();
    expect(count).toBe(1);
  });

  // TEST E2: Test Isolation Cleanup
  it("TEST E2 — Test Isolation: Database is automatically cleaned between tests", async () => {
    const count = await User.countDocuments();
    expect(count).toBe(0); // Proves afterEach cleaned the database!
  });
});
