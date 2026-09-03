import { describe, expect, test } from "vitest";
import { HuntSchema } from "@/lib/schemas";
import { makeHunt } from "./test-utils";

describe("HuntSchema", () => {
  test("accepts a complete hunt", () => {
    expect(HuntSchema.parse(makeHunt()).slug).toBe("test-hunt");
  });

  test.each([
    ["hypothesis", ""],
    ["investigationSteps", []],
    ["references", [{ title: "bad", url: "javascript:alert(1)" }]],
  ])("rejects invalid %s", (key, value) => {
    expect(() => HuntSchema.parse({ ...makeHunt(), [key]: value })).toThrow();
  });
});
