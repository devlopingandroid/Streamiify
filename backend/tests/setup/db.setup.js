import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterEach, afterAll } from "vitest";

let mongod;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.ENABLE_REDIS = "false";
  process.env.ACCESS_TOKEN_SECRET = "test_access_token_secret_123456789_test";
  process.env.REFRESH_TOKEN_SECRET = "test_refresh_token_secret_123456789_test";
  process.env.ACCESS_TOKEN_EXPIRY = "1d";
  process.env.REFRESH_TOKEN_EXPIRY = "10d";
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
