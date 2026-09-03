import { describe, expect, test } from "vitest";
import { hunts } from "@/data/hunts";
import { getHuntBySlug } from "@/lib/content";
import { HuntSchema } from "@/lib/schemas";

const requiredTitles = [
  "Unexpected Management Interface Egress",
  "New Infrastructure External Destination",
  "Infrastructure Beaconing",
  "Suspicious Infrastructure DNS",
  "Alternate DNS Resolver",
  "Unexpected SSH Egress",
  "Firewall-to-Router SSH",
  "Router-to-Router SSH",
  "Device-to-Device HTTPS Administration",
  "SNMP Fan-Out",
  "SNMP From Unexpected Initiator",
  "New AAA Destination",
  "Unexpected LDAP From Infrastructure",
  "Packet Capture Started",
  "Packet Capture Followed by File Transfer",
  "Unexpected GRE Tunnel",
  "New IPsec Tunnel",
  "Logging Destination Modified",
  "Infrastructure Telemetry Gap",
  "Management ACL Modified",
];

const flagshipSlugs = [
  "unexpected-management-interface-egress",
  "infrastructure-beaconing",
  "firewall-to-router-ssh",
  "snmp-fan-out",
  "unexpected-gre-tunnel",
] as const;

const suppliedUnexpectedInfrastructureEgressQuery = `index=network
| lookup network_assets ip AS src_ip
    OUTPUT asset_type AS src_type
| where src_type IN (
    "firewall",
    "router",
    "switch",
    "vpn_gateway",
    "load_balancer"
)
| lookup approved_infrastructure_dependencies
    src_ip
    dest_ip
    OUTPUT approved
| where isnull(approved)
| stats
    count
    sum(bytes_out) AS bytes_out
    sum(bytes_in) AS bytes_in
    values(dest_port) AS dest_ports
    earliest(_time) AS first_seen
    latest(_time) AS last_seen
    by src_ip dest_ip
| sort count`;

describe("launch hunt registry", () => {
  test("ships exactly the required launch hunts", () => {
    expect(hunts).toHaveLength(20);
    expect(hunts.map((hunt) => hunt.title)).toEqual(requiredTitles);
    expect(hunts.map((hunt) => HuntSchema.parse(hunt))).toHaveLength(20);
  });

  test.each(flagshipSlugs)("gives flagship hunt %s full operational depth", (slug) => {
    const hunt = getHuntBySlug(slug)!;
    expect(hunt).toBeDefined();
    expect(hunt.queries.length).toBeGreaterThanOrEqual(2);
    expect(hunt.investigationSteps.length).toBeGreaterThanOrEqual(8);
    expect(hunt.escalationConditions.length).toBeGreaterThanOrEqual(4);
    expect(hunt.behaviorComparison).toBeDefined();
    expect(hunt.rationale.length).toBeGreaterThan(180);
  });

  test("preserves the supplied Unexpected Infrastructure Egress Splunk query verbatim", () => {
    const hunt = getHuntBySlug("unexpected-management-interface-egress")!;
    const query = hunt.queries.find((item) => item.platform === "splunk");
    expect(query?.query).toBe(suppliedUnexpectedInfrastructureEgressQuery);
  });

  test("keeps every non-flagship hunt operationally actionable", () => {
    const nonFlagships = hunts.filter((hunt) => !flagshipSlugs.includes(hunt.slug as (typeof flagshipSlugs)[number]));

    for (const hunt of nonFlagships) {
      expect(hunt.hypothesis.length, `${hunt.slug} hypothesis`).toBeGreaterThan(45);
      expect(hunt.rationale.length, `${hunt.slug} rationale`).toBeGreaterThan(100);
      expect(hunt.detectionStrategy.length, `${hunt.slug} detection strategy`).toBeGreaterThan(70);
      expect(hunt.investigationSteps.length, `${hunt.slug} investigation steps`).toBeGreaterThanOrEqual(4);
      expect(hunt.escalationConditions.length, `${hunt.slug} escalation conditions`).toBeGreaterThanOrEqual(2);
      expect(hunt.falsePositives.length, `${hunt.slug} false positives`).toBeGreaterThan(0);
      expect(hunt.enrichment.length, `${hunt.slug} enrichment`).toBeGreaterThan(0);
      expect(hunt.queries.length, `${hunt.slug} queries`).toBeGreaterThan(0);
      expect(hunt.queries.every((query) => query.query.length > 30), `${hunt.slug} meaningful query`).toBe(true);
      expect(hunt.telemetry.recommended.length, `${hunt.slug} recommended telemetry`).toBeGreaterThan(0);
      expect(hunt.techniques.length, `${hunt.slug} techniques`).toBeGreaterThan(0);
      expect(hunt.devices.length, `${hunt.slug} devices`).toBeGreaterThan(0);
      expect(hunt.protocols.length, `${hunt.slug} protocols`).toBeGreaterThan(0);
      expect(hunt.planes.length, `${hunt.slug} planes`).toBeGreaterThan(0);
      expect(hunt.references.length, `${hunt.slug} references`).toBeGreaterThan(0);
      expect(hunt.relatedHunts.length, `${hunt.slug} related hunts`).toBeGreaterThan(0);
    }
  });
});
