import type { Telemetry } from "@/lib/schemas";

const telemetryLabels: Record<string, string> = {
  "netflow-ipfix": "NetFlow / IPFIX",
  dns: "DNS",
  aaa: "AAA",
  "configuration-diffs": "Configuration diffs",
  "cli-audit": "CLI audit",
  zeek: "Zeek",
  "packet-capture": "Packet capture",
  syslog: "Syslog",
};

function labelFor(key: string) {
  return telemetryLabels[key] ?? key.replaceAll("-", " ");
}

type TelemetrySummary = Pick<Telemetry, "key" | "name" | "investigationContribution">;

function TelemetryList({ keys, sources }: { keys: readonly string[]; sources: readonly TelemetrySummary[] }) {
  return <ul>{keys.map((key) => {
    const source = sources.find((candidate) => candidate.key === key);
    return <li key={key}><strong>{source?.name ?? labelFor(key)}</strong>{source ? <p>{source.investigationContribution}</p> : null}</li>;
  })}</ul>;
}

export function TelemetryRequirements({ recommended, optional, sources = [] }: { recommended: readonly string[]; optional: readonly string[]; sources?: readonly TelemetrySummary[] }) {
  return (
    <section aria-labelledby="telemetry-requirements-title" className="telemetry-requirements">
      <h2 id="telemetry-requirements-title">Telemetry requirements</h2>
      <div className="telemetry-requirements__groups">
        <div><h3>Recommended</h3><TelemetryList keys={recommended} sources={sources} /></div>
        {optional.length ? <div><h3>Optional</h3><TelemetryList keys={optional} sources={sources} /></div> : null}
      </div>
    </section>
  );
}
