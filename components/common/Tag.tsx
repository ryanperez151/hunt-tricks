import type { ReactNode } from "react";

export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`tag ${className}`.trim()}>{children}</span>;
}
