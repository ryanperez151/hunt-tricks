import { describe, expect, test } from "vitest";
import { hunts } from "@/data/hunts";
import { researchEntries } from "@/data/research";
import { telemetrySources } from "@/data/telemetry";
import { SCOPES, TELEMETRY_KEYS } from "@/lib/taxonomy";

const legacySlugs = new Set([
  "unexpected-management-interface-egress",
  "new-infrastructure-external-destination",
  "infrastructure-beaconing",
  "suspicious-infrastructure-dns",
  "alternate-dns-resolver",
  "unexpected-ssh-egress",
  "firewall-to-router-ssh",
  "router-to-router-ssh",
  "device-to-device-https-administration",
  "snmp-fan-out",
  "snmp-from-unexpected-initiator",
  "new-aaa-destination",
  "unexpected-ldap-from-infrastructure",
  "packet-capture-started",
  "packet-capture-followed-by-file-transfer",
  "unexpected-gre-tunnel",
  "new-ipsec-tunnel",
  "logging-destination-modified",
  "infrastructure-telemetry-gap",
  "management-acl-modified",
]);

function lintQueryContract(query: string, requiredFields: readonly string[]) {
  const dottedReferences = [...query.matchAll(/\b[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)+\b/g)]
    .map(([reference]) => reference);
  return [...new Set(dottedReferences.filter((reference) => !requiredFields.includes(reference)))];
}

function hasExplicitAnalysisBoundary(query: string) {
  return query.startsWith("ANALYSIS_INTERVAL(event.time, ANALYST_START, ANALYST_END)\n")
    && query.includes("LATENESS_POLICY(MAX_INGEST_DELAY, RETENTION_LIMIT)\n");
}

