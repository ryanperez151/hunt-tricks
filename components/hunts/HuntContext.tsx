import Link from "next/link";
import { AttributionPrinciple } from "@/components/common/AttributionPrinciple";
import { displayLabel } from "@/lib/display-labels";
import type { Hunt } from "@/lib/schemas";
export function HuntContext({ hunt }: { hunt: Hunt }) {
  return <>
    {hunt.temporalPatterns.length > 0 && <section className="hunt-detail__section"><p className="eyebrow">{hunt.temporalPatterns.map(displayLabel).join(" · ")}</p>
      <h2>Temporal interpretation</h2>
      <p>{hunt.temporal.interpretation}</p>
      <h3>Comparable baseline</h3>
      <p>{hunt.temporal.baseline}</p>{hunt.temporal.confounders.length > 0 && <><h3>Timing confounders</h3>
      <ul>{hunt.temporal.confounders.map((item) => <li key={item}>{item}</li>)}</ul></>}</section>}
    {(hunt.temporalPatterns.length > 0 || hunt.aiRoles.length > 0) && <AttributionPrinciple />}
    {hunt.aiRoles.length > 0 && <section className="hunt-detail__section"><h2>AI-role context</h2>
      <p>{hunt.aiRoles.map(displayLabel).join(" · ")}</p>
      <p>These roles describe the hunt’s content perspective, not attribution of an observed event. Automation, adaptation, AI involvement, and malicious intent are separate questions.</p>
      <p>Where authorized, correlate agent run IDs, model gateway requests, tool-call lineage, and independently observed target actions. Visibility depends on permissions, architecture, logging, instructions, and operational choices. Sparse or missing traces leave AI involvement unknown.</p>
      <Link href="/methodology/ai-autonomy/">Investigate AI and autonomy →</Link></section>}
  </>;
}
