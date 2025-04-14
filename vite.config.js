import path from "path";
import { defineConfig } from "vitest/config";

const __dirname = path.resolve();

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests.js",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
