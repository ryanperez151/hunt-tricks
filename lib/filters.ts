import type { Hunt } from "@/lib/schemas";
import {
  AI_ROLES,
  BEHAVIORS,
  DEVICES,
  HUNT_FAMILIES,
  PLANES,
  PROTOCOL_NAMES,
  SCOPES,
  SEVERITIES,
  TELEMETRY_KEYS,
  TEMPORAL_PATTERNS,
} from "@/lib/taxonomy";

type HuntFilterValues = {
  families: (typeof HUNT_FAMILIES)[number];
  protocols: (typeof PROTOCOL_NAMES)[number];
  devices: (typeof DEVICES)[number];
  planes: (typeof PLANES)[number];
  severities: (typeof SEVERITIES)[number];
  telemetry: (typeof TELEMETRY_KEYS)[number];
  scopes: (typeof SCOPES)[number];
  behaviors: (typeof BEHAVIORS)[number];
  temporalPatterns: (typeof TEMPORAL_PATTERNS)[number];
  aiRoles: (typeof AI_ROLES)[number];
};

export type HuntFilters = {
  readonly [Key in keyof HuntFilterValues]: readonly HuntFilterValues[Key][];
};

export const emptyHuntFilters: HuntFilters = Object.freeze({
  families: Object.freeze([]),
  protocols: Object.freeze([]),
  devices: Object.freeze([]),
  planes: Object.freeze([]),
  severities: Object.freeze([]),
  telemetry: Object.freeze([]),
  scopes: Object.freeze([]),
  behaviors: Object.freeze([]),
  temporalPatterns: Object.freeze([]),
  aiRoles: Object.freeze([]),
});

const filterDefinitions = [
  ["families", "family", HUNT_FAMILIES],
  ["protocols", "protocol", PROTOCOL_NAMES],
  ["devices", "device", DEVICES],
  ["planes", "plane", PLANES],
  ["severities", "severity", SEVERITIES],
  ["telemetry", "telemetry", TELEMETRY_KEYS],
  ["scopes", "scope", SCOPES],
  ["behaviors", "behavior", BEHAVIORS],
  ["temporalPatterns", "temporal", TEMPORAL_PATTERNS],
  ["aiRoles", "ai", AI_ROLES],
] as const;

function normalizeValues<T extends string>(values: Iterable<string>, knownValues: readonly T[]): readonly T[] {
  const selected = new Set(values);
  return knownValues.filter((value) => selected.has(value));
}

export function parseHuntFilters(searchParams: URLSearchParams): HuntFilters {
  const filters = Object.fromEntries(filterDefinitions.map(([key, parameter, values]) => [
    key,
    Object.freeze(normalizeValues(searchParams.getAll(parameter), values)),
  ])) as HuntFilters;

  return Object.freeze(filters);
}

export function serializeHuntFilters(filters: HuntFilters): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, parameter, values] of filterDefinitions) {
    for (const value of normalizeValues(filters[key], values)) {
      searchParams.append(parameter, value);
    }
  }

  return searchParams;
}

function matchesAny<T>(values: readonly T[], selected: readonly T[]) {
  return selected.length === 0 || selected.some((value) => values.includes(value));
}

export function filterHunts(hunts: readonly Hunt[], filters: HuntFilters): readonly Hunt[] {
  const normalized = parseHuntFilters(serializeHuntFilters(filters));

  return hunts.filter((hunt) => (
    matchesAny([hunt.family], normalized.families)
    && matchesAny(hunt.protocols, normalized.protocols)
    && matchesAny(hunt.devices, normalized.devices)
    && matchesAny(hunt.planes, normalized.planes)
    && matchesAny([hunt.severity], normalized.severities)
    && matchesAny([...hunt.telemetry.recommended, ...hunt.telemetry.optional], normalized.telemetry)
    && matchesAny(hunt.scopes, normalized.scopes)
    && matchesAny(hunt.behaviors, normalized.behaviors)
    && matchesAny(hunt.temporalPatterns, normalized.temporalPatterns)
    && matchesAny(hunt.aiRoles, normalized.aiRoles)
  ));
}
