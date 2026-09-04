# Task 8 report — protocol, telemetry, and methodology explorers

## Status

Implemented Task 8 only in the isolated `edge-threat-hunting-guide-mvp` worktree. The site now exports a 24-record protocol catalog and 24 static protocol detail routes, an eight-source interactive telemetry matrix, and three explicit local-MDX methodology routes. Task 9 was not started.

## TDD evidence

### Route and telemetry RED

Created `tests/protocol-routes.test.ts` and `tests/components/TelemetryMatrix.test.tsx` before their production modules.

```text
npm test -- tests/protocol-routes.test.ts tests/components/TelemetryMatrix.test.tsx

Test Files  2 failed (2)
Tests       no tests

Failed to resolve import "@/lib/protocol-routes"
Failed to resolve import "@/components/telemetry/TelemetryMatrix"
```

The failures were the expected missing-feature failures.

### Route and telemetry GREEN

```text
npm test -- tests/protocol-routes.test.ts tests/components/TelemetryMatrix.test.tsx

Test Files  2 passed (2)
Tests       6 passed (6)
```

The tests cover exact ordered static parameters, exact-slug rejection, slash-terminated known-protocol hrefs, unique metadata, semantic table coverage, visible word labels, truthful disclosure state, adjacent resolvable regions, and multi-instance ID/state isolation.

### Page, MDX, and accessibility RED

Added the page behavior and carried Task 3 table-accessibility regressions before creating routes or changing the MDX mapping.

```text
npm test -- tests/components/MdxTable.test.tsx tests/task-8-pages.test.tsx tests/secondary-content.test.ts

Test Files  3 failed (3)
Tests       2 failed | 10 passed (12)
```

Failures were specific to the missing protocol/telemetry pages, absent labelled focusable MDX table region, and absent semantic equation labels.

The first static export audit then exposed an integration defect: without a GFM table plugin, the pipe-delimited allow matrix compiled into a paragraph. A compiler-level regression was added first:

```text
npm test -- tests/secondary-content.test.ts

Test Files  1 failed (1)
Tests       1 failed | 10 passed (11)
Expected 12 semantic table rows; received 0.
```

The source was converted to explicit semantic MDX `<Table>` markup routed through the reusable accessible scroll wrapper.

### Page, MDX, and accessibility GREEN

```text
npm test -- tests/components/MdxTable.test.tsx tests/task-8-pages.test.tsx tests/secondary-content.test.ts tests/protocol-routes.test.ts tests/components/TelemetryMatrix.test.tsx

Test Files  5 passed (5)
Tests       23 passed (23)
```

The focused compiler/table regression also passed independently with 2 files and 12 tests.

## Implementation

- `lib/protocol-routes.ts` is a pure route boundary for exact resolution, immutable static parameters, per-protocol metadata, and deterministic trailing-slash hrefs.
- `/protocols/` renders all validated protocol records through Next `Link`. `/protocols/[slug]/` exports `dynamicParams = false`, rejects unknown slugs, and presents definition, infrastructure uses, expected direction, suspicious behavior, attacker abuse, normal and suspicious structured diagrams with text equivalents, and accurate related-hunt or empty state content.
- `TelemetryMatrix` is a client island over a real table. Each source is a native button with truthful `aria-expanded`, a unique/resolvable `aria-controls`, an adjacent persistent detail region, and independent component state. Coverage is always visible as `Low`, `Medium`, or `High`, with color used only as reinforcement.
- The three methodology pages use explicit fixed imports for `baselining.mdx`, `rarity.mdx`, and `independent-observation.mdx`; there is no runtime or dynamic path resolution.
- The Infrastructure Communication Allow Matrix is a real labelled table with 12 data rows. Its horizontal scroll region is keyboard-focusable, has a visible focus outline, a concise accessible name, and a referenced screen-reader instruction.
- Rarity and independent-observation relationships are semantic labelled lists rather than images or presentation-only equations.
- Responsive styles contain protocol diagrams and wide matrices within local horizontal scrollers at narrow widths.
- `mdx.d.ts` declares the fixed local MDX module boundary for strict TypeScript checks.

## Final verification

```text
npm test
Test Files  30 passed (30)
Tests       123 passed (123)

npm run lint
Exit code: 0

npm run typecheck
Exit code: 0

npm run build
Test Files  1 passed (1) — production content gate
Generated static pages: 58/58
Exit code: 0
```

`git diff --check` reported no whitespace errors. Git emitted only the existing Windows LF-to-CRLF notices.

## Export and boundary audit

```text
PROTOCOL_DETAILS=24
PROTOCOL_INDEXES_WITH_CATALOG=25
MISSING=
EXTRA=
UNIQUE_TITLES=24
UNIQUE_DESCRIPTIONS=24
INCOMPLETE_PROTOCOL_DETAILS=
EMPTY_RELATED_HUNT_LINK_STATE_ACCURATE=True
CATALOG_LINKS=24
TELEMETRY_DISCLOSURES=8
COVERAGE_WORDS_PRESENT=True
METHODOLOGY_BASELINING=True
METHODOLOGY_RARITY=True
METHODOLOGY_INDEPENDENT_OBSERVATION=True
ALLOW_MATRIX_SEMANTIC=True
ALLOW_MATRIX_SCROLL_A11Y=True
RARITY_EQUATION_SEMANTIC=True
INDEPENDENT_EQUATION_SEMANTIC=True
CLIENT_BUNDLE_SIGNATURES=none
```

Every exported protocol detail contains all six required prose sections, both flow titles, and diagram text summaries. BGP, OSPF, and VXLAN accurately state that no launch hunts are directly linked from their protocol records. No `@mdx-js/mdx`, Shiki, `server-only`, `_createMdxContent`, or server highlighter signature appears in `out/_next/static`.

## Independent review fix round 1

The scoped read-only review found two Important issues and no Critical issues:

1. Collapsed telemetry detail `<tr>` elements remained exposed as blank accessibility-tree rows even though their inner regions were hidden.
2. The empty related-hunt copy said no hunt “references” the protocol, which was broader than the curated direct-link relationship represented by `relatedHunts`.

Regressions were added first. RED showed 17 exposed rows instead of 9 and the old broad copy. After applying `hidden` to the adjacent detail row and changing the copy to “No launch hunts are currently linked to this protocol,” the focused suite passed with 2 files and 8 tests. Full verification and the export audit were rerun before amending the containing commit.

## Commit

Planned containing commit message: `feat: add protocol telemetry and methodology explorers`. The exact containing commit hash is returned to the SDD controller after commit creation.

## Concerns

No implementation blocker remains. Canonical URL/complete Open Graph helpers remain intentionally deferred to Task 10; Task 8 provides unique route title, description, and Open Graph fields. Git continues to warn that the user-level global ignore file is unreadable in this sandbox, which does not affect repository state or verification.
