# Hunt the Infrastructure MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and verify the complete, fully static “Hunt the Infrastructure” threat-hunting field guide defined in the approved design.

**Architecture:** A Next.js App Router application statically exports every route. Zod-validated TypeScript registries supply structured security content, local MDX supplies long-form methodology prose, server components render primary content, and small client islands provide URL-backed filtering, search, copy controls, navigation, and diagram toggles.

**Tech Stack:** Next.js 16.3.4, React 19.2.8, TypeScript 7.0.2, Tailwind CSS 4.3.3, Zod 4.5.4, Fuse.js 7.5.0, Lucide React 1.39.0, Shiki 4.4.3, MDX, Vitest 4.1.11, Testing Library, Playwright 1.62.1, and Serve 14.2.6.

**Spec:** `docs/superpowers/specs/2026-09-02-edge-threat-hunting-guide-design.md`

## Global Constraints

- Configure Next.js with `output: "export"`; the built site must require no runtime server, database, authentication, CMS, API route, or third-party security integration.
- Keep threat hunts, protocol knowledge, telemetry, research, and attack paths in validated content modules rather than embedding records in page components.
- Render vendor-neutral detection strategy before every platform-specific query and display “Adapt field names and data models to your environment.” with every query.
- Never execute query content; research URLs are inert data and external links use safe attributes.
- Generate every hunt, hunt-family, and protocol route at build time; no dynamic route may depend on request data.
- Preserve the four family URLs exactly: `/hunts/management-plane-c2`, `/hunts/infrastructure-lateral-movement`, `/hunts/discovery-credential-access`, and `/hunts/traffic-manipulation`.
- Include exactly the 20 required launch hunts and all 24 required protocols; the five flagship hunt concepts receive full operational depth.
- Query-library data must aggregate from hunt definitions and global search must index hunts, protocols, queries, research, and methodology without a second content source.
- Use lightweight CSS/SVG diagrams with structured inputs; do not add a graph visualization dependency.
- Meet semantic HTML, keyboard navigation, visible focus, contrast, reduced-motion, textual-diagram-equivalent, and non-color-only communication requirements.
- Optimize first for 1440px and remain usable at 1024px, 768px, and 390px; wide tables and code blocks scroll within their containers.
- Use test-first red-green-refactor for behavioral production code, keep tests focused on observable behavior, and preserve a successful static production build after each task.
- Do not implement vendor packs, an ATT&CK explorer, detection-as-code export, community submission workflows, artifact export, a baseline generator, accounts, or live SIEM integrations.

## File map

### Tooling and application shell

- `package.json` — pinned dependencies and verification scripts.
- `package-lock.json` — reproducible npm dependency graph.
- `next.config.mjs` — MDX integration, static export, trailing slashes, and unoptimized local images.
- `tsconfig.json` — strict TypeScript and `@/*` alias.
- `eslint.config.mjs` — Next.js core-web-vitals and TypeScript lint rules.
- `postcss.config.mjs` — Tailwind 4 PostCSS plugin.
- `vitest.config.ts` — jsdom/component-test setup and path aliases.
- `playwright.config.ts` — static preview server and desktop/mobile projects.
- `mdx-components.tsx` — accessible MDX element mappings.
- `app/layout.tsx`, `app/globals.css`, `app/not-found.tsx` — root metadata, visual tokens, shell, and 404.
- `components/layout/Header.tsx`, `MobileNavigation.tsx`, `Footer.tsx` — shared navigation shell.

### Content and validation

- `lib/schemas.ts` — Zod contracts and inferred content types.
- `lib/taxonomy.ts` — family, severity, plane, platform, device, protocol, and telemetry vocabularies.
- `lib/content.ts` — validated registries, lookups, and cross-reference integrity checks.
- `data/navigation.ts` — primary navigation records.
- `data/home.ts`, `families.ts` — homepage concepts, diagrams, and family labels/objectives.
- `data/hunts/*.ts` — four focused hunt-family files and a combined export.
- `data/protocols.ts`, `telemetry.ts`, `research.ts`, `methodology.ts`, `attack-paths.ts` — secondary registries.
- `content/methodology/*.mdx` — the three long-form methodology bodies.

### Domain logic

- `lib/filters.ts` — parsed URL filter state, serialization, and hunt filtering.
- `lib/queries.ts` — query aggregation from hunts.
- `lib/search.ts` — normalized multi-object search index and Fuse search.
- `lib/highlight.ts` — server/build-only Shiki conversion for trusted local queries.
- `lib/metadata.ts` — canonical URL and metadata helpers.

### Reusable UI

- `components/common/Tag.tsx`, `SeverityBadge.tsx`, `CopyButton.tsx`, `CodeBlock.tsx`, `SectionHeading.tsx`, `OriginMatters.tsx`.
- `components/hunts/HuntCard.tsx`, `HuntFilters.tsx`, `HuntCatalog.tsx`, `HuntHeader.tsx`, `HuntQuery.tsx`, `BehaviorComparison.tsx`, `TelemetryRequirements.tsx`, `InvestigationChecklist.tsx`.
- `components/diagrams/NetworkFlow.tsx`, `PlaneExplorer.tsx`, `ProtocolFlowDiagram.tsx`, `AttackTimeline.tsx`, `AttackPathDiagram.tsx`.
- `components/search/SearchProvider.tsx`, `SearchDialog.tsx`, `SearchTrigger.tsx`.
- `components/queries/QueryLibrary.tsx` and `components/telemetry/TelemetryMatrix.tsx`.

### Routes

- `app/page.tsx` — field-guide homepage.
- `app/hunts/page.tsx`, `app/hunts/[slug]/page.tsx` — catalog plus shared family/detail static route.
- `app/protocols/page.tsx`, `app/protocols/[slug]/page.tsx` — protocol explorer.
- `app/telemetry/page.tsx`, `app/queries/page.tsx`, `app/attack-paths/page.tsx`, `app/research/page.tsx`, `app/about/page.tsx`.
- `app/methodology/{baselining,rarity,independent-observation}/page.tsx` — MDX-backed methodology.
- `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` — static discovery and sharing metadata.

### Tests

