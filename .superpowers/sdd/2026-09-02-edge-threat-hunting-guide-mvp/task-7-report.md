# Task 7 Report: Searchable infrastructure hunt catalog

## RED / GREEN evidence

- Baseline: `npm test` passed with 19 files and 90 tests before Task 7 changes.
- Card/filter RED: `npm test -- tests/components/HuntCard.test.tsx tests/components/HuntFilters.test.tsx` failed because both Task 7 modules were absent.
- Card/filter GREEN: the same command passed with 2 files and 4 tests after implementing the single-link card, six filter dimensions, active chips, individual removal, and clear-all behavior.
- Catalog/route RED: `npm test -- tests/components/HuntCatalog.test.tsx tests/hunt-routes.test.ts` failed because the client island and pure shared-segment helpers were absent.
- Catalog/route GREEN: the expanded focused suite passed after canonical URL serialization, record-derived options, resettable empty state, strict resolution, ordered static parameters, and metadata inputs were implemented.
- Page RED: home coverage failed on the missing origin/transit network and approved sections; the catalog fallback export was absent; the shared route page module was absent.
- Page GREEN: the seven-file Task 7 suite passed with 21 tests after implementing the homepage, useful Suspense fallback, family route, build-highlighted hunt details, and metadata. A nested async-renderer failure was reproduced and corrected by completing Shiki work before returning the page tree.
- Self-review RED/GREEN: the hunt page test first failed because required device/protocol scope was absent from the detail header; it passed after the header rendered both fields from the validated hunt record.

## Changed files and architecture

- `app/page.tsx` and `data/home.ts` now render the structured origin/transit hero, appliance characteristics, plane explorer, four family entries, registry-derived flagship hunts, independent-observation equation, and next steps.
- `app/hunts/page.tsx` wraps the URL-backed `HuntCatalog` client island in server-page `Suspense`; the fallback exposes all validated hunts as usable links without JavaScript.
- `app/hunts/[slug]/page.tsx` exports `dynamicParams = false`, delegates static parameters and exact resolution to pure helpers, generates route-specific metadata, and renders families or hunt details through one shared segment.
- `lib/hunt-routes.ts` resolves families before hunts, rejects non-canonical/unknown segments, and deterministically returns four family params followed by twenty hunt params.
- `HuntCard` is one coherent accessible trailing-slash link. `HuntCatalog` uses the existing pure parser, serializer, and filter functions with Next navigation hooks; protocol and telemetry choices are derived from the passed records.
- Hunt detail rendering follows the approved operational order, includes every required hunt field, explains recommended/optional telemetry from the validated telemetry registry, highlights local queries only during server/build rendering, and omits the genuinely absent timeline section.
- `app/globals.css` adds the calm field-manual layout, responsive card/filter/detail grids, internal overflow containment, focus treatment for selects, and reduced-motion-compatible transitions.
- Tests cover card/link semantics, every filter dimension, canonical query updates, malformed URL values, chips/reset, useful fallback content, homepage inventory, route count/order/resolution/metadata, family rendering, hunt content, and section order.

## Verification and export audit

- Focused Task 7 regression suite: passed — 7 files, 21 tests.
- Full `npm test`: passed — 25 files, 104 tests.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed, including the production content gate and 29 total generated pages.
- `out/hunts/` contains exactly 25 `index.html` files: one catalog, four family pages, and twenty hunt pages.
- The catalog static HTML contains the explanatory loading/fallback message and all twenty hunt links; filtered behavior hydrates into the tested client island.
- All emitted internal hunt links use trailing slashes. The 24 family/detail outputs have 24 unique, non-empty titles and 24 unique, non-empty descriptions.
- The SNMP detail HTML contains the approved section sequence, both query adaptation warnings, and Shiki-highlighted markup. No `codeToHtml`, `github-dark`, `shiki/core`, or `shiki/engine` signature appears in emitted client chunks.
- `git diff --check`: passed; only the environment's existing LF-to-CRLF notices were emitted.

## Commit

- Task commit message: `feat: add searchable infrastructure hunt catalog`.
- This report is included in that containing commit; its exact hash is returned to the SDD controller after commit creation.

## Concerns

- Canonical URL metadata remains intentionally deferred to Task 10's shared metadata helper; Task 7 supplies unique title, description, and Open Graph metadata for all shared hunt routes.
- URL filtering requires JavaScript by design. The static Suspense fallback remains useful without JavaScript by exposing the complete hunt catalog rather than an empty loading shell.
- No current hunt record contains timeline data in the validated schema, so the optional attack-timeline section is correctly absent.
- Git emits a non-blocking warning for an unreadable global ignore file in this environment.
