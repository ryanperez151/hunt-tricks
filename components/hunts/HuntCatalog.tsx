"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HuntCard } from "@/components/hunts/HuntCard";
import { HuntFilters, type HuntFilterOptions } from "@/components/hunts/HuntFilters";
import {
  emptyHuntFilters,
  filterHunts,
  parseHuntFilters,
  serializeHuntFilters,
  type HuntFilters as HuntFilterState,
} from "@/lib/filters";
import type { Hunt } from "@/lib/schemas";
import { DEVICES, HUNT_FAMILIES, PLANES, PROTOCOL_NAMES, SEVERITIES, TELEMETRY_KEYS } from "@/lib/taxonomy";

function presentValues<T extends string>(knownValues: readonly T[], usedValues: Iterable<string>): readonly T[] {
  const used = new Set(usedValues);
  return knownValues.filter((value) => used.has(value));
}

export function deriveHuntFilterOptions(hunts: readonly Hunt[]): HuntFilterOptions {
  return {
    families: presentValues(HUNT_FAMILIES, hunts.map((hunt) => hunt.family)),
    devices: presentValues(DEVICES, hunts.flatMap((hunt) => hunt.devices)),
    protocols: presentValues(PROTOCOL_NAMES, hunts.flatMap((hunt) => hunt.protocols)),
    planes: presentValues(PLANES, hunts.flatMap((hunt) => hunt.planes)),
    severities: presentValues(SEVERITIES, hunts.map((hunt) => hunt.severity)),
    telemetry: presentValues(TELEMETRY_KEYS, hunts.flatMap((hunt) => [
      ...hunt.telemetry.recommended,
      ...hunt.telemetry.optional,
    ])),
  };
}

function withTrailingSlash(pathname: string) {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function HuntCatalog({ hunts }: { hunts: readonly Hunt[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseHuntFilters(new URLSearchParams(searchParams.toString()));
  const filteredHunts = filterHunts(hunts, filters);
  const options = deriveHuntFilterOptions(hunts);

  function setFilters(nextFilters: HuntFilterState) {
    const query = serializeHuntFilters(nextFilters).toString();
    const canonicalPath = withTrailingSlash(pathname);
    router.replace(query ? `${canonicalPath}?${query}` : canonicalPath, { scroll: false });
  }

  return (
    <div className="hunt-catalog">
      <HuntFilters filters={filters} options={options} onChange={setFilters} />
      <p className="hunt-catalog__count" aria-live="polite">
        {filteredHunts.length} {filteredHunts.length === 1 ? "hunt" : "hunts"}
      </p>
      {filteredHunts.length ? (
        <div className="hunt-grid">
          {filteredHunts.map((hunt) => <HuntCard hunt={hunt} key={hunt.slug} />)}
        </div>
      ) : (
        <section className="catalog-empty-state">
          <p className="eyebrow">No results</p>
          <h2>No hunts match these filters</h2>
          <p>Remove one or more filters to broaden the catalog.</p>
          <button className="button button--secondary" type="button" onClick={() => setFilters(emptyHuntFilters)}>
            Reset hunt filters
          </button>
        </section>
      )}
    </div>
  );
}

export function HuntCatalogFallback({ hunts }: { hunts: readonly Hunt[] }) {
  return (
    <div className="hunt-catalog hunt-catalog--fallback">
      <p className="hunt-catalog__loading">Catalog controls are loading. All hunts are available below.</p>
      <p className="hunt-catalog__count">{hunts.length} {hunts.length === 1 ? "hunt" : "hunts"}</p>
      <div className="hunt-grid">
        {hunts.map((hunt) => <HuntCard hunt={hunt} key={hunt.slug} />)}
      </div>
    </div>
  );
}
