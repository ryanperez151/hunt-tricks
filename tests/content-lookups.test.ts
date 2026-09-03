import { describe, expect, test } from "vitest";
import {
  attackPaths,
  getHuntBySlug,
  getHuntsByFamily,
  getProtocolBySlug,
  getRelatedHunts,
  hunts,
  protocols,
  researchEntries,
  telemetrySources,
} from "@/lib/content";

describe("validated content lookups", () => {
  test("resolves related hunts without broken references", () => {
    const related = getRelatedHunts(getHuntBySlug("snmp-fan-out")!);
    expect(related.length).toBeGreaterThan(0);
    expect(related.every(Boolean)).toBe(true);
  });

  test("returns undefined for unknown slugs", () => {
    expect(getHuntBySlug("not-real")).toBeUndefined();
    expect(getProtocolBySlug("not-real")).toBeUndefined();
  });

  test("returns hunts by family in launch order", () => {
    expect(getHuntsByFamily("infrastructure-lateral-movement").map((hunt) => hunt.slug)).toEqual([
      "firewall-to-router-ssh",
      "router-to-router-ssh",
      "device-to-device-https-administration",
      "snmp-fan-out",
      "snmp-from-unexpected-initiator",
    ]);
    expect(getHuntsByFamily("not-real")).toEqual([]);
  });

  test("populates protocol and research links exclusively with real hunts", () => {
    const huntSlugs = new Set(hunts.map((hunt) => hunt.slug));
    expect(protocols.every((protocol) => protocol.relatedHunts.length > 0)).toBe(true);
    expect(researchEntries.every((research) => research.relatedHunts.length > 0)).toBe(true);
    expect([...protocols, ...researchEntries].every((record) => (
      record.relatedHunts.every((slug) => huntSlugs.has(slug))
    ))).toBe(true);
  });

  test("exports immutable validated registries and records", () => {
    for (const registry of [hunts, protocols, telemetrySources, researchEntries, attackPaths]) {
      expect(Object.isFrozen(registry)).toBe(true);
      expect(registry.every((record) => Object.isFrozen(record))).toBe(true);
    }
  });
});
