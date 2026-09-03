import { describe, expect, test } from "vitest";
import { buildSearchIndex, searchGuide } from "@/lib/search";

describe("guide search", () => {
  test("indexes hunts, protocols, methodology, research, and aggregated queries", () => {
    const entries = buildSearchIndex();

    expect(entries.map((entry) => entry.type)).toEqual(expect.arrayContaining([
      "HUNT", "PROTOCOL", "METHODOLOGY", "RESEARCH", "QUERY",
    ]));
    expect(entries.find((entry) => entry.title === "SNMP Fan-Out")).toMatchObject({
      type: "HUNT",
      href: "/hunts/snmp-fan-out/",
      tags: expect.arrayContaining(["SNMP"]),
    });
    expect(entries.find((entry) => entry.type === "QUERY" && entry.title === "Managed-device SNMP fan-out")).toBeDefined();
    expect(Object.isFrozen(entries)).toBe(true);
  });

  test("returns curated defaults for an empty query", () => {
    const results = searchGuide("");

    expect(results.map((result) => result.title)).toEqual([
      "Unexpected Management Interface Egress",
      "SNMP Fan-Out",
      "SNMP",
      "Require Independent Observation",
      "Countering Chinese State-Sponsored Actors Compromise of Networks Worldwide to Feed Global Espionage System",
    ]);
  });

  test("labels and ranks SNMP content with a stable bounded result set", () => {
    const first = searchGuide("SNMP");
    const second = searchGuide("SNMP");

    expect(first.length).toBeLessThanOrEqual(12);
    expect(first[0]?.type).toMatch(/HUNT|PROTOCOL/);
    expect(first.some((result) => result.title === "SNMP Fan-Out" && result.type === "HUNT")).toBe(true);
    expect(first.some((result) => result.type === "PROTOCOL")).toBe(true);
    expect(first).toEqual(second);
  });
});
