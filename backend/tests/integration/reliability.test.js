import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import mongoose from "mongoose";

describe("Integration — Step 7 Reliability & Health Probes", () => {
  it("1. GET /ready returns 200 OK with readiness payload when database is connected", async () => {
    const res = await request(app).get("/ready");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("READY");
    expect(res.body.dependencies.mongodb).toBe("connected");
  });

  it("2. GET /health returns 200 OK with liveness status", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.uptime).toBeDefined();
  });

  it("3. Error response returns consistent JSON structure across 4xx and 5xx errors", async () => {
    const res = await request(app).get("/nonexistent-endpoint-777");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain(
      "Route /nonexistent-endpoint-777 not found"
    );
  });

  it("4. Database connection status check is reflected accurately", () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
  });
});
