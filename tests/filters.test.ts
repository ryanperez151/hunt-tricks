import { describe, expect, test } from "vitest";
import { hunts } from "@/lib/content";
import {
  emptyHuntFilters,
  filterHunts,
  parseHuntFilters,
  serializeHuntFilters,
} from "@/lib/filters";

describe("hunt filters", () => {
  test("combines categories with AND and values within a category with OR", () => {
    const results = filterHunts(hunts, {
      families: ["management-plane-c2", "traffic-manipulation"],
      protocols: ["DNS", "GRE"],
      devices: [],
      planes: [],
      severities: [],
      telemetry: [],
    });

    expect(results.map((hunt) => hunt.slug)).toEqual(expect.arrayContaining([
      "suspicious-infrastructure-dns",
      "unexpected-gre-tunnel",
    ]));
    expect(results.every((hunt) => hunt.protocols.includes("DNS") || hunt.protocols.includes("GRE"))).toBe(true);
    expect(results.every((hunt) => (
      hunt.family === "management-plane-c2" || hunt.family === "traffic-manipulation"
    ))).toBe(true);
  });

  test("normalizes known URL values, drops unknown values, and serializes in canonical order", () => {
    const filters = parseHuntFilters(new URLSearchParams(
      "unrelated=leave-out&protocol=not-real&protocol=SNMP&protocol=DNS&protocol=SNMP&severity=critical&severity=high&family=traffic-manipulation&telemetry=bogus",
    ));

    expect(filters).toEqual({
      families: ["traffic-manipulation"],
      protocols: ["SNMP", "DNS"],
      devices: [],
      planes: [],
      severities: ["high", "critical"],
      telemetry: [],
    });
    expect(serializeHuntFilters(filters).toString()).toBe(
      "family=traffic-manipulation&protocol=SNMP&protocol=DNS&severity=high&severity=critical",
    );
  });

  test("round-trips filter state through URLSearchParams", () => {
    const filters = parseHuntFilters(new URLSearchParams("protocol=SNMP&severity=high&severity=critical"));

    expect(parseHuntFilters(serializeHuntFilters(filters))).toEqual(filters);
  });

  test("matches optional telemetry and leaves its immutable inputs unchanged", () => {
    const filters = parseHuntFilters(new URLSearchParams("telemetry=packet-capture"));

    expect(filterHunts(hunts, filters).map((hunt) => hunt.slug)).toContain("infrastructure-beaconing");
    expect(filters).toEqual({ ...emptyHuntFilters, telemetry: ["packet-capture"] });
    expect(Object.isFrozen(hunts)).toBe(true);
  });
});
