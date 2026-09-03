import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, children }: { eyebrow?: string; children: ReactNode }) {
  return <div className="section-heading">{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h2>{children}</h2></div>;
}
