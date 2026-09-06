import Link from "next/link";
import { PlaneExplorer } from "@/components/diagrams/PlaneExplorer";
import { homeContent } from "@/data/home";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "About the Field Guide",
  description: "Understand the purpose, boundaries, evidence model, and future contribution direction of hunt-tricks.",
  path: "/about/",
});

export default function AboutPage() {
  return (
    <article className="about-page reading-width">
      <header className="page-header">
        <p className="eyebrow">Purpose and boundaries</p>
        <h1>About the field guide</h1>
        <p>hunt-tricks is a research-backed defensive workbench across endpoints, identity, cloud, SaaS, email, network and edge, containers, CI/CD, software supply chains, data stores, OT/IoT, and AI systems. Start with a scope, examine behavior and timing, then test a hypothesis against independent evidence.</p>
      </header>

      <section>
        <h2>What this guide is for</h2>
        <p>The guide turns suspicious behavior into testable hypotheses, evidence requirements, adaptable queries, and investigation steps. It is a starting point for experienced defenders building hunts around their own topology, dependencies, and telemetry.</p>
      </section>

      <section id="infrastructure">
        <h2>Origin is not transit</h2>
        <p>Traffic forwarded by an appliance describes a path through the infrastructure. Traffic initiated from an appliance describes the device acting as a host. Preserve initiator, interface role, management address, and expected dependency context so those two stories do not collapse into one.</p>
        <PlaneExplorer planes={homeContent.planeExamples} />
        <p><Link href="/methodology/baselining/">Build an expected communication baseline</Link> before treating a new direction or peer as malicious.</p>
      </section>

      <section><h2>Evidence before attribution</h2><p>Source observations, controlled experiments, framework guidance, and editorial hypotheses have different evidentiary limits. High velocity can be scripted just as readily as AI-driven. Speed alone does not identify AI involvement.</p><p><Link href="/methodology/ai-autonomy/">Investigate AI and autonomy</Link> with provenance and independent outcomes, including the limits of reward-hacking experiments.</p></section>
      <section>
        <h2>Adapt every query</h2>
        <p>Example queries are detection logic, not portable production rules. Map field names and data models, verify asset attribution and connection direction, tune time windows against local cadence, and validate results with independent evidence before escalating.</p>
        <p><Link href="/queries/">Browse the query library</Link> and carry each hunt&apos;s adaptation notes into your environment.</p>
      </section>

      <section>
        <h2>Boundaries of the MVP</h2>
        <p>This static guide does not execute queries, connect to a SIEM, authenticate users, score assets, or provide vendor-specific detection packs. It offers no guarantee that an observed anomaly is malicious; operational context and corroboration remain essential.</p>
      </section>

      <section>
        <h2>Contribution direction</h2>
        <p>Future work may publish a documented review path for proposed hunts, protocol profiles, source corrections, and detection adaptations. This MVP does not accept submissions or run a contribution backend. Until that workflow exists, treat the current catalog as curated reference material rather than an active community intake service.</p>
      </section>
    </article>
  );
}
