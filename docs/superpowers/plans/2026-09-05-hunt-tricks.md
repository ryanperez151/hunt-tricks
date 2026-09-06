# hunt-tricks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Expand the static site into a diverse, cited hunting workbench centered on behavior and temporal reasoning.

**Architecture:** Extend existing registries and consumer projections, preserving old URLs. Add operational hunt content and reusable evidence/temporal sections, then update browsing and methodology. No backend or live attack execution.

**Tech Stack:** Existing Next.js, React, TypeScript, Zod, Vitest, Playwright, CSS.

**Spec:** docs/superpowers/specs/2026-09-05-hunt-tricks-design.md

## Global Constraints

- High velocity can be scripted just as readily as AI-driven. Speed alone does not identify AI involvement.
- Existing infrastructure hunts and URLs remain accessible.
- Each promised scope has at least two substantive hunts; overlapping scopes require real investigative relevance.
- Evidence labels distinguish incident reports, experiments, framework guidance, and editorial inference.
- Reward hacking means gaming a reward, evaluator, or success criterion; it does not mean ordinary goal pursuit.
- Static export, accessible dark presentation, and independently validated content remain mandatory.
- Work in the existing isolated worktree; do not merge or publish.

## Task 1: Contracts, filters, and search

Files: lib/taxonomy.ts, lib/schemas.ts, lib/content.ts, lib/filters.ts, lib/search-index.ts; components/hunts/HuntCatalog.tsx and HuntFilters.tsx; relevant existing tests and tests/expansion-contracts.test.ts.

Interfaces: export SCOPES = endpoints, identity, cloud, saas, email, network-edge, containers, cicd, supply-chain, data-stores, ot-iot, ai-systems. Export BEHAVIORS = role-deviation, new-relationships, privilege-change, discovery, credential-use, persistence, data-movement, trust-boundary, evidence-tampering, adaptive-sequence. Export TEMPORAL_PATTERNS = burst, acceleration, periodicity, fan-out, dwell-time, stage-transition, low-and-slow. Export AI_ROLES = defender, attacker, target. Use these exact strings.

Extend Hunt with scopes, behaviors, temporalPatterns, aiRoles arrays; temporal = { interpretation: string, baseline: string, confounders: string[] }; evidence = { claim: string, sourceIds: string[], kind: 'observation' | 'hypothesis' }[]; requiredFields: string[]; limitations: string[]. Defaults preserve legacy infrastructure seeds, while new content is explicitly populated. Planes/devices may be empty for other scopes. Extend Research with evidenceType ('incident-report' | 'experiment' | 'framework' | 'historical-research'), supportedClaims: string[], limitations: string[], defaulting existing records appropriately. Keep existing research fields.

Add telemetry keys endpoint-events, identity-audit, cloud-audit, saas-audit, email-audit, kubernetes-audit, build-audit, data-audit, ot-passive, agent-traces. Add families cross-domain and ai-agent-abuse with visible family descriptors (data/families.ts).

- [x] Add failing tests using makeHunt fixtures that verify empty infrastructure context is accepted for identity hunts, unknown evidence source IDs reject registries, and combined scope + behavior + temporal + AI-role filters select only the matching fixture.

```ts
const f = parseHuntFilters(new URLSearchParams('scope=identity&behavior=credential-use&temporal=low-and-slow&ai=attacker'));
expect(serializeHuntFilters(f).toString()).toContain('scope=identity');
expect(filterHunts([matching, nonmatching], f).map(h => h.slug)).toEqual(['matching']);
```

- [x] Run `npx vitest run tests/expansion-contracts.test.ts`; confirm failures are missing behavior.
- [x] Implement contracts above; reject unknown source IDs and nonempty evidence claims with empty sourceIds. Legacy seeds may omit extension evidence; new scope content must supply it. Parsed default scopes are network-edge. New filters use keys scopes, behaviors, temporalPatterns, aiRoles and URL parameters scope, behavior, temporal, ai. Preserve existing OR-within/AND-between semantics and normalization. Use `emptyHuntFilters` when clearing all controls. Index added dimensions and evidence claims in search.
- [x] Run focused schema, integrity, filter, catalog and search tests, then typecheck. Update old exact-count/shape expectations only where expansion intentionally changes the contract. Record red/green evidence and changes in task report.

## Task 2: Research-backed scope content

