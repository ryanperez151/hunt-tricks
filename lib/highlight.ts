import "server-only";
import { codeToHtml } from "shiki";
import type { HuntQuery } from "@/lib/schemas";

export const HIGHLIGHT_LANGUAGES = {
  splunk: "splunk",
  kql: "kusto",
  zeek: "log",
  pseudocode: "text",
} as const satisfies Record<HuntQuery["platform"], string>;

declare const trustedHighlightedQuery: unique symbol;
export type TrustedHighlightedQueryHtml = string & {
  readonly [trustedHighlightedQuery]: true;
};

/** Converts only validated, local query content during rendering or static builds. */
export async function highlightQuery(
  query: string,
  platform: HuntQuery["platform"],
): Promise<TrustedHighlightedQueryHtml> {
  return (await codeToHtml(query, {
    lang: HIGHLIGHT_LANGUAGES[platform],
    theme: "github-dark",
  })) as TrustedHighlightedQueryHtml;
}
