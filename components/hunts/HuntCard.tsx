import { SeverityBadge } from "@/components/common/SeverityBadge";
import { Tag } from "@/components/common/Tag";
import { huntFamilies } from "@/data/families";
import type { Hunt } from "@/lib/schemas";

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

export function HuntCard({ hunt, headingLevel = 2 }: { hunt: Hunt; headingLevel?: 2 | 3 }) {
  const family = huntFamilies.find((candidate) => candidate.id === hunt.family);
  const telemetry = [...hunt.telemetry.recommended, ...hunt.telemetry.optional];
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <a className="hunt-card" href={`/hunts/${hunt.slug}/`}>
      <article>
        <div className="hunt-card__header">
          <p className="eyebrow">{family?.label ?? hunt.family}</p>
          <SeverityBadge severity={hunt.severity} />
        </div>
        <Heading>{hunt.title}</Heading>
        <p className="hunt-card__summary">{hunt.summary}</p>
        <dl className="hunt-card__metadata">
          <div>
            <dt>Protocols</dt>
            <dd>{hunt.protocols.map((protocol) => <Tag key={protocol}>{protocol}</Tag>)}</dd>
          </div>
          <div>
            <dt>Telemetry</dt>
            <dd>{telemetry.map((key) => <Tag key={key}>{telemetryLabels[key] ?? key}</Tag>)}</dd>
          </div>
          <div>
            <dt>Devices</dt>
            <dd>{hunt.devices.map((device) => <Tag key={device}>{device}</Tag>)}</dd>
          </div>
        </dl>
      </article>
    </a>
  );
}
