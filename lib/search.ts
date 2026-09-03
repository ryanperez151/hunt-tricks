import Fuse from "fuse.js";

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

const defaultEntryIds = [
  "hunt:unexpected-management-interface-egress",
  "hunt:snmp-fan-out",
  "protocol:snmp",
  "methodology-independent-observation",
  "research-cisa-aa25-239a",
] as const;

export function searchGuide(query: string, entries: readonly SearchEntry[]): readonly SearchEntry[] {
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
