import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

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
  base: "./",
  build: {
    rollupOptions: {
      input: {
        original: "./index.html",
        basic: "./index.basic.html",
        advanced: "./index.advanced.html",
      },
    },
  },
  plugins: [react(), tsconfigPaths()],
});
