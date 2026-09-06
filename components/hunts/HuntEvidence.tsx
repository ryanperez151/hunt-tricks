import Link from "next/link";
import { researchEntries } from "@/lib/content";
import { displayLabel } from "@/lib/display-labels";
import type { Hunt } from "@/lib/schemas";
export function HuntEvidence({ evidence }: { evidence: Hunt["evidence"] }) {
  if (!evidence.length) return null;
  return <section className="hunt-detail__section hunt-evidence" aria-labelledby="hunt-evidence-title">
    <h2 id="hunt-evidence-title">Claim-linked evidence</h2>
    <p>Source observations describe what a report, experiment, or framework supports. Editorial hypotheses apply that evidence to an investigation; they are not findings about your environment.</p>
    {evidence.map((item) => <div className={`evidence-claim evidence-claim--${item.kind}`} key={item.claim}>
      <p className="eyebrow">{item.kind === "observation" ? "Source observation" : "Editorial hypothesis"}</p>
      <p>{item.claim}</p>
      {item.sourceIds.map((id) => {
        const source = researchEntries.find((entry) => entry.id === id)!;
        return <div className="evidence-source" key={id}><p><Link href={`/research/#${id}`}>{source.title}</Link></p>
          <p className="evidence-source__meta">{source.organization} · <time dateTime={source.publishedAt}>{source.publishedAt}</time> · {displayLabel(source.evidenceType)}</p>
          <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">Read primary source ↗</a>
          {source.limitations.length > 0 && <div><strong>Source limitations</strong><ul>{source.limitations.map((limit) => <li key={limit}>{limit}</li>)}</ul></div>}
        </div>;
      })}
    </div>)}
  </section>;
}
