import Link from "next/link";
import { protocols } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";
import { getProtocolHref } from "@/lib/protocol-routes";

export const metadata = createPageMetadata({
  title: "Protocol Behavior Catalog",
  description: "Compare the expected direction, infrastructure purpose, suspicious use, and attacker abuse of twenty-four network protocols.",
  path: "/protocols/",
});

export default function ProtocolsPage() {
  return (
    <div className="protocol-catalog-page workspace-width">
      <header className="page-header">
        <p className="eyebrow">Directional dependency guide</p>
        <h1>Protocol behavior catalog</h1>
        <p>Start with who initiated the connection and what role the appliance played. A familiar protocol becomes investigative evidence when its direction, peer, timing, or purpose departs from the approved dependency model.</p>
        <p className="page-header__count">{protocols.length} protocol profiles</p>
      </header>
      <div className="protocol-grid">
        {protocols.map((protocol) => (
          <article className="protocol-card" key={protocol.slug}>
            <p className="eyebrow">{protocol.category}</p>
            <h2>
              <Link href={getProtocolHref(protocol.slug)!}>{protocol.name}</Link>
            </h2>
            <p className="protocol-card__port">{protocol.portOrEncapsulation}</p>
            <p>{protocol.definition}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
