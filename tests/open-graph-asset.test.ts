import { describe, expect, test } from "vitest";
import { GET } from "@/app/opengraph-image.png/route";

describe("Open Graph image asset", () => {
  test("responds as a PNG from a filename-qualified route", () => {
    const response = GET();

    expect(response.headers.get("content-type")).toBe("image/png");
  });
});
