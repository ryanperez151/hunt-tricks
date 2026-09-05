# Hunt the Infrastructure

A static Next.js field guide for threat hunting on routers, firewalls, switches, VPN gateways, and other network infrastructure.

## Local commands

```powershell
npm install
npm run dev
```

Run the complete non-browser quality gate and production build:

```powershell
npm run check
npm run build
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
