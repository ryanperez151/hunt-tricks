"use client";

import { useId, useState } from "react";
import type { Telemetry } from "@/lib/schemas";

type TelemetryMatrixProps = {
  sources: readonly Telemetry[];
};

const coverageColumns = [
  ["c2", "C2"],
  ["lateralMovement", "Lateral movement"],
  ["discovery", "Discovery"],
  ["manipulation", "Manipulation"],
] as const;

function Coverage({ source, dimension, label }: {
  source: Telemetry;
  dimension: (typeof coverageColumns)[number][0];
  label: string;
}) {
  const level = source.coverage[dimension];
  return (
    <span
      aria-label={`${source.name} ${label} coverage: ${level}`}
      className={`telemetry-coverage telemetry-coverage--${level}`}
    >
      {level[0].toUpperCase() + level.slice(1)}
    </span>
  );
}

export function TelemetryMatrix({ sources }: TelemetryMatrixProps) {
  const instanceId = useId().replaceAll(":", "");
  const [expandedSources, setExpandedSources] = useState<ReadonlySet<string>>(() => new Set());

  function toggleSource(id: string) {
    setExpandedSources((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="telemetry-matrix-scroll" role="region" aria-label="Telemetry coverage matrix. Scroll horizontally to view all coverage columns." tabIndex={0}>
      <table className="telemetry-matrix" aria-label="Telemetry coverage">
        <thead>
          <tr>
            <th scope="col">Source</th>
            {coverageColumns.map(([, label]) => <th key={label} scope="col">{label}</th>)}
          </tr>
        </thead>
        {sources.map((source) => {
          const expanded = expandedSources.has(source.id);
          const detailsId = `${instanceId}-${source.id}-details`;
          return (
            <tbody key={source.id}>
              <tr>
                <th scope="row">
                  <button
                    aria-controls={detailsId}
                    aria-expanded={expanded}
                    className="telemetry-matrix__trigger"
                    onClick={() => toggleSource(source.id)}
                    type="button"
                  >
                    <span>{source.name}</span>
                    <span aria-hidden="true">{expanded ? "−" : "+"}</span>
                  </button>
                </th>
                {coverageColumns.map(([dimension, label]) => (
                  <td key={dimension}><Coverage dimension={dimension} label={label} source={source} /></td>
                ))}
              </tr>
              <tr className="telemetry-matrix__detail-row" hidden={!expanded}>
                <td colSpan={5}>
                  <div
                    aria-label={`${source.name} collection and investigation guidance`}
                    hidden={!expanded}
                    id={detailsId}
                    role="region"
                  >
                    <p>{source.summary}</p>
                    <div className="telemetry-matrix__detail-grid">
                      <section>
                        <h3>Collection guidance</h3>
                        <p>{source.collectionGuidance}</p>
                      </section>
                      <section>
                        <h3>Investigation contribution</h3>
                        <p>{source.investigationContribution}</p>
                      </section>
                      <section>
                        <h3>Limitations</h3>
                        <p>{source.limitations}</p>
                      </section>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
