import { spawnSync } from "node:child_process";
import path from "node:path";
import { describe, expect, test } from "vitest";
import packageJson from "@/package.json";

const projectRoot = path.resolve(import.meta.dirname, "..");

describe("production build content gate", () => {
  test("runs the content validation command before the Next build", () => {
    expect(packageJson.scripts["validate:content"]).toBe("vitest run tests/content-production-validation.test.ts --environment node");
    expect(packageJson.scripts.build).toBe("npm run validate:content && next build");
  });

  test("loads and validates the production registries without running Next build", () => {
    const result = spawnSync(process.execPath, [
      "node_modules/vitest/vitest.mjs",
      "run",
      "tests/content-production-validation.test.ts",
      "--environment",
      "node",
    ], {
      cwd: projectRoot,
      encoding: "utf8",
      timeout: 15_000,
    });

    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toMatch(/Tests\s+1 passed \(1\)/);
  }, 20_000);
});
