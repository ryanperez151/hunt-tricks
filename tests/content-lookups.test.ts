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

  test("populates supported protocol and research links exclusively with real hunts", () => {
    const huntSlugs = new Set(hunts.map((hunt) => hunt.slug));
    expect(protocols.filter((protocol) => protocol.relatedHunts.length === 0).map((protocol) => protocol.slug)).toEqual(["bgp", "ospf", "vxlan"]);
    expect(researchEntries.some((research) => research.relatedHunts.length > 0)).toBe(true);
    expect([...protocols, ...researchEntries].every((record) => (
      record.relatedHunts.every((slug) => huntSlugs.has(slug))
    ))).toBe(true);
  });

  test("curates protocol links to hunts that directly observe the protocol", () => {
    expect(getProtocolBySlug("netconf")?.relatedHunts).toEqual(["management-acl-modified"]);
    expect(getProtocolBySlug("vxlan")?.relatedHunts).toEqual([]);
    expect(getProtocolBySlug("ntp")?.relatedHunts).toEqual(["new-infrastructure-external-destination"]);
    expect(getProtocolBySlug("bgp")?.relatedHunts).toEqual([]);
    expect(getProtocolBySlug("ospf")?.relatedHunts).toEqual([]);
    expect(getProtocolBySlug("wireguard")?.relatedHunts).toEqual(["infrastructure-beaconing"]);
    expect(getProtocolBySlug("openvpn")?.relatedHunts).toEqual(["infrastructure-beaconing"]);
  });

  test("curates research links to behaviors stated by each source record", () => {
    const linksByResearchId = Object.fromEntries(researchEntries.map((entry) => [entry.id, entry.relatedHunts]));
    expect(linksByResearchId).toMatchObject({
      "research-cisa-aa25-239a": ["unexpected-management-interface-egress", "firewall-to-router-ssh", "router-to-router-ssh", "device-to-device-https-administration"],
      "research-cisco-talos-arcanedoor": ["packet-capture-started", "packet-capture-followed-by-file-transfer"],
      "research-mandiant-ghost-in-router": ["router-to-router-ssh", "infrastructure-telemetry-gap"],
      "research-mandiant-cloaked-and-covert": ["firewall-to-router-ssh", "router-to-router-ssh", "unexpected-ssh-egress"],
      "research-ncsc-uk-edge-router-advisory": ["snmp-from-unexpected-initiator", "unexpected-gre-tunnel", "management-acl-modified"],
      "research-microsoft-soho-dns-hijacking": ["alternate-dns-resolver"],
      "research-cisa-aa24-038a": ["unexpected-management-interface-egress", "firewall-to-router-ssh", "router-to-router-ssh"],
    });
  });

  test("exports immutable validated registries and records", () => {
    for (const registry of [hunts, protocols, telemetrySources, researchEntries, attackPaths]) {
      expect(Object.isFrozen(registry)).toBe(true);
      expect(registry.every((record) => Object.isFrozen(record))).toBe(true);
    }
  });
});
