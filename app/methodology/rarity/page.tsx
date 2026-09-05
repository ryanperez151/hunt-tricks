import RarityContent from "@/content/methodology/rarity.mdx";
import { methodologyEntries } from "@/data/methodology";
import { createPageMetadata } from "@/lib/metadata";

const entry = methodologyEntries[1];

export const metadata = createPageMetadata({ title: entry.title, description: entry.summary, path: "/methodology/rarity/" });

export default function RarityPage() {
  return (
    <article className="methodology-page reading-width">
      <header className="methodology-context">
        <p className="eyebrow">Methodology · Evidence-based priority</p>
        <p>{entry.summary}</p>
      </header>
      <RarityContent />
    </article>
  );
}
