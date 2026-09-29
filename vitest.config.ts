import path from "node:path";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    exclude: [
      ...configDefaults.exclude, "tests/e2e/**",
      ".worktrees/**", ".claude/**", ".superpowers/**", ".task10-verify/**", ".publication-verify/**",
    ],
    setupFiles: ["./tests/setup.ts"],
  },
});
