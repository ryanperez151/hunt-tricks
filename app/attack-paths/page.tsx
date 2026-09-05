import Link from "next/link";
import { AttackPathDiagram } from "@/components/diagrams/AttackPathDiagram";
import { attackPaths, getRelatedHunts } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Infrastructure Attack Paths",
  description: "Trace four representative infrastructure attack chains from appliance compromise through pivoting, collection, tunneling, and telemetry suppression.",
  path: "/attack-paths/",
});

export default function AttackPathsPage() {
  return (
    <div className="attack-paths-page workspace-width">
      <header className="page-header">
        <p className="eyebrow">Sequences reveal intent</p>
        <h1>Infrastructure attack paths</h1>
        <p>A single device anomaly can have an operational explanation. Read as a sequence, changes in access, direction, collection, and telemetry reveal how an actor turns infrastructure into a host.</p>
        <p className="page-header__count">{attackPaths.length} representative paths</p>
      </header>

      <div className="attack-path-list">
        {attackPaths.map((attackPath) => {
          const relatedHunts = getRelatedHunts(attackPath);
          return (
            <article className="attack-path-card" id={attackPath.slug} key={attackPath.id}>
              <header>
                <p className="eyebrow">Attack path</p>
                <h2>{attackPath.title}</h2>
                <p>{attackPath.summary}</p>
              </header>
              <div className="attack-path-card__diagram">
                <AttackPathDiagram
                  edges={attackPath.edges}
                  nodes={attackPath.nodes}
                  textAlternative={attackPath.textAlternative}
                  title={`${attackPath.title} attack path diagram`}
                />
              </div>
              <section className="attack-path-card__interpretation">
                <h3>Ordered interpretation</h3>
                <ol aria-label={`${attackPath.title} ordered path`}>
                  {attackPath.textAlternative.map((step) => <li key={step}>{step}</li>)}
                </ol>
              </section>
              <section className="attack-path-card__hunts">
                <h3>Related hunts</h3>
                <ul className="related-links">
                  {relatedHunts.map((hunt) => (
                    <li key={hunt.slug}>
                      <Link aria-label={`Hunt: ${hunt.title}`} href={`/hunts/${hunt.slug}/`}>{hunt.title}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            </article>
          );
        })}
      </div>
    </div>
  );
}
