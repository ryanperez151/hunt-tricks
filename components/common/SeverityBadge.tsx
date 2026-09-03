import type { Hunt } from "@/lib/schemas";

export function SeverityBadge({ severity }: { severity: Hunt["severity"] }) {
  return (
    <span aria-label={`Severity: ${severity}`} className={`severity-badge severity-badge--${severity}`}>
      {severity.toUpperCase()}
    </span>
  );
}
