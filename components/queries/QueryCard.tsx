import Link from "next/link";
import { CodeBlock } from "@/components/common/CodeBlock";
import { Tag } from "@/components/common/Tag";
import type { QueryDisplayRecord } from "@/components/queries/QueryLibrary";

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

export function labelFor(value: string) {
  return labels[value] ?? value.replaceAll("-", " ");
}

export function QueryCard({ query }: { query: QueryDisplayRecord }) {
  return (
    <article className="query-card" data-testid="query-card">
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
        {query.devices.length ? <div><dt>Devices</dt><dd>{query.devices.map((value) => <Tag key={value}>{labelFor(value)}</Tag>)}</dd></div> : null}
        {query.protocols.length ? <div><dt>Protocols</dt><dd>{query.protocols.map((value) => <Tag key={value}>{value}</Tag>)}</dd></div> : null}
        {query.telemetry.length ? <div><dt>Telemetry</dt><dd>{query.telemetry.map((value) => <Tag key={value}>{labelFor(value)}</Tag>)}</dd></div> : null}
        {query.techniques.length ? <div><dt>Techniques</dt><dd>{query.techniques.map((value) => <Tag key={value}>{value}</Tag>)}</dd></div> : null}
      </dl>
      <div className="query-card__strategy">
        <h3>Detection strategy</h3>
        <p>{query.detectionStrategy}</p>
      </div>
      <CodeBlock highlightedHtml={query.highlightedHtml} raw={query.query} />
    </article>
  );
}
