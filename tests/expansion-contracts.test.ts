import { describe, expect, test } from "vitest";
import { validateContentRegistries } from "@/lib/content";
import { filterHunts, parseHuntFilters, serializeHuntFilters } from "@/lib/filters";
import { buildSearchIndex } from "@/lib/search-index";
import { HuntSchema, ResearchSchema } from "@/lib/schemas";
import { makeHunt } from "./test-utils";

const expandedMetadata = {
  expectedBehavior: ["Normal authentication follows established identity and source relationships."],
  temporal: {
    interpretation: "Repeated failures spread across a long interval may indicate password spraying.",
    baseline: "Compare each identity and source with its normal authentication cadence.",
    confounders: ["Approved access testing"],
  },
  evidence: [{
    claim: "Long-window authentication patterns are an investigation hypothesis.",
    sourceIds: ["research-test"],
    kind: "hypothesis",
  }],
  requiredFields: ["event.time", "identity.id", "source.ip", "auth.result"],
  limitations: ["Shared egress can make independent actors appear related."],
};

describe("hunt-tricks expansion contracts", () => {
  test("accepts expansion vocabulary in hunt contracts and rejects unknown values", () => {
    expect(HuntSchema.parse({
      ...makeHunt(),
      family: "ai-agent-abuse",
      scopes: ["ai-systems"],
      behaviors: ["adaptive-sequence"],
      temporalPatterns: ["stage-transition"],
      aiRoles: ["target"],
      telemetry: { recommended: ["agent-traces"], optional: [] },
      expectedBehavior: ["Authorized agents invoke approved tools within the assigned task."],
      temporal: {
        interpretation: "Compare the order and latency of consequential agent actions.",
        baseline: "Establish expected tool sequences for each approved workflow.",
        confounders: ["Workflow version changes"],
      },
      evidence: [{ claim: "Agent actions require independent outcome validation.", sourceIds: ["research-test"], kind: "hypothesis" }],
      requiredFields: ["event.time", "agent.run_id", "tool.name", "tool.result"],
      limitations: ["Missing orchestration traces can hide intermediate decisions."],
    })).toMatchObject({
      family: "ai-agent-abuse",
      scopes: ["ai-systems"],
      behaviors: ["adaptive-sequence"],
      temporalPatterns: ["stage-transition"],
      aiRoles: ["target"],
      telemetry: { recommended: ["agent-traces"] },
    });

    expect(() => HuntSchema.parse({ ...makeHunt(), scopes: ["unsupported-scope"] })).toThrow();
  });

  test("defaults legacy hunts to network-edge while accepting empty infrastructure context for identity hunts", () => {
    expect(HuntSchema.parse(makeHunt()).scopes).toEqual(["network-edge"]);

    const identityHunt = HuntSchema.parse({
      ...makeHunt(),
      scopes: ["identity"],
      behaviors: ["credential-use"],
      temporalPatterns: ["low-and-slow"],
      aiRoles: ["attacker"],
      planes: [],
      devices: [],
      temporal: {
        interpretation: "Repeated failures spread across a long interval may indicate password spraying.",
        baseline: "Compare each identity and source with its normal authentication cadence.",
        confounders: ["Approved access testing"],
      },
      evidence: [{ claim: "Long-window authentication patterns are an investigation hypothesis.", sourceIds: ["research-test"], kind: "hypothesis" }],
      requiredFields: ["event.time", "identity.id", "source.ip", "auth.result"],
      limitations: ["Shared egress can make independent actors appear related."],
      expectedBehavior: ["Normal authentication follows established identity and source relationships."],
    });

    expect(identityHunt).toMatchObject({ scopes: ["identity"], planes: [], devices: [] });
  });

  test("rejects nonempty evidence claims without sources", () => {
    expect(() => HuntSchema.parse({
      ...makeHunt(),
      evidence: [{ claim: "This claim needs support.", sourceIds: [], kind: "observation" }],
    })).toThrow(/source/i);
  });

  test("rejects evidence source IDs absent from the research registry", () => {
    expect(() => validateContentRegistries({
      hunts: [{
        ...makeHunt(),
        evidence: [{ claim: "A supported observation.", sourceIds: ["research-missing"], kind: "observation" }],
      }],
      protocols: [],
      telemetry: [],
      research: [],
      attackPaths: [],
    })).toThrow(/unknown evidence source research-missing/i);
  });

  test.each([
    ["behaviors", { behaviors: [] }],
    ["temporalPatterns", { temporalPatterns: [] }],
    ["temporal", { temporal: undefined }],
    ["evidence", { evidence: [] }],
    ["requiredFields", { requiredFields: [] }],
    ["limitations", { limitations: [] }],
    ["expectedBehavior", { expectedBehavior: [] }],
  ] as const)("build validation rejects expanded hunts missing %s", (field, override) => {
    const expanded = {
      ...makeHunt(),
      scopes: ["identity"],
      behaviors: ["credential-use"],
      temporalPatterns: ["low-and-slow"],
      aiRoles: ["attacker"],
      planes: [],
      devices: [],
      expectedBehavior: ["Normal authentication follows established identity and source relationships."],
      temporal: {
        interpretation: "Repeated failures spread across a long interval may indicate password spraying.",
        baseline: "Compare each identity and source with its normal authentication cadence.",
        confounders: ["Approved access testing"],
      },
      evidence: [{ claim: "Long-window authentication patterns are an investigation hypothesis.", sourceIds: ["research-test"], kind: "hypothesis" }],
      requiredFields: ["event.time", "identity.id", "source.ip", "auth.result"],
      limitations: ["Shared egress can make independent actors appear related."],
      ...override,
    };

    expect(() => validateContentRegistries({
      hunts: [expanded],
      protocols: [], telemetry: [], research: [], attackPaths: [],
    })).toThrow(new RegExp(`field ${field}`, "i"));
  });

  test("combines scope, behavior, temporal, and AI-role filters", () => {
    const matching = HuntSchema.parse({
      ...makeHunt(),
      ...expandedMetadata,
      id: "hunt-matching",
      slug: "matching",
      scopes: ["identity"],
      behaviors: ["credential-use"],
      temporalPatterns: ["low-and-slow"],
      aiRoles: ["attacker"],
    });
    const nonmatching = HuntSchema.parse({
      ...makeHunt(),
      ...expandedMetadata,
      id: "hunt-nonmatching",
      slug: "nonmatching",
      scopes: ["identity"],
      behaviors: ["credential-use"],
      temporalPatterns: ["burst"],
      aiRoles: ["attacker"],
    });
    const filters = parseHuntFilters(new URLSearchParams(
      "scope=identity&behavior=credential-use&temporal=low-and-slow&ai=attacker",
    ));

    expect(serializeHuntFilters(filters).toString()).toContain("scope=identity");
    expect(filterHunts([matching, nonmatching], filters).map((hunt) => hunt.slug)).toEqual(["matching"]);
  });

  test("indexes expanded hunt dimensions and evidence claims", () => {
    const hunt = HuntSchema.parse({
      ...makeHunt(),
      ...expandedMetadata,
      id: "hunt-searchable-expansion",
      slug: "searchable-expansion",
      scopes: ["identity"],
      behaviors: ["credential-use"],
      temporalPatterns: ["low-and-slow"],
      aiRoles: ["attacker"],
    });

    const entry = buildSearchIndex([hunt]).find((item) => item.id === "hunt:searchable-expansion");

    expect(entry?.tags).toEqual(expect.arrayContaining([
      "identity", "credential-use", "low-and-slow", "attacker",
    ]));
    expect(entry?.body).toContain("Long-window authentication patterns are an investigation hypothesis.");
  });

  test("defaults legacy research evidence metadata", () => {
    const research = ResearchSchema.parse({
      id: "research-test",
      title: "Test research",
      organization: "Example",
      publishedAt: "2026-01-01",
      affectedTechnology: ["Routers"],
      relevantBehaviors: ["Unexpected egress"],
      relatedHunts: [],
      sourceUrl: "https://example.com/research",
      summary: "A concise infrastructure research summary.",
    });

    expect(research).toMatchObject({ evidenceType: "incident-report", supportedClaims: [], limitations: [] });
  });

  test.each(["1998", "1998-07", "1998-07-01"])(
    "accepts honest research publication precision: %s",
    (publishedAt) => {
      expect(ResearchSchema.parse({
        id: "research-date-precision",
        title: "Date precision research",
        organization: "Example",
        publishedAt,
        affectedTechnology: ["Network monitoring"],
        relevantBehaviors: ["Independent observation"],
        relatedHunts: [],
        sourceUrl: "https://example.com/date-precision",
        summary: "A research record whose source publishes only the precision represented here.",
      }).publishedAt).toBe(publishedAt);
    },
  );

  test.each(["1998-13", "1998-02-30", "1998-00-10", "98"])(
    "rejects invalid research publication date: %s",
    (publishedAt) => {
      expect(() => ResearchSchema.parse({
        id: "research-invalid-date",
        title: "Invalid date research",
        organization: "Example",
        publishedAt,
        affectedTechnology: ["Network monitoring"],
        relevantBehaviors: ["Independent observation"],
        relatedHunts: [],
        sourceUrl: "https://example.com/invalid-date",
        summary: "This otherwise valid record isolates publication date validation.",
      })).toThrow(/date|publishedAt/i);
    },
  );
});
