import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterEach, afterAll } from "vitest";

// Safe test environment fallbacks for test execution
process.env.NODE_ENV = process.env.NODE_ENV || "test";
process.env.PORT = process.env.PORT || "8000";
process.env.MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/streamify_test";
process.env.ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "test_access_token_secret_123456789_test";
process.env.ACCESS_TOKEN_EXPIRE = process.env.ACCESS_TOKEN_EXPIRE || "1d";
process.env.REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  "test_refresh_token_secret_123456789_test";
process.env.REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || "7d";
process.env.CLOUDINARY_CLOUD_NAME =
  process.env.CLOUDINARY_CLOUD_NAME || "test-cloud";
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "test-key";
process.env.CLOUDINARY_API_SECRET =
  process.env.CLOUDINARY_API_SECRET || "test-secret";
process.env.REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
process.env.ENABLE_REDIS = process.env.ENABLE_REDIS || "false";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
process.env.MAX_VIDEO_SIZE = process.env.MAX_VIDEO_SIZE || "1073741824";
process.env.RESEND_API_KEY =
  process.env.RESEND_API_KEY || "re_test_dummy_key_12345";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
process.env.EMAIL_FROM =
  process.env.EMAIL_FROM || "Streamify <onboarding@resend.dev>";

let mongod;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.ENABLE_REDIS = "false";
  process.env.ACCESS_TOKEN_SECRET = "test_access_token_secret_123456789_test";
  process.env.REFRESH_TOKEN_SECRET = "test_refresh_token_secret_123456789_test";
  process.env.ACCESS_TOKEN_EXPIRE = "1d";
  process.env.REFRESH_TOKEN_EXPIRE = "7d";
  process.env.ACCESS_TOKEN_EXPIRY = "1d";
  process.env.REFRESH_TOKEN_EXPIRY = "7d";
  process.env.CORS_ORIGIN = "*";

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
});

afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
});