Files: data/hunts/expanded/*.ts, data/hunts/index.ts, data/research-expanded.ts, data/research.ts, data/telemetry-expanded.ts, data/telemetry.ts, tests/expansion-content.test.ts.

Consumes Task 1 interfaces. Produces expandedHunts: Hunt[], expandedResearch: Research[], expandedTelemetry: Telemetry[]. Keep arrays split into focused topic modules. Shared builders may supply presentation defaults, never interchangeable investigative prose.

- [x] Add a production-content test counting at least two hunts for each SCOPES value and checking every added hunt has nonempty temporal, requiredFields, evidence, limitations, expectedBehavior, investigation and query material.
- [x] Run the test and confirm missing scope coverage.
- [x] Browse primary sources for each scope. Seed choices: endpoint LOLBins and credential access; identity spray and session misuse; cloud role changes and data access; SaaS OAuth and bulk exports; email rules and phishing triage; Kubernetes service-account access and exec; CI workflow changes and runner egress; supply-chain dependency/build provenance; database export and access changes; OT engineering actions and new remote peers; AI tool pivots, injected retrieval instructions, evaluation tampering, and claims/outcome mismatch. Preserve 20 existing network hunts and explicitly enrich their behavioral/temporal metadata where needed.
- [x] For each hunt write complete Hunt objects with source-specific supported observations, editorial hypothesis labeling, explicit telemetry fields, executable-shape vendor-neutral pseudocode, tailored confounders, and at least three investigation steps. Cite evidence rather than attach a generic reading list. Source dates must be verified; framework dates mean source publication or revision, not incident occurrence. Bibliographic research seed memo is under the task workspace.
- [x] Wire arrays into validated production registries. Add source-specific collection guidance and limitations for each new telemetry key.
- [x] Run content tests, production validation and typecheck. Save source review and limitations in the task report.

## Task 3: Workbench and methodology

Files: app/page.tsx, app/about/page.tsx, app/hunts/page.tsx, app/hunts/[slug]/page.tsx, app/research/page.tsx, app/globals.css, components/hunts/HuntCard.tsx, HuntHeader.tsx; components/common/AttributionPrinciple.tsx; components/hunts/HuntEvidence.tsx; components/diagrams/AutomationTimeline.tsx; app/methodology/behavior/page.tsx, velocity/page.tsx, ai-autonomy/page.tsx; data/methodology.ts, data/navigation.ts, data/home.ts, lib/metadata.ts, app/layout.tsx, components/layout/Header.tsx and Footer.tsx; branding assets and tests as needed.

Consumes all registries. Evidence sections resolve sourceIds via researchEntries; cards link to `/research/#<source-id>` and primary URLs, displaying claim kind, publication date, evidence type and limitations. New hunt context renders only when populated.

- [x] Add a behavior test for an interactive AutomationTimeline: choosing a scenario displays its ordered steps and observations without deriving an AI verdict. Add a detail integration test verifying a claim's actual source URL is reachable from rendered evidence. Run to expected failure.
- [x] Replace home with a clear hunt-tricks identity, scope entry grid (`/hunts/?scope=<id>`), behavior/velocity entry points, attribution principle, featured hunts and historical research entry points. Retain infrastructure explanation as a linked domain feature.
- [x] Add static methodology pages with cited sections on baseline/role/sequence analysis, temporal windows and ingest delay, adaptive pivots and attribution, reward/evaluator manipulation, defender assistance, and evidence limits. Show experimental/incident distinctions and all required nuance from the spec.
- [x] Implement timeline with accessible buttons and an ordered list. Use synthetic fixed-script, adaptive-automation, and agent examples with overlaps; no classifier, score, or pseudo-probability.
- [x] Extend research display and detail evidence. Rebrand metadata, header, footer, about, search labels, README and social preview coherently. Keep existing compatibility routes and existing methodology accessible from navigation.
- [x] Run relevant component and route tests, update superseded copy expectations, and typecheck.

## Task 4: Review and delivery verification

Files: tests/e2e/hunt-tricks.spec.ts, existing regression tests only for intentional changes; docs/superpowers/plans/2026-09-05-hunt-tricks.md and verification notes.

- [x] Run `npm run check` and `npm run build`; inspect errors and fix root causes with focused regression coverage.
- [x] Add browser journeys for scope + temporal filter persistence, back/reset, evidence navigation, AI methodology and timeline keyboard interaction. Test existing journeys.
- [x] Run Playwright against the static export and inspect home, filtered catalog, new hunt detail, research and methodology at 1440px and 390px. Confirm no horizontal page overflow, readable diagrams and keyboard focus.
- [x] Conduct final independent code/spec and citation review. Resolve material findings, rerun affected checks, record actual results, and leave completed work in its isolated worktree with preview instructions. No merge/publish.
