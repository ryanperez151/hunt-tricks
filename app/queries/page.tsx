import { Suspense } from "react";
import { QueryLibrary, QueryLibraryFallback, type QueryDisplayRecord } from "@/components/queries/QueryLibrary";
import { hunts } from "@/lib/content";
import { highlightQuery } from "@/lib/highlight";
import { createPageMetadata } from "@/lib/metadata";
import { aggregateQueries } from "@/lib/queries";

export const metadata = createPageMetadata({
  title: "Infrastructure Query Library",
  description: "Filter adaptable Splunk, KQL, Zeek, and vendor-neutral infrastructure hunting queries derived from the operational hunt catalog.",
  path: "/queries/",
});

async function buildQueryDisplayRecords(): Promise<readonly QueryDisplayRecord[]> {
  return Promise.all(aggregateQueries(hunts).map(async (query) => ({
    id: query.id,
    title: query.title,
    description: query.description,
    detectionStrategy: query.detectionStrategy,
    platform: query.platform,
    query: query.query,
    highlightedHtml: await highlightQuery(query.query, query.platform),
    huntSlug: query.huntSlug,
    huntTitle: query.huntTitle,
    family: query.family,
    devices: [...query.devices],
    protocols: [...query.protocols],
    telemetry: [...query.telemetry],
    techniques: [...query.techniques],
  } satisfies QueryDisplayRecord)));
}

export default async function QueriesPage() {
  const queries = await buildQueryDisplayRecords();

  return (
    <div className="queries-page workspace-width">
      <header className="page-header">
        <p className="eyebrow">Adaptable detection logic</p>
        <h1>Infrastructure query library</h1>
        <p>Start from a behavior and independent telemetry, then adapt these examples to your local fields, approved dependencies, and data model. Query text is displayed and copied only; it is never executed here.</p>
      </header>
      <Suspense fallback={<QueryLibraryFallback queries={queries} />}>
        <QueryLibrary queries={queries} />
      </Suspense>
    </div>
  );
}
