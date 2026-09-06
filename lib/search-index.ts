import { methodologyEntries } from "@/data/methodology";
import { hunts, protocols, researchEntries } from "@/lib/content";
import { aggregateQueries } from "@/lib/queries";
import type { FlowDefinition, Hunt } from "@/lib/schemas";
import type { SearchEntry } from "@/lib/search";

function freezeEntry(entry: Omit<SearchEntry, "tags"> & { tags: readonly string[] }): SearchEntry {
  return Object.freeze({ ...entry, tags: Object.freeze([...entry.tags]) });
}

function withTrailingSlash(path: string) {
  return path.endsWith("/") ? path : `${path}/`;
}

function flowSearchText(flow: FlowDefinition): readonly string[] {
  return [
    flow.title,
    ...flow.nodes.map((node) => node.label),
    ...flow.edges.map((edge) => edge.label),
    ...flow.textAlternative,
  ];
}

export function buildSearchIndex(huntRecords: readonly Hunt[] = hunts): readonly SearchEntry[] {
  const huntEntries = huntRecords.map((hunt) => freezeEntry({
    id: `hunt:${hunt.slug}`,
    type: "HUNT",
    title: hunt.title,
    description: hunt.summary,
    href: `/hunts/${hunt.slug}/`,
    tags: [
      hunt.family,
      hunt.severity,
      ...hunt.scopes,
      ...hunt.behaviors,
      ...hunt.temporalPatterns,
      ...hunt.aiRoles,
      ...hunt.protocols,
      ...hunt.devices,
      ...hunt.planes,
      ...hunt.telemetry.recommended,
      ...hunt.telemetry.optional,
      ...hunt.techniques,
    ],
    body: [
      hunt.hypothesis,
      hunt.rationale,
      hunt.detectionStrategy,
      hunt.temporal.interpretation,
      hunt.temporal.baseline,
      ...hunt.temporal.confounders,
      ...hunt.evidence.map((evidence) => evidence.claim),
      ...hunt.requiredFields,
      ...hunt.limitations,
      ...hunt.suspiciousBehavior,
      ...hunt.queries.map((query) => query.query),
    ].join(" "),
  }));
  const protocolEntries = protocols.map((protocol) => freezeEntry({
    id: `protocol:${protocol.slug}`,
    type: "PROTOCOL",
    title: protocol.name,
    description: protocol.definition,
    href: `/protocols/${protocol.slug}/`,
    tags: [protocol.category, protocol.portOrEncapsulation, ...protocol.relatedHunts],
    body: [
      protocol.expectedDirection,
      ...protocol.infrastructureUses,
      ...protocol.suspiciousPatterns,
      ...protocol.attackerAbuse,
      ...flowSearchText(protocol.normalFlow),
      ...flowSearchText(protocol.suspiciousFlow),
    ].join(" "),
  }));
  const methodologySearchEntries = methodologyEntries.map((entry) => freezeEntry({
    id: entry.id,
    type: "METHODOLOGY",
    title: entry.title,
    description: entry.summary,
    href: withTrailingSlash(entry.route),
    tags: entry.searchTerms,
    body: entry.searchTerms.join(" "),
  }));
  const researchSearchEntries = researchEntries.map((entry) => freezeEntry({
    id: entry.id,
    type: "RESEARCH",
    title: entry.title,
    description: entry.summary,
    href: `/research/#${entry.id}`,
    tags: [entry.organization, entry.evidenceType, ...(entry.threatActor ? [entry.threatActor] : []), ...entry.affectedTechnology],
    body: [
      entry.id,
      entry.sourceUrl,
      ...entry.relevantBehaviors,
      ...entry.supportedClaims,
      ...entry.limitations,
      ...entry.relatedHunts,
      entry.publishedAt,
    ].join(" "),
  }));
  const queryEntries = aggregateQueries(huntRecords).map((query) => freezeEntry({
    id: `query:${query.id}`,
    type: "QUERY",
    title: query.title,
    description: `${query.huntTitle}: ${query.description}`,
    href: "/queries/",
    tags: [query.platform, query.family, query.severity, ...query.protocols, ...query.devices, ...query.planes, ...query.telemetry, ...query.techniques],
    body: `${query.huntTitle} ${query.query}`,
  }));

  return Object.freeze([...huntEntries, ...protocolEntries, ...methodologySearchEntries, ...researchSearchEntries, ...queryEntries]);
}
