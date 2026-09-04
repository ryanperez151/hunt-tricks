import Link from "next/link";
import { OriginMatters } from "@/components/common/OriginMatters";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PlaneExplorer } from "@/components/diagrams/PlaneExplorer";
import { HuntCard } from "@/components/hunts/HuntCard";
import { huntFamilies } from "@/data/families";
import { homeContent } from "@/data/home";
import { hunts } from "@/lib/content";

function HeroNetwork() {
  return (
    <figure className="home-network" aria-labelledby="home-network-title">
      <figcaption id="home-network-title">Origin and transit through the infrastructure</figcaption>
      <ol className="home-network__nodes">
        {homeContent.heroNetwork.nodes.map((node) => <li key={node}>{node}</li>)}
      </ol>
      <div className="home-network__flows">
        {homeContent.heroNetwork.flows.map((flow) => (
          <div className={`home-network__flow home-network__flow--${flow.kind}`} key={flow.kind}>
            <strong>{flow.label}</strong>
            <span>{flow.path}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

export default function HomePage() {
  const flagshipHunts = hunts.filter((hunt) => hunt.behaviorComparison);

  return (
    <div className="home-page">
      <section className="home-hero workspace-width" aria-labelledby="page-title">
        <div className="home-hero__copy">
          <p className="eyebrow">{homeContent.eyebrow}</p>
          <h1 id="page-title">{homeContent.title}</h1>
          <p className="hero__lede">{homeContent.heroCopy}</p>
          <p className="home-hero__question">{homeContent.originQuestion}</p>
          <div className="hero__actions">
            <Link className="button button--primary" href={homeContent.actions.primary.href}>{homeContent.actions.primary.label}</Link>
            <Link className="button button--secondary" href={homeContent.actions.secondary.href}>{homeContent.actions.secondary.label}</Link>
          </div>
        </div>
        <HeroNetwork />
        <OriginMatters question={homeContent.originQuestion} />
      </section>

      <section className="home-section workspace-width">
        <SectionHeading eyebrow="Infrastructure is a host">Stop Treating the Firewall as Just a Sensor</SectionHeading>
        <div className="characteristic-grid">
          {homeContent.applianceCharacteristics.map((characteristic) => (
            <article key={characteristic.title}>
              <h3>{characteristic.title}</h3>
              <p>{characteristic.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section workspace-width">
        <PlaneExplorer planes={homeContent.planeExamples} />
      </section>

      <section className="home-section workspace-width">
        <SectionHeading eyebrow="Choose a behavior family">Four ways to hunt infrastructure</SectionHeading>
        <div className="family-grid">
          {huntFamilies.map((family) => (
            <article className="family-card" key={family.id}>
              <p className="eyebrow">Hunt family</p>
              <h3>{family.label}</h3>
              <p>{family.objective}</p>
              <a href={`/hunts/${family.id}/`}>Explore {family.label} hunts</a>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section workspace-width">
        <SectionHeading eyebrow="Start with depth">Flagship hunts</SectionHeading>
        <div className="hunt-grid hunt-grid--featured">
          {flagshipHunts.map((hunt) => <HuntCard headingLevel={3} hunt={hunt} key={hunt.slug} />)}
        </div>
      </section>

      <section className="home-section workspace-width">
        <aside className="independent-observation" aria-labelledby="independent-observation-title">
          <p className="eyebrow">Independent observation</p>
          <h2 id="independent-observation-title">{homeContent.independentObservation.title}</h2>
          <p className="independent-observation__equation">{homeContent.independentObservation.equation}</p>
          <p>{homeContent.independentObservation.nextStep}</p>
        </aside>
        <div className="next-step">
          <h2>Build the baseline, then test it</h2>
          <p>Document the connections an appliance is allowed to initiate, then treat each new role, peer, protocol, and sequence as a question worth answering.</p>
          <div className="hero__actions">
            <a className="button button--secondary" href="/methodology/baselining/">Learn baselining</a>
            <Link className="button button--primary" href="/hunts/">Browse the hunt catalog</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
