# GitHub preparation implementation plan

> For agentic workers: use superpowers:executing-plans to implement this plan inline, in the approved review order.

**Goal:** Prepare a complete, tested local publication branch and resolve the actionable pre-GitHub review findings.

**Architecture:** Retain the static Next.js application and its validated content registries. Correct the existing query and navigation flows, consolidate local histories without rewriting them, and add repository/CI configuration.

**Tech stack:** Next.js, React, TypeScript, Vitest, Playwright, npm, GitHub Actions.

**Spec:** `docs/pre-github-review-2026-09-28.md`, approved by the user's request to apply its fixes in order.

**Constraints:** Preserve existing edits and local scratch files. Leave the license undecided as requested. Do not publish until the intended remote and publication intent are established. Keep the filter-control redesign deferred; it was an optional follow-up, not a required correction.

**Review focus:** Full service-tuple allowlisting; null/false approval values; query fragment navigation across routes and from filtered libraries; active navigation on detail routes and subpath hosting; clean installation and export with GitHub Pages assets preserved.

### Task 1: Consolidate the publication candidate

- [x] Reuse the application worktree and create `codex/github-preparation` from `7dc23c9`.
- [x] Commit the existing methodology edits and research-review note, then merge `main` and the research-annex branch.
- [x] Validate the annex with `node docs/research/validate-records.mjs` (39 additions, 6 amendments).
- [x] Mark the annex as a dated supporting snapshot, copy the approved review into this branch, and preserve the assembled history.

### Task 2: Clean publication contents

- [x] Ignore `.task10-verify/`, `.claude/`, and `.publication-verify/`.
- [x] Remove tracked `.superpowers/` reports from the index while keeping local copies.
- [x] Verify the staged file list contains only intended project content; preserve all earlier history.

### Task 3: Correct query behavior and dependency

- [x] Replace the verbatim legacy SPL expectation: lookup dependencies by source, destination, destination port, and transport; suppress only a normalized positive approval. Document origin and lookup assumptions. Validate the example against hand-checked allowed-HTTPS/disallowed-SSH and null/false approval cases; a live Splunk service is unavailable.
- [x] Write failing consumer tests for query-result fragments resolving to query cards, plus browser tests for search selection and reload. Use the existing aggregated query ID as the unique fragment, with a `query-` prefix.
- [x] Add matching card IDs and search destinations, with a scroll offset for the sticky header. Verify direct links and search from both home and a filtered library.
- [x] Update the compatible transitive `undici` dependency to a patched version; verify the lockfile change and audit result.

### Task 4: Publication configuration and navigation

- [x] Add a failing component test for current navigation on hunt/protocol/methodology detail routes, then a shared navigation link that adds `aria-current` and a visible state.
- [x] Add Node 24 runtime metadata, `npm ci` instructions, contributor/source-correction guidance, and CI running checks, build, and Chromium journeys.
- [x] Include `public/.nojekyll` so exported assets survive branch-based Pages hosting; document build-time site URL and base path. Configure the actual host only once known.
- [x] Keep license selection pending, per user instruction.

### Task 5: Verify and integrate

- [x] Run lint, typecheck, all unit/component tests, production build, annex validation, dependency audit, and desktop/mobile browser journeys.
- [x] Verify a clean checkout/install and a prefixed static export, including the selected-query fragment and active navigation.
- [x] Request one independent whole-change code review and address substantive findings.
- [x] Commit the fixes and fast-forward local `main` to the verified preparation branch, preserving the root review file.
- [x] Record final verification and any remaining publication details without claiming a push occurred.
