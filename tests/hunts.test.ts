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

const originMattersBySlug = {
  "unexpected-management-interface-egress": true,
  "new-infrastructure-external-destination": true,
  "infrastructure-beaconing": true,
  "suspicious-infrastructure-dns": true,
  "alternate-dns-resolver": true,
  "unexpected-ssh-egress": true,
  "firewall-to-router-ssh": true,
  "router-to-router-ssh": true,
  "device-to-device-https-administration": true,
  "snmp-fan-out": true,
  "snmp-from-unexpected-initiator": true,
  "new-aaa-destination": true,
  "unexpected-ldap-from-infrastructure": true,
  "packet-capture-started": false,
  "packet-capture-followed-by-file-transfer": true,
  "unexpected-gre-tunnel": true,
  "new-ipsec-tunnel": true,
  "logging-destination-modified": false,
  "infrastructure-telemetry-gap": false,
  "management-acl-modified": false,
} as const;

describe("launch hunt registry", () => {
  test("preserves the required launch hunts before expanded content", () => {
    expect(hunts.length).toBeGreaterThanOrEqual(44);
    expect(hunts.slice(0, requiredTitles.length).map((hunt) => hunt.title)).toEqual(requiredTitles);
    expect(hunts.map((hunt) => HuntSchema.parse(hunt))).toHaveLength(hunts.length);
  });

  test("explicitly curates origin-versus-transit guidance for every hunt", () => {
    expect(Object.keys(originMattersBySlug)).toHaveLength(requiredTitles.length);
    for (const hunt of hunts.slice(0, requiredTitles.length)) {
      expect(hunt.showOriginMatters, hunt.slug).toBe(originMattersBySlug[hunt.slug as keyof typeof originMattersBySlug]);
    }
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

  test("creates a GRE literal before using it as a Splunk lookup key", () => {
    const hunt = getHuntBySlug("unexpected-gre-tunnel")!;
    const query = hunt.queries.find((item) => item.platform === "splunk")!.query;
    const literalPosition = query.indexOf('| eval tunnel_type="GRE"');
    const lookupPosition = query.indexOf("tunnel_type OUTPUT tunnel_id approval_status");

    expect(literalPosition).toBeGreaterThan(-1);
    expect(lookupPosition).toBeGreaterThan(literalPosition);
    expect(query).not.toContain('tunnel_type AS "GRE"');
  });

  test("preserves GRE detections while correlating only changes within one hour of first activity", () => {
    const hunt = getHuntBySlug("unexpected-gre-tunnel")!;
    const query = hunt.queries.find((item) => item.platform === "kql")!;
    const afterLeftJoin = query.query.slice(query.query.indexOf("| join kind=leftouter"));

    expect(query.description).toMatch(/one-hour correlation window around first observed tunnel activity/i);
    expect(query.query).toContain("ChangeTime=TimeGenerated");
    expect(query.query).toContain(
      "ChangeInWindow = isnotnull(ChangeTime) and ChangeTime between ((FirstSeen - 1h) .. (FirstSeen + 1h))",
    );
    expect(query.query).toContain(
      "Changes=make_set_if(ChangeSummary, ChangeInWindow and isnotempty(ChangeSummary))",
    );
    expect(query.query).toContain("Actors=make_set_if(Actor, ChangeInWindow and isnotempty(Actor))");
    expect(query.query).toContain("ChangeTimes=make_set_if(ChangeTime, ChangeInWindow)");
    expect(afterLeftJoin).not.toMatch(/\|\s*where[^\n]*ChangeTime/);
  });

  test("requires protocol-specific upload and capture-artifact evidence for capture transfer", () => {
    const hunt = getHuntBySlug("packet-capture-followed-by-file-transfer")!;
    const query = hunt.queries[0].query;

    expect(query).toContain('transfer.protocol = HTTPS AND transfer.http.method IN ("PUT", "POST")');
    expect(query).toContain('transfer.protocol = SFTP AND transfer.sftp.operation IN ("write", "upload")');
    expect(query).toContain('transfer.protocol = TFTP AND transfer.tftp.opcode = "WRQ"');
    expect(query).toContain('transfer.protocol = SCP AND transfer.scp.direction = "local-to-remote"');
    expect(query).toContain("isnotempty(transfer.source_path) AND isnotempty(capture.artifact_path)");
    expect(query).toContain("transfer.source_path = capture.artifact_path");
    expect(query).toContain("isnotempty(transfer.file_hash) AND isnotempty(capture.artifact_hash)");
    expect(query).toContain("transfer.file_hash = capture.artifact_hash");
    expect(query).toContain("transfer.file_size > 0 AND capture.file_size > 0");
    expect(query).toContain("abs(transfer.file_size - capture.file_size)");
    expect(query).toContain("transfer.bytes_out >= capture.file_size * 0.95");
    expect(query).toContain("transfer.bytes_out <= capture.file_size * 1.05 + 4096");
    expect(query).toContain("PROTOCOL_UPLOAD AND ARTIFACT_EVIDENCE");
  });

  test("maps corrected hunts only to techniques directly evidenced by their detections", () => {
    const expectedTechniques = {
      "unexpected-management-interface-egress": ["T1071 Application Layer Protocol"],
      "new-infrastructure-external-destination": ["T1071 Application Layer Protocol"],
      "infrastructure-beaconing": ["T1071.001 Web Protocols", "T1071.004 DNS", "T1572 Protocol Tunneling"],
      "suspicious-infrastructure-dns": ["T1071.004 DNS"],
      "alternate-dns-resolver": ["T1071.004 DNS"],
      "unexpected-ssh-egress": ["T1021.004 SSH"],
      "firewall-to-router-ssh": ["T1021.004 SSH"],
      "router-to-router-ssh": ["T1021.004 SSH"],
      "device-to-device-https-administration": ["T1021 Remote Services"],
      "snmp-from-unexpected-initiator": ["T1046 Network Service Discovery", "T1018 Remote System Discovery"],
      "new-aaa-destination": ["T1556 Modify Authentication Process"],
      "packet-capture-started": ["T1040 Network Sniffing"],
      "packet-capture-followed-by-file-transfer": ["T1040 Network Sniffing", "T1048 Exfiltration Over Alternative Protocol"],
      "unexpected-gre-tunnel": ["T1572 Protocol Tunneling"],
      "new-ipsec-tunnel": ["T1572 Protocol Tunneling"],
      "logging-destination-modified": ["T1562.001 Impair Defenses"],
      "infrastructure-telemetry-gap": ["T1562.001 Impair Defenses"],
      "management-acl-modified": ["T1562.004 Disable or Modify System Firewall"],
    } as const;

    for (const [slug, techniques] of Object.entries(expectedTechniques)) {
      expect(getHuntBySlug(slug)?.techniques, slug).toEqual(techniques);
    }
  });

  test("keeps every non-flagship hunt operationally actionable", () => {
    const nonFlagships = hunts.filter((hunt) => !flagshipSlugs.includes(hunt.slug as (typeof flagshipSlugs)[number]));

    for (const hunt of nonFlagships) {
      expect(hunt.hypothesis.length, `${hunt.slug} hypothesis`).toBeGreaterThan(45);
      expect(hunt.rationale.length, `${hunt.slug} rationale`).toBeGreaterThan(100);
      expect(hunt.detectionStrategy.length, `${hunt.slug} detection strategy`).toBeGreaterThan(70);
      expect(hunt.investigationSteps.length, `${hunt.slug} investigation steps`).toBeGreaterThanOrEqual(3);
      expect(hunt.escalationConditions.length, `${hunt.slug} escalation conditions`).toBeGreaterThanOrEqual(1);
      expect(hunt.falsePositives.length, `${hunt.slug} false positives`).toBeGreaterThan(0);
      expect(hunt.enrichment.length, `${hunt.slug} enrichment`).toBeGreaterThan(0);
      expect(hunt.queries.length, `${hunt.slug} queries`).toBeGreaterThan(0);
      expect(hunt.queries.every((query) => query.query.length > 30), `${hunt.slug} meaningful query`).toBe(true);
      expect(hunt.telemetry.recommended.length, `${hunt.slug} recommended telemetry`).toBeGreaterThan(0);
      expect(hunt.techniques.length, `${hunt.slug} techniques`).toBeGreaterThan(0);
      if (hunt.scopes.every((scope) => scope === "network-edge")) {
        expect(hunt.devices.length, `${hunt.slug} devices`).toBeGreaterThan(0);
        expect(hunt.protocols.length, `${hunt.slug} protocols`).toBeGreaterThan(0);
        expect(hunt.planes.length, `${hunt.slug} planes`).toBeGreaterThan(0);
      }
      expect(hunt.references.length, `${hunt.slug} references`).toBeGreaterThan(0);
      expect(hunt.relatedHunts.length, `${hunt.slug} related hunts`).toBeGreaterThan(0);
    }
  });
});
