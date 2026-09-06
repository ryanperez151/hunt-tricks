"use client";

import { displayLabel } from "@/lib/display-labels";
import { emptyHuntFilters, type HuntFilters as HuntFilterState } from "@/lib/filters";

export type HuntFilterOptions = {
  readonly [Key in keyof HuntFilterState]: HuntFilterState[Key];
};

type HuntFiltersProps = {
  filters: HuntFilterState;
  options: HuntFilterOptions;
  onChange: (filters: HuntFilterState) => void;
};

const definitions = [
  ["scopes", "Scope"],
  ["behaviors", "Behavior"],
  ["temporalPatterns", "Temporal pattern"],
  ["aiRoles", "AI role"],
  ["families", "Family"],
  ["devices", "Device"],
  ["protocols", "Protocol"],
  ["planes", "Plane"],
  ["severities", "Severity"],
  ["telemetry", "Telemetry"],
] as const satisfies ReadonlyArray<readonly [keyof HuntFilterState, string]>;

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
  return labels[value] ?? displayLabel(value);
}

function replaceCategory(
  filters: HuntFilterState,
  key: keyof HuntFilterState,
  values: readonly string[],
): HuntFilterState {
  return { ...filters, [key]: values } as HuntFilterState;
}

export function HuntFilters({ filters, options, onChange }: HuntFiltersProps) {
  const activeFilters = definitions.flatMap(([key, singular]) => (
    filters[key].map((value) => ({ key, singular: singular.toLowerCase(), value }))
  ));

  return (
    <section className="hunt-filters" aria-labelledby="hunt-filters-title">
      <div className="hunt-filters__heading">
        <div>
          <p className="eyebrow">Refine the catalog</p>
          <h2 id="hunt-filters-title">Hunt filters</h2>
        </div>
        <p>Select one or more values. Categories combine to narrow the results.</p>
      </div>
      <div className="hunt-filters__controls">
        {definitions.slice(0, 4).map(([key, label]) => (
          <label key={key}>
            <span>{label}</span>
            <select
              aria-describedby="hunt-filter-guidance"
              multiple
              onChange={(event) => onChange(replaceCategory(
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
      <p className="filter-perspective">AI role describes the content perspective: defender assistance, attacker capability, or AI attack surface. It is not an attribution result about an observed event.</p>
      <details className="advanced-filters"><summary>Infrastructure and advanced filters</summary>
      <div className="hunt-filters__controls">
        {definitions.slice(4).map(([key, label]) => (
          <label key={key}>
            <span>{label}</span>
            <select
              aria-describedby="hunt-filter-guidance"
              multiple
              onChange={(event) => onChange(replaceCategory(
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
      </details>
      <p className="sr-only" id="hunt-filter-guidance">Hold Control or Command to select more than one value.</p>
      {activeFilters.length ? (
        <div className="hunt-filters__active">
          <p>Active filters</p>
          <ul>
            {activeFilters.map(({ key, singular, value }) => (
              <li key={`${key}-${value}`}>
                <button
                  type="button"
                  aria-label={`Remove ${singular} ${value} filter`}
                  onClick={() => onChange(replaceCategory(filters, key, filters[key].filter((item) => item !== value)))}
                >
                  {labelFor(value)} <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
          <button className="hunt-filters__clear" type="button" onClick={() => onChange(emptyHuntFilters)}>Clear all filters</button>
        </div>
      ) : null}
    </section>
  );
}
