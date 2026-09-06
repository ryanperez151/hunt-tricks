import { readFile } from "node:fs/promises";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
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
import packageJson from "@/package.json";

const methodologyFiles = {
  baselining: path.resolve(process.cwd(), "content/methodology/baselining.mdx"),
  rarity: path.resolve(process.cwd(), "content/methodology/rarity.mdx"),
  independentObservation: path.resolve(process.cwd(), "content/methodology/independent-observation.mdx"),
} as const;

const expectedResearchMetadata = [
  [
    "Countering Chinese State-Sponsored Actors Compromise of Networks Worldwide to Feed Global Espionage System",
    "CISA",
    "2025-08-27",
    "https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a",
  ],
  [
    "ArcaneDoor — New espionage-focused campaign found targeting perimeter network devices",
    "Cisco Talos",
    "2024-04-24",
    "https://blog.talosintelligence.com/arcanedoor-new-espionage-focused-campaign-found-targeting-perimeter-network-devices/",
  ],
  [
    "Ghost in the Router: China-Nexus Espionage Actor UNC3886 Targets Juniper Routers",
    "Mandiant",
    "2025-03-11",
    "https://cloud.google.com/blog/topics/threat-intelligence/china-nexus-espionage-targets-juniper-routers",
  ],
  [
    "Cloaked and Covert: Uncovering UNC3886 Espionage Operations",
    "Mandiant",
    "2024-06-18",
    "https://cloud.google.com/blog/topics/threat-intelligence/uncovering-unc3886-espionage-operations",
  ],
  [
    "UK Internet Edge Router Devices: Advisory",
    "NCSC",
    "2017-08-11",
    "https://www.ncsc.gov.uk/information/uk-internet-edge-router-devices-advisory",
  ],
  [
    "SOHO router compromise leads to DNS hijacking and adversary-in-the-middle attacks",
    "Microsoft Threat Intelligence",
    "2026-04-07",
    "https://www.microsoft.com/en-us/security/blog/2026/04/07/soho-router-compromise-leads-to-dns-hijacking-and-adversary-in-the-middle-attacks/",
  ],
  [
    "PRC State-Sponsored Actors Compromise and Maintain Persistent Access to U.S. Critical Infrastructure",
    "CISA",
    "2024-02-07",
    "https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a",
  ],
] as const;

function numberedBoldLabels(source: string) {
  return [...source.matchAll(/^\d+\. \*\*([^*]+)\*\*/gm)].map((match) => match[1]);
}

