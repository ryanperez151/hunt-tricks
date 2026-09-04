"use client";

import { useId, useRef, useState } from "react";

type Plane = { plane: string; label: string; examples: readonly string[] };

export function PlaneExplorer({ planes }: { planes: readonly Plane[] }) {
  const instanceId = useId().replaceAll(":", "");
  const [selected, setSelected] = useState(0);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const active = planes[selected];

  function select(index: number) {
    setSelected(index);
    tabs.current[index]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % planes.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + planes.length) % planes.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = planes.length - 1;
    else return;
    event.preventDefault();
    select(next);
  }

  if (!active) return null;
  return <section className="plane-explorer" aria-labelledby={`plane-explorer-title-${instanceId}`}><h2 id={`plane-explorer-title-${instanceId}`}>Infrastructure planes</h2><div aria-label="Infrastructure planes" className="plane-explorer__tabs" role="tablist">{planes.map((plane, index) => <button aria-controls={`plane-panel-${instanceId}-${plane.plane}`} aria-selected={selected === index} className="plane-explorer__tab" id={`plane-tab-${instanceId}-${plane.plane}`} key={plane.plane} onClick={() => select(index)} onKeyDown={(event) => onKeyDown(event, index)} ref={(element) => { tabs.current[index] = element; }} role="tab" tabIndex={selected === index ? 0 : -1}>{plane.label}</button>)}</div>{planes.map((plane, index) => <div aria-labelledby={`plane-tab-${instanceId}-${plane.plane}`} className="plane-explorer__panel" hidden={selected !== index} id={`plane-panel-${instanceId}-${plane.plane}`} key={plane.plane} role="tabpanel" tabIndex={selected === index ? 0 : -1}><p>{plane.label}</p><ul>{plane.examples.map((example) => <li key={example}>{example}</li>)}</ul></div>)}</section>;
}
