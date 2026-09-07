export type QueryFilterKey = "platforms" | "families" | "protocols" | "devices" | "telemetry" | "techniques";

export type QueryFilters = {
  readonly [Key in QueryFilterKey]: readonly string[];
};

export type QueryFilterOptions = QueryFilters;

export const queryFilterDefinitions = [
  ["platforms", "Platform", "platform"],
  ["families", "Family", "family"],
  ["protocols", "Protocol", "protocol"],
  ["devices", "Device", "device"],
  ["telemetry", "Telemetry", "telemetry"],
  ["techniques", "Technique", "technique"],
] as const satisfies ReadonlyArray<readonly [QueryFilterKey, string, string]>;

export const emptyQueryFilters: QueryFilters = Object.freeze({
  platforms: Object.freeze([]),
  families: Object.freeze([]),
  protocols: Object.freeze([]),
  devices: Object.freeze([]),
  telemetry: Object.freeze([]),
  techniques: Object.freeze([]),
});

function normalizeValues(values: Iterable<string>, knownValues: readonly string[]): readonly string[] {
  const selected = new Set(values);
  return knownValues.filter((value) => selected.has(value));
}

export function parseQueryFilters(searchParams: URLSearchParams, options: QueryFilterOptions): QueryFilters {
  return Object.freeze(Object.fromEntries(queryFilterDefinitions.map(([key, , parameter]) => [
    key,
    Object.freeze(normalizeValues(searchParams.getAll(parameter), options[key])),
  ])) as QueryFilters);
}

export function serializeQueryFilters(filters: QueryFilters, options: QueryFilterOptions): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, , parameter] of queryFilterDefinitions) {
    for (const value of normalizeValues(filters[key], options[key])) searchParams.append(parameter, value);
  }

  return searchParams;
}
