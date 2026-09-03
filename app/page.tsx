import Link from "next/link";
import { homeContent } from "@/data/home";

export default function HomePage() {
  return (
    <section className="hero workspace-width" aria-labelledby="page-title">
      <p className="eyebrow">{homeContent.eyebrow}</p>
      <h1 id="page-title">{homeContent.title}</h1>
      <p className="hero__lede">
        {homeContent.heroCopy} {homeContent.originQuestion}
      </p>
      <div className="hero__actions">
        <Link className="button button--primary" href={homeContent.actions.primary.href}>
          {homeContent.actions.primary.label}
        </Link>
        <Link className="button button--secondary" href={homeContent.actions.secondary.href}>
          {homeContent.actions.secondary.label}
        </Link>
      </div>
    </section>
  );
}
