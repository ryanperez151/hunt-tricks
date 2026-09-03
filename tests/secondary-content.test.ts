import { describe, expect, test } from "vitest";
import { attackPaths } from "@/data/attack-paths";
import { huntFamilies } from "@/data/families";
import { homeContent } from "@/data/home";
import { methodologyEntries } from "@/data/methodology";
import { protocols } from "@/data/protocols";
import { researchEntries } from "@/data/research";
import { telemetrySources } from "@/data/telemetry";
import {
  AttackPathSchema,
  ProtocolSchema,
  ResearchSchema,
  TelemetrySchema,
} from "@/lib/schemas";

describe("secondary content registries", () => {
  test("seeds every required protocol and secondary collection", () => {
    expect(protocols.map((item) => item.name)).toEqual([
      "SSH", "HTTPS", "SNMP", "TACACS+", "RADIUS", "LDAP", "LDAPS",
      "NETCONF", "RESTCONF", "SCP", "SFTP", "TFTP", "DNS", "NTP",
      "BGP", "OSPF", "GRE", "IPsec", "VXLAN", "SMB", "RDP", "WinRM",
      "WireGuard", "OpenVPN",
    ]);
    expect(telemetrySources).toHaveLength(8);
    expect(huntFamilies).toHaveLength(4);
    expect(homeContent.originQuestion).toMatch(/forwarded BY|initiated FROM/);
    expect(methodologyEntries).toHaveLength(3);
    expect(attackPaths.map((item) => item.title)).toEqual([
      "Infrastructure Pivot", "Credential Collection", "Covert Tunnel", "Telemetry Suppression",
    ]);
    expect(researchEntries.length).toBeGreaterThanOrEqual(6);
  });

  test("all schema-backed secondary records satisfy their contracts", () => {
    expect(protocols.map((item) => ProtocolSchema.parse(item))).toHaveLength(24);
    expect(telemetrySources.map((item) => TelemetrySchema.parse(item))).toHaveLength(8);
    expect(attackPaths.map((item) => AttackPathSchema.parse(item))).toHaveLength(4);
    expect(researchEntries.map((item) => ResearchSchema.parse(item))).toHaveLength(7);
  });
});
