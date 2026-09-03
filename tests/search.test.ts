import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { buildSearchIndex } from "@/lib/search-index";
import { searchGuide } from "@/lib/search";

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
    const results = searchGuide("", buildSearchIndex());

    expect(results.map((result) => result.title)).toEqual([
      "Unexpected Management Interface Egress",
      "SNMP Fan-Out",
      "SNMP",
      "Require Independent Observation",
      "Countering Chinese State-Sponsored Actors Compromise of Networks Worldwide to Feed Global Espionage System",
    ]);
  });

  test("labels and ranks SNMP content with a stable bounded result set", () => {
    const entries = buildSearchIndex();
    const first = searchGuide("SNMP", entries);
    const second = searchGuide("SNMP", entries);

    expect(first.length).toBeLessThanOrEqual(12);
    expect(first[0]?.type).toMatch(/HUNT|PROTOCOL/);
    expect(first.some((result) => result.title === "SNMP Fan-Out" && result.type === "HUNT")).toBe(true);
    expect(first.some((result) => result.type === "PROTOCOL")).toBe(true);
    expect(first).toEqual(second);
  });

  test("projects protocol flow details into the normalized search body", () => {
    const entry = buildSearchIndex().find((item) => item.id === "protocol:snmp");

    expect(entry?.body).toContain("Expected SNMP flow");
    expect(entry?.body).toContain("Network management system");
    expect(entry?.body).toContain("Polls UDP/161");
    expect(entry?.body).toContain("The router originates UDP/161 queries to several unexpected peers, reversing its normal role and creating fan-out.");
  });

  test("indexes research identifiers and source URLs without empty tags", () => {
    const entries = buildSearchIndex();
    const research = entries.find((item) => item.id === "research-cisa-aa25-239a");
    const results = searchGuide("AA25-239A", entries);

    expect(research?.tags).not.toContain("");
    expect(research?.body).toContain("https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a");
    expect(results).toContainEqual(expect.objectContaining({ id: "research-cisa-aa25-239a" }));
  });

  test("keeps the Fuse-only client module free of content registry imports", () => {
    const source = readFileSync("lib/search.ts", "utf8");

    expect(source).not.toMatch(/@\/lib\/content|@\/data\/|@\/lib\/schemas|buildSearchIndex/);
  });
});
