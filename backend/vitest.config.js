import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["tests/setup/db.setup.js"],
    testTimeout: 30000,
    hookTimeout: 30000,
    threads: false, // Run sequentially for DB stability
    singleThread: true,
  },
});