describe("expanded production content", () => {
  test("provides at least two operational hunts in every promised scope", () => {
    const newHunts = hunts.filter((hunt) => !legacySlugs.has(hunt.slug));

    expect(newHunts.length).toBeGreaterThanOrEqual(24);
    for (const scope of SCOPES) {
      expect(hunts.filter((hunt) => hunt.scopes.includes(scope)).length, scope).toBeGreaterThanOrEqual(2);
    }
  });

  test("makes every new hunt complete and labels source observations and editorial hypotheses", () => {
    const researchIds = new Set(researchEntries.map((source) => source.id));
    const newHunts = hunts.filter((hunt) => !legacySlugs.has(hunt.slug));

    for (const hunt of newHunts) {
      expect((hunt.expectedBehavior ?? []).length, `${hunt.slug}: expectedBehavior`).toBeGreaterThan(0);
      expect(hunt.temporal.interpretation.trim(), `${hunt.slug}: temporal interpretation`).not.toBe("");
      expect(hunt.temporal.baseline.trim(), `${hunt.slug}: temporal baseline`).not.toBe("");
      expect(hunt.temporal.confounders.length, `${hunt.slug}: temporal confounders`).toBeGreaterThan(0);
      expect(hunt.requiredFields.length, `${hunt.slug}: requiredFields`).toBeGreaterThan(0);
      expect(hunt.evidence.some(({ kind }) => kind === "observation"), `${hunt.slug}: observation`).toBe(true);
      expect(hunt.evidence.some(({ kind, claim }) => kind === "hypothesis" && claim.startsWith("Editorial hypothesis:")), `${hunt.slug}: hypothesis label`).toBe(true);
      expect(hunt.evidence.flatMap(({ sourceIds }) => sourceIds).every((id) => researchIds.has(id)), `${hunt.slug}: source IDs`).toBe(true);
      expect(hunt.limitations.length, `${hunt.slug}: limitations`).toBeGreaterThan(0);
      expect(hunt.investigationSteps.length, `${hunt.slug}: investigationSteps`).toBeGreaterThanOrEqual(3);
      expect(hunt.queries.length, `${hunt.slug}: queries`).toBeGreaterThan(0);
      expect(hunt.queries.every(({ query }) => query.trim().length > 40), `${hunt.slug}: query material`).toBe(true);
    }
  });

  test("explicitly enriches every legacy hunt for behavior and temporal filtering", () => {
    for (const slug of legacySlugs) {
      const hunt = hunts.find((candidate) => candidate.slug === slug);
      expect(hunt, slug).toBeDefined();
      expect(hunt?.behaviors.length, `${slug}: behaviors`).toBeGreaterThan(0);
      expect(hunt?.temporalPatterns.length, `${slug}: temporalPatterns`).toBeGreaterThan(0);
      expect(hunt?.requiredFields.length, `${slug}: requiredFields`).toBeGreaterThan(0);
      expect(hunt?.temporal.confounders.length, `${slug}: temporal confounders`).toBeGreaterThan(0);
    }
  });

  test("registers operational guidance for every telemetry contract key", () => {
    expect(telemetrySources.map(({ key }) => key)).toEqual([...TELEMETRY_KEYS]);
    for (const source of telemetrySources) {
      expect(source.collectionGuidance.trim(), `${source.key}: collection guidance`).not.toBe("");
      expect(source.limitations.trim(), `${source.key}: limitations`).not.toBe("");
    }
  });

  test("covers retrieval-corpus poisoning separately from prompt injection", () => {
    const poisoning = hunts.find(({ slug }) => slug === "retrieval-corpus-provenance-drift");
    expect(poisoning).toBeDefined();
    expect(poisoning?.behaviors).toContain("evidence-tampering");
    expect(poisoning?.requiredFields).toContain("retrieval.document_digest");
  });

  test("keeps methodology research anchors in the validated library", () => {
    const ids = new Set(researchEntries.map(({ id }) => id));
    for (const id of ["research-bro-1998", "research-slammer-2003", "research-copilot-2024", "research-reward-2025"]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  test("rejects undeclared raw query fields and missing temporal boundary headers", () => {
    expect(lintQueryContract(
      "ANALYSIS_INTERVAL(event.time, ANALYST_START, ANALYST_END)\nRETURN actor.id, target.id",
      ["event.time", "actor.id"],
    )).toEqual(["target.id"]);
    expect(hasExplicitAnalysisBoundary("RETURN event.time, actor.id")).toBe(false);
  });

  test("declares every dotted raw field referenced by expanded query material", () => {
    const newHunts = hunts.filter((hunt) => !legacySlugs.has(hunt.slug));
    const issues = newHunts.flatMap((hunt) => hunt.queries.flatMap((query) => (
      lintQueryContract(query.query, hunt.requiredFields).map((field) => `${hunt.slug}: ${field}`)
    )));
    expect(issues).toEqual([]);
  });

  test("bounds provenance and AI analysis by event time with lateness and retention inputs", () => {
    const boundedSlugs = [
      "source-release-artifact-provenance-gap",
      "retrieved-content-precedes-tool-action",
      "agent-tool-scope-escalation",
      "evaluator-change-precedes-perfect-score",
      "claimed-success-without-target-evidence",
      "retrieval-corpus-provenance-drift",
    ];
    for (const slug of boundedSlugs) {
      const hunt = hunts.find((candidate) => candidate.slug === slug);
      expect(hunt, slug).toBeDefined();
      expect(hasExplicitAnalysisBoundary(hunt!.queries[0].query), slug).toBe(true);
    }
  });

  test("keeps cross-domain query dependencies and source claims aligned", () => {
    const credentialSequence = hunts.find(({ slug }) => slug === "credential-store-read-then-cloud-auth")!;
    expect(credentialSequence.telemetry.recommended).toContain("cloud-audit");
    expect(credentialSequence.queries[0].description).toContain("AUTHORITATIVE_IDENTITY_LINK");
    expect(credentialSequence.queries[0].description).toContain("AUTHORITATIVE_DEVICE_LINK");
    expect(credentialSequence.queries[0].query).toContain("ENDPOINT_DEVICE_ID = AUTHORITATIVE_DEVICE_LINK(host.id)");
    expect(credentialSequence.queries[0].query).toContain("REQUIRE ENDPOINT_DEVICE_ID IS NOT NULL");
    expect(credentialSequence.queries[0].query).not.toContain("device.id != ENDPOINT_HOST_ID");

    const signedUtility = hunts.find(({ slug }) => slug === "signed-utility-new-external-relationship")!;
    expect(signedUtility.evidence.find(({ kind }) => kind === "observation")?.sourceIds)
      .toEqual(["research-volt-typhoon-2023"]);
    expect(researchEntries.some(({ id }) => id === "research-volt-typhoon-2023")).toBe(true);

    const saasExport = hunts.find(({ slug }) => slug === "saas-bulk-export-after-consent")!;
    expect(saasExport.evidence.find(({ kind }) => kind === "observation")?.claim)
      .not.toContain("unusually broad");

    const claimReconciliation = hunts.find(({ slug }) => slug === "claimed-success-without-target-evidence")!;
    expect(claimReconciliation.queries[0].query)
      .toContain("LEFT JOIN independent_target_event ON tool.call_id = CLAIM_TOOL_CALL_ID");
    expect(claimReconciliation.queries[0].query).not.toContain("OR target.event_key");
  });
});
