import type { Metadata } from "next";
import IndependentObservationContent from "@/content/methodology/independent-observation.mdx";
import { methodologyEntries } from "@/data/methodology";

const entry = methodologyEntries[2];

export const metadata: Metadata = { title: entry.title, description: entry.summary };

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
