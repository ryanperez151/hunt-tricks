import { describe, expect, test } from "vitest";
import { ContentIntegrityError, validateContentRegistries } from "@/lib/content";
import { makeHunt } from "./test-utils";

const flow = {
  title: "Test flow",
  nodes: [{ id: "source", label: "Source" }, { id: "target", label: "Target" }],
  edges: [{ source: "source", target: "target", label: "Connects to" }],
  textAlternative: ["Source connects to target."],
};

function makeProtocol() {
  return {
    id: "protocol-ssh",
    slug: "ssh",
    name: "SSH",
    category: "Management",
    portOrEncapsulation: "TCP/22",
    definition: "Secure Shell provides remote administration.",
    infrastructureUses: ["Router administration"],
    expectedDirection: "NMS to router.",
    suspiciousPatterns: ["Router egress to unapproved hosts."],
    attackerAbuse: ["Remote command execution."],
    normalFlow: flow,
    suspiciousFlow: flow,
    relatedHunts: [],
  };
}

function makeTelemetry() {
  return {
    id: "telemetry-netflow",
    key: "netflow-ipfix",
    name: "NetFlow/IPFIX",
    summary: "Flow records describe network sessions.",
    collectionGuidance: "Collect from independent exporters.",
    investigationContribution: "Shows originating traffic.",
    limitations: "Does not include payloads.",
    coverage: { c2: "high", lateralMovement: "high", discovery: "medium", manipulation: "medium" },
  };
}

function makeResearch() {
  return {
    id: "research-test",
    title: "Test research",
    organization: "Example",
    publishedAt: "2026-01-01",
    affectedTechnology: ["Routers"],
    relevantBehaviors: ["Management-plane egress"],
    relatedHunts: [],
    sourceUrl: "https://example.com/research",
    summary: "A relevant infrastructure hunting source.",
  };
}

function makeAttackPath() {
  return {
    id: "path-test",
    slug: "test-path",
    title: "Test path",
    summary: "A concise attack path.",
    nodes: flow.nodes,
    edges: flow.edges,
    textAlternative: flow.textAlternative,
    relatedHunts: [],
  };
}

describe("validateContentRegistries", () => {
  test("rejects duplicate and broken content relationships", () => {
    const hunt = makeHunt();
    expect(() => validateContentRegistries({
      hunts: [hunt, { ...hunt }],
      protocols: [], telemetry: [], research: [], attackPaths: [],
    })).toThrow(/duplicate hunt slug/i);

    expect(() => validateContentRegistries({
      hunts: [{ ...hunt, relatedHunts: ["missing-hunt"] }],
      protocols: [], telemetry: [], research: [], attackPaths: [],
    })).toThrow(/missing-hunt/i);
  });

  test("reports every invalid cross-reference with its record and field", () => {
    const hunt = {
      ...makeHunt(),
      slug: "management-plane-c2",
      protocols: ["SSH", "DNS"],
      telemetry: { recommended: ["netflow-ipfix"], optional: ["dns"] },
    };
    const protocol = { ...makeProtocol(), relatedHunts: ["missing-protocol-hunt"] };
    const research = { ...makeResearch(), relatedHunts: ["missing-research-hunt"] };

    let error: unknown;
    try {
      validateContentRegistries({
        hunts: [hunt],
        protocols: [protocol, { ...protocol, slug: "ssh-copy" }],
        telemetry: [makeTelemetry()],
        research: [research],
        attackPaths: [makeAttackPath()],
      });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(ContentIntegrityError);
    const integrityError = error as ContentIntegrityError;
    expect(integrityError.issues).toHaveLength(7);
    expect(integrityError.issues).toEqual(expect.arrayContaining([
      expect.stringMatching(/hunt management-plane-c2 field slug: collides with family slug management-plane-c2/i),
      expect.stringMatching(/hunt management-plane-c2 field protocols: unknown protocol DNS/i),
      expect.stringMatching(/hunt management-plane-c2 field telemetry: unknown telemetry dns/i),
      expect.stringMatching(/duplicate protocol id: protocol-ssh/i),
      expect.stringMatching(/protocol ssh field relatedHunts: missing-protocol-hunt/i),
      expect.stringMatching(/protocol ssh-copy field relatedHunts: missing-protocol-hunt/i),
      expect.stringMatching(/research research-test field relatedHunts: missing-research-hunt/i),
    ]));
  });

  test("includes rejected schema values in aggregated validation errors", () => {
    let error: unknown;
    try {
      validateContentRegistries({
        hunts: [{
          ...makeHunt(),
          protocols: ["unsupported-protocol"],
          references: [{ title: "Bad URL", url: "javascript:alert(1)" }],
          telemetry: { recommended: ["netflow-ipfix", "netflow-ipfix"], optional: [] },
        }],
        protocols: [], telemetry: [], research: [], attackPaths: [],
      });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(ContentIntegrityError);
    expect((error as ContentIntegrityError).issues).toEqual(expect.arrayContaining([
      expect.stringMatching(/hunt test-hunt field protocols\.0:.*"unsupported-protocol"/i),
      expect.stringMatching(/hunt test-hunt field references\.0\.url:.*"javascript:alert\(1\)"/i),
      expect.stringMatching(/hunt test-hunt field telemetry\.recommended\.1:.*"netflow-ipfix"/i),
    ]));
  });

  test("accepts registries whose references resolve", () => {
    const hunt = makeHunt();
    expect(() => validateContentRegistries({
      hunts: [hunt],
      protocols: [{ ...makeProtocol(), relatedHunts: [hunt.slug] }],
      telemetry: [makeTelemetry(), { ...makeTelemetry(), id: "telemetry-dns", key: "dns", name: "DNS" }],
      research: [{ ...makeResearch(), relatedHunts: [hunt.slug] }],
      attackPaths: [{ ...makeAttackPath(), relatedHunts: [hunt.slug] }],
    })).not.toThrow();
  });
});
