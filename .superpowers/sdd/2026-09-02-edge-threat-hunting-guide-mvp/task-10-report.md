# Task 10 Report: Attack paths, research, about, and metadata

## Outcome

- Added `/attack-paths/` with all four validated attack paths, the existing `AttackPathDiagram`, visible ordered interpretations, and links to validated hunt records.
- Added `/research/` with static organization navigation and grouped cards containing every validated report's title, organization, ISO publication date, affected technology, observed behaviors, related hunts, summary, and safely linked primary source.
- Added `/about/` with the guide's purpose, origin-versus-transit model, query-adaptation guidance, MVP boundaries, and a future contribution direction that explicitly states there is no submission backend.
- Added canonical and Open Graph metadata to every page route through one base-path-aware helper. `NEXT_PUBLIC_SITE_URL` falls back to `https://hunt-the-infrastructure.example`; both it and `NEXT_PUBLIC_BASE_PATH` are normalized so the deployment path appears exactly once.
- Added a deterministic 59-entry sitemap covering 11 fixed routes, four hunt families, 20 hunts, and 24 protocols. No research detail routes are fabricated.
- Added an allow-all robots policy and a build-time, network-free 1200×630 Open Graph PNG.
- Preserved the existing static query/search implementation and full `output: "export"` build.

## Test-driven evidence

The metadata and route-inventory tests were first run before the implementation and failed because `lib/metadata.ts`, `app/sitemap.ts`, `app/robots.ts`, and the three informational routes did not exist. After implementation:

- `npm test -- tests/metadata.test.ts tests/static-routes.test.ts tests/secondary-content.test.ts` — 3 files, 19 tests passed.
- `npm test -- tests/metadata.test.ts tests/static-routes.test.ts` — 2 files, 8 tests passed after aligning the explicit OG URL with Next's extensionless exported image route.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test` — 34 files, 145 tests passed.

## Production builds and artifact audit

- Default `npm run build` — passed; Next generated 65 static/SSG pages and metadata routes.
- Default output audit — 59 sitemap locations, zero missing page artifacts, zero canonical mismatches, allow-all robots policy, Open Graph metadata pointing to the emitted `out/opengraph-image` asset, and a 1200×630 PNG (43,375 bytes).
- Base-path build with `NEXT_PUBLIC_SITE_URL=https://docs.example.test/guide/` and `NEXT_PUBLIC_BASE_PATH=/guide` — passed.
- Base-path output audit — all 59 sitemap URLs, root/research canonicals, robots sitemap URL, Open Graph image URL, and Next static asset URLs contained `/guide` exactly once.

Next 16 requires functional metadata routes to opt into static generation under `output: "export"`; `opengraph-image`, `robots`, and `sitemap` therefore export `dynamic = "force-static"`.

## Concerns

None. The research page links only to already validated HTTP(S) registry URLs, and no runtime service or contribution endpoint was introduced.

## Fix round 1: deployment regressions

- Replaced the extensionless `app/opengraph-image.tsx` metadata route with the force-static `app/opengraph-image.png/route.ts` route handler. Page metadata now references `/opengraph-image.png`.
- Changed deployment-path deduplication from full-path equality to normalized segment-suffix comparison. A site URL ending in `/docs/guide/` and base path `/guide` now retains `/docs/guide/`; `/docs/`, `/guide`, and the near-match `/docs/my-guide/` retain their distinct expected behavior.
- Added focused regressions for the `.png` URL and response MIME, parent-prefix, exact-base, absent-base, near-match suffix, and the unchanged 59-page inventory.

Verification evidence:

- `npm test -- tests/metadata.test.ts tests/open-graph-asset.test.ts tests/static-routes.test.ts` — 3 files, 13 tests passed.
- A production build with `NEXT_PUBLIC_SITE_URL=https://docs.example.test/docs/guide/` and `NEXT_PUBLIC_BASE_PATH=/guide` completed in the disposable verification copy at `C:\Users\Mango\edgeTH\.task10-verify`; Next generated 65 routes including `/opengraph-image.png`.
- Export audit confirmed 59 sitemap entries, no doubled `/docs/guide/guide/` prefix, matching canonical/robots/Open Graph URLs, a PNG signature, and 1200×630 dimensions.
- Serving that export with the project's generic static server and requesting `HEAD /opengraph-image.png` returned `200 OK`, `Content-Disposition: inline; filename="opengraph-image.png"`, and `Content-Type: image/png`.

The original generated directory `C:\Users\Mango\edgeTH\.worktrees\edge-threat-hunting-guide-mvp\out` remains locked at the directory level on Windows: both `Remove-Item` and `Rename-Item` report that another process is using it after its contents were removed. The owned audit-server Node processes (PIDs 25212 and 25228, started at 09:11) were stopped, the audit terminal session was exited, no listener remained on port 4173, and no remaining process command line referenced `serve out`, port 4173, or the locked path. Local `openfiles.exe` handle enumeration was unavailable with `Access is denied`, so no additional process was terminated. The successful verification copy uses a physical `node_modules`; Turbopack rejected an initial junction because it pointed outside the project root. Keep `.task10-verify` as a generated, disposable build environment until the original handle clears. A fresh copy/worktree with physical dependencies is the safe fallback for Task 11; do not broadly terminate unrelated Node or Codex processes.
