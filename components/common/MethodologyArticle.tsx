import Link from "next/link";
import { methodologyEntries, methodologySections } from "@/data/methodology";
import { researchEntries } from "@/lib/content";
import { displayLabel } from "@/lib/display-labels";
import { AttributionPrinciple } from "@/components/common/AttributionPrinciple";
import { AutomationTimeline } from "@/components/diagrams/AutomationTimeline";
export function MethodologyArticle({ slug }: { slug: string }) {
  const entry = methodologyEntries.find((item) => item.id === `methodology-${slug}`)!;
  return <article className="methodology-page reading-width"><header className="page-header"><p className="eyebrow">Methodology · hunt-tricks</p>
      <h1>{entry.title}</h1>
      <p>{entry.summary}</p>
      </header>
    {slug === "velocity" && <AttributionPrinciple />}
    {methodologySections[slug].map((section) => <section className="methodology-section" key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {section.sourceIds.map((id) => { const source = researchEntries.find((item) => item.id === id)!; return <aside className="methodology-citation" key={id}><p><span className="eyebrow">{displayLabel(source.evidenceType)} · {source.publishedAt}</span><br /><a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">{source.title} ↗</a></p>
      <Link href={`/research/#${id}`}>Source context and limitations →</Link></aside>; })}
    </section>)}
    {slug === "velocity" && <><section className="methodology-section"><h2>Keep a long-window view</h2>
      <p>MITRE ATT&amp;CK documents password spraying that spreads attempts over time. A short burst view alone can miss the cumulative pattern; compare both windows with the account and workload context.</p>
      <a href="https://attack.mitre.org/techniques/T1110/003/" target="_blank" rel="noopener noreferrer">MITRE ATT&amp;CK T1110.003 · Framework guidance ↗</a></section>
      <AutomationTimeline /></>}
    <nav className="methodology-links" aria-label="Methodology"><h2>Continue the method</h2>
      <ul>{methodologyEntries.filter((item) => item.id !== entry.id).map((item) => <li key={item.id}><Link href={`${item.route}/`}>{item.title}</Link></li>)}</ul><Link className="button button--secondary" href="/hunts/">Test a hypothesis in the hunt catalog</Link></nav>
  </article>;
}
