"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { labelFor, QueryCard } from "@/components/queries/QueryCard";
import {
  emptyQueryFilters,
  parseQueryFilters,
  queryFilterDefinitions,
  serializeQueryFilters,
  type QueryFilterOptions,
  type QueryFilters,
} from "@/lib/query-filters";
import type { TrustedHighlightedQueryHtml } from "@/lib/highlight";

export type QueryDisplayRecord = Readonly<{
  id: string;
  title: string;
  description: string;
  detectionStrategy: string;
  platform: string;
  query: string;
  highlightedHtml: TrustedHighlightedQueryHtml;
  huntSlug: string;
  huntTitle: string;
  family: string;
  devices: readonly string[];
  protocols: readonly string[];
  telemetry: readonly string[];
  techniques: readonly string[];
}>;

function unique(values: readonly string[]) {
  return [...new Set(values)];
}

function deriveOptions(queries: readonly QueryDisplayRecord[]): QueryFilterOptions {
  return {
    platforms: unique(queries.map((query) => query.platform)),
    families: unique(queries.map((query) => query.family)),
    protocols: unique(queries.flatMap((query) => query.protocols)),
    devices: unique(queries.flatMap((query) => query.devices)),
    telemetry: unique(queries.flatMap((query) => query.telemetry)),
    techniques: unique(queries.flatMap((query) => query.techniques)),
  };
}

function matches(selected: readonly string[], values: readonly string[]) {
  return selected.length === 0 || selected.some((value) => values.includes(value));
}

function filterQueries(queries: readonly QueryDisplayRecord[], filters: QueryFilters) {
  return queries.filter((query) => (
    matches(filters.platforms, [query.platform])
    && matches(filters.families, [query.family])
    && matches(filters.protocols, query.protocols)
    && matches(filters.devices, query.devices)
    && matches(filters.telemetry, query.telemetry)
    && matches(filters.techniques, query.techniques)
  ));
}

function replaceFilter(filters: QueryFilters, key: keyof QueryFilters, values: readonly string[]): QueryFilters {
  return { ...filters, [key]: values };
}

function withTrailingSlash(pathname: string) {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function QueryLibrary({ queries }: { queries: readonly QueryDisplayRecord[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const options = deriveOptions(queries);
  const filters = parseQueryFilters(new URLSearchParams(searchParams.toString()), options);
  const filteredQueries = filterQueries(queries, filters);
  const canonicalPath = withTrailingSlash(pathname);
  const activeFilters = queryFilterDefinitions.flatMap(([key, , singular]) => (
    filters[key].map((value) => ({ key, singular, value }))
  ));

  useEffect(() => {
    // The static fallback and filtered library have different layouts. Reveal
    // the fragment after hydration/navigation has committed the actual cards.
    let frame = 0;
    function revealQuery() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const fragment = window.location.hash.slice(1);
        if (!fragment.startsWith("query-")) return;
        const card = document.getElementById(fragment);
        card?.scrollIntoView({ block: "start" });
        card?.focus({ preventScroll: true });
      });
    }
    revealQuery();
    window.addEventListener("hashchange", revealQuery);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", revealQuery);
    };
  }, [searchParams]);

  function setFilters(nextFilters: QueryFilters) {
    const query = serializeQueryFilters(nextFilters, options).toString();
    router.push(query ? `${canonicalPath}?${query}` : canonicalPath, { scroll: false });
  }

  return (
    <div className="query-library">
      <section className="query-filters" aria-labelledby="query-filters-title">
        <div className="query-filters__heading">
          <div>
            <p className="eyebrow">Refine the library</p>
            <h2 id="query-filters-title">Query filters</h2>
          </div>
          <p>Values within one category broaden results. Populated categories combine to narrow them.</p>
        </div>
        <div className="query-filters__controls">
          {queryFilterDefinitions.map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <select
                aria-describedby="query-filter-guidance"
                multiple
                onChange={(event) => setFilters(replaceFilter(
                  filters,
                  key,
                  Array.from(event.currentTarget.selectedOptions, (option) => option.value),
                ))}
                value={[...filters[key]]}
              >
                {options[key].map((value) => <option key={value} value={value}>{labelFor(value)}</option>)}
              </select>
            </label>
          ))}
        </div>
        <p className="sr-only" id="query-filter-guidance">Select one or more values. With a keyboard or mouse, hold Control or Command while selecting. On a touch screen, tap each value.</p>
        {activeFilters.length ? (
          <div className="query-filters__active">
            <p>Active filters</p>
            <ul>
              {activeFilters.map(({ key, singular, value }) => (
                <li key={`${key}-${value}`}>
                  <button
                    aria-label={`Remove ${singular} ${labelFor(value)} filter`}
                    onClick={() => setFilters(replaceFilter(filters, key, filters[key].filter((item) => item !== value)))}
                    type="button"
                  >
                    {labelFor(value)} <span aria-hidden="true">×</span>
                  </button>
                </li>
              ))}
            </ul>
            <button className="query-filters__clear" onClick={() => setFilters(emptyQueryFilters)} type="button">
              Clear all filters
            </button>
          </div>
        ) : null}
      </section>

      <p className="query-library__count" aria-live="polite">
        {filteredQueries.length} {filteredQueries.length === 1 ? "query" : "queries"}
      </p>

      {filteredQueries.length ? (
        <div className="query-library__list">
          {filteredQueries.map((query) => <QueryCard key={query.id} query={query} />)}
        </div>
      ) : (
        <section className="catalog-empty-state">
          <p className="eyebrow">No results</p>
          <h2>No queries match these filters</h2>
          <p>Remove one or more filters to broaden the query library.</p>
          <button className="button button--secondary" onClick={() => setFilters(emptyQueryFilters)} type="button">
            Reset query filters
          </button>
        </section>
      )}
    </div>
  );
}

export function QueryLibraryFallback({ queries }: { queries: readonly QueryDisplayRecord[] }) {
  return (
    <div className="query-library query-library--fallback">
      <p className="hunt-catalog__loading">Library controls are loading. All queries are available below.</p>
      <p className="query-library__count">{queries.length} {queries.length === 1 ? "query" : "queries"}</p>
      <div className="query-library__list">
        {queries.map((query) => <QueryCard key={query.id} query={query} />)}
      </div>
    </div>
  );
}