- `tests/setup.ts`, `tests/test-utils.tsx` — common component-test setup.
- `tests/schema.test.ts`, `content-integrity.test.ts`, `content-lookups.test.ts`, `filters.test.ts`, `queries.test.ts`, `search.test.ts`, `metadata.test.ts` — domain tests.
- `tests/components/*.test.tsx` — reusable component behavior.
- `tests/e2e/critical-journeys.spec.ts` and `responsive.spec.ts` — Playwright journeys.

---

### Task 1: Bootstrap the static application and accessible shell

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`
- Create: `tests/components/Header.test.tsx`
- Create: `data/navigation.ts`
- Create: `components/layout/Header.tsx`
- Create: `components/layout/MobileNavigation.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/not-found.tsx`
- Create: `app/icon.svg`
- Create: `.gitignore`

**Interfaces:**
- Consumes: None; this bootstraps the project.
- Produces: `navigation`, `Header`, `Footer`, global visual tokens, the root static-export configuration, and executable `lint`, `typecheck`, `test`, and `build` scripts.

- [ ] **Step 1: Add the pinned toolchain and generated configuration**

Create `package.json` with these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "preview:static": "serve out -l 4173",
    "check": "npm run lint && npm run typecheck && npm test"
  }
}
```

Pin the versions named in the plan header; add `react-dom@19.2.8`, `@next/mdx@16.3.4`, `@mdx-js/loader@3.1.1`, `@mdx-js/react@3.1.1`, `@types/mdx@2.0.14`, `@tailwindcss/postcss@4.3.3`, `postcss@8.5.26`, `eslint@10.9.1`, `eslint-config-next@16.3.4`, `@testing-library/react@16.3.3`, `@testing-library/jest-dom@7.0.1`, `@testing-library/user-event@14.6.7`, `jsdom@30.0.1`, `@vitejs/plugin-react@6.1.1`, and `serve@14.2.6`. Generate the lockfile with `npm install`.

Configure `next.config.mjs` as:

```js
import createMDX from "@next/mdx";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const withMDX = createMDX({});

export default withMDX({
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
});
```

- [ ] **Step 2: Write the failing shell test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/Header";

