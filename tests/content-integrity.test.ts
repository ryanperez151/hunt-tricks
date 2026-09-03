import { describe, expect, test } from "vitest";
import { validateContentRegistries } from "@/lib/content";
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

    expect(() => validateContentRegistries({
      hunts: [hunt],
      protocols: [protocol, { ...protocol, slug: "ssh-copy" }],
      telemetry: [makeTelemetry()],
      research: [research],
      attackPaths: [makeAttackPath()],
    })).toThrow(/hunt management-plane-c2.*family slug|unknown protocol.*DNS|protocol ssh.*missing-protocol-hunt|research research-test.*missing-research-hunt|duplicate protocol id/i);
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
