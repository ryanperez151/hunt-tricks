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
