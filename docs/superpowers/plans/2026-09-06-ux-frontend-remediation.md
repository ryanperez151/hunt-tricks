# UX and Front-End Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix ten confirmed user-experience and accessibility defects in the hunt-tricks front end, each with a regression test that fails before the fix and passes after.

**Architecture:** All changes are localised to `components/`, `app/globals.css`, and one new `lib/` module. Nine tasks are small, independent edits to a single component plus its test. One task (Task 7) moves query-library filter state into the URL, mirroring the existing `HuntCatalog` pattern, and is the only task that adds a file. No data, schema, or content changes.

**Tech Stack:** Next.js 16 (App Router, `output: "export"`, `trailingSlash: true`), React 19, TypeScript, plain CSS with Tailwind v4 preflight, Vitest + Testing Library (jsdom), Playwright.

## Global Constraints

- **Target branch is `feat/edge-threat-hunting-guide-mvp`, not `main`.** `main` contains only `docs/`. Check out the feature branch before starting; every path below is relative to the repository root on that branch.
- Static export only — `output: "export"` in `next.config.mjs`. No server actions, no route handlers beyond the existing `app/opengraph-image.png/route.ts`, no runtime data fetching.
- `trailingSlash: true`. Internal `href` values are written with a trailing slash (`/hunts/`, `/about/#infrastructure`). Under Vitest, `next/link`'s `normalizePathTrailingSlash` strips it because `process.env.__NEXT_TRAILING_SLASH` is unset, so unit tests assert slash-less hrefs (`/hunts`). Do not "fix" this mismatch — it is correct in both environments.
- Every interactive control keeps a minimum touch target of `2.75rem` (44px). This is asserted by `tests/e2e/responsive.spec.ts`.
- Run `npm run check` (lint + typecheck + unit tests) before every commit. Run `npm run test:e2e` before the final commit only — it builds the static site and takes minutes.
- Commit after every task. One task, one commit.
- Do not reformat untouched lines. `app/globals.css` deliberately packs several rules onto one physical line; match the surrounding density rather than expanding it.

---

## File Structure

| File | Change | Responsibility after the change |
|---|---|---|
| `app/globals.css` | Modify (3 rules) | Mobile menu becomes its own scroll container; query-library filter chips get a 44px target. |
| `components/layout/MobileNavigation.tsx` | Modify | Adds body scroll lock while the menu is open, matching `SearchDialog`. |
| `components/common/SeverityBadge.tsx` | Modify | Badge span gains `role="img"` so its `aria-label` survives. |
| `components/telemetry/TelemetryMatrix.tsx` | Modify | Coverage span gains `role="img"` for the same reason. |
| `components/hunts/HuntFilters.tsx` | Modify | Chip `aria-label` uses the display label; guidance copy is mode-neutral. |
| `components/queries/QueryLibrary.tsx` | Modify | Chip `aria-label` fix, empty-metadata guards, landmark removal, URL-backed filter state, guidance copy. |
| `components/common/CodeBlock.tsx` | Modify | Stops emitting two landmarks per query. |
| `components/search/SearchDialog.tsx` | Modify | Modal setup effect no longer re-runs on prop identity change. |
| `components/search/SearchProvider.tsx` | Modify | Memoises the callbacks it hands the dialog. |
| `components/diagrams/AutomationTimeline.tsx` | Modify | Live region announces the delta, not the whole block. |
| `lib/query-filters.ts` | **Create** | Parse/serialize query-library filters to and from `URLSearchParams`. |
| `components/queries/QueryCard.tsx` | **Create** | One query card, shared by the filterable library and its hydration fallback — mirrors `components/hunts/HuntCard.tsx`. |
| `app/queries/page.tsx` | Modify | Wraps `QueryLibrary` in `Suspense` (required once it calls `useSearchParams`). |
| `tests/components/*.test.tsx` | Modify | Regression tests per task. |
| `tests/e2e/responsive.spec.ts` | Modify | Short-viewport nav test, `/queries` touch targets, parameterised scroller role. |
| `tests/query-filters.test.ts` | **Create** | Unit tests for the new filter serializer. |

---

## Findings Not Being Fixed (Decision Required, Not Defects)

Two items from the review turned out to be deliberate, test-enforced behaviour. Do not "fix" them as part of this plan.

**1. `HuntCatalog` pushes a history entry per filter change** (`components/hunts/HuntCatalog.tsx:76`)

`router.push` means selecting four values leaves four history entries, so Back does not return to the previous page in one press. This is intentional: `tests/e2e/hunt-tricks.spec.ts:16` and `tests/e2e/critical-journeys.spec.ts:13-19` both assert that Back and Forward step through individual filter changes. Changing `push` to `replace` breaks two e2e tests that encode the product decision. **Leave as-is.** If the team wants to revisit it, that is a product conversation, and the fix would be to coalesce rapid changes behind a short timer rather than to swap the navigation method.

**2. URL canonicalisation drops unrecognised query parameters** (`components/hunts/HuntCatalog.tsx:70`)

Landing on `/hunts/?utm_source=newsletter&scope=identity` rewrites to `/hunts/?scope=identity`, losing campaign attribution. This is also deliberate: `tests/components/HuntCatalog.test.tsx:52` seeds `unrelated=x` and asserts it is absent from the `replace` call. **Leave as-is** unless marketing needs UTM attribution on this page. If they do, the minimal change is an allowlist (`utm_*`, `gclid`, `ref`) carried through `serializeHuntFilters`, plus an update to that test — a separate, one-task change.

**3. Replacing the ten `<select multiple>` controls with checkbox groups**

The review's finding that native multi-selects are a poor primary interaction on touch is correct, but the fix is a control redesign with a large blast radius: `HuntFilters`, `QueryLibrary`, `app/globals.css`, and eight test files that locate controls via `getByRole("listbox")` / `selectOptions` (`tests/components/HuntFilters.test.tsx`, `HuntCatalog.test.tsx`, `QueryLibrary.test.tsx`, `tests/e2e/hunt-tricks.spec.ts`, `critical-journeys.spec.ts`, `responsive.spec.ts`). That belongs in its own plan. **Task 10 below ships the honest interim fix** — correcting guidance copy that currently tells touch users to hold a key they do not have — and the redesign is deferred to `docs/superpowers/plans/<date>-filter-control-redesign.md`.

---

### Task 1: Mobile navigation overlay becomes scrollable

**The defect:** `.mobile-menu` is `position: fixed` with `inset: 0 0 auto` (top/right/left pinned, bottom `auto`) and `min-height: 100vh`, with no `overflow-y` and no `max-height`. Its content is roughly 600px: a ~44px close bar, a `2rem` list margin, and eight links at `padding: .9rem 0` over `line-height: 1.6` (~54px each) with `.5rem` gaps, inside `1rem` padding. On a phone in landscape (390×390 or shorter) or at 200% browser zoom, the box grows past the viewport — and because it is `position: fixed`, the page body cannot scroll it and the box has no scroller of its own. "Attack paths", "Research" and "About" become permanently unreachable by touch. The sibling overlay `.search-backdrop` (globals.css:376) already sets `overflow-y: auto`, which confirms the omission. Separately, `MobileNavigation` never locks body scroll, so the page scrolls underneath the open menu.

