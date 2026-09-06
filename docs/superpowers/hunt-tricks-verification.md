# hunt-tricks verification — 2026-09-06

The expansion contains 45 hunts (20 preserved, 25 added), 12 scopes, 27 research records, 18 telemetry sources, and six methodology pages. Each scope has at least two substantive hunts. Existing hunt routes remain available.

## Verification evidence

- `npm run check`: lint, typecheck, and 38 files / 189 tests passed.
- `npm run build`: content validation and production static export passed; Next generated 95 pages, with 92 exported HTML files.
- `npx playwright test --workers=2`: 20 passed, two intentional viewport-specific skips (desktop-only check on mobile and mobile-only check on desktop).
- After the final content corrections, `npm run check` and `npm run build` passed again; `npx playwright test tests/e2e/hunt-tricks.spec.ts --workers=2` passed all 10 affected browser checks, and the export link audit again found zero errors.
- Export audit: 2,468 internal links/anchors checked across 92 HTML pages; zero missing targets.
- Desktop (1440px) and mobile (390px) browser checks cover existing journeys, combined scope/temporal filters, browser back/reset, research anchors, search, query copying, keyboard timeline interaction, mobile navigation, reduced motion, and page overflow.
- Visual review covered home, filtered catalog, AI hunt evidence, research, velocity, and AI-autonomy pages. A mobile footer flex-basis regression was fixed and independently re-reviewed; its content now measures about 433px high at 390px, with automatic child heights.

Independent task reviews approved the contracts, research/query content, and workbench after fixes. Whole-change review identified four query-semantic issues and two metadata corrections; scoped re-review approved all six corrections with no remaining findings. The fixes preserve missing claims with independent coverage checks, bind CI runs to repository and effective workflow revision, distinguish grant initiator from recipient, require stable process lineage, and correct the Snowflake date and inbox-forwarding ATT&CK mapping.

## Research and operational limits

Claims distinguish source observations from editorial hypotheses. Incident reports, experiments, frameworks, and historical research are labeled. Source limits and supplied date precision appear with citations. Historical foundations explain enduring mechanisms without validating modern thresholds. AI-role filters describe content perspective, not event attribution.

The new queries are explicitly labeled defensive pseudocode. They require deployment-specific field mappings, approved inventories, comparable baselines, time windows, and telemetry coverage; they have not been executed against a live SIEM. A dotted-field consistency test catches undeclared normalized references, while semantic joins and derived inputs require review. Missing evidence remains unknown.

## Recorded implementation decisions

- Used the existing isolated worktree and feature branch because it already contained the site. A mistaken assumption here would require relocating the work; no shared branch was updated.
- Executed the approved plan with required Superpowers implementation/review agents, without another workflow-choice pause. The cost is review overhead; product scope did not change.
- Preserved honest year/month publication precision rather than inventing dates. Future consumers must support partial-date sorting and display.
- Required operational metadata for expanded hunts while retaining legacy input defaults. Incomplete expanded drafts fail validation; legacy coverage is additionally checked by content tests.
- Bound provenance comparisons by exact release/build identity plus an explicit analysis interval, rather than an arbitrary short join window. This requires reliable identity mappings and sufficient retention.

The local preview serves the exported `out` directory at http://127.0.0.1:4173. To restart from this worktree, run `npm run build` and `npm run preview:static`. Changes remain on the feature branch; no merge or publication was requested.
