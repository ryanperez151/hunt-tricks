import Link from "next/link";
import { displayLabel } from "@/lib/display-labels";
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
        {hunt.planes.length > 0 && <Tag>{planeLabel}: {hunt.planes.join(", ")}</Tag>}
      </div>
      <dl className="hunt-header__scope" aria-label="Hunt scope"><div><dt>Scope</dt><dd>{hunt.scopes.map((scope) => <Tag key={scope}>{displayLabel(scope)}</Tag>)}</dd></div>{hunt.behaviors.length > 0 && <div><dt>Behavior</dt><dd>{hunt.behaviors.map((behavior) => <Tag key={behavior}>{displayLabel(behavior)}</Tag>)}</dd></div>}
        {hunt.devices.length > 0 && <div>
          <dt>Devices</dt>
          <dd>{hunt.devices.map((device) => <Tag key={device}>{device}</Tag>)}</dd>
        </div>}
        {hunt.protocols.length > 0 && <div>
          <dt>Protocols</dt>
          <dd>{hunt.protocols.map((protocol) => <Tag key={protocol}>{protocol}</Tag>)}</dd>
        </div>}
      </dl>
    </header>
  );
}
