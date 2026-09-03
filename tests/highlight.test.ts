// @vitest-environment node
import { describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { HIGHLIGHT_LANGUAGES, highlightQuery } from "@/lib/highlight";

describe("highlightQuery", () => {
  test("maps each supported query platform to its fixed Shiki grammar", () => {
    expect(HIGHLIGHT_LANGUAGES).toEqual({
      splunk: "splunk",
      kql: "kusto",
      zeek: "log",
      pseudocode: "text",
    });
  });

  test("highlights trusted local query text at build time", async () => {
    const html = await highlightQuery("source.device_type = network_infrastructure", "pseudocode");

    expect(html).toContain("shiki");
    expect(html).toContain("source");
  });
});
