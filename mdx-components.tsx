import { useId, type ComponentPropsWithoutRef } from "react";
import type { MDXComponents } from "mdx/types";

function SafeLink({ href = "", ...props }: ComponentPropsWithoutRef<"a">) {
  const external = /^https?:\/\//i.test(href);
  return <a href={href} {...(external ? { rel: "noreferrer", target: "_blank" } : {})} {...props} />;
}

function ScrollableTable({ "aria-label": tableLabel = "Data table", ...props }: ComponentPropsWithoutRef<"table">) {
  const instructionId = `${useId().replaceAll(":", "")}-table-scroll-instruction`;
  return (
    <div
      aria-describedby={instructionId}
      aria-label={`${tableLabel} — scrollable table`}
      className="mdx-table-scroll my-8 overflow-x-auto rounded-md border border-[var(--border)]"
      role="region"
      tabIndex={0}
    >
      <span className="sr-only" id={instructionId}>Scroll horizontally to view all columns.</span>
      <table aria-label={tableLabel} className="w-full min-w-[60rem] border-collapse text-left text-sm" {...props} />
    </div>
  );
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="text-4xl font-bold tracking-tight text-white" {...props} />,
    h2: (props) => <h2 className="mt-12 text-2xl font-bold tracking-tight text-white" {...props} />,
    h3: (props) => <h3 className="mt-8 text-xl font-semibold text-white" {...props} />,
    p: (props) => <p className="mt-5 text-[var(--text-muted)]" {...props} />,
    ul: (props) => <ul className="mt-5 list-disc space-y-2 pl-6 text-[var(--text-muted)]" {...props} />,
    ol: (props) => <ol className="mt-5 list-decimal space-y-3 pl-6 text-[var(--text-muted)]" {...props} />,
    li: (props) => <li className="pl-1 marker:text-[var(--cyan)]" {...props} />,
    strong: (props) => <strong className="font-semibold text-[var(--text)]" {...props} />,
    blockquote: (props) => <blockquote className="my-8 border-l-4 border-[var(--cyan)] bg-[var(--bg-panel)] px-6 py-4 text-lg text-[var(--text)]" {...props} />,
    a: SafeLink,
    table: ScrollableTable,
    Table: ScrollableTable,
    thead: (props) => <thead className="bg-[var(--bg-panel-raised)] text-[var(--text)]" {...props} />,
    tbody: (props) => <tbody className="divide-y divide-[var(--border)]" {...props} />,
    tr: (props) => <tr className="align-top" {...props} />,
    th: (props) => <th className="border-b border-[var(--border)] px-4 py-3 font-semibold" scope="col" {...props} />,
    td: (props) => <td className="px-4 py-3 text-[var(--text-muted)]" {...props} />,
    code: (props) => <code className="font-mono text-[var(--cyan)]" {...props} />,
    ...components,
  };
}
