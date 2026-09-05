import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProtocolFlowDiagram } from "@/components/diagrams/ProtocolFlowDiagram";
import { getRelatedHunts } from "@/lib/content";
import {
  getProtocolRouteMetadata,
  getProtocolStaticParams,
  resolveProtocolRoute,
} from "@/lib/protocol-routes";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getProtocolStaticParams()];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const metadata = getProtocolRouteMetadata(slug);
  if (!metadata) return { title: "Protocol not found" };
  return createPageMetadata({
    title: metadata.title,
    description: metadata.description,
    path: `/protocols/${slug}/`,
    type: "article",
  });
}

function TextList({ items }: { items: readonly string[] }) {
  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

export default async function ProtocolDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const protocol = resolveProtocolRoute(slug);
  if (!protocol) notFound();
  const relatedHunts = getRelatedHunts(protocol);

  return (
    <article className="protocol-detail reading-width">
      <header className="protocol-header">
        <Link className="protocol-header__back" href="/protocols/">← Protocol catalog</Link>
        <p className="eyebrow">{protocol.category}</p>
        <h1>{protocol.name}</h1>
        <p className="protocol-header__port">{protocol.portOrEncapsulation}</p>
      </header>

      <section className="protocol-detail__section">
        <h2>Definition</h2>
        <p>{protocol.definition}</p>
      </section>
      <section className="protocol-detail__section">
        <h2>Infrastructure use</h2>
        <TextList items={protocol.infrastructureUses} />
      </section>
      <section className="protocol-detail__section">
        <h2>Expected direction</h2>
        <p>{protocol.expectedDirection}</p>
      </section>
      <section className="protocol-detail__section">
        <h2>Suspicious behavior</h2>
        <TextList items={protocol.suspiciousPatterns} />
      </section>
      <section className="protocol-detail__section">
        <h2>Attacker abuse</h2>
        <TextList items={protocol.attackerAbuse} />
      </section>

      <section className="protocol-detail__section">
        <h2>Normal and suspicious flows</h2>
        <div className="protocol-detail__flows">
          <div>
            <ProtocolFlowDiagram {...protocol.normalFlow} />
          </div>
          <div className="protocol-detail__flow--suspicious">
            <ProtocolFlowDiagram {...protocol.suspiciousFlow} />
          </div>
        </div>
      </section>

      <section className="protocol-detail__section">
        <h2>Related hunts</h2>
        {relatedHunts.length ? (
          <ul className="related-links">
            {relatedHunts.map((hunt) => (
              <li key={hunt.slug}><Link href={`/hunts/${hunt.slug}/`}>{hunt.title}</Link></li>
            ))}
          </ul>
        ) : <p>No launch hunts are currently linked to this protocol.</p>}
      </section>
    </article>
  );
}
