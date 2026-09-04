import Link from "next/link";
import { SeverityBadge } from "@/components/common/SeverityBadge";
import { Tag } from "@/components/common/Tag";
import { huntFamilies } from "@/data/families";
import type { Hunt } from "@/lib/schemas";

export function HuntHeader({ hunt }: { hunt: Hunt }) {
  const family = huntFamilies.find((candidate) => candidate.id === hunt.family);
  const planeLabel = hunt.planes.length === 1 ? "Plane" : "Planes";

  return (
    <header className="hunt-header">
      <Link className="hunt-header__back" href="/hunts/">← Hunt catalog</Link>
      <p className="eyebrow">{family?.label ?? hunt.family}</p>
      <h1>{hunt.title}</h1>
      <p className="hunt-header__summary">{hunt.summary}</p>
      <div className="hunt-header__classification" aria-label="Hunt classification">
        <SeverityBadge severity={hunt.severity} />
        <Tag>Confidence: {hunt.confidence}</Tag>
        <Tag>{planeLabel}: {hunt.planes.join(", ")}</Tag>
      </div>
      <dl className="hunt-header__scope" aria-label="Hunt scope">
        <div>
          <dt>Devices</dt>
          <dd>{hunt.devices.map((device) => <Tag key={device}>{device}</Tag>)}</dd>
        </div>
        <div>
          <dt>Protocols</dt>
          <dd>{hunt.protocols.map((protocol) => <Tag key={protocol}>{protocol}</Tag>)}</dd>
        </div>
      </dl>
    </header>
  );
}
