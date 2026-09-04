import { Suspense } from "react";
import type { Metadata } from "next";
import { HuntCatalog, HuntCatalogFallback } from "@/components/hunts/HuntCatalog";
import { hunts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Infrastructure Hunt Catalog",
  description: "Filter twenty operational threat hunts by family, device, protocol, plane, severity, and telemetry.",
};

export default function HuntsPage() {
  return (
    <div className="catalog-page workspace-width">
      <header className="page-header">
        <p className="eyebrow">Operational field guide</p>
        <h1>Infrastructure hunt catalog</h1>
        <p>Start with an observed role reversal, protocol anomaly, or telemetry gap. Each hunt moves from hypothesis to independent evidence, adaptable detection logic, and a concrete investigation workflow.</p>
      </header>
      <Suspense fallback={<HuntCatalogFallback hunts={hunts} />}>
        <HuntCatalog hunts={hunts} />
      </Suspense>
    </div>
  );
}
