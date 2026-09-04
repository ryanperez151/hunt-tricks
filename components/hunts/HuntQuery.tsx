import { CodeBlock } from "@/components/common/CodeBlock";
import type { TrustedHighlightedQueryHtml } from "@/lib/highlight";
import type { HuntQuery as HuntQueryRecord } from "@/lib/schemas";

export function HuntQuery({ query, highlightedHtml }: { query: HuntQueryRecord; highlightedHtml: TrustedHighlightedQueryHtml }) {
  return (
    <article className="hunt-query">
      <div className="hunt-query__heading">
        <div>
          <p className="eyebrow">{query.platform}</p>
          <h3>{query.title}</h3>
        </div>
        <p>{query.description}</p>
      </div>
      <CodeBlock raw={query.query} highlightedHtml={highlightedHtml} />
    </article>
  );
}
