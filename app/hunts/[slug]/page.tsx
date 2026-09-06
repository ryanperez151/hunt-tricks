import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { HuntEvidence } from "@/components/hunts/HuntEvidence";
import { HuntContext } from "@/components/hunts/HuntContext";
import { OriginMatters } from "@/components/common/OriginMatters";
import { BehaviorComparison } from "@/components/hunts/BehaviorComparison";
import { HuntCard } from "@/components/hunts/HuntCard";
import { HuntHeader } from "@/components/hunts/HuntHeader";
import { HuntQuery } from "@/components/hunts/HuntQuery";
import { InvestigationChecklist } from "@/components/hunts/InvestigationChecklist";
import { TelemetryRequirements } from "@/components/hunts/TelemetryRequirements";
import { highlightQuery } from "@/lib/highlight";
import {
  getHuntRouteMetadata,
  getHuntStaticParams,
  resolveHuntRoute,
  type HuntRoute,
} from "@/lib/hunt-routes";
import { getRelatedHunts, telemetrySources, type Hunt } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [...getHuntStaticParams()];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = resolveHuntRoute(slug);
  const metadata = getHuntRouteMetadata(slug);
  if (!route || !metadata) return { title: "Hunt not found" };

  return createPageMetadata({
    title: metadata.title,
    description: metadata.description,
    path: `/hunts/${slug}/`,
    type: route.kind === "hunt" ? "article" : "website",
  });
}

function FamilyPage({ route }: { route: Extract<HuntRoute, { kind: "family" }> }) {
  return (
    <div className="family-page workspace-width">
      <header className="page-header">
        <Link href="/hunts/">← Hunt catalog</Link>
        <p className="eyebrow">Hunt family</p>
        <h1>{route.family.label}</h1>
        <p>{route.family.objective}</p>
        <p className="page-header__count">{route.hunts.length} operational hunts</p>
      </header>
      <div className="hunt-grid">
        {route.hunts.map((hunt) => <HuntCard hunt={hunt} key={hunt.slug} />)}
      </div>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="hunt-detail__section">
      <h2>{title}</h2>
      {items.length ? <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p>No specific items are defined for this hunt.</p>}
    </section>
  );
}

function BehaviorSection({ hunt }: { hunt: Hunt }) {
  const signals = (
    <div className="behavior-signals">
      {hunt.expectedBehavior?.length ? <div><h3>Expected behavior</h3><ul>{hunt.expectedBehavior.map((item) => <li key={item}>{item}</li>)}</ul></div> : null}
      <div><h3>Suspicious behavior</h3><ul>{hunt.suspiciousBehavior.map((item) => <li key={item}>{item}</li>)}</ul></div>
    </div>
  );

  return hunt.behaviorComparison ? (
    <div className="hunt-detail__behavior">
      <BehaviorComparison {...hunt.behaviorComparison} />
      {signals}
    </div>
  ) : (
    <section className="hunt-detail__section hunt-detail__behavior">
      <h2>Behavior comparison</h2>
      {signals}
    </section>
  );
}

async function HuntDetailPage({ hunt }: { hunt: Hunt }) {
  const highlightedQueries = await Promise.all(hunt.queries.map((query) => highlightQuery(query.query, query.platform)));
  const relatedHunts = getRelatedHunts(hunt);

  return (
    <article className="hunt-detail reading-width">
      <HuntHeader hunt={hunt} />
      <section className="hunt-detail__hypothesis">
        <p className="eyebrow">Working theory</p>
        <h2>Hunt hypothesis</h2>
        <p>{hunt.hypothesis}</p>
      </section>
      {hunt.showOriginMatters ? <OriginMatters /> : null}
      <BehaviorSection hunt={hunt} />
      <HuntContext hunt={hunt} />
      <section className="hunt-detail__section">
        <h2>Why this matters</h2>
        <p>{hunt.rationale}</p>
      </section>
      <TelemetryRequirements {...hunt.telemetry} sources={telemetrySources} />
      {hunt.requiredFields.length > 0 && <ListSection title="Required fields" items={hunt.requiredFields} />}
      <section className="hunt-detail__section">
        <h2>Detection strategy</h2>
        <p>{hunt.detectionStrategy}</p>
      </section>
      <section className="hunt-detail__queries">
        <h2>Example queries</h2>
        <div className="hunt-detail__query-list">
          {hunt.queries.map((query, index) => <HuntQuery highlightedHtml={highlightedQueries[index]} key={`${query.platform}-${query.title}`} query={query} />)}
        </div>
      </section>
      <InvestigationChecklist steps={hunt.investigationSteps} />
      <ListSection title="Escalation conditions" items={hunt.escalationConditions} />
      <section className="hunt-detail__section hunt-detail__two-column">
        <h2>False positives and enrichment</h2>
        <div><h3>Likely false positives</h3><ul>{hunt.falsePositives.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <div><h3>Useful enrichment</h3><ul>{hunt.enrichment.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>
      {hunt.limitations.length > 0 && <ListSection title="Limitations" items={hunt.limitations} />}
      <HuntEvidence evidence={hunt.evidence} />
      <ListSection title="ATT&CK techniques" items={hunt.techniques} />
      <section className="hunt-detail__section">
        <h2>Related hunts</h2>
        {relatedHunts.length ? <ul className="related-links">{relatedHunts.map((related) => <li key={related.slug}><Link aria-label={`Related hunt: ${related.title}`} href={`/hunts/${related.slug}/`}>{related.title}</Link></li>)}</ul> : <p>No related hunts are defined.</p>}
      </section>
      <section className="hunt-detail__section">
        <h2>References</h2>
        <ul className="reference-links">{hunt.references.map((reference) => <li key={reference.url}><a href={reference.url} rel="noreferrer noopener" target="_blank">{reference.title}</a></li>)}</ul>
      </section>
    </article>
  );
}

export default async function HuntRoutePage({ params }: PageProps) {
  const { slug } = await params;
  const route = resolveHuntRoute(slug);
  if (!route) notFound();

  return route.kind === "family" ? <FamilyPage route={route} /> : HuntDetailPage({ hunt: route.hunt });
}
