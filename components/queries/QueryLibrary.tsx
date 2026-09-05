"use client";

import { useState } from "react";
import Link from "next/link";
import { CodeBlock } from "@/components/common/CodeBlock";
import { Tag } from "@/components/common/Tag";
import type { TrustedHighlightedQueryHtml } from "@/lib/highlight";

export type QueryDisplayRecord = Readonly<{
  id: string;
  title: string;
  description: string;
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

type QueryFilters = {
  platforms: readonly string[];
  families: readonly string[];
  protocols: readonly string[];
  devices: readonly string[];
  telemetry: readonly string[];
  techniques: readonly string[];
};

const filterDefinitions = [
  ["platforms", "Platform", "platform"],
  ["families", "Family", "family"],
  ["protocols", "Protocol", "protocol"],
  ["devices", "Device", "device"],
  ["telemetry", "Telemetry", "telemetry"],
  ["techniques", "Technique", "technique"],
] as const satisfies ReadonlyArray<readonly [keyof QueryFilters, string, string]>;

const emptyQueryFilters: QueryFilters = {
  platforms: [],
  families: [],
  protocols: [],
  devices: [],
  telemetry: [],
  techniques: [],
};

const labels: Record<string, string> = {
  "management-plane-c2": "Management-Plane C2",
  "infrastructure-lateral-movement": "Infrastructure Lateral Movement",
  "discovery-credential-access": "Discovery & Credential Access",
  "traffic-manipulation": "Traffic Manipulation",
  "netflow-ipfix": "NetFlow / IPFIX",
  "configuration-diffs": "Configuration diffs",
  "cli-audit": "CLI audit",
  "packet-capture": "Packet capture",
};

function labelFor(value: string) {
  return labels[value] ?? value.replaceAll("-", " ");
}

function unique(values: readonly string[]) {
  return [...new Set(values)];
}

function deriveOptions(queries: readonly QueryDisplayRecord[]): QueryFilters {
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

export function QueryLibrary({ queries }: { queries: readonly QueryDisplayRecord[] }) {
  const [filters, setFilters] = useState<QueryFilters>(emptyQueryFilters);
  const options = deriveOptions(queries);
  const filteredQueries = filterQueries(queries, filters);
  const activeFilters = filterDefinitions.flatMap(([key, , singular]) => (
    filters[key].map((value) => ({ key, singular, value }))
  ));

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
          {filterDefinitions.map(([key, label]) => (
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
        <p className="sr-only" id="query-filter-guidance">Hold Control or Command to select more than one value.</p>
        {activeFilters.length ? (
          <div className="query-filters__active">
            <p>Active filters</p>
            <ul>
              {activeFilters.map(({ key, singular, value }) => (
                <li key={`${key}-${value}`}>
                  <button
                    aria-label={`Remove ${singular} ${value} filter`}
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
          {filteredQueries.map((query) => (
            <article className="query-card" data-testid="query-card" key={query.id}>
              <header className="query-card__heading">
                <div>
                  <p className="eyebrow">{query.platform.toUpperCase()}</p>
                  <h2>{query.title}</h2>
                  <p className="query-card__context">
                    From <Link href={`/hunts/${query.huntSlug}/`}>{query.huntTitle}</Link>
                  </p>
                </div>
                <p>{query.description}</p>
              </header>
              <dl className="query-card__metadata">
                <div><dt>Family</dt><dd><Tag>{labelFor(query.family)}</Tag></dd></div>
                <div><dt>Devices</dt><dd>{query.devices.map((value) => <Tag key={value}>{labelFor(value)}</Tag>)}</dd></div>
                <div><dt>Protocols</dt><dd>{query.protocols.map((value) => <Tag key={value}>{value}</Tag>)}</dd></div>
                <div><dt>Telemetry</dt><dd>{query.telemetry.map((value) => <Tag key={value}>{labelFor(value)}</Tag>)}</dd></div>
                {query.techniques.length ? <div><dt>Techniques</dt><dd>{query.techniques.map((value) => <Tag key={value}>{value}</Tag>)}</dd></div> : null}
              </dl>
              <CodeBlock highlightedHtml={query.highlightedHtml} raw={query.query} />
            </article>
          ))}
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
