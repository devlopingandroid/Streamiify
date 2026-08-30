import { Router } from "express";
import mongoose from "mongoose";
import { isRedisReady } from "../config/redis.js";

const router = Router();

// Liveness Probe
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy 🚀",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness Probe
router.get("/ready", (req, res) => {
  const isDbReady = mongoose.connection.readyState === 1;
  const isCacheReady = isRedisReady();

  const isReady = isDbReady; // Process is ready if database connection is active

  return res.status(isReady ? 200 : 503).json({
    success: isReady,
    status: isReady ? "READY" : "NOT_READY",
    dependencies: {
      mongodb: isDbReady ? "connected" : "disconnected",
      redis: isCacheReady ? "connected" : "disabled",
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
