type TimelineItem = { title: string; detail: string };

export function AttackTimeline({ items }: { items: readonly TimelineItem[] }) {
  return <section aria-labelledby="attack-timeline-title" className="attack-timeline"><h2 id="attack-timeline-title">Attack timeline</h2><ol aria-label="Attack timeline">{items.map((item, index) => <li key={`${index}-${item.title}`}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.detail}</p></div></li>)}</ol></section>;
}