**Files:**
- Modify: `app/globals.css:122-129`
- Modify: `components/layout/MobileNavigation.tsx:27-72`
- Test: `tests/components/Header.test.tsx`
- Test: `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing unit test for the body scroll lock**

Append to `tests/components/Header.test.tsx`:

```tsx
test("locks background scrolling while the mobile menu is open", async () => {
  const user = userEvent.setup();
  document.body.style.overflow = "";
  render(<Header />);
  const trigger = screen.getByRole("button", { name: /open navigation/i });

  await user.click(trigger);
  expect(document.body.style.overflow).toBe("hidden");

  await user.keyboard("{Escape}");
  expect(document.body.style.overflow).toBe("");
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/components/Header.test.tsx -t "locks background scrolling"`
Expected: FAIL — `expected '' to be 'hidden'`.

- [ ] **Step 3: Add the scroll lock**

In `components/layout/MobileNavigation.tsx`, inside the second `useEffect`, add the lock immediately after the `inertSiblings` setup and restore it in the cleanup. Replace lines 33-37:

```tsx
    const inertSiblings = Array.from(document.body.children).filter((element) => element !== dialog);
    const previousInertState = inertSiblings.map((element) => [element, element.hasAttribute("inert")] as const);
    inertSiblings.forEach((element) => element.setAttribute("inert", ""));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    closeRef.current?.focus();
```

and replace the cleanup at lines 66-71:

```tsx
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousInertState.forEach(([element, wasInert]) => {
        if (!wasInert) element.removeAttribute("inert");
      });
    };
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `npx vitest run tests/components/Header.test.tsx`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing e2e test for the short-viewport overlay**

Append to `tests/e2e/responsive.spec.ts`:

```ts
test("mobile navigation scrolls to its last link in a short viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only assertions");
  await page.setViewportSize({ width: 390, height: 380 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();

  const menu = page.locator(".mobile-menu");
  await expect(menu).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");

  const overflow = await menu.evaluate((element) => ({
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  }));
  expect(overflow.scrollHeight).toBeGreaterThan(overflow.clientHeight);
  expect(overflow.clientHeight).toBeLessThanOrEqual(380);

  const about = menu.getByRole("link", { name: "About" });
  await about.scrollIntoViewIfNeeded();
  await expect(about).toBeInViewport();
  await about.click();
  await expect(page).toHaveURL(/\/about\/$/);
});
```

- [ ] **Step 6: Run it to make sure it fails**

Run: `npx playwright test tests/e2e/responsive.spec.ts -g "short viewport" --project=mobile-chromium`
Expected: FAIL — `clientHeight` equals `scrollHeight` (the box grew instead of scrolling), so `scrollHeight > clientHeight` is false.

- [ ] **Step 7: Make the overlay its own scroll container**

In `app/globals.css`, replace the `.mobile-menu` rule at lines 122-129:

```css
.mobile-menu {
  position: fixed;
  z-index: 90;
  inset: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 1rem;
  background: var(--bg-navy);
}
```

`inset: 0` pins all four edges so the box is exactly viewport height instead of growing past it; `overflow-y: auto` gives it a scroller; `overscroll-behavior: contain` stops scroll chaining to the page behind it.

- [ ] **Step 8: Run the e2e test to verify it passes**

Run: `npx playwright test tests/e2e/responsive.spec.ts --project=mobile-chromium`
Expected: PASS, all mobile tests.

- [ ] **Step 9: Commit**

```bash
git add app/globals.css components/layout/MobileNavigation.tsx tests/components/Header.test.tsx tests/e2e/responsive.spec.ts
git commit -m "fix: make the mobile navigation overlay scrollable and lock background scroll"
```

---

### Task 2: Restore accessible names on severity and coverage badges

**The defect:** `SeverityBadge` renders `<span aria-label="Severity: high">HIGH</span>` and `TelemetryMatrix`'s `Coverage` renders `<span aria-label="Zeek Lateral movement coverage: partial">Partial</span>`. ARIA 1.2 prohibits naming `role=generic`, which is what a bare `<span>` maps to, so Chrome and Firefox discard both labels (this is axe-core's `aria-prohibited-attr` rule). A screen reader hears only "HIGH" with no indication it is a severity, and in the coverage matrix hears only "Partial" with no column context. The existing tests pass today because `dom-accessibility-api` (used by Testing Library) does not implement the prohibition — they give false confidence. Adding `role="img"` makes the name legal and keeps every existing assertion green.

