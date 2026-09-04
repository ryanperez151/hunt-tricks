import type { Metadata } from "next";
import BaseliningContent from "@/content/methodology/baselining.mdx";
import { methodologyEntries } from "@/data/methodology";

const entry = methodologyEntries[0];

export const metadata: Metadata = { title: entry.title, description: entry.summary };

export default function BaseliningPage() {
  return (
    <article className="methodology-page reading-width">
      <header className="methodology-context">
        <p className="eyebrow">Methodology · Expected dependencies</p>
        <p>{entry.summary}</p>
      </header>
      <BaseliningContent />
    </article>
  );
}
