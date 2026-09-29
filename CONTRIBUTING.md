# Contributing to hunt-tricks

For a bug report, include the route, expected behavior, actual behavior, browser, and minimal steps to reproduce. For a source correction, identify the hunt or methodology section, link the primary source, and explain exactly which claim it supports or contradicts. Do not include credentials, confidential logs, or identifying incident data.

Discuss substantial changes in an issue before implementation. The project license is still undecided; resolve licensing expectations with the maintainer before contributing substantial new material.

Use the runtime in `.nvmrc`, install with `npm ci`, and run:

```text
npm run check
npm run validate:research
npm run build
npx playwright install chromium
npm run test:e2e
```

Keep hunts and research in the validated registries. New hunts need explicit telemetry requirements, locally adaptable queries, false positives, limitations, and claim-linked evidence. Distinguish source observations from editorial hypotheses and experimental results. Timing or request volume alone must not be presented as proof of AI involvement.

When changing query examples, explain field normalization, join keys, approval semantics, and the cases that would create false positives or false negatives. Include executable platform validation where available; a website test passing does not establish that a detection works on production telemetry.

The research annex in `docs/research/` is a historical review snapshot. Recheck and reconcile proposed records before promoting them into `data/research*.ts`. Include a regression test for behavior changes and keep generated output, dependency directories, private environment settings, and local agent workspaces out of commits.