**Files:**
- Modify: `components/common/SeverityBadge.tsx:5`
- Modify: `components/telemetry/TelemetryMatrix.tsx:24-29`
- Test: `tests/components/SeverityBadge.test.tsx`
- Test: `tests/components/TelemetryMatrix.test.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing tests**

Append to `tests/components/SeverityBadge.test.tsx`:

```tsx
test("exposes the severity badge with a role that permits an accessible name", () => {
  render(<SeverityBadge severity="critical" />);
  expect(screen.getByRole("img", { name: "Severity: critical" })).toBeInTheDocument();
});
```

Append to the `TelemetryMatrix` describe block in `tests/components/TelemetryMatrix.test.tsx`:

```tsx
  test("exposes every coverage cell with a role that permits an accessible name", () => {
    render(<TelemetryMatrix sources={telemetrySources} />);

    expect(screen.getByRole("img", { name: "NetFlow/IPFIX C2 coverage: high" })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(telemetrySources.length * 4);
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/components/SeverityBadge.test.tsx tests/components/TelemetryMatrix.test.tsx -t "permits an accessible name"`
Expected: FAIL — `Unable to find an accessible element with the role "img"`.

- [ ] **Step 3: Add `role="img"` to both spans**

`components/common/SeverityBadge.tsx`, replace lines 4-8:

```tsx
  return (
    <span aria-label={`Severity: ${severity}`} className={`severity-badge severity-badge--${severity}`} role="img">
      {severity.toUpperCase()}
    </span>
  );
```

`components/telemetry/TelemetryMatrix.tsx`, replace lines 23-30:

```tsx
  return (
    <span
      aria-label={`${source.name} ${label} coverage: ${level}`}
      className={`telemetry-coverage telemetry-coverage--${level}`}
      role="img"
    >
      {level[0].toUpperCase() + level.slice(1)}
    </span>
  );
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/components/SeverityBadge.test.tsx tests/components/TelemetryMatrix.test.tsx tests/hunt-pages.test.tsx`
Expected: PASS. `tests/hunt-pages.test.tsx:33` (`getByLabelText("Severity: critical")`) and `TelemetryMatrix.test.tsx:38` (`getByLabelText("NetFlow/IPFIX C2 coverage: high")`) still pass — `role="img"` does not change `getByLabelText`.

- [ ] **Step 5: Commit**

```bash
git add components/common/SeverityBadge.tsx components/telemetry/TelemetryMatrix.tsx tests/components/SeverityBadge.test.tsx tests/components/TelemetryMatrix.test.tsx
git commit -m "fix: give severity and coverage badges a role that permits an accessible name"
```

---

### Task 3: Filter removal chips announce the display label, not the slug

**The defect:** Both filter panels build the chip's accessible name from the raw taxonomy slug while rendering the human display label as visible text. Selecting the "Management-Plane C2" family produces a button that reads `Management-Plane C2 ×` but whose accessible name is `Remove family management-plane-c2 filter`. The visible label is not contained in the accessible name, which fails WCAG 2.5.3 Label in Name: a voice-control user saying "click Management-Plane C2" gets no match, and a screen reader reads the slug. `QueryLibrary` has the same bug with a different `labelFor` (it de-hyphenates, so visible "netflow ipfix" versus accessible "netflow-ipfix"). The existing tests only exercise `SNMP` and `T1046`, whose slug and label happen to be identical, so the suite never catches it.

**Files:**
- Modify: `components/hunts/HuntFilters.tsx:116`
- Modify: `components/queries/QueryLibrary.tsx:147`
- Test: `tests/components/HuntFilters.test.tsx`
- Test: `tests/components/QueryLibrary.test.tsx`

**Interfaces:**
- Consumes: `labelFor(value: string): string` — already defined locally in both files (`HuntFilters.tsx:40`, `QueryLibrary.tsx:64`).
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing tests**

Append to the `HuntFilters` describe block in `tests/components/HuntFilters.test.tsx`:

```tsx
  test("names a removal chip with the same label the user can see", () => {
    const filters: HuntFilterState = { ...emptyHuntFilters, families: ["management-plane-c2"] };
    render(<HuntFilters filters={filters} options={filterOptions} onChange={vi.fn()} />);

    const chip = screen.getByRole("button", { name: "Remove family Management-Plane C2 filter" });
    expect(chip).toHaveTextContent("Management-Plane C2");
  });
```

Append to the `QueryLibrary` describe block in `tests/components/QueryLibrary.test.tsx`:

```tsx
  test("names a removal chip with the same label the user can see", async () => {
    const user = userEvent.setup();
    render(<QueryLibrary queries={queries} />);

    await user.selectOptions(screen.getByLabelText("Telemetry"), "netflow-ipfix");

    const chip = screen.getByRole("button", { name: "Remove telemetry NetFlow / IPFIX filter" });
    expect(chip).toHaveTextContent("NetFlow / IPFIX");
  });
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/components/HuntFilters.test.tsx tests/components/QueryLibrary.test.tsx -t "same label the user can see"`
Expected: FAIL — `Unable to find an accessible element with the role "button" and name "Remove family Management-Plane C2 filter"` (the DOM has `Remove family management-plane-c2 filter`).

- [ ] **Step 3: Use `labelFor` in both accessible names**

`components/hunts/HuntFilters.tsx`, replace line 116:

```tsx
                  aria-label={`Remove ${singular} ${labelFor(value)} filter`}
```

`components/queries/QueryLibrary.tsx`, replace line 147:

```tsx
                    aria-label={`Remove ${singular} ${labelFor(value)} filter`}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/components/HuntFilters.test.tsx tests/components/QueryLibrary.test.tsx`
Expected: PASS. The pre-existing assertions for `Remove protocol SNMP filter` (`HuntFilters.test.tsx:75`) and `Remove technique T1046 filter` (`QueryLibrary.test.tsx:130`) still pass, because `labelFor("SNMP")` is `"SNMP"` and `labelFor("T1046")` is `"T1046"`.

- [ ] **Step 5: Verify the e2e assertion is unaffected**

Run: `npx playwright test tests/e2e/responsive.spec.ts -g "touch sizing" --project=mobile-chromium`
Expected: PASS. `responsive.spec.ts:98` looks for `Remove protocol SNMP filter`, which is unchanged.

- [ ] **Step 6: Commit**

```bash
git add components/hunts/HuntFilters.tsx components/queries/QueryLibrary.tsx tests/components/HuntFilters.test.tsx tests/components/QueryLibrary.test.tsx
git commit -m "fix: name filter removal chips with their visible label"
```

---

### Task 4: Query-library filter chips meet the 44px touch target

**The defect:** `.query-filters__active button` sets `padding: .3rem .55rem` and `font-size: .75rem` with no `min-height`, computing to roughly 31px tall (19px of text at `line-height: 1.6`, plus 9.6px padding, plus 2px border). The equivalent hunt-catalog control at globals.css:236 sets `min-height: 2.75rem`, and `tests/e2e/responsive.spec.ts:101-105` asserts a 44×44 bounding box for exactly these controls on `/hunts`. `/queries` ships the same controls undersized with no test covering them, so the two pages fail the project's own touch-target bar inconsistently.

**Files:**
- Modify: `app/globals.css:363`
- Test: `tests/e2e/responsive.spec.ts:78-106`

**Interfaces:**
- Consumes: the `Remove telemetry NetFlow / IPFIX filter` accessible name introduced in Task 3.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Extend the mobile touch-sizing e2e test to `/queries`**

In `tests/e2e/responsive.spec.ts`, append to the body of the `"mobile navigation restores focus and filter controls meet touch sizing"` test, after the existing `for` loop that ends at line 105:

```ts
  await page.goto("/queries/");
  await page.getByRole("listbox", { name: "Telemetry", exact: true }).selectOption("netflow-ipfix");

  for (const button of [
    page.getByRole("button", { name: "Remove telemetry NetFlow / IPFIX filter" }),
    page.getByRole("button", { name: "Clear all filters" }),
  ]) {
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx playwright test tests/e2e/responsive.spec.ts -g "touch sizing" --project=mobile-chromium`
Expected: FAIL — the chip's height is about 31, so `expect(31).toBeGreaterThanOrEqual(44)` fails.

- [ ] **Step 3: Set the minimum target size**

In `app/globals.css`, replace the rule at line 363:

```css
.query-filters__active button { min-height: 2.75rem; border: 1px solid var(--cyan); border-radius: 999px; background: transparent; color: var(--cyan); cursor: pointer; padding: .45rem .7rem; font-size: .75rem; }
```

This matches `.hunt-filters__active button` at line 236 exactly, so the two panels are now consistent.

- [ ] **Step 4: Run the e2e test to verify it passes**

Run: `npx playwright test tests/e2e/responsive.spec.ts --project=mobile-chromium`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css tests/e2e/responsive.spec.ts
git commit -m "fix: bring query library filter chips up to the 44px touch target"
```

---

### Task 5: Query cards stop rendering empty metadata rows

**The defect:** `QueryLibrary` renders the Devices, Protocols and Telemetry rows of each card's definition list unconditionally, so a query whose source hunt has none renders a `<dt>` label followed by an empty `<dd>`. Hunts with no device or protocol context exist in production content — `tests/expansion-contracts.test.ts:77` asserts an identity hunt matches `{ planes: [], devices: [] }` — and `lib/queries.ts:41-43` copies those empty arrays verbatim onto every query derived from that hunt. `HuntCard.tsx:35` and `:43` already guard the same fields with `.length > 0`, so the catalog and the query library disagree on identical data.

**Files:**
- Modify: `components/queries/QueryLibrary.tsx:181-187`
- Test: `tests/components/QueryLibrary.test.tsx`

**Interfaces:**
- Consumes: `QueryDisplayRecord` (`components/queries/QueryLibrary.tsx:9-24`) — unchanged.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing test**

Append to the `QueryLibrary` describe block in `tests/components/QueryLibrary.test.tsx`:

```tsx
  test("omits metadata rows the source hunt does not populate", () => {
    const bare: QueryDisplayRecord = {
      ...queries[0]!,
      id: "identity-hunt:kql:0",
      title: "Identity-only query",
      devices: [],
      protocols: [],
      telemetry: [],
      techniques: [],
    };
    render(<QueryLibrary queries={[bare]} />);

    const card = screen.getByTestId("query-card");
    expect(within(card).getByText("Family")).toBeInTheDocument();
    expect(within(card).queryByText("Devices")).not.toBeInTheDocument();
    expect(within(card).queryByText("Protocols")).not.toBeInTheDocument();
    expect(within(card).queryByText("Telemetry")).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/components/QueryLibrary.test.tsx -t "omits metadata rows"`
Expected: FAIL — `expect(element).not.toBeInTheDocument()` receives the `Devices` `<dt>`.

- [ ] **Step 3: Guard the three optional rows**

In `components/queries/QueryLibrary.tsx`, replace lines 181-187:

```tsx
              <dl className="query-card__metadata">
                <div><dt>Family</dt><dd><Tag>{labelFor(query.family)}</Tag></dd></div>
                {query.devices.length ? <div><dt>Devices</dt><dd>{query.devices.map((value) => <Tag key={value}>{labelFor(value)}</Tag>)}</dd></div> : null}
                {query.protocols.length ? <div><dt>Protocols</dt><dd>{query.protocols.map((value) => <Tag key={value}>{value}</Tag>)}</dd></div> : null}
                {query.telemetry.length ? <div><dt>Telemetry</dt><dd>{query.telemetry.map((value) => <Tag key={value}>{labelFor(value)}</Tag>)}</dd></div> : null}
                {query.techniques.length ? <div><dt>Techniques</dt><dd>{query.techniques.map((value) => <Tag key={value}>{value}</Tag>)}</dd></div> : null}
              </dl>
```

Family stays unconditional — every query has one.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/components/QueryLibrary.test.tsx`
Expected: PASS. The pre-existing assertions at lines 148-149 (`getByText("firewall")`, `getByText("SSH")`) still pass because the first fixture populates both.

- [ ] **Step 5: Commit**

```bash
git add components/queries/QueryLibrary.tsx tests/components/QueryLibrary.test.tsx
git commit -m "fix: omit unpopulated metadata rows from query cards"
```

---

### Task 6: Stop flooding the landmark list on `/queries`

**The defect:** Each query card emits three region landmarks — `<section aria-label="Query example">` (`CodeBlock.tsx:6`), `<div role="region" aria-label="Query text. Scroll horizontally…">` (`CodeBlock.tsx:11-17`), and `<section aria-label="Detection strategy">` (`QueryLibrary.tsx:188`). `/queries` renders one card per query aggregated across every hunt (`lib/queries.ts:27`), which is 30+ cards, so a screen-reader user opening the landmarks rotor to reach the filters or the results count pages through roughly 90 landmarks with three distinct names. The scroll container genuinely needs a role and a name so keyboard users can reach it, but `role="group"` provides both without registering a landmark; the two `<section aria-label>` wrappers add nothing the visible `Query example` text and `Detection strategy` heading do not already convey.

Note that the singular scrollers — `.network-flow__canvas` and `.telemetry-matrix-scroll` — keep `role="region"`. They appear once or twice per page, where a landmark is genuinely useful.

**Files:**
- Modify: `components/common/CodeBlock.tsx`
- Modify: `components/queries/QueryLibrary.tsx:188-191`
- Test: `tests/components/QueryLibrary.test.tsx:79`
- Test: `tests/e2e/responsive.spec.ts:23-33, 46, 68`

**Interfaces:**
- Consumes: `TrustedHighlightedQueryHtml` (`lib/highlight.ts:13`) — unchanged.
- Produces: `.code-block__source` now carries `role="group"`; `expectLocalScroller` gains an optional second parameter `role: "region" | "group"` defaulting to `"region"`.

- [ ] **Step 1: Write the failing e2e test**

Append to `tests/e2e/responsive.spec.ts`:

```ts
test("query library keeps its landmark list navigable", async ({ page }) => {
  await page.goto("/queries/");
  await expect(page.getByTestId("query-card").first()).toBeVisible();
  expect(await page.getByTestId("query-card").count()).toBeGreaterThan(10);

  await expect(page.locator('.query-library__list [role="region"]')).toHaveCount(0);
  await expect(page.locator(".query-library__list section[aria-label]")).toHaveCount(0);
  await expect(page.locator('.query-library__list [role="group"]').first()).toHaveAttribute("tabindex", "0");
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx playwright test tests/e2e/responsive.spec.ts -g "landmark list" --project=desktop-chromium`
Expected: FAIL — `Expected: 0, Received: 30` (or however many queries exist) for the `[role="region"]` locator.

- [ ] **Step 3: Rewrite `CodeBlock` without landmarks**

Replace the whole of `components/common/CodeBlock.tsx`:

```tsx
import { CopyButton } from "@/components/common/CopyButton";
import type { TrustedHighlightedQueryHtml } from "@/lib/highlight";

export function CodeBlock({ raw, highlightedHtml }: { raw: string; highlightedHtml: TrustedHighlightedQueryHtml }) {
  return (
    <div className="code-block">
      <div className="code-block__bar">
        <span>Query example</span>
        <CopyButton label="Copy query" value={raw} />
      </div>
      <div
        aria-label="Query text. Scroll horizontally to view long lines."
        className="code-block__source"
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        role="group"
        tabIndex={0}
      />
      <p className="adaptation-note">Adapt field names and data models to your environment.</p>
    </div>
  );
}
```

- [ ] **Step 4: Demote the detection-strategy section**

In `components/queries/QueryLibrary.tsx`, replace lines 188-191:

```tsx
              <div className="query-card__strategy">
                <h3>Detection strategy</h3>
                <p>{query.detectionStrategy}</p>
              </div>
```

- [ ] **Step 5: Update the unit test that located the strategy by landmark**

In `tests/components/QueryLibrary.test.tsx`, replace line 79:

```tsx
      const strategy = within(card).getByRole("heading", { name: "Detection strategy" }).parentElement!;
```

- [ ] **Step 6: Parameterise the e2e scroller helper**

In `tests/e2e/responsive.spec.ts`, replace the `expectLocalScroller` function at lines 23-33:

```ts
async function expectLocalScroller(scroller: Locator, role: "region" | "group" = "region") {
  await expect(scroller).toBeVisible();
  const dimensions = await scroller.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThanOrEqual(dimensions.clientWidth);
  await expect(scroller).toHaveAttribute("tabindex", "0");
  await expect(scroller).toHaveAttribute("role", role);
  await expect(scroller).toHaveAccessibleName(/scroll horizontally/i);
}
```

Then update the two `.code-block__source` call sites. Line 46:

```ts
  await expectLocalScroller(page.locator(".code-block__source").first(), "group");
```

Line 68:

```ts
  await expectLocalScroller(page.locator(".code-block__source").first(), "group");
```

Leave the `.network-flow__canvas` and `.telemetry-matrix-scroll` call sites unchanged — they still assert `"region"` via the default.

- [ ] **Step 7: Run the unit tests**

Run: `npx vitest run tests/components/QueryLibrary.test.tsx tests/components/FieldGuidePrimitives.test.tsx`
Expected: PASS. `FieldGuidePrimitives.test.tsx:16-21` renders a `CodeBlock` and only asserts the adaptation note text, so it is unaffected.

- [ ] **Step 8: Run the e2e tests to verify they pass**

Run: `npx playwright test tests/e2e/responsive.spec.ts`
Expected: PASS on both projects.

- [ ] **Step 9: Commit**

```bash
git add components/common/CodeBlock.tsx components/queries/QueryLibrary.tsx tests/components/QueryLibrary.test.tsx tests/e2e/responsive.spec.ts
git commit -m "fix: stop emitting a landmark per code block and query card"
```

---

### Task 7: Put query-library filters in the URL

**The defect:** `QueryLibrary` holds its filter state in `useState`, so a filtered view cannot be linked, bookmarked, or restored. A user who filters to Splunk + SNMP, clicks the "From <hunt>" link on a result to check the parent hunt, then presses Back is returned to the unfiltered library. `HuntCatalog.tsx:74-77` solves exactly this by serialising filters into the query string, and `app/page.tsx:32` already deep-links into it via `/hunts/?scope=…`, so the two catalogs behave differently for the same user intent.

The fix mirrors `HuntCatalog` deliberately, including `router.push` (which keeps Back-undoes-a-filter, the behaviour the e2e suite asserts for `/hunts/`) and the `Suspense` fallback that `output: "export"` requires around `useSearchParams`. Filter values here are derived from content rather than a fixed taxonomy, so parse and serialize both take the derived option set.

**Files:**
- Create: `lib/query-filters.ts`
- Create: `tests/query-filters.test.ts`
- Create: `components/queries/QueryCard.tsx`
- Modify: `components/queries/QueryLibrary.tsx`
- Modify: `app/queries/page.tsx`
- Test: `tests/components/QueryLibrary.test.tsx`

**Interfaces:**
- Consumes: `QueryDisplayRecord` (`components/queries/QueryLibrary.tsx:9-24`) — unchanged.
- Produces:
  - `lib/query-filters.ts` exports `type QueryFilterKey`, `type QueryFilters`, `type QueryFilterOptions`, `queryFilterDefinitions`, `emptyQueryFilters`, `parseQueryFilters(searchParams: URLSearchParams, options: QueryFilterOptions): QueryFilters`, `serializeQueryFilters(filters: QueryFilters, options: QueryFilterOptions): URLSearchParams`.
  - `components/queries/QueryCard.tsx` exports `QueryCard({ query }: { query: QueryDisplayRecord })` and re-exports nothing else.
  - `components/queries/QueryLibrary.tsx` additionally exports `QueryLibraryFallback({ queries }: { queries: readonly QueryDisplayRecord[] })`.

**Note on decomposition:** the filterable library and its hydration fallback render identical cards. Extract the card into `components/queries/QueryCard.tsx` and have both call it — do **not** duplicate the card JSX. This mirrors `HuntCatalog` and `HuntCatalogFallback`, which both render the shared `HuntCard` (`components/hunts/HuntCard.tsx`).

- [ ] **Step 1: Write the failing serializer tests**

Create `tests/query-filters.test.ts`:

```ts
import { describe, expect, test } from "vitest";
import {
  emptyQueryFilters,
  parseQueryFilters,
  serializeQueryFilters,
  type QueryFilterOptions,
} from "@/lib/query-filters";

const options: QueryFilterOptions = {
  platforms: ["splunk", "kql", "zeek"],
  families: ["management-plane-c2", "discovery-credential-access"],
  protocols: ["SSH", "SNMP"],
  devices: ["firewall", "router"],
  telemetry: ["netflow-ipfix", "zeek"],
  techniques: ["T1046", "T1071"],
};

describe("query filters", () => {
  test("keeps only values the current option set offers, in option order", () => {
    const filters = parseQueryFilters(new URLSearchParams("platform=zeek&platform=splunk&platform=not-real"), options);

    expect(filters.platforms).toEqual(["splunk", "zeek"]);
    expect(filters.families).toEqual([]);
  });

  test("round-trips through a canonical, deduplicated query string", () => {
    const filters = parseQueryFilters(
      new URLSearchParams("technique=T1046&protocol=SNMP&technique=T1046&family=management-plane-c2"),
      options,
    );

    expect(serializeQueryFilters(filters, options).toString())
      .toBe("family=management-plane-c2&protocol=SNMP&technique=T1046");
    expect(parseQueryFilters(serializeQueryFilters(filters, options), options)).toEqual(filters);
  });

  test("serializes the empty filter set to an empty query string", () => {
    expect(serializeQueryFilters(emptyQueryFilters, options).toString()).toBe("");
  });
});
```

- [ ] **Step 2: Run them to make sure they fail**

Run: `npx vitest run tests/query-filters.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/query-filters"`.

- [ ] **Step 3: Create the filter module**

Create `lib/query-filters.ts`:

```ts
export type QueryFilterKey = "platforms" | "families" | "protocols" | "devices" | "telemetry" | "techniques";

export type QueryFilters = {
  readonly [Key in QueryFilterKey]: readonly string[];
};

export type QueryFilterOptions = QueryFilters;

export const queryFilterDefinitions = [
  ["platforms", "Platform", "platform"],
  ["families", "Family", "family"],
  ["protocols", "Protocol", "protocol"],
  ["devices", "Device", "device"],
  ["telemetry", "Telemetry", "telemetry"],
  ["techniques", "Technique", "technique"],
] as const satisfies ReadonlyArray<readonly [QueryFilterKey, string, string]>;

export const emptyQueryFilters: QueryFilters = Object.freeze({
  platforms: Object.freeze([]),
  families: Object.freeze([]),
  protocols: Object.freeze([]),
  devices: Object.freeze([]),
  telemetry: Object.freeze([]),
  techniques: Object.freeze([]),
});

function normalizeValues(values: Iterable<string>, knownValues: readonly string[]): readonly string[] {
  const selected = new Set(values);
  return knownValues.filter((value) => selected.has(value));
}

export function parseQueryFilters(searchParams: URLSearchParams, options: QueryFilterOptions): QueryFilters {
  return Object.freeze(Object.fromEntries(queryFilterDefinitions.map(([key, , parameter]) => [
    key,
    Object.freeze(normalizeValues(searchParams.getAll(parameter), options[key])),
  ])) as QueryFilters);
}

export function serializeQueryFilters(filters: QueryFilters, options: QueryFilterOptions): URLSearchParams {
  const searchParams = new URLSearchParams();

  for (const [key, , parameter] of queryFilterDefinitions) {
    for (const value of normalizeValues(filters[key], options[key])) searchParams.append(parameter, value);
  }

  return searchParams;
}
```

`normalizeValues` filters `knownValues` rather than the incoming list, which both deduplicates and imposes a stable canonical order — the same technique `lib/filters.ts:58-61` uses.

- [ ] **Step 4: Run the serializer tests to verify they pass**

Run: `npx vitest run tests/query-filters.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Write the failing component test**

At the top of `tests/components/QueryLibrary.test.tsx`, add the navigation mock beneath the existing `next/link` mock (after line 14):

```tsx
const navigation = vi.hoisted(() => ({
  pathname: "/queries/",
  push: vi.fn(),
  replace: vi.fn(),
  search: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
  useSearchParams: () => navigation.search,
}));
```

Add a `beforeEach` as the first statement inside the `describe("QueryLibrary", …)` block, and import `beforeEach` from `vitest` on line 4:

```tsx
  beforeEach(() => {
    navigation.pathname = "/queries/";
    navigation.push.mockReset();
    navigation.replace.mockReset();
    navigation.search = new URLSearchParams();
  });
```

Then append the new test to the same describe block:

```tsx
  test("writes filter selections to the URL and renders the URL's filters on Back", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<QueryLibrary queries={queries} />);

    await user.selectOptions(screen.getByLabelText("Platform"), "zeek");
    expect(navigation.push).toHaveBeenCalledWith("/queries/?platform=zeek", { scroll: false });

    navigation.search = new URLSearchParams("platform=zeek");
    rerender(<QueryLibrary queries={queries} />);
    expect(screen.getByText("1 query")).toBeInTheDocument();

    navigation.search = new URLSearchParams();
    rerender(<QueryLibrary queries={queries} />);
    expect(screen.getByText("3 queries")).toBeInTheDocument();
  });
```

- [ ] **Step 6: Run it to make sure it fails**

Run: `npx vitest run tests/components/QueryLibrary.test.tsx -t "writes filter selections to the URL"`
Expected: FAIL — `expected "push" to be called with arguments`, received zero calls, because the component still uses local state.

- [ ] **Step 7: Move `QueryLibrary` onto URL state**

In `components/queries/QueryLibrary.tsx`, replace the imports at lines 1-7:

```tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CodeBlock } from "@/components/common/CodeBlock";
import { Tag } from "@/components/common/Tag";
import {
  emptyQueryFilters,
  parseQueryFilters,
  queryFilterDefinitions,
  serializeQueryFilters,
  type QueryFilterOptions,
  type QueryFilters,
} from "@/lib/query-filters";
import type { TrustedHighlightedQueryHtml } from "@/lib/highlight";
```

Delete the now-duplicated local declarations: the `type QueryFilters` block (lines 26-33), the `filterDefinitions` constant (lines 35-42), and the `emptyQueryFilters` constant (lines 44-51). Keep `labels`, `labelFor`, `unique`, `matches`, `filterQueries` and `replaceFilter` as they are, and change `deriveOptions`'s return type annotation to `QueryFilterOptions`:

```tsx
function deriveOptions(queries: readonly QueryDisplayRecord[]): QueryFilterOptions {
```

Replace the component body's first four lines (previously lines 102-108) with:

```tsx
function withTrailingSlash(pathname: string) {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function QueryLibrary({ queries }: { queries: readonly QueryDisplayRecord[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const options = deriveOptions(queries);
  const filters = parseQueryFilters(new URLSearchParams(searchParams.toString()), options);
  const filteredQueries = filterQueries(queries, filters);
  const canonicalPath = withTrailingSlash(pathname);
  const activeFilters = queryFilterDefinitions.flatMap(([key, , singular]) => (
    filters[key].map((value) => ({ key, singular, value }))
  ));

  function setFilters(nextFilters: QueryFilters) {
    const query = serializeQueryFilters(nextFilters, options).toString();
    router.push(query ? `${canonicalPath}?${query}` : canonicalPath, { scroll: false });
  }
```

Every existing `setFilters(...)` call site in the JSX keeps working unchanged, because `setFilters` still takes a whole `QueryFilters` object. Rename the two remaining references to the deleted local `filterDefinitions` — the control loop at line 121 becomes:

```tsx
          {queryFilterDefinitions.map(([key, label]) => (
```

- [ ] **Step 8: Extract the shared query card**

Both the filterable library and its fallback render the same card, so extract it once rather than duplicating the JSX. Create `components/queries/QueryCard.tsx`:

```tsx
import Link from "next/link";
import { CodeBlock } from "@/components/common/CodeBlock";
import { Tag } from "@/components/common/Tag";
import type { QueryDisplayRecord } from "@/components/queries/QueryLibrary";

const labels: Record<string, string> = {
  "management-plane-c2": "Management-Plane C2",
  "infrastructure-lateral-movement": "Infrastructure Lateral Movement",
  "discovery-credential-access": "Discovery & Credential Access",
  "traffic-manipulation": "Traffic Manipulation",
  "netflow-ipfix": "NetFlow / IPFIX",
  "configuration-diffs": "Configuration diffs",
  "cli-audit": "CLI audit",
  "packet-capture": "Packet capture",
};

export function labelFor(value: string) {
  return labels[value] ?? value.replaceAll("-", " ");
}

export function QueryCard({ query }: { query: QueryDisplayRecord }) {
  return (
    <article className="query-card" data-testid="query-card">
      <header className="query-card__heading">
        <div>
          <p className="eyebrow">{query.platform.toUpperCase()}</p>
          <h2>{query.title}</h2>
          <p className="query-card__context">
            From <Link href={`/hunts/${query.huntSlug}/`}>{query.huntTitle}</Link>
          </p>
        </div>
        <p>{query.description}</p>
      </header>
      <dl className="query-card__metadata">
        <div><dt>Family</dt><dd><Tag>{labelFor(query.family)}</Tag></dd></div>
        {query.devices.length ? <div><dt>Devices</dt><dd>{query.devices.map((value) => <Tag key={value}>{labelFor(value)}</Tag>)}</dd></div> : null}
        {query.protocols.length ? <div><dt>Protocols</dt><dd>{query.protocols.map((value) => <Tag key={value}>{value}</Tag>)}</dd></div> : null}
        {query.telemetry.length ? <div><dt>Telemetry</dt><dd>{query.telemetry.map((value) => <Tag key={value}>{labelFor(value)}</Tag>)}</dd></div> : null}
        {query.techniques.length ? <div><dt>Techniques</dt><dd>{query.techniques.map((value) => <Tag key={value}>{value}</Tag>)}</dd></div> : null}
      </dl>
      <div className="query-card__strategy">
        <h3>Detection strategy</h3>
        <p>{query.detectionStrategy}</p>
      </div>
      <CodeBlock highlightedHtml={query.highlightedHtml} raw={query.query} />
    </article>
  );
}
```

This carries forward the empty-row guards from Task 5 and the landmark removal from Task 6 — do not reintroduce `<section aria-label="Detection strategy">`. Then in `components/queries/QueryLibrary.tsx`, delete its now-duplicated local `labels` table and `labelFor` function, import both `QueryCard` and `labelFor` from `@/components/queries/QueryCard` (the filter chips still need `labelFor`), delete the `Tag` and `CodeBlock` imports if nothing else in the file uses them, and replace the whole `filteredQueries.map(...)` card block with:

```tsx
          {filteredQueries.map((query) => <QueryCard key={query.id} query={query} />)}
```

- [ ] **Step 9: Add the hydration fallback**

Append to `components/queries/QueryLibrary.tsx`:

```tsx
export function QueryLibraryFallback({ queries }: { queries: readonly QueryDisplayRecord[] }) {
  return (
    <div className="query-library query-library--fallback">
      <p className="hunt-catalog__loading">Library controls are loading. All queries are available below.</p>
      <p className="query-library__count">{queries.length} {queries.length === 1 ? "query" : "queries"}</p>
      <div className="query-library__list">
        {queries.map((query) => <QueryCard key={query.id} query={query} />)}
      </div>
    </div>
  );
}
```

This mirrors `HuntCatalogFallback` (`HuntCatalog.tsx:103-113`), which likewise renders the shared `HuntCard`: the prerendered HTML shows every query, and hydration swaps in the filterable version. It reuses `.hunt-catalog__loading` (globals.css:210) so no new CSS is needed.

- [ ] **Step 10: Wrap the page in `Suspense`**

In `app/queries/page.tsx`, replace line 1 and the returned JSX at lines 35-44:

```tsx
import { Suspense } from "react";
import { QueryLibrary, QueryLibraryFallback, type QueryDisplayRecord } from "@/components/queries/QueryLibrary";
```

```tsx
  return (
    <div className="queries-page workspace-width">
      <header className="page-header">
        <p className="eyebrow">Adaptable detection logic</p>
        <h1>Infrastructure query library</h1>
        <p>Start from a behavior and independent telemetry, then adapt these examples to your local fields, approved dependencies, and data model. Query text is displayed and copied only; it is never executed here.</p>
      </header>
      <Suspense fallback={<QueryLibraryFallback queries={queries} />}>
        <QueryLibrary queries={queries} />
      </Suspense>
    </div>
  );
```

`useSearchParams` in a statically exported route must sit under a `Suspense` boundary or `next build` fails with a prerender error.

- [ ] **Step 11: Run the unit tests to verify they pass**

Run: `npx vitest run tests/components/QueryLibrary.test.tsx tests/query-filters.test.ts`
Expected: PASS. The five pre-existing `QueryLibrary` tests that drive filters through the UI now assert on rendered output after a `rerender`; if any of them fail because they relied on local state updating in place, update that test to set `navigation.search` and `rerender`, exactly as the new test does. The `render(await QueriesPage())` test at line 73 exercises the `Suspense` fallback path and still finds every card.

- [ ] **Step 12: Verify the static build still prerenders**

Run: `npm run build`
Expected: build completes; `out/queries/index.html` exists and contains `Library controls are loading`.

- [ ] **Step 13: Add an e2e journey for the shareable URL**

Append to `tests/e2e/hunt-tricks.spec.ts`:

```ts
test("query library filters survive a link out and back", async ({ page }) => {
  await page.goto("/queries/");
  await page.getByRole("listbox", { name: "Platform", exact: true }).selectOption("zeek");
  await expect(page).toHaveURL(/\/queries\/\?platform=zeek$/);

  const filteredCount = await page.getByTestId("query-card").count();
  expect(filteredCount).toBeGreaterThan(0);

  await page.getByTestId("query-card").first().getByRole("link").first().click();
  await expect(page).toHaveURL(/\/hunts\/[a-z0-9-]+\/$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/queries\/\?platform=zeek$/);
  await expect(page.getByRole("listbox", { name: "Platform", exact: true })).toHaveValues(["zeek"]);
  await expect(page.getByTestId("query-card")).toHaveCount(filteredCount);
});
```

- [ ] **Step 14: Run the e2e test to verify it passes**

Run: `npx playwright test tests/e2e/hunt-tricks.spec.ts -g "survive a link out"`
Expected: PASS on both projects.

- [ ] **Step 15: Commit**

```bash
git add lib/query-filters.ts tests/query-filters.test.ts components/queries/QueryLibrary.tsx app/queries/page.tsx tests/components/QueryLibrary.test.tsx tests/e2e/hunt-tricks.spec.ts
git commit -m "feat: make query library filters shareable through the URL"
```

---

### Task 8: Search dialog stops re-running its modal setup

**The defect:** `SearchDialog`'s modal setup effect — focus the input, lock body scroll, mark background elements `inert` — depends on `onClose`, and `SearchProvider.tsx:95-96` passes a freshly-created arrow function on every render. Any provider re-render therefore tears the modal down and re-initialises it. Concretely: open search with Ctrl+K, tab into the results list, then press the browser Back button. The App Router re-renders the root layout's children, `SearchProvider` re-renders, `onClose` changes identity, and the effect's cleanup runs (unlocking scroll, un-inerting the background) immediately followed by a fresh setup that calls `inputRef.current?.focus()` — yanking focus out of the results list mid-navigation.

The primary fix holds the handler in a ref so the effect can take an empty dependency array; memoising the provider's callbacks is the matching hygiene fix.

**Files:**
- Modify: `components/search/SearchDialog.tsx:23-94`
- Modify: `components/search/SearchProvider.tsx:89-99`
- Test: `tests/components/SearchDialog.test.tsx`

**Interfaces:**
- Consumes: `SearchDialogProps` (`components/search/SearchDialog.tsx:8-12`) — unchanged, so the provider's call site keeps its shape.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing test**

Append to `tests/components/SearchDialog.test.tsx`, inside its top-level describe block (match the file's existing fixture names for `entries`):

```tsx
  test("keeps focus where the user put it when the close handler identity changes", () => {
    const { rerender } = render(<SearchDialog entries={entries} onActivate={() => {}} onClose={() => {}} />);

    const firstOption = screen.getAllByRole("option")[0]!;
    firstOption.focus();
    expect(firstOption).toHaveFocus();

    rerender(<SearchDialog entries={entries} onActivate={() => {}} onClose={() => {}} />);

    expect(firstOption).toHaveFocus();
  });
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/components/SearchDialog.test.tsx -t "keeps focus where the user put it"`
Expected: FAIL — focus is on the search input, not the first option, because the effect re-ran and called `inputRef.current?.focus()`.

- [ ] **Step 3: Hold the close handler in a ref**

In `components/search/SearchDialog.tsx`, add the ref immediately after `const inputRef = useRef<HTMLInputElement>(null);` (line 32):

```tsx
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
```

Assigning during render (rather than in an effect) keeps the ref current before any event can fire. Then, inside `handleModalKeyDown`, replace the `onClose()` call at line 62:

```tsx
        onCloseRef.current();
```

and replace the effect's dependency array at line 94:

```tsx
  }, []);
```

- [ ] **Step 4: Memoise the provider's callbacks**

In `components/search/SearchProvider.tsx`, add these two callbacks immediately after `closeSearch` (after line 59):

```tsx
  const handleActivate = useCallback(() => closeSearch(false), [closeSearch]);
  const handleClose = useCallback(() => closeSearch(true), [closeSearch]);
```

and replace the dialog render at lines 92-98:

```tsx
      {isOpen ? (
        <SearchDialog
          entries={immutableEntries}
          onActivate={handleActivate}
          onClose={handleClose}
        />
      ) : null}
```

`closeSearch` is already a `useCallback` with an empty dependency list, so both handlers are now stable for the life of the provider.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run tests/components/SearchDialog.test.tsx`
Expected: PASS, all tests including the pre-existing Escape, focus-trap, and background-inert assertions.

- [ ] **Step 6: Verify the search e2e journeys still pass**

Run: `npx playwright test tests/e2e/critical-journeys.spec.ts -g "global search"`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add components/search/SearchDialog.tsx components/search/SearchProvider.tsx tests/components/SearchDialog.test.tsx
git commit -m "fix: stop the search dialog re-running modal setup on prop identity changes"
```

---

### Task 9: Automation timeline announces only what changed

**The defect:** `AutomationTimeline` wraps its five-step list and observation paragraph in `<div aria-live="polite" aria-atomic="true">`. Only `steps[3]` (`scenario.branch`, line 12) and the observation differ between scenarios; steps 1, 2, 3 and 5 are identical strings across all three. `aria-atomic="true"` forces the whole subtree to be re-announced on every change, so a user clicking through "Fixed script" → "Adaptive automation" → "Autonomous agent" to compare them hears all five steps plus the ~40-word observation each time, with the one sentence that actually changed buried at the end of roughly 80 words of repetition. Removing `aria-atomic` lets assistive technology announce just the changed nodes.

**Files:**
- Modify: `components/diagrams/AutomationTimeline.tsx:18`
- Test: `tests/components/AutomationTimeline.test.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing test**

Append to `tests/components/AutomationTimeline.test.tsx`:

```tsx
test("announces the changed step without re-reading the whole timeline", async () => {
  const user = userEvent.setup();
  render(<AutomationTimeline />);

  const live = screen.getByRole("list", { name: "Scenario steps" }).closest("[aria-live]")!;
  expect(live).toHaveAttribute("aria-live", "polite");
  expect(live).not.toHaveAttribute("aria-atomic");

  await user.click(screen.getByRole("button", { name: "Autonomous agent" }));
  expect(within(live as HTMLElement).getByText("Select another permitted tool using the run context")).toBeInTheDocument();
});
```

Ensure the file imports `userEvent` from `@testing-library/user-event` and `within` from `@testing-library/react`.

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/components/AutomationTimeline.test.tsx -t "without re-reading the whole timeline"`
Expected: FAIL — `expected element not to have attribute "aria-atomic"`.

- [ ] **Step 3: Drop `aria-atomic`**

In `components/diagrams/AutomationTimeline.tsx`, replace line 18:

```tsx
    <div aria-live="polite">
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/components/AutomationTimeline.test.tsx`
Expected: PASS.

- [ ] **Step 5: Verify the keyboard e2e journey still passes**

Run: `npx playwright test tests/e2e/hunt-tricks.spec.ts -g "automation comparison"`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/diagrams/AutomationTimeline.tsx tests/components/AutomationTimeline.test.tsx
git commit -m "fix: announce only the changed automation timeline step"
```

---

### Task 10: Filter guidance stops telling touch users to hold a key

**The defect:** Both filter panels attach `aria-describedby="…-filter-guidance"` to every `<select multiple>`, pointing at the visually-hidden text "Hold Control or Command to select more than one value." At `<= 36rem` the filter grid collapses to a single column (globals.css:513) and these ten selects are the site's primary interaction, so a phone user is described an action they cannot perform. iOS Safari renders `<select multiple>` as an inline list where each tap toggles a value; Android Chrome opens a checkbox dialog. Neither needs a modifier key.

This is the interim fix. The full control redesign — replacing native multi-selects with checkbox groups — is deferred to its own plan, because it rewrites control lookups in eight test files (see "Findings Not Being Fixed" above).

**Files:**
- Modify: `components/hunts/HuntFilters.tsx:107`
- Modify: `components/queries/QueryLibrary.tsx:139`
- Test: `tests/components/HuntFilters.test.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write the failing test**

Append to the `HuntFilters` describe block in `tests/components/HuntFilters.test.tsx`:

```tsx
  test("describes multi-selection in terms every input mode can follow", () => {
    render(<HuntFilters filters={emptyHuntFilters} options={filterOptions} onChange={vi.fn()} />);

    const guidance = document.getElementById("hunt-filter-guidance")!;
    expect(screen.getByLabelText("Scope")).toHaveAttribute("aria-describedby", "hunt-filter-guidance");
    expect(guidance).toHaveTextContent(
      "Select one or more values. With a keyboard or mouse, hold Control or Command while selecting. On a touch screen, tap each value.",
    );
  });
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npx vitest run tests/components/HuntFilters.test.tsx -t "every input mode can follow"`
Expected: FAIL — the element has the old single-sentence text.

- [ ] **Step 3: Rewrite both guidance strings**

`components/hunts/HuntFilters.tsx`, replace line 107:

```tsx
      <p className="sr-only" id="hunt-filter-guidance">Select one or more values. With a keyboard or mouse, hold Control or Command while selecting. On a touch screen, tap each value.</p>
```

`components/queries/QueryLibrary.tsx`, replace line 139:

```tsx
        <p className="sr-only" id="query-filter-guidance">Select one or more values. With a keyboard or mouse, hold Control or Command while selecting. On a touch screen, tap each value.</p>
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tests/components/HuntFilters.test.tsx tests/components/QueryLibrary.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/hunts/HuntFilters.tsx components/queries/QueryLibrary.tsx tests/components/HuntFilters.test.tsx
git commit -m "fix: make multi-select filter guidance accurate for touch input"
```

---

## Final Verification

- [ ] **Step 1: Run the full unit suite**

Run: `npm run check`
Expected: lint clean, typecheck clean, all Vitest suites pass.

- [ ] **Step 2: Run the full e2e suite on both projects**

Run: `npm run test:e2e`
Expected: all specs pass on `desktop-chromium` and `mobile-chromium`.

- [ ] **Step 3: Review the release screenshots**

Open `test-results/task-11-screenshots/` and `test-results/hunt-tricks-screenshots/`. Confirm the query-library and hunt-catalog filter chips look consistent and nothing shifted in the mobile captures.

- [ ] **Step 4: Confirm the follow-up plan is recorded**

The filter-control redesign is not in this plan. Before closing out, either write `docs/superpowers/plans/<date>-filter-control-redesign.md` or open a tracking issue, so the deferred work is not lost.

---

## Self-Review

**Coverage against the review findings**

| # | Finding | Task |
|---|---|---|
| 1 | Mobile nav overlay unscrollable | Task 1 |
| 2 | Empty `<dd>` in query cards | Task 5 |
| 3 | `aria-label` dropped on role-less spans | Task 2 |
| 4 | Label-in-Name on filter chips | Task 3 |
| 5 | Query chips below 44px | Task 4 |
| 6 | Query filters absent from URL | Task 7 |
| 7 | Landmark flood on `/queries` | Task 6 |
| 8 | `aria-atomic` over-announcement | Task 9 |
| 9 | History entry per filter change | Not fixed — deliberate, e2e-enforced |
| 10 | Unstable modal effect dependency | Task 8 |
| 11 | Canonicalisation drops query params | Not fixed — deliberate, unit-test-enforced |
| 12 | Multi-selects poor on touch | Task 10 (interim) + deferred redesign plan |

**Type consistency check**

`QueryFilterOptions` is used as the second parameter of both `parseQueryFilters` and `serializeQueryFilters` (Task 7, Step 3), as the return type of `deriveOptions` (Step 7), and in `tests/query-filters.test.ts` (Step 1) — consistent. `QueryFilters` is the type of `setFilters`'s parameter and of `emptyQueryFilters`, and every existing `setFilters(replaceFilter(...))` and `setFilters(emptyQueryFilters)` call site still type-checks because `replaceFilter` already returns `QueryFilters`. `queryFilterDefinitions` tuples are ordered `[key, label, parameter]`; Task 7 Step 7 destructures `[key, , singular]` for chips and `[key, label]` for controls, matching the original local `filterDefinitions` ordering exactly. `expectLocalScroller(scroller, role?)` (Task 6, Step 6) is called with two arguments at the two `.code-block__source` sites and one argument everywhere else.

**Ordering check**

Tasks 3, 5, 6 and 7 all edit `components/queries/QueryLibrary.tsx` and must run in that order: Task 6 introduces `.query-card__strategy`, which Task 7's `QueryLibraryFallback` reuses. Task 4's e2e assertion depends on the accessible name Task 3 introduces. No other cross-task dependencies exist.
