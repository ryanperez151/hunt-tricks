# Filter Control Redesign — Follow-Up Plan (not yet scheduled)

> **Status:** deferred backlog, not ready to execute. This records work split out of
> `2026-09-06-ux-frontend-remediation.md` so it is not lost. It needs a brainstorming and
> planning pass (`superpowers:brainstorming`, then `superpowers:writing-plans`) before anyone
> executes it — the task breakdown below is a starting point, not a finished plan.

**Goal:** Replace the ten native `<select multiple>` filter controls on `/hunts` and `/queries` with a control that works on touch, and close the accessibility and interaction debt the interim fix left behind.

**Why this was split out:** the remediation branch shipped nine self-contained fixes plus an interim copy change (its Task 10). The redesign itself rewrites how eight test files locate filter controls, which is too large to carry inside a plan whose other nine tasks were single-file edits.

---

## The problem

Ten `<select multiple>` controls are the primary interaction on both catalog pages. At `<= 36rem` the filter grid collapses to one column and each select becomes a 6.25rem-tall native list box.

**1. Touch is a second-class input.** `hunt-tricks` ships a mobile Playwright project at 390×844, so phones are a supported target. Native multi-selects render three different ways — iOS Safari an inline toggle list, Android Chrome a checkbox dialog, desktop a modifier-key list box — and on iOS the picker covers the result count and active-filter chips the user is selecting against.

**2. The interim copy is a workaround, not a fix.** The remediation branch replaced "Hold Control or Command to select more than one value" with mode-neutral wording (`components/hunts/HuntFilters.tsx:107`, `components/queries/QueryLibrary.tsx:116`). That stopped instructing touch users to press a key they do not have, but a single sentence now has to describe three different renderings. That is the tell that the control is wrong, not the copy.

**3. URL-controlled selects drop selections mid-gesture.** Documented at `tests/components/QueryLibrary.test.tsx:143-147`. Both catalogs now drive their `<select>` purely from URL state, so React restores the DOM selection to the last-rendered `value` after any change event that does not itself update it. In a browser this is a visible flicker between click and router commit, and a ctrl+click landing inside that window is lost. `/hunts` has had this since `HuntCatalog` shipped; the remediation branch made `/queries` consistent with it rather than introducing it. A checkbox group has no controlled-selection restoration problem and removes this class of bug entirely.

---

## Blast radius — why this needs its own plan

Eight files locate filter controls through `getByRole("listbox")` or `selectOptions`, and every one breaks:

- `tests/components/HuntFilters.test.tsx`
- `tests/components/HuntCatalog.test.tsx`
- `tests/components/QueryLibrary.test.tsx`
- `tests/e2e/hunt-tricks.spec.ts`
- `tests/e2e/critical-journeys.spec.ts`
- `tests/e2e/responsive.spec.ts`

Plus the components themselves (`components/hunts/HuntFilters.tsx`, `components/queries/QueryLibrary.tsx`) and their CSS (`.hunt-filters select`, `.query-filters select`, and the responsive grid rules at `app/globals.css:229`, `:358`, `:477`, `:512-513`).

The URL serialisation layers (`lib/filters.ts`, `lib/query-filters.ts`) should need **no** changes — the control is a different way to produce the same `HuntFilters` / `QueryFilters` value. Confirm that early; if it turns out false, the plan is bigger than it looks.

---

## Sketch of an approach (to be validated in brainstorming)

Replace each `<select multiple>` with a `<fieldset>` containing a `<legend>` and one checkbox per option, styled as toggle chips. This keeps native semantics and keyboard behaviour, needs no ARIA authoring beyond the fieldset, has a real 44px touch target per option, and shows every option and its selected state at once — which the iOS picker does not.

Open questions for brainstorming:
- Ten expanded checkbox groups is a lot of vertical space on a phone. Collapsed-by-default disclosures per category? A count badge on each collapsed group?
- Does the existing `<details>` "Infrastructure and advanced filters" split still make sense, or does it merge into a uniform disclosure pattern?
- Should selection commit per-checkbox (one history entry each, matching today) or batch behind an Apply button? Note that `tests/e2e/hunt-tricks.spec.ts:16` and `tests/e2e/critical-journeys.spec.ts:13-19` currently assert Back steps through individual filter changes — an Apply button changes that contract and those tests.

---

## Also fold in

Deferred findings from the remediation branch's reviews that belong with this work:

- **Unify the taxonomy label table.** `components/queries/QueryCard.tsx:6-19` and `components/hunts/HuntFilters.tsx:29-42` hold byte-identical 8-entry `labels` maps with divergent fallbacks — `QueryCard` falls back to `value.replaceAll("-", " ")`, `HuntFilters` to `displayLabel` (`lib/display-labels.ts:8`), which consults a second table first. No value currently reaches both paths, so there is no live bug, but `labelFor` now feeds `aria-label` on both pages, so adding a slug to `displayLabels` would give it two different accessible names on two pages and only one chip test would catch it. A single `labelFor` in `lib/display-labels.ts` should serve both panels.
- **Single source for the guidance sentence.** The same string lives in four places (both components, both tests). If the control changes, the copy changes with it — export it as a constant so the tests pin one definition rather than duplicating it.
- **`/queries` canonicalisation.** `HuntCatalog.tsx:68-72` rewrites its URL to canonical form; `QueryLibrary` does not. So `/queries/?platform=not-real` renders every query while the URL still claims a filter, and non-canonical parameter order persists. A ~6-line mirror of the existing effect. Decide deliberately whether the two catalogs should match here.
- **`withTrailingSlash` and `normalizeValues` duplication.** `withTrailingSlash` is verbatim in `QueryLibrary.tsx:66-68` and `HuntCatalog.tsx:51-53`; `normalizeValues` in `lib/filters.ts:58-61` and `lib/query-filters.ts:33-36`. Hoist to `lib/` when touching these files anyway.
- **`QueryDisplayRecord` lives in the wrong module.** `components/queries/QueryCard.tsx:4` imports it from `QueryLibrary`, which imports `QueryCard` back — erased at compile time by `import type`, so no runtime cycle, but the stated model is "mirrors `HuntCard`", and `HuntCard` takes its `Hunt` type from `lib/schemas`. Move the type to `lib/`.
- **`.query-card__strategy` has no CSS rule and no selector using it** (`QueryCard.tsx:41`). Either style it or let the unit test query it instead of reaching through `.parentElement`.

---

## Out of scope

The two findings the remediation plan recorded as deliberate, test-enforced behaviour stay deliberate unless a product decision changes them — see that plan's "Findings Not Being Fixed" section:

- One history entry per filter change (`router.push`), asserted by two e2e tests.
- Canonicalisation dropping unrecognised query parameters on `/hunts`, asserted by `tests/components/HuntCatalog.test.tsx:52`.
