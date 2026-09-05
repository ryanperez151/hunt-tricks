import BaseliningContent from "@/content/methodology/baselining.mdx";
import { methodologyEntries } from "@/data/methodology";
import { createPageMetadata } from "@/lib/metadata";

const entry = methodologyEntries[0];

export const metadata = createPageMetadata({ title: entry.title, description: entry.summary, path: "/methodology/baselining/" });

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
