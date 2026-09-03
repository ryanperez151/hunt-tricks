import Fuse from "fuse.js";
import { methodologyEntries } from "@/data/methodology";
import { hunts, protocols, researchEntries } from "@/lib/content";
import { aggregateQueries } from "@/lib/queries";

export const SEARCH_ENTRY_TYPES = ["HUNT", "PROTOCOL", "METHODOLOGY", "RESEARCH", "QUERY"] as const;

export type SearchEntryType = (typeof SEARCH_ENTRY_TYPES)[number];

export type SearchEntry = Readonly<{
  id: string;
  type: SearchEntryType;
  title: string;
  description: string;
  href: string;
  tags: readonly string[];
  body: string;
}>;

function freezeEntry(entry: Omit<SearchEntry, "tags"> & { tags: readonly string[] }): SearchEntry {
  return Object.freeze({ ...entry, tags: Object.freeze([...entry.tags]) });
}

function withTrailingSlash(path: string) {
  return path.endsWith("/") ? path : `${path}/`;
}

export function buildSearchIndex(): readonly SearchEntry[] {
  const huntEntries = hunts.map((hunt) => freezeEntry({
    id: `hunt:${hunt.slug}`,
    type: "HUNT",
    title: hunt.title,
    description: hunt.summary,
    href: `/hunts/${hunt.slug}/`,
    tags: [hunt.family, hunt.severity, ...hunt.protocols, ...hunt.devices, ...hunt.planes, ...hunt.telemetry.recommended, ...hunt.telemetry.optional, ...hunt.techniques],
    body: [hunt.hypothesis, hunt.rationale, hunt.detectionStrategy, ...hunt.suspiciousBehavior, ...hunt.queries.map((query) => query.query)].join(" "),
  }));
  const protocolEntries = protocols.map((protocol) => freezeEntry({
    id: `protocol:${protocol.slug}`,
    type: "PROTOCOL",
    title: protocol.name,
    description: protocol.definition,
    href: `/protocols/${protocol.slug}/`,
    tags: [protocol.category, protocol.portOrEncapsulation, ...protocol.relatedHunts],
    body: [protocol.expectedDirection, ...protocol.infrastructureUses, ...protocol.suspiciousPatterns, ...protocol.attackerAbuse].join(" "),
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
    href: "/research/",
    tags: [entry.organization, entry.threatActor ?? "", ...entry.affectedTechnology],
    body: [...entry.relevantBehaviors, ...entry.relatedHunts, entry.publishedAt].join(" "),
  }));
  const queryEntries = aggregateQueries(hunts).map((query) => freezeEntry({
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

const defaultEntryIds = [
  "hunt:unexpected-management-interface-egress",
  "hunt:snmp-fan-out",
  "protocol:snmp",
  "methodology-independent-observation",
  "research-cisa-aa25-239a",
] as const;

export function searchGuide(query: string, entries: readonly SearchEntry[] = buildSearchIndex()): readonly SearchEntry[] {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length === 0) {
    const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
    return Object.freeze(defaultEntryIds.flatMap((id) => {
      const entry = entriesById.get(id);
      return entry ? [entry] : [];
    }));
  }

  const fuse = new Fuse(entries, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.36,
    keys: [
      { name: "title", weight: 0.55 },
      { name: "tags", weight: 0.25 },
      { name: "description", weight: 0.14 },
      { name: "body", weight: 0.06 },
    ],
  });

  return Object.freeze(fuse.search(normalizedQuery)
    .sort((left, right) => (left.score ?? 1) - (right.score ?? 1) || left.item.id.localeCompare(right.item.id))
    .slice(0, 12)
    .map((result) => result.item));
}
