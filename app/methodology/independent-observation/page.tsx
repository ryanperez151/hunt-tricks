import IndependentObservationContent from "@/content/methodology/independent-observation.mdx";
import { methodologyEntries } from "@/data/methodology";
import { createPageMetadata } from "@/lib/metadata";

const entry = methodologyEntries[2];

export const metadata = createPageMetadata({ title: entry.title, description: entry.summary, path: "/methodology/independent-observation/" });

export default function IndependentObservationPage() {
  return (
    <article className="methodology-page reading-width">
      <header className="methodology-context">
        <p className="eyebrow">Methodology · Corroboration</p>
        <p>{entry.summary}</p>
      </header>
      <IndependentObservationContent />
    </article>
  );
}
