# hunt-tricks

A static Next.js threat-hunting workbench across identities, systems, networks, and AI. Scope, behavior, and temporal filters connect operational hypotheses to telemetry, adaptable queries, and claim-linked research. Existing infrastructure routes remain available.

High velocity can be scripted just as readily as AI-driven. Speed alone does not identify AI involvement. Methodology covers behavior, velocity, and AI/autonomy, alongside the original baselining, rarity, and independent-observation guides.

## Local commands

Use Node **24.18.0** (recorded in `.nvmrc`) and npm **11.16.0**. The supported runtime is Node 24.18 or newer in the 24.x line, with npm 11. Install the committed dependency versions with `npm ci`.

```powershell
npm ci
npm run dev
```

Run the complete non-browser quality gate and production build:

```powershell
npm run check
npm run build
npm run validate:research
```

Install the pinned browser once, then run the production-export Playwright journeys:

```powershell
npx playwright install chromium
npm run test:e2e
```

Preview an existing static export at `http://localhost:4173`:

```powershell
npm run preview:static
```

## Static-host configuration

The build writes a backend-free site to `out/`. Set the public site URL and, when hosting below an origin subpath, the matching base path before building:

```powershell
$env:NEXT_PUBLIC_SITE_URL = "https://docs.example.com/guide"
$env:NEXT_PUBLIC_BASE_PATH = "/guide"
npm run build
```

`NEXT_PUBLIC_SITE_URL` is the canonical public URL (`SITE_URL`) and may include the deployment prefix. `NEXT_PUBLIC_BASE_PATH` is the path prefix (`BASE_PATH`), such as `/guide`; omit it for origin-root hosting. Both values are build-time configuration, so rebuild after changing them and publish the contents of `out/` at the configured path.

For a GitHub Pages repository site, use `https://OWNER.github.io/REPOSITORY` and `/REPOSITORY`. For a custom domain or `OWNER.github.io` repository at the origin root, leave the base path empty. `.env.example` lists the settings; the `.example` domain is a local placeholder and must be replaced for publication.

The export includes `.nojekyll` from `public/`. Preserve that file when publishing the export through Pages' branch source so `_next/` assets are served. A Pages Actions deployment can instead publish the generated artifact directly. The included CI workflow verifies the application; it does not deploy it. The live URL and hosting destination have not yet been selected.

## Checks and contributions

GitHub Actions runs the locked installation, lint, typecheck, unit tests, research-annex validation, dependency audit, production export, and desktop/mobile Chromium journeys. Local `npm run test:e2e` builds the export automatically when port 4173 is free; stop an old preview first to avoid testing stale files.

See [CONTRIBUTING.md](CONTRIBUTING.md) for bug reports and source corrections. The live content is in `data/` and `content/`; `docs/research/` preserves a dated research annex with proposals that are not automatically published on the site.

License selection is pending. No project license has been added.
