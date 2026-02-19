import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react"
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname)
    }
  },
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    environmentMatchGlobs: [
      ["tests/unit/lib/auth.test.ts", "node"],
      ["tests/unit/lib/slug.test.ts", "node"],
      ["tests/unit/lib/spotify.test.ts", "node"],
      ["tests/unit/lib/post-preview.test.ts", "node"]
    ],
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage"
    }
  }
});
