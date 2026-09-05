import { CopyButton } from "@/components/common/CopyButton";
import type { TrustedHighlightedQueryHtml } from "@/lib/highlight";

export function CodeBlock({ raw, highlightedHtml }: { raw: string; highlightedHtml: TrustedHighlightedQueryHtml }) {
  return (
    <section aria-label="Query example" className="code-block">
      <div className="code-block__bar">
        <span>Query example</span>
        <CopyButton label="Copy query" value={raw} />
      </div>
      <div
        aria-label="Query text. Scroll horizontally to view long lines."
        className="code-block__source"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        role="region"
        tabIndex={0}
      />
      <p className="adaptation-note">Adapt field names and data models to your environment.</p>
    </section>
  );
}
