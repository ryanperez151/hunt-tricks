import { Suspense } from "react";
import { HuntCatalog, HuntCatalogFallback } from "@/components/hunts/HuntCatalog";
import { hunts } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Hunt Catalog",
  description: "Filter operational hunts by scope, behavior, temporal pattern, AI role, and infrastructure context.",
  path: "/hunts/",
});

export default function HuntsPage() {
  return (
    <div className="catalog-page workspace-width">
      <header className="page-header">
        <p className="eyebrow">Operational field guide</p>
        <h1>Hunt catalog</h1>
        <p>Start with a scope, behavior, or temporal pattern. Each hunt moves from hypothesis to independent evidence, adaptable detection logic, and a concrete investigation workflow.</p>
      </header>
      <Suspense fallback={<HuntCatalogFallback hunts={hunts} />}>
        <HuntCatalog hunts={hunts} />
      </Suspense>
    </div>
  );
}
