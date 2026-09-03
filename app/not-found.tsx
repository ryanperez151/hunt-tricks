import Link from "next/link";

export default function NotFound() {
  return (
    <section className="empty-state reading-width" aria-labelledby="not-found-title">
      <p className="eyebrow">Route unavailable</p>
      <h1 id="not-found-title">This field-guide entry does not exist.</h1>
      <p>Return to the guide and begin with the infrastructure behaviors available in this static release.</p>
      <Link className="button button--primary" href="/">
        Return home
      </Link>
    </section>
  );
}
