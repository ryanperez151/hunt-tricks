import Link from "next/link";

export default function HomePage() {
  return (
    <section className="hero workspace-width" aria-labelledby="page-title">
      <p className="eyebrow">Threat Hunting Beyond the Endpoint</p>
      <h1 id="page-title">Hunt the Infrastructure</h1>
      <p className="hero__lede">
        Investigate the devices that route, protect, and manage your network as potential hosts—not merely
        passive sensors. Start by asking whether a flow was forwarded by an appliance or initiated from it.
      </p>
      <div className="hero__actions">
        <Link className="button button--primary" href="/hunts">
          Explore Hunts
        </Link>
        <Link className="button button--secondary" href="/hunts/management-plane-c2">
          Start With the Management Plane
        </Link>
      </div>
    </section>
  );
}