test("exposes primary navigation and an operable mobile menu", async () => {
  const user = userEvent.setup();
  render(<Header />);
  expect(screen.getByRole("link", { name: /hunt the infrastructure/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /open navigation/i }));
  expect(screen.getByRole("dialog", { name: /navigation/i })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog", { name: /navigation/i })).not.toBeInTheDocument();
});
```

- [ ] **Step 3: Run the focused test and confirm RED**

Run: `npm test -- tests/components/Header.test.tsx`

Expected: FAIL because `Header` and its navigation dependencies do not exist.

- [ ] **Step 4: Implement the shell and visual foundation**

Use semantic `header`, `nav`, `main`, and `footer` landmarks. The mobile dialog closes on Escape, returns focus to its trigger, and uses an explicit close button. Define CSS variables for navy backgrounds, panel layers, cyan/teal interaction, amber caution, sparing red risk, muted text, borders, monospace, content widths, focus ring, and reduced motion. The temporary home page contains the approved headline and actions so the app is useful while later sections arrive.

- [ ] **Step 5: Verify GREEN and the static build**

Run: `npm test -- tests/components/Header.test.tsx`

Expected: PASS with one shell behavior test.

Run: `npm run lint && npm run typecheck && npm run build`

Expected: all commands exit 0 and `out/index.html` exists.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json next.config.mjs tsconfig.json next-env.d.ts eslint.config.mjs postcss.config.mjs vitest.config.ts tests app components data .gitignore
git commit -m "feat: establish threat hunting guide foundation"
```

---

### Task 2: Define schemas, taxonomies, and validation errors

**Files:**
- Create: `lib/taxonomy.ts`
- Create: `lib/schemas.ts`
- Create: `lib/content.ts`
- Create: `tests/schema.test.ts`
- Create: `tests/content-integrity.test.ts`
- Create: `tests/test-utils.tsx`

**Interfaces:**
- Consumes: Zod 4.5.4.
- Produces: `HuntSchema`, `HuntQuerySchema`, `ProtocolSchema`, `TelemetrySchema`, `ResearchSchema`, `AttackPathSchema`, inferred public types, `validateContentRegistries(registries): void`, and exact shared taxonomy constants.

- [ ] **Step 1: Write failing schema tests**

```ts
import { describe, expect, test } from "vitest";
import { HuntSchema } from "@/lib/schemas";
import { makeHunt } from "./test-utils";

describe("HuntSchema", () => {
  test("accepts a complete hunt", () => {
    expect(HuntSchema.parse(makeHunt()).slug).toBe("test-hunt");
  });

  test.each([
    ["hypothesis", ""],
    ["investigationSteps", []],
    ["references", [{ title: "bad", url: "javascript:alert(1)" }]],
  ])("rejects invalid %s", (key, value) => {
    expect(() => HuntSchema.parse({ ...makeHunt(), [key]: value })).toThrow();
  });
});
```

Add `tests/test-utils.tsx` with `makeHunt()` returning a full valid record including one pseudocode query, one HTTP(S) reference, expected/suspicious flows, and one investigation step.

- [ ] **Step 2: Run the schema test and confirm RED**

Run: `npm test -- tests/schema.test.ts`

Expected: FAIL because schemas and fixtures are absent.

- [ ] **Step 3: Implement schemas and exact taxonomies**

Export readonly arrays for the four family slugs, four severities, three confidence values, three planes, four query platforms, required devices, the 24 protocol names, and telemetry keys. Use `z.enum()` from those tuples. Model diagram nodes and directed edges once and reuse them across hunts, protocols, and attack paths. A hunt's `telemetry` value is `{ recommended: TelemetryKey[]; optional: TelemetryKey[] }`, requires at least one recommended source, and contains no duplicate key across the two groups. A behavior comparison is `{ expected: FlowDefinition; suspicious: FlowDefinition }`; each `FlowDefinition` contains `title`, structured `nodes`, structured directed `edges`, and a non-empty `textAlternative` string array. Infer TypeScript types with `z.infer` rather than maintaining parallel interfaces.

- [ ] **Step 4: Verify schemas GREEN**

Run: `npm test -- tests/schema.test.ts`

Expected: PASS for valid and invalid records.

- [ ] **Step 5: Write failing cross-reference tests**

```ts
test("rejects duplicate and broken content relationships", () => {
  const hunt = makeHunt();
  expect(() => validateContentRegistries({
    hunts: [hunt, { ...hunt }],
    protocols: [], telemetry: [], research: [], attackPaths: [],
  })).toThrow(/duplicate hunt slug/i);

  expect(() => validateContentRegistries({
    hunts: [{ ...hunt, relatedHunts: ["missing-hunt"] }],
    protocols: [], telemetry: [], research: [], attackPaths: [],
  })).toThrow(/missing-hunt/i);
});
```

Cover family-slug collisions, unknown protocols, unknown telemetry, invalid protocol/research related-hunt slugs, and duplicate IDs/slugs.

- [ ] **Step 6: Run cross-reference tests and confirm RED**

Run: `npm test -- tests/content-integrity.test.ts`

Expected: FAIL because `validateContentRegistries` is absent.

- [ ] **Step 7: Implement integrity validation with descriptive errors**

Parse each registry first, then accumulate relationship errors containing record kind, slug or ID, field, and invalid value. Throw one `ContentIntegrityError` with all issues so a build reports every malformed record in a single run.

- [ ] **Step 8: Verify GREEN and commit**

Run: `npm test -- tests/schema.test.ts tests/content-integrity.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: exit 0 and the existing static shell remains exportable.

```bash
git add lib tests
git commit -m "feat: add structured threat hunting content model"
```

---

### Task 3: Seed protocols, telemetry, methodology, attack paths, and research

**Files:**
- Create: `data/protocols.ts`
- Create: `data/telemetry.ts`
- Create: `data/home.ts`
- Create: `data/families.ts`
- Create: `data/methodology.ts`
- Create: `data/attack-paths.ts`
- Create: `data/research.ts`
- Create: `content/methodology/baselining.mdx`
- Create: `content/methodology/rarity.mdx`
- Create: `content/methodology/independent-observation.mdx`
- Create: `mdx-components.tsx`
- Create: `tests/secondary-content.test.ts`

**Interfaces:**
- Consumes: schemas and taxonomy from Task 2.
- Produces: validated `protocols`, `telemetrySources`, `methodologyEntries`, `attackPaths`, and `researchEntries` registries plus three importable MDX bodies.

- [ ] **Step 1: Write the failing registry completeness test**

```ts
test("seeds every required protocol and secondary collection", () => {
  expect(protocols.map((item) => item.name)).toEqual([
    "SSH", "HTTPS", "SNMP", "TACACS+", "RADIUS", "LDAP", "LDAPS",
    "NETCONF", "RESTCONF", "SCP", "SFTP", "TFTP", "DNS", "NTP",
    "BGP", "OSPF", "GRE", "IPsec", "VXLAN", "SMB", "RDP", "WinRM",
    "WireGuard", "OpenVPN",
  ]);
  expect(telemetrySources).toHaveLength(8);
  expect(huntFamilies).toHaveLength(4);
  expect(homeContent.originQuestion).toMatch(/forwarded BY|initiated FROM/);
  expect(methodologyEntries).toHaveLength(3);
  expect(attackPaths.map((item) => item.title)).toEqual([
    "Infrastructure Pivot", "Credential Collection", "Covert Tunnel", "Telemetry Suppression",
  ]);
  expect(researchEntries.length).toBeGreaterThanOrEqual(6);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/secondary-content.test.ts`

Expected: FAIL because the registries do not exist.

- [ ] **Step 3: Implement the protocol registry**

Give each of the 24 protocols a slug, category, port or encapsulation identifier, definition, infrastructure uses, expected direction narrative, suspicious patterns, attacker abuse cases, normal flow, suspicious flow, and initially empty related-hunt array. Use a directionally correct SNMP example: NMS to router on UDP/161 and router to NMS on UDP/162; flag router-originated UDP/161 fan-out as suspicious.

- [ ] **Step 4: Implement telemetry and methodology registries**

Define NetFlow/IPFIX, DNS, AAA, Configuration Diffs, CLI Audit, Zeek, Packet Capture, and Syslog with word-based coverage values `low | medium | high`. Define the four family labels/objectives and homepage hero copy, appliance characteristics, origin/transit examples, plane examples, and independent-observation equation as structured data. Write the three MDX bodies with the exact expected-dependency inventory, rarity-factor list, allow-matrix rows, and independent telemetry sources from the design. Map prose elements through `mdx-components.tsx` to semantic, styled components.

- [ ] **Step 5: Implement four attack paths and curated research**

Represent ordered nodes and labeled edges for Infrastructure Pivot, Credential Collection, Covert Tunnel, and Telemetry Suppression. Seed these primary-source research entries, summarize only infrastructure-relevant behaviors, and reserve related-hunt slugs for records introduced in Task 4:

- CISA, “Countering Chinese State-Sponsored Actors Compromise of Networks Worldwide to Feed Global Espionage System,” 2025-08-27, `https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a`.
- Cisco Talos, “ArcaneDoor — New espionage-focused campaign found targeting perimeter network devices,” 2024-04-24, `https://blog.talosintelligence.com/arcanedoor-new-espionage-focused-campaign-found-targeting-perimeter-network-devices/`.
- Mandiant, “Ghost in the Router: China-Nexus Espionage Actor UNC3886 Targets Juniper Routers,” 2025-03-11, `https://cloud.google.com/blog/topics/threat-intelligence/china-nexus-espionage-targets-juniper-routers`.
- Mandiant, “Cloaked and Covert: Uncovering UNC3886 Espionage Operations,” 2024-06-18, `https://cloud.google.com/blog/topics/threat-intelligence/uncovering-unc3886-espionage-operations`.
- NCSC, “UK Internet Edge Router Devices: Advisory,” 2017-08-11, `https://www.ncsc.gov.uk/information/uk-internet-edge-router-devices-advisory`.
- Microsoft Threat Intelligence, “SOHO router compromise leads to DNS hijacking and adversary-in-the-middle attacks,” 2026-04-07, `https://www.microsoft.com/en-us/security/blog/2026/04/07/soho-router-compromise-leads-to-dns-hijacking-and-adversary-in-the-middle-attacks/`.
- CISA, “PRC State-Sponsored Actors Compromise and Maintain Persistent Access to U.S. Critical Infrastructure,” 2024-02-07, `https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a`.

- [ ] **Step 6: Verify GREEN and schema parsing**

Run: `npm test -- tests/secondary-content.test.ts tests/schema.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add data content mdx-components.tsx tests/secondary-content.test.ts
git commit -m "content: add protocol telemetry and research foundations"
```

---

### Task 4: Seed the 20-hunt dataset with five flagship hunts

**Files:**
- Create: `data/hunts/management-plane-c2.ts`
- Create: `data/hunts/infrastructure-lateral-movement.ts`
- Create: `data/hunts/discovery-credential-access.ts`
- Create: `data/hunts/traffic-manipulation.ts`
- Create: `data/hunts/index.ts`
- Modify: `data/protocols.ts`
- Modify: `data/research.ts`
- Modify: `lib/content.ts`
- Create: `tests/hunts.test.ts`
- Create: `tests/content-lookups.test.ts`

**Interfaces:**
- Consumes: all schemas and secondary registries.
- Produces: `hunts`, `getHuntBySlug`, `getProtocolBySlug`, `getRelatedHunts`, `getHuntsByFamily`, and a module-load integrity gate used by routes and builds.

- [ ] **Step 1: Write failing hunt completeness and quality tests**

```ts
const requiredTitles = [
  "Unexpected Management Interface Egress",
  "New Infrastructure External Destination",
  "Infrastructure Beaconing",
  "Suspicious Infrastructure DNS",
  "Alternate DNS Resolver",
  "Unexpected SSH Egress",
  "Firewall-to-Router SSH",
  "Router-to-Router SSH",
  "Device-to-Device HTTPS Administration",
  "SNMP Fan-Out",
  "SNMP From Unexpected Initiator",
  "New AAA Destination",
  "Unexpected LDAP From Infrastructure",
  "Packet Capture Started",
  "Packet Capture Followed by File Transfer",
  "Unexpected GRE Tunnel",
  "New IPsec Tunnel",
  "Logging Destination Modified",
  "Infrastructure Telemetry Gap",
  "Management ACL Modified",
];

test("ships exactly the required launch hunts", () => {
  expect(hunts).toHaveLength(20);
  expect(hunts.map((hunt) => hunt.title)).toEqual(requiredTitles);
});

test.each([
  "unexpected-management-interface-egress",
  "infrastructure-beaconing",
  "firewall-to-router-ssh",
  "snmp-fan-out",
  "unexpected-gre-tunnel",
])("gives flagship hunt %s full operational depth", (slug) => {
  const hunt = getHuntBySlug(slug)!;
  expect(hunt.queries.length).toBeGreaterThanOrEqual(2);
  expect(hunt.investigationSteps.length).toBeGreaterThanOrEqual(8);
  expect(hunt.escalationConditions.length).toBeGreaterThanOrEqual(4);
  expect(hunt.behaviorComparison).toBeDefined();
  expect(hunt.rationale.length).toBeGreaterThan(180);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/hunts.test.ts`

Expected: FAIL because hunt registries do not exist.

- [ ] **Step 3: Author the management-plane and lateral-movement hunts**

Add the first 11 required records in exact title order. Preserve the supplied Splunk query for Unexpected Management Interface Egress verbatim. Provide Splunk/KQL/Zeek where meaningful and pseudocode otherwise. Fully develop Unexpected Management Interface Egress, Infrastructure Beaconing, Firewall-to-Router SSH as the generic Device-to-Device SSH flagship, and SNMP Fan-Out.

- [ ] **Step 4: Author discovery and manipulation hunts**

Add the remaining nine records. Fully develop Unexpected GRE Tunnel. Every non-flagship hunt still includes a specific hypothesis, rationale, detection strategy, at least four investigation steps, escalation conditions, false positives, enrichment ideas, a query or pseudocode strategy, defensible techniques, telemetry, and valid related-hunt references.

- [ ] **Step 5: Complete secondary cross-references and validated exports**

Fill protocol and research related-hunt arrays only with real slugs. In `lib/content.ts`, parse all registries, call the integrity validator during module initialization, expose immutable validated arrays, and make missing lookups return `undefined` rather than throw.

- [ ] **Step 6: Write and run lookup tests**

```ts
test("resolves related hunts without broken references", () => {
  const related = getRelatedHunts(getHuntBySlug("snmp-fan-out")!);
  expect(related.length).toBeGreaterThan(0);
  expect(related.every(Boolean)).toBe(true);
});

test("returns undefined for unknown slugs", () => {
  expect(getHuntBySlug("not-real")).toBeUndefined();
  expect(getProtocolBySlug("not-real")).toBeUndefined();
});
```

Run: `npm test -- tests/hunts.test.ts tests/content-lookups.test.ts tests/content-integrity.test.ts`

Expected: PASS with all 20 hunts and valid relationships.

Run: `npm run build`

Expected: exit 0 with validated content imported by the static build.

- [ ] **Step 7: Commit**

```bash
git add data/hunts data/protocols.ts data/research.ts lib/content.ts tests
git commit -m "content: add flagship infrastructure hunts"
```

---

### Task 5: Implement filtering, query aggregation, and search logic

**Files:**
- Create: `lib/filters.ts`
- Create: `lib/queries.ts`
- Create: `lib/search.ts`
- Create: `tests/filters.test.ts`
- Create: `tests/queries.test.ts`
- Create: `tests/search.test.ts`

**Interfaces:**
- Consumes: validated `hunts`, `protocols`, `researchEntries`, and `methodologyEntries`.
- Produces: `parseHuntFilters`, `serializeHuntFilters`, `filterHunts`, `aggregateQueries`, `buildSearchIndex`, and `searchGuide`.

- [ ] **Step 1: Write failing filter tests**

```ts
test("combines categories with AND and values within a category with OR", () => {
  const results = filterHunts(hunts, {
    families: ["management-plane-c2", "traffic-manipulation"],
    protocols: ["DNS", "GRE"],
    devices: [], planes: [], severities: [], telemetry: [],
  });
  expect(results.map((hunt) => hunt.slug)).toEqual(expect.arrayContaining([
    "suspicious-infrastructure-dns", "unexpected-gre-tunnel",
  ]));
  expect(results.every((hunt) => hunt.protocols.includes("DNS") || hunt.protocols.includes("GRE"))).toBe(true);
});

test("round-trips filter state through URLSearchParams", () => {
  const filters = parseHuntFilters(new URLSearchParams("protocol=SNMP&severity=high&severity=critical"));
  expect(parseHuntFilters(serializeHuntFilters(filters))).toEqual(filters);
});
```

- [ ] **Step 2: Run filter tests and confirm RED**

Run: `npm test -- tests/filters.test.ts`

Expected: FAIL because filter functions are absent.

- [ ] **Step 3: Implement normalized URL-backed filtering**

Ignore unknown parameter values, de-duplicate known values, produce deterministic parameter order, and preserve no unrelated parameters. Filtering uses OR within a category and AND across populated categories. A hunt matches a telemetry filter when the key appears in either `telemetry.recommended` or `telemetry.optional`.

- [ ] **Step 4: Verify filter tests GREEN**

Run: `npm test -- tests/filters.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing aggregation and search tests**

```ts
test("derives query records from hunts", () => {
  const records = aggregateQueries(hunts);
  expect(records.length).toBe(hunts.reduce((sum, hunt) => sum + hunt.queries.length, 0));
  expect(records.find((item) => item.huntSlug === "unexpected-management-interface-egress")?.platform).toBe("splunk");
});

test("search labels and ranks SNMP content", () => {
  const results = searchGuide("SNMP");
  expect(results[0].type).toMatch(/HUNT|PROTOCOL/);
  expect(results.some((result) => result.title === "SNMP Fan-Out" && result.type === "HUNT")).toBe(true);
  expect(results.some((result) => result.type === "PROTOCOL")).toBe(true);
});
```

- [ ] **Step 6: Run and confirm RED**

Run: `npm test -- tests/queries.test.ts tests/search.test.ts`

Expected: FAIL because aggregation and search functions are absent.

- [ ] **Step 7: Implement aggregation and Fuse search**

Flatten every query with inherited hunt metadata and a stable ID `${hunt.slug}:${query.platform}:${index}`. Normalize search entries to `type`, `title`, `description`, `href`, `tags`, and `body`; index hunt titles/descriptions/protocols/telemetry/techniques/query text, protocol fields, methodology search terms, research fields, and aggregated queries. Return a curated default result set for an empty query and at most 12 ranked results for text.

- [ ] **Step 8: Verify and commit**

Run: `npm test -- tests/filters.test.ts tests/queries.test.ts tests/search.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: exit 0.

```bash
git add lib tests
git commit -m "feat: add hunt filtering query aggregation and search"
```

---

### Task 6: Build reusable field-guide components and diagrams

**Files:**
- Create: `components/common/Tag.tsx`
- Create: `components/common/SeverityBadge.tsx`
- Create: `components/common/CopyButton.tsx`
- Create: `components/common/CodeBlock.tsx`
- Create: `components/common/SectionHeading.tsx`
- Create: `components/common/OriginMatters.tsx`
- Create: `components/hunts/BehaviorComparison.tsx`
- Create: `components/hunts/TelemetryRequirements.tsx`
- Create: `components/hunts/InvestigationChecklist.tsx`
- Create: `components/diagrams/NetworkFlow.tsx`
- Create: `components/diagrams/PlaneExplorer.tsx`
- Create: `components/diagrams/ProtocolFlowDiagram.tsx`
- Create: `components/diagrams/AttackTimeline.tsx`
- Create: `components/diagrams/AttackPathDiagram.tsx`
- Create: `lib/highlight.ts`
- Create: `tests/highlight.test.ts`
- Create: `tests/components/CopyButton.test.tsx`
- Create: `tests/components/SeverityBadge.test.tsx`
- Create: `tests/components/BehaviorComparison.test.tsx`
- Create: `tests/components/ProtocolFlowDiagram.test.tsx`

**Interfaces:**
- Consumes: diagram/query/telemetry types from Task 2.
- Produces: reusable visual and operational primitives used by every remaining route.

- [ ] **Step 1: Write failing component tests**

```tsx
test("announces a successful copy action", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  render(<CopyButton value="source.device_type IN network_infrastructure" />);
  await userEvent.click(screen.getByRole("button", { name: /copy/i }));
  expect(writeText).toHaveBeenCalledWith("source.device_type IN network_infrastructure");
  expect(screen.getByRole("status")).toHaveTextContent(/copied/i);
});

test("labels expected and suspicious behavior in text", () => {
  render(<BehaviorComparison expected={expectedFlow} suspicious={suspiciousFlow} />);
  expect(screen.getByRole("heading", { name: "Expected" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Suspicious" })).toBeInTheDocument();
  expect(screen.getByText(/Firewall sends HTTPS to Unknown VPS/)).toBeInTheDocument();
});

test("renders protocol flow nodes and an accessible direction statement", () => {
  render(<ProtocolFlowDiagram title="Normal SNMP" nodes={nodes} edges={edges} />);
  expect(screen.getByText("NMS")).toBeInTheDocument();
  expect(screen.getByText(/NMS initiates UDP\/161 to Router/)).toBeInTheDocument();
});

test("renders severity as text and an accessible label", () => {
  render(<SeverityBadge severity="critical" />);
  expect(screen.getByText("CRITICAL")).toHaveAccessibleName("Severity: critical");
});

test("highlights trusted local query text at build time", async () => {
  const html = await highlightQuery("source.device_type = network_infrastructure", "pseudocode");
  expect(html).toContain("shiki");
  expect(html).toContain("source");
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/highlight.test.ts tests/components/CopyButton.test.tsx tests/components/SeverityBadge.test.tsx tests/components/BehaviorComparison.test.tsx tests/components/ProtocolFlowDiagram.test.tsx`

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement common and hunt primitives**

Make severity badges include the severity word, not color alone. `CopyButton` handles rejected clipboard promises with “Copy failed — select the text manually.” in a polite live region. `highlightQuery` imports Shiki only in server/build code, maps the four platforms to fixed Shiki grammars, and returns highlighted HTML. `CodeBlock` accepts that pre-highlighted HTML only from trusted local query data and exposes raw text to `CopyButton`; no client component imports Shiki. The checklist copies an ordered plain-text list without storing state.

- [ ] **Step 4: Implement structured diagrams**

Render visual nodes and directed edges with responsive CSS/SVG, plus an ordered or sentence-based text equivalent that remains visible to screen readers. `PlaneExplorer` is a keyboard-operable tab interface for Data, Management, and Control. All motion or transitions are disabled under `prefers-reduced-motion`.

- [ ] **Step 5: Verify GREEN and commit**

Run: `npm test -- tests/highlight.test.ts tests/components/CopyButton.test.tsx tests/components/SeverityBadge.test.tsx tests/components/BehaviorComparison.test.tsx tests/components/ProtocolFlowDiagram.test.tsx`

Expected: PASS.

Run: `npm run typecheck`

Expected: exit 0.

Run: `npm run build`

Expected: exit 0.

```bash
git add components lib/highlight.ts tests/highlight.test.ts tests/components
git commit -m "feat: add infrastructure behavior visualizations"
```

---

### Task 7: Complete the homepage, hunt catalog, family pages, and hunt details

**Files:**
- Modify: `app/page.tsx`
- Create: `components/hunts/HuntCard.tsx`
- Create: `components/hunts/HuntFilters.tsx`
- Create: `components/hunts/HuntCatalog.tsx`
- Create: `components/hunts/HuntHeader.tsx`
- Create: `components/hunts/HuntQuery.tsx`
- Create: `app/hunts/page.tsx`
- Create: `app/hunts/[slug]/page.tsx`
- Create: `tests/components/HuntCard.test.tsx`
- Create: `tests/components/HuntFilters.test.tsx`
- Create: `tests/hunt-routes.test.ts`

**Interfaces:**
- Consumes: validated hunts, family taxonomy, filter logic, and Task 6 components.
- Produces: full homepage, hunt browser, four family landing pages, and 20 static hunt detail pages through the shared segment resolver.

- [ ] **Step 1: Write failing card and filter tests**

```tsx
test("presents the hunt's operational metadata as one accessible link", () => {
  render(<HuntCard hunt={makeHunt()} />);
  expect(screen.getByRole("link", { name: /test hunt/i })).toHaveAttribute("href", "/hunts/test-hunt/");
  expect(screen.getByText("HIGH")).toBeInTheDocument();
  expect(screen.getByText("SNMP")).toBeInTheDocument();
});

test("updates URL state and can clear all filters", async () => {
  render(<HuntFilters filters={emptyFilters} options={filterOptions} onChange={onChange} />);
  await userEvent.selectOptions(screen.getByLabelText(/protocol/i), "SNMP");
  expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ protocols: ["SNMP"] }));
  await userEvent.click(screen.getByRole("button", { name: /clear all/i }));
  expect(onChange).toHaveBeenLastCalledWith(emptyFilters);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/components/HuntCard.test.tsx tests/components/HuntFilters.test.tsx`

Expected: FAIL because hunt UI does not exist.

- [ ] **Step 3: Implement catalog UI with URL state**

Use `useSearchParams`, `useRouter`, and `usePathname` inside `HuntCatalog`; wrap it in `Suspense` from the server page for static export compatibility. Derive dynamic protocol and telemetry choices from records. Show result count, active chips, clear-all, and a resettable empty state. Preserve deterministic trailing-slash links.

- [ ] **Step 4: Verify catalog components GREEN**

Run: `npm test -- tests/components/HuntCard.test.tsx tests/components/HuntFilters.test.tsx`

Expected: PASS.

- [ ] **Step 5: Write failing route-resolution tests**

```ts
test("generates all family and hunt slugs without collisions", () => {
  const params = getHuntStaticParams();
  expect(params).toHaveLength(24);
  expect(new Set(params.map(({ slug }) => slug)).size).toBe(24);
  expect(resolveHuntRoute("management-plane-c2")?.kind).toBe("family");
  expect(resolveHuntRoute("snmp-fan-out")?.kind).toBe("hunt");
});
```

- [ ] **Step 6: Run and confirm RED**

Run: `npm test -- tests/hunt-routes.test.ts`

Expected: FAIL because route helpers are absent.

- [ ] **Step 7: Implement home and static hunt routes**

Move pure route helpers to `lib/hunt-routes.ts` so tests do not import Next page modules. `generateStaticParams()` returns those 24 params and `dynamicParams = false`. Resolve family before hunt. Generate unique metadata for both kinds. Hunt details render every section in the approved operational order; highlight queries with Shiki during build and omit only genuinely absent optional sections. The homepage renders the origin/transit hero, four appliance characteristics, plane explorer, family cards, flagship hunts, and independent-observation callout.

- [ ] **Step 8: Verify route tests and static output**

Run: `npm test -- tests/hunt-routes.test.ts tests/components/HuntCard.test.tsx tests/components/HuntFilters.test.tsx`

Expected: PASS.

Run: `npm run build`

Expected: exit 0; `out/hunts/index.html`, four family pages, and all 20 hunt pages exist.

- [ ] **Step 9: Commit**

```bash
git add app/page.tsx app/hunts components/hunts lib/hunt-routes.ts tests
git commit -m "feat: add searchable infrastructure hunt catalog"
```

---

### Task 8: Build the protocol, telemetry, and methodology explorers

**Files:**
- Create: `app/protocols/page.tsx`
- Create: `app/protocols/[slug]/page.tsx`
- Create: `app/telemetry/page.tsx`
- Create: `components/telemetry/TelemetryMatrix.tsx`
- Create: `app/methodology/baselining/page.tsx`
- Create: `app/methodology/rarity/page.tsx`
- Create: `app/methodology/independent-observation/page.tsx`
- Create: `tests/components/TelemetryMatrix.test.tsx`
- Create: `tests/protocol-routes.test.ts`

**Interfaces:**
- Consumes: protocol, telemetry, methodology, hunt, and MDX registries plus diagram primitives.
- Produces: 24 static protocol pages, a protocol catalog, the interactive telemetry matrix, and three long-form methodology pages.

- [ ] **Step 1: Write failing protocol-route and matrix tests**

```ts
test("generates one static route for every protocol", () => {
  expect(getProtocolStaticParams()).toHaveLength(24);
  expect(getProtocolStaticParams()).toContainEqual({ slug: "snmp" });
});
```

```tsx
test("expands a telemetry row with collection guidance", async () => {
  render(<TelemetryMatrix sources={telemetrySources} />);
  await userEvent.click(screen.getByRole("button", { name: /netflow\/ipfix/i }));
  expect(screen.getByText(/collection/i)).toBeVisible();
  expect(screen.getByText(/C2 coverage: high/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/protocol-routes.test.ts tests/components/TelemetryMatrix.test.tsx`

Expected: FAIL because route helper and matrix do not exist.

- [ ] **Step 3: Implement protocol catalog and static details**

Create `lib/protocol-routes.ts`; generate exactly 24 static params with `dynamicParams = false`. Each page answers definition, infrastructure use, normal direction, unusual behavior, abuse, and related hunts, and renders normal/suspicious flow diagrams with textual equivalents.

- [ ] **Step 4: Implement telemetry and MDX-backed methodology**

Make telemetry rows buttons controlling adjacent detail regions with `aria-expanded` and `aria-controls`. Render words alongside coverage styling. Methodology pages import their fixed local MDX module explicitly, add structured hero/context components, show the allow matrix with a scroll container, and include the rarity equation and independent-observation equation as semantic lists rather than images.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/protocol-routes.test.ts tests/components/TelemetryMatrix.test.tsx`

Expected: PASS.

Run: `npm run build`

Expected: exit 0 with 24 protocol pages and all methodology routes in `out`.

```bash
git add app/protocols app/telemetry app/methodology components/telemetry lib/protocol-routes.ts tests
git commit -m "feat: add protocol telemetry and methodology explorers"
```

---

### Task 9: Build the aggregated query library and global search palette

**Files:**
- Create: `components/queries/QueryLibrary.tsx`
- Create: `app/queries/page.tsx`
- Create: `components/search/SearchProvider.tsx`
- Create: `components/search/SearchDialog.tsx`
- Create: `components/search/SearchTrigger.tsx`
- Modify: `components/layout/Header.tsx`
- Modify: `app/layout.tsx`
- Create: `tests/components/QueryLibrary.test.tsx`
- Create: `tests/components/SearchDialog.test.tsx`

**Interfaces:**
- Consumes: `aggregateQueries`, `buildSearchIndex`, and `searchGuide` from Task 5.
- Produces: client-side query filters, `Ctrl/Cmd + K` global search, object-type-labelled results, and header search entry point.

- [ ] **Step 1: Write failing query-library and search-dialog tests**

```tsx
test("filters queries by platform without duplicating query content", async () => {
  render(<QueryLibrary queries={aggregateQueries(hunts)} />);
  await userEvent.selectOptions(screen.getByLabelText(/platform/i), "zeek");
  expect(screen.getAllByTestId("query-card").every((card) => within(card).getByText("ZEEK"))).toBe(true);
});

test("opens by keyboard, searches, closes, and restores trigger focus", async () => {
  render(<SearchProvider entries={buildSearchIndex()}><SearchTrigger /></SearchProvider>);
  const trigger = screen.getByRole("button", { name: /search/i });
  trigger.focus();
  await userEvent.keyboard("{Control>}k{/Control}");
  const input = screen.getByRole("combobox", { name: /search guide/i });
  await userEvent.type(input, "SNMP");
  expect(screen.getByRole("option", { name: /SNMP Fan-Out/ })).toHaveTextContent("HUNT");
  await userEvent.keyboard("{Escape}");
  expect(trigger).toHaveFocus();
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/components/QueryLibrary.test.tsx tests/components/SearchDialog.test.tsx`

Expected: FAIL because client components do not exist.

- [ ] **Step 3: Implement the query library**

Filter by platform, family, protocol, device, telemetry, and technique from the aggregated records. Render platform, inherited hunt context, description, statically highlighted query, adaptation warning, and copy action. Never evaluate query strings or inject them as arbitrary HTML.

- [ ] **Step 4: Implement accessible global search**

The server page precomputes highlighted query HTML with `highlightQuery` and passes serializable display records into the client library. The provider owns dialog state and immutable search entries. Open from button or `Ctrl/Cmd + K`; ignore shortcuts originating in editable controls. The dialog uses an accessible combobox/listbox pattern, traps Tab within the modal, supports ArrowUp/ArrowDown/Enter, closes on Escape or backdrop, restores focus, locks background scroll while open, and reports no results explicitly.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/components/QueryLibrary.test.tsx tests/components/SearchDialog.test.tsx tests/search.test.ts tests/queries.test.ts`

Expected: PASS.

Run: `npm run typecheck && npm run build`

Expected: exit 0.

```bash
git add app/queries app/layout.tsx components/queries components/search components/layout/Header.tsx tests
git commit -m "feat: add query library and global guide search"
```

---

### Task 10: Add attack paths, research, about, and metadata

**Files:**
- Create: `app/attack-paths/page.tsx`
- Create: `app/research/page.tsx`
- Create: `app/about/page.tsx`
- Create: `lib/metadata.ts`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `app/opengraph-image.tsx`
- Modify: all route page files to export metadata.
- Create: `tests/metadata.test.ts`
- Create: `tests/static-routes.test.ts`

**Interfaces:**
- Consumes: all validated registries, `AttackPathDiagram`, and the route helpers.
- Produces: final informational routes, canonical metadata helpers, complete static sitemap, robots policy, and build-time Open Graph image.

- [ ] **Step 1: Write failing metadata and route-inventory tests**

```ts
test("builds canonical URLs from one configured origin", () => {
  expect(createPageMetadata({ title: "SNMP Fan-Out", description: "Hunt SNMP fan-out.", path: "/hunts/snmp-fan-out/" }))
    .toMatchObject({ alternates: { canonical: "https://hunt-the-infrastructure.example/hunts/snmp-fan-out/" } });
});

test("sitemap contains every public static route", () => {
  const routes = buildSitemapEntries().map((entry) => new URL(entry.url).pathname);
  expect(routes).toContain("/attack-paths/");
  expect(routes).toContain("/research/");
  expect(routes).toContain("/hunts/snmp-fan-out/");
  expect(routes).toContain("/protocols/snmp/");
  expect(routes.length).toBeGreaterThanOrEqual(59);
});
```

- [ ] **Step 2: Run and confirm RED**

Run: `npm test -- tests/metadata.test.ts tests/static-routes.test.ts`

Expected: FAIL because helpers and routes do not exist.

- [ ] **Step 3: Implement content routes**

Render all four attack paths with diagrams, ordered-text equivalents, explanations, and related hunts. Render research as filterable-looking but static grouped cards with title, organization, date, affected technology, behaviors, related hunts, and safely linked primary source. About explains purpose, boundaries, query adaptation, origin-versus-transit, and future contribution direction without implying an active submission backend.

- [ ] **Step 4: Implement metadata and discovery files**

Use `NEXT_PUBLIC_SITE_URL` with `https://hunt-the-infrastructure.example` as the deterministic test/build fallback and normalize trailing slashes. Include all fixed routes, four families, 20 hunts, and 24 protocols in the sitemap. Allow all public pages in robots. Generate a static 1200×630 Open Graph image at build time with the product title and subtitle; do not fetch fonts or images from the network.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- tests/metadata.test.ts tests/static-routes.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: exit 0 with attack-paths, research, about, sitemap, robots, and Open Graph assets in `out`.

```bash
git add app lib/metadata.ts tests
git commit -m "feat: add attack paths research and static metadata"
```

---

### Task 11: Add critical Playwright journeys and responsive/accessibility polish

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/critical-journeys.spec.ts`
- Create: `tests/e2e/responsive.spec.ts`
- Modify: `app/globals.css`
- Modify: interactive components only where failing journeys expose defects.

**Interfaces:**
- Consumes: the complete built site.
- Produces: browser-level proof of the required journeys at desktop and mobile sizes.

- [ ] **Step 1: Configure Playwright against production output**

Use `npm run build && npm run preview:static` as the web server command, reuse no existing server in CI, and define Chromium desktop at 1440×1000 plus mobile at 390×844. Grant clipboard read/write permission for the local test origin. Install the pinned Playwright Chromium browser with `npx playwright install chromium` before the first browser run.

- [ ] **Step 2: Write critical-journey tests before any polish fixes**

```ts
test("home to filtered hunt to copied query to related hunt", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore Hunts" }).click();
  await page.getByLabel("Protocol").selectOption("SNMP");
  await expect(page.getByText(/SNMP Fan-Out/)).toBeVisible();
  await page.getByRole("link", { name: /SNMP Fan-Out/ }).click();
  await page.getByRole("button", { name: /copy query/i }).first().click();
  await expect(page.getByRole("status")).toContainText("Copied");
  await page.getByRole("link", { name: /related hunt/i }).first().click();
  await expect(page.locator("h1")).toBeVisible();
});

test("global search opens SNMP result", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("ControlOrMeta+K");
  await page.getByRole("combobox", { name: /search guide/i }).fill("SNMP");
  await page.getByRole("option", { name: /SNMP Fan-Out/ }).click();
  await expect(page).toHaveURL(/\/hunts\/snmp-fan-out\/$/);
});
```

- [ ] **Step 3: Run the journeys and confirm RED for any unmet browser behavior**

Run: `npm run test:e2e -- tests/e2e/critical-journeys.spec.ts`

Expected: tests either pass from prior implementation or fail on a specific browser-level behavior; record the exact failure before changing production code.

- [ ] **Step 4: Add responsive overflow and mobile navigation tests**

At 390px, open and close mobile navigation, visit the hunt detail, telemetry matrix, protocol diagram, and query library, and assert `document.documentElement.scrollWidth === document.documentElement.clientWidth`. Assert that internal code/table scrollers have `scrollWidth >= clientWidth` instead of forcing page overflow. At 1440px, verify desktop navigation and the two-column expected/suspicious comparison.

- [ ] **Step 5: Make only test-driven polish fixes**

Correct focus order, accessible names, stacking, scrolling, contrast, touch sizing, and reduced-motion issues demonstrated by the failing tests. Do not add new product features.

- [ ] **Step 6: Verify browser GREEN and commit**

Run: `npm run test:e2e`

Expected: all Playwright journeys pass in both configured projects.

Run: `npm run check && npm run build`

Expected: exit 0 for lint, typecheck, Vitest, and build.

```bash
git add playwright.config.ts tests/e2e app/globals.css components package.json package-lock.json
git commit -m "chore: prepare infrastructure hunting guide for release"
```

---

### Task 12: Perform the final content, export, and requirements audit

**Files:**
- Modify: only files required to correct failures found by the audit.
- Create: no new feature files.

**Interfaces:**
- Consumes: the complete repository and approved design.
- Produces: fresh evidence that the Definition of Done is met.

- [ ] **Step 1: Run the complete automated gate**

Run: `npm run lint`

Expected: exit 0 with no errors.

Run: `npm run typecheck`

Expected: exit 0.

Run: `npm test`

Expected: all Vitest unit and component tests pass with no unhandled errors.

Run: `npm run test:e2e`

Expected: every critical and responsive journey passes.

Run: `npm run build`

Expected: exit 0 and a complete `out/` directory.

- [ ] **Step 2: Audit exported route inventory**

Verify the output contains root, hunts index, four hunt families, 20 hunt pages, protocols index, 24 protocol pages, telemetry, queries, attack paths, research, three methodology pages, about, 404, sitemap, robots, and Open Graph asset. Fail the audit for a missing path.

- [ ] **Step 3: Audit content requirements programmatically**

Run the integrity and completeness tests alone:

`npm test -- tests/content-integrity.test.ts tests/hunts.test.ts tests/secondary-content.test.ts tests/static-routes.test.ts`

Expected: PASS with exactly 20 hunts, 24 protocols, four families, five detailed flagships, valid relationships, and every static route represented.

- [ ] **Step 4: Inspect the rendered site at 1440px and 390px**

Use browser screenshots of the homepage, hunt catalog, flagship hunt, protocol detail, telemetry, query library, and search dialog. Confirm the field-manual hierarchy, responsive stacking, diagram readability, code/table scroll containment, focus visibility, and absence of hacker-cliché decoration.

- [ ] **Step 5: Request final whole-branch code review**

Review the entire implementation range against this plan and the approved design. Fix every Critical or Important finding, re-run the tests covering each fix, and run one scoped re-review.

- [ ] **Step 6: Commit verified audit corrections if present**

```bash
git add -A
git commit -m "chore: complete MVP verification audit"
```

Skip this commit only when the audit creates no changes.
