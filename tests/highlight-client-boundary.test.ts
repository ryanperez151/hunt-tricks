import { expect, test } from "vitest";

test("rejects importing the build-time highlighter from a client test environment", async () => {
  await expect(import("@/lib/highlight")).rejects.toThrow(/client component/i);
});
