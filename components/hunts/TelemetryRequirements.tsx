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

export function TelemetryRequirements({ recommended, optional }: { recommended: readonly string[]; optional: readonly string[] }) {
  return (
    <section aria-labelledby="telemetry-requirements-title" className="telemetry-requirements">
      <h2 id="telemetry-requirements-title">Telemetry requirements</h2>
      <div className="telemetry-requirements__groups">
        <div><h3>Recommended</h3><ul>{recommended.map((key) => <li key={key}>{labelFor(key)}</li>)}</ul></div>
        {optional.length ? <div><h3>Optional</h3><ul>{optional.map((key) => <li key={key}>{labelFor(key)}</li>)}</ul></div> : null}
      </div>
    </section>
  );
}
