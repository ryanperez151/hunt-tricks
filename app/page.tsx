import Link from "next/link";
import { AttributionPrinciple } from "@/components/common/AttributionPrinciple";
import { SectionHeading } from "@/components/common/SectionHeading";
import { HuntCard } from "@/components/hunts/HuntCard";
import { homeContent } from "@/data/home";
import { hunts, researchEntries, telemetrySources } from "@/lib/content";
import { SCOPES } from "@/lib/taxonomy";
import { displayLabel } from "@/lib/display-labels";
import { createPageMetadata } from "@/lib/metadata";
export const metadata = createPageMetadata({ title: "hunt-tricks", description: "A research-backed workbench for suspicious behavior across identities, systems, and AI.", path: "/" });
export default function HomePage() {
  const featured = ["snmp-fan-out", "distributed-password-spray", "agent-tool-scope-escalation"].map((slug) => hunts.find((hunt) => hunt.slug === slug)!);
  const historical = researchEntries.filter((entry) => ["research-bro-1998", "research-slammer-2003"].includes(entry.id));
  return <div className="home-page">
    <section className="workbench-hero workspace-width" aria-labelledby="page-title">
      <div><p className="eyebrow">hunt-tricks / defensive field guide</p>
      <h1 id="page-title">Hunt the behavior.<br /><span>Follow the change.</span></h1>
      <p className="hero__lede">{homeContent.heroCopy}</p>
      <div className="hero__actions"><Link className="button button--primary" href="/hunts/">Explore Hunts</Link><Link className="button button--secondary" href="/methodology/behavior/">Start with behavior →</Link></div>
      </div>
      <aside className="workbench-sequence" aria-label="Investigation workflow"><p className="eyebrow">From signal to evidence</p>
      <ol>{["Choose a scope", "Examine the behavior", "Follow the sequence", "Test the hypothesis"].map((step, index) => <li key={step}><span>0{index + 1}</span>{step}</li>)}</ol>
      <p>Telemetry → query → investigation → evidence</p>
      </aside>
      <dl className="workbench-counts"><div><dt>Operational hunts</dt><dd>{hunts.length}</dd></div>
      <div><dt>Scopes</dt><dd>{SCOPES.length}</dd></div>
      <div><dt>Research sources</dt><dd>{researchEntries.length}</dd></div>
      <div><dt>Telemetry sources</dt><dd>{telemetrySources.length}</dd></div>
      </dl>
    </section>
    <div className="workspace-width"><AttributionPrinciple /></div>
    <section className="home-section workspace-width"><SectionHeading eyebrow="01 / Choose your environment">Start with a scope</SectionHeading><div className="scope-grid">{SCOPES.map((scope, index) => { const scoped = hunts.filter((hunt) => hunt.scopes.includes(scope)); return <Link aria-label={`Browse ${displayLabel(scope)} hunts`} className="scope-card" href={`/hunts/?scope=${scope}`} key={scope}><span className="scope-card__index">{String(index + 1).padStart(2, "0")} / {scoped.length} hunts</span><h3>{displayLabel(scope)}</h3>
      <p>{scoped[0].title}</p>
      <span aria-hidden="true" className="scope-card__arrow">↗</span></Link>; })}</div>
      </section>
    <section className="home-section workspace-width"><SectionHeading eyebrow="02 / Build the interpretation">Behavior before attribution</SectionHeading><div className="method-grid"><Link href="/methodology/behavior/"><span className="eyebrow">Role · relationship · sequence</span><h3>What changed?</h3>
      <p>Establish an expectation. Reconstruct the action and its consequences.</p>
      </Link><Link href="/methodology/velocity/"><span className="eyebrow">Rate · latency · long windows</span><h3>How did it unfold?</h3>
      <p>Compare timing with the workload and explore synthetic automation sequences.</p>
      </Link><Link href="/methodology/ai-autonomy/"><span className="eyebrow">Provenance · tools · outcomes</span><h3>What can you corroborate?</h3>
      <p>Separate automation, adaptation, AI involvement, and intent.</p>
      </Link></div>
      </section>
    <section className="home-section workspace-width"><SectionHeading eyebrow="03 / Open a working hypothesis">Featured hunts</SectionHeading><div className="hunt-grid hunt-grid--featured">{featured.map((hunt) => <HuntCard headingLevel={3} hunt={hunt} key={hunt.slug} />)}</div>
      </section>
    <section className="home-section workspace-width"><SectionHeading eyebrow="04 / Learn from the record">Old mechanisms. Current questions.</SectionHeading><div className="method-grid">{historical.map((entry) => <Link key={entry.id} href={`/research/#${entry.id}`}><span className="eyebrow">{entry.publishedAt} · historical research</span><h3>{entry.title}</h3>
      <p>{entry.summary}</p>
      </Link>)}<Link href="/about/#infrastructure"><span className="eyebrow">Infrastructure fieldcraft</span><h3>Infrastructure is a host</h3>
      <p>Distinguish appliance-originated traffic from transit. Retain the management, control, and data-plane context.</p>
      </Link></div>
      </section>
  </div>;
}
