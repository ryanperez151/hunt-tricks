import { describe, expect, test } from "vitest";
import { HuntSchema, ResearchSchema } from "@/lib/schemas";
import {
  CONFIDENCE_LEVELS,
  DEVICES,
  HUNT_FAMILIES,
  PLANES,
  PROTOCOL_NAMES,
  QUERY_PLATFORMS,
  SEVERITIES,
  TELEMETRY_KEYS,
} from "@/lib/taxonomy";
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

  test("requires at least one recommended telemetry source", () => {
    expect(() => HuntSchema.parse({
      ...makeHunt(),
      telemetry: { recommended: [], optional: ["dns"] },
    })).toThrow();
  });

  test.each([
    ["within recommended telemetry", { recommended: ["netflow-ipfix", "netflow-ipfix"], optional: [] }],
    ["across telemetry groups", { recommended: ["netflow-ipfix"], optional: ["netflow-ipfix"] }],
  ])("identifies duplicate keys %s", (_scenario, telemetry) => {
    expect(() => HuntSchema.parse({
      ...makeHunt(),
      telemetry,
    })).toThrow(/Duplicate telemetry key: netflow-ipfix/);
  });

  test.each([
    ["nodes", []],
    ["textAlternative", []],
  ])("rejects flows without %s", (field, value) => {
    expect(() => HuntSchema.parse({
      ...makeHunt(),
      behaviorComparison: {
        ...makeHunt().behaviorComparison,
        expected: { ...makeHunt().behaviorComparison.expected, [field]: value },
      },
    })).toThrow();
  });
});

describe("shared content contracts", () => {
  test("exports the exact supported taxonomy tuples", () => {
    expect(HUNT_FAMILIES).toEqual([
      "management-plane-c2", "infrastructure-lateral-movement", "discovery-credential-access", "traffic-manipulation",
    ]);
    expect(SEVERITIES).toEqual(["low", "medium", "high", "critical"]);
    expect(CONFIDENCE_LEVELS).toEqual(["low", "medium", "high"]);
    expect(PLANES).toEqual(["management", "control", "data"]);
    expect(QUERY_PLATFORMS).toEqual(["splunk", "kql", "zeek", "pseudocode"]);
    expect(DEVICES).toEqual(["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"]);
    expect(PROTOCOL_NAMES).toEqual([
      "SSH", "HTTPS", "SNMP", "TACACS+", "RADIUS", "LDAP", "LDAPS", "NETCONF", "RESTCONF", "SCP", "SFTP", "TFTP",
      "DNS", "NTP", "BGP", "OSPF", "GRE", "IPsec", "VXLAN", "SMB", "RDP", "WinRM", "WireGuard", "OpenVPN",
    ]);
    expect(TELEMETRY_KEYS).toEqual([
      "netflow-ipfix", "dns", "aaa", "configuration-diffs", "cli-audit", "zeek", "packet-capture", "syslog",
    ]);
  });

  test("rejects non-HTTP(S) research source URLs", () => {
    expect(() => ResearchSchema.parse({
      id: "research-test",
      title: "Test research",
      organization: "Example",
      publishedAt: "2026-01-01",
      affectedTechnology: ["Router"],
      relevantBehaviors: ["Unexpected egress"],
      relatedHunts: [],
      sourceUrl: "ftp://example.com/research",
      summary: "A concise infrastructure research summary.",
    })).toThrow(/HTTP\(S\)/);
  });
});
