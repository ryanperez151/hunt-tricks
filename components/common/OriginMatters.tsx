export function OriginMatters({ question = "Was this traffic forwarded by the appliance, or initiated from it?" }: { question?: string }) {
  return (
    <aside className="origin-matters" aria-labelledby="origin-matters-title">
      <p className="eyebrow">Origin matters</p>
      <h2 id="origin-matters-title">Treat infrastructure as a host</h2>
      <p>{question}</p>
    </aside>
  );
}