function semanticAllowMatrixRows(source: string) {
  const body = source.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1] ?? "";
  return [...body.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((row) =>
    [...row[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((cell) => cell[1].trim()),
  );
}

describe("secondary content registries", () => {
  test("seeds every required protocol and secondary collection", () => {
    expect(protocols.map((item) => item.name)).toEqual([
      "SSH", "HTTPS", "SNMP", "TACACS+", "RADIUS", "LDAP", "LDAPS",
      "NETCONF", "RESTCONF", "SCP", "SFTP", "TFTP", "DNS", "NTP",
      "BGP", "OSPF", "GRE", "IPsec", "VXLAN", "SMB", "RDP", "WinRM",
      "WireGuard", "OpenVPN",
    ]);
    expect(telemetrySources.length).toBeGreaterThanOrEqual(18);
    expect(huntFamilies).toHaveLength(6);
    expect(homeContent.originQuestion).toMatch(/forwarded BY|initiated FROM/);
    expect(methodologyEntries).toHaveLength(3);
    expect(attackPaths.map((item) => item.title)).toEqual([
      "Infrastructure Pivot", "Credential Collection", "Covert Tunnel", "Telemetry Suppression",
    ]);
    expect(researchEntries.length).toBeGreaterThanOrEqual(24);
  });

  test("preserves exact telemetry identities", () => {
    expect(telemetrySources.slice(0, 8).map(({ key, name }) => [key, name])).toEqual([
      ["netflow-ipfix", "NetFlow/IPFIX"],
      ["dns", "DNS"],
      ["aaa", "AAA"],
      ["configuration-diffs", "Configuration Diffs"],
      ["cli-audit", "CLI Audit"],
      ["zeek", "Zeek"],
      ["packet-capture", "Packet Capture"],
      ["syslog", "Syslog"],
    ]);
  });

  test("keeps every protocol operationally complete and links launch hunts", () => {
    for (const item of protocols) {
      expect([
        item.category,
        item.portOrEncapsulation,
        item.definition,
        item.expectedDirection,
      ].every((value) => value.trim().length > 0)).toBe(true);
      expect(item.infrastructureUses.length).toBeGreaterThan(0);
      expect(item.infrastructureUses.every((value) => value.trim().length > 0)).toBe(true);
      expect(item.suspiciousPatterns.length).toBeGreaterThan(0);
      expect(item.suspiciousPatterns.every((value) => value.trim().length > 0)).toBe(true);
      expect(item.attackerAbuse.length).toBeGreaterThan(0);
      expect(item.attackerAbuse.every((value) => value.trim().length > 0)).toBe(true);
      expect(item.normalFlow.nodes.length).toBeGreaterThan(0);
      expect(item.normalFlow.edges.length).toBeGreaterThan(0);
      expect(item.normalFlow.textAlternative.length).toBeGreaterThan(0);
      expect(item.normalFlow.textAlternative.every((value) => value.trim().length > 0)).toBe(true);
      expect(item.suspiciousFlow.nodes.length).toBeGreaterThan(0);
      expect(item.suspiciousFlow.edges.length).toBeGreaterThan(0);
      expect(item.suspiciousFlow.textAlternative.length).toBeGreaterThan(0);
      expect(item.suspiciousFlow.textAlternative.every((value) => value.trim().length > 0)).toBe(true);
      if (["bgp", "ospf", "vxlan"].includes(item.slug)) {
        expect(item.relatedHunts).toEqual([]);
      } else {
        expect(item.relatedHunts.length).toBeGreaterThan(0);
      }
    }
  });

  test("models SNMP polling, notifications, and suspicious fan-out in the correct direction", () => {
    const snmp = protocols.find((item) => item.name === "SNMP");
    expect(snmp).toBeDefined();
    expect(snmp?.normalFlow.edges).toEqual([
      { source: "nms", target: "router", label: "Polls UDP/161" },
      { source: "router", target: "nms", label: "Sends traps UDP/162" },
    ]);
    expect(snmp?.suspiciousFlow.edges).toEqual([
      { source: "router", target: "peer-a", label: "Initiates UDP/161" },
      { source: "router", target: "peer-b", label: "Initiates UDP/161" },
    ]);
    expect(snmp?.suspiciousFlow.textAlternative.join(" ")).toMatch(/router originates UDP\/161.*fan-out/i);
  });

  test("keeps attack paths ordered, connected, and linked to launch hunts", () => {
    for (const path of attackPaths) {
      const nodeIds = new Set(path.nodes.map((item) => item.id));
      expect(path.edges.every(({ source, target }) => nodeIds.has(source) && nodeIds.has(target))).toBe(true);
      expect(path.edges.map(({ source, target }) => ({ source, target }))).toEqual(
        path.nodes.slice(0, -1).map((item, index) => ({ source: item.id, target: path.nodes[index + 1].id })),
      );
      expect(path.textAlternative.length).toBe(path.edges.length);
      expect(path.relatedHunts.length).toBeGreaterThan(0);
    }
  });

  test("preserves exact primary-source research metadata and links launch hunts", () => {
    expect(researchEntries.slice(0, expectedResearchMetadata.length).map(({ title, organization, publishedAt, sourceUrl }) => [
      title,
      organization,
      publishedAt,
      sourceUrl,
    ])).toEqual(expectedResearchMetadata);
    expect(researchEntries.slice(0, expectedResearchMetadata.length).every((item) => item.relatedHunts.length > 0)).toBe(true);
  });

  test("all schema-backed secondary records satisfy their contracts", () => {
    expect(protocols.map((item) => ProtocolSchema.parse(item))).toHaveLength(24);
    expect(telemetrySources.map((item) => TelemetrySchema.parse(item))).toHaveLength(telemetrySources.length);
    expect(attackPaths.map((item) => AttackPathSchema.parse(item))).toHaveLength(4);
    expect(researchEntries.map((item) => ResearchSchema.parse(item))).toHaveLength(researchEntries.length);
  });

  test("declares the MDX compiler used directly by methodology tests", () => {
    expect(packageJson.devDependencies["@mdx-js/mdx"]).toBe("3.1.1");
  });

  test("compiles all local methodology MDX bodies", async () => {
    for (const file of Object.values(methodologyFiles)) {
      const source = await readFile(file, "utf8");
      const compiled = await compile(source, { providerImportSource: "@mdx-js/react" });
      expect(String(compiled)).toContain("function _createMdxContent");
      expect(String(compiled)).toContain("@mdx-js/react");
    }
  });

  test("preserves the baselining inventory and directional allow-matrix rows", async () => {
    const source = await readFile(methodologyFiles.baselining, "utf8");
    const compiled = String(await compile(source, { providerImportSource: "@mdx-js/react" }));
    expect(source).toContain("## Expected-dependency inventory");
    expect(source).toContain("## Infrastructure Communication Allow Matrix");
    expect(numberedBoldLabels(source)).toEqual([
      "Device identity and role",
      "Management addresses and interfaces",
      "Approved initiators",
      "Approved destinations",
      "Protocol, port, and encapsulation",
      "Direction and device role",
      "Plane and path",
      "Identity and authorization",
      "Timing and cadence",
      "Volume and fan-out",
      "Evidence and stewardship",
    ]);
    expect(semanticAllowMatrixRows(source)).toEqual([
      ["Approved jump host", "Device management IP", "SSH TCP/22 or HTTPS TCP/443", "Device is server; management plane", "Interactive administration", "Named administrators; ticketed or approved support window"],
      ["Automation controller", "Managed device", "NETCONF TCP/830 or RESTCONF HTTPS", "Device is API server; management plane", "Deploy and validate configuration", "Service identity; controller subnet; change window"],
      ["Managed device", "TACACS+ / RADIUS service", "TCP/49 or UDP/1812–1813", "Device is AAA client; management plane", "Authenticate, authorize, and account for access", "Approved server set; accounting must remain continuous"],
      ["Managed device", "Recursive resolver", "DNS UDP/TCP/53", "Device is DNS client; management plane", "Resolve infrastructure dependencies", "Internal resolvers only; direct external resolution denied"],
      ["Managed device", "Internal time source", "NTP UDP/123", "Device is time client; management plane", "Maintain reliable time", "Approved hierarchy; offset and source changes alert"],
      ["Managed device", "External log collector", "Syslog TCP/TLS or approved transport", "Device is log sender; management plane", "Preserve security and operations events", "Continuous; collector lives outside device control"],
      ["Network management system", "Managed device", "SNMP UDP/161", "Device is managed agent; management plane", "Poll health and interface counters", "Approved NMS addresses and object scope"],
      ["Managed device", "Network management system", "SNMP UDP/162", "Device is notification sender; management plane", "Send traps or informs", "Approved collectors; event-driven"],
      ["Managed device", "Configuration repository", "SCP/SFTP over TCP/22", "Device is transfer client or server as documented", "Image import, backup, or diagnostic export", "Signed images; named repository; scheduled or ticketed"],
      ["Edge router", "Configured routing peer", "BGP TCP/179", "Symmetric routing peer; control plane", "Exchange approved prefixes and policy", "Fixed peer identity, ASN, prefix, and maximum-prefix policy"],
      ["Internal router", "Configured link neighbor", "OSPF IP protocol 89", "Symmetric routing peer; control plane", "Exchange authenticated topology state", "Defined interface, area, router ID, and authentication"],
      ["VPN gateway", "Approved tunnel peer", "IKE UDP/500 or 4500 and ESP IP/50", "Tunnel endpoint; control and data planes", "Connect named sites, partners, or users", "Approved identity, cryptography, selectors, and routed networks"],
    ]);
    expect(compiled).toContain('"aria-label": "Infrastructure Communication Allow Matrix"');
    expect(compiled).not.toContain('children: "| Initiator | Destination |');
  });

  test("preserves the rarity factors and independent observation sources", async () => {
    const rarity = await readFile(methodologyFiles.rarity, "utf8");
    const independentObservation = await readFile(methodologyFiles.independentObservation, "utf8");
    const rarityCompiled = String(await compile(rarity, { providerImportSource: "@mdx-js/react" }));
    const independentCompiled = String(await compile(independentObservation, { providerImportSource: "@mdx-js/react" }));
    expect(rarity).toContain("## Conceptual Infrastructure Hunt Score");
    expect(independentObservation).toContain("## Independent observation equation");
    expect(independentObservation).toContain("## Independent telemetry sources");
    expect(numberedBoldLabels(rarity)).toEqual([
      "Origin rarity",
      "Direction and role rarity",
      "Destination rarity",
      "Protocol and port rarity",
      "Time and cadence rarity",
      "Volume and duration rarity",
      "Fan-out and peer rarity",
      "Change rarity",
      "Sequence rarity",
      "Independent corroboration",
    ]);
    expect(numberedBoldLabels(independentObservation)).toEqual([
      "Upstream NetFlow/IPFIX",
      "TAP/SPAN packet observation",
      "Zeek",
      "DNS resolver telemetry",
      "AAA records",
      "Central configuration management",
      "External syslog",
      "Neighboring-firewall telemetry",
    ]);
    expect(rarityCompiled).toContain('"aria-label": "Infrastructure Hunt Score relationship"');
    expect(independentCompiled).toContain('"aria-label": "Independent observation equation"');
  });
});
