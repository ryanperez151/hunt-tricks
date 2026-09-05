import Link from "next/link";
import { getRelatedHunts, researchEntries } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Infrastructure Compromise Research",
  description: "Review primary-source infrastructure compromise research grouped by reporting organization and connected to operational hunts.",
  path: "/research/",
});

function organizationId(organization: string) {
  return `organization-${organization.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
}

export default function ResearchPage() {
  const organizations = [...new Set(researchEntries.map(({ organization }) => organization))];

  return (
    <div className="research-page workspace-width">
      <header className="page-header">
        <p className="eyebrow">Primary-source library</p>
        <h1>Infrastructure compromise research</h1>
        <p>Use these reports to connect observed appliance behavior with concrete hunt hypotheses. The library summarizes infrastructure-relevant findings; follow each source for its complete context and guidance.</p>
        <p className="page-header__count">{researchEntries.length} curated reports</p>
      </header>

      <nav className="research-index" aria-label="Research organizations">
        <p className="eyebrow">Browse reporting organizations</p>
        <ul>
          {organizations.map((organization) => (
            <li key={organization}><Link href={`#${organizationId(organization)}`}>{organization}</Link></li>
          ))}
        </ul>
      </nav>

      <div className="research-groups">
        {organizations.map((organization) => (
          <section aria-labelledby={organizationId(organization)} className="research-group" key={organization}>
            <h2 id={organizationId(organization)}>{organization}</h2>
            <div className="research-grid">
              {researchEntries.filter((entry) => entry.organization === organization).map((entry) => {
                const relatedHunts = getRelatedHunts(entry);
                return (
                  <article className="research-card" key={entry.id}>
                    <header>
                      <p className="research-card__source"><span>{entry.organization}</span> · <time dateTime={entry.publishedAt}>{entry.publishedAt}</time></p>
                      <h3>{entry.title}</h3>
                      {entry.threatActor ? <p><strong>Reported actor:</strong> {entry.threatActor}</p> : null}
                    </header>
                    <p>{entry.summary}</p>
                    <section>
                      <h4>Affected technology</h4>
                      <ul className="research-card__tags">
                        {entry.affectedTechnology.map((technology) => <li key={technology}>{technology}</li>)}
                      </ul>
                    </section>
                    <section>
                      <h4>Observed behaviors</h4>
                      <ul>{entry.relevantBehaviors.map((behavior) => <li key={behavior}>{behavior}</li>)}</ul>
                    </section>
                    <section>
                      <h4>Related hunts</h4>
                      <ul className="related-links">
                        {relatedHunts.map((hunt) => (
                          <li key={hunt.slug}><Link aria-label={`Hunt: ${hunt.title}`} href={`/hunts/${hunt.slug}/`}>{hunt.title}</Link></li>
                        ))}
                      </ul>
                    </section>
                    <a className="research-card__primary-source" href={entry.sourceUrl} rel="noopener noreferrer" target="_blank">
                      Read {entry.organization} primary source
                    </a>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
