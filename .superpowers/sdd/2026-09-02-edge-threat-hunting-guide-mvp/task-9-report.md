# Task 9 report — query library and global guide search

## Status

Implemented Task 9 only in the isolated `edge-threat-hunting-guide-mvp` worktree. The site now exports an aggregated `/queries/` library with six filter dimensions and provides a global, keyboard-accessible guide search from the shared header. Task 10 was not started.

## TDD evidence

Created `tests/components/QueryLibrary.test.tsx` and `tests/components/SearchDialog.test.tsx` before their production modules.

```text
npm test -- tests/components/QueryLibrary.test.tsx tests/components/SearchDialog.test.tsx

Test Files  2 failed (2)
Failed to resolve import "@/components/queries/QueryLibrary"
Failed to resolve import "@/components/search/SearchProvider"
```

Those were the expected missing-feature failures. After implementation, the same focused command passed:

```text
Test Files  2 passed (2)
Tests       13 passed (13)
```

The focused regressions cover platform filtering, OR-within/AND-across filtering, counts, chips, individual removal, clear/reset behavior, empty state, hunt context, highlighted/raw query pairing, exact raw copy, all six dimensions, shortcut opening and conflicts, editable origins, keyboard wrapping and activation, resolvable IDs and ARIA relationships, modal background isolation, focus trap/restoration, backdrop/explicit/Escape closing, no-result status, trigger unmount, listener cleanup, and mobile-navigation conflict prevention.

The expanded Task 9 regression passed with 6 files and 31 tests, including the existing query, search, header, and copy-control suites.

## Implementation

- `/queries/` aggregates validated query records on the server and highlights each raw query inside the same record-producing operation, preventing unrelated raw and HTML values from being paired.
- The client query island receives only compact serializable display records. It never imports the content registry, schemas, Shiki, or raw MDX at runtime and never evaluates query text.
- Filters cover platform, family, protocol, device, telemetry, and technique. Values broaden results within one category; populated categories narrow them together.
- Query cards retain hunt context through Next `Link`, show platform, description, inherited metadata, trusted highlighted markup, an adaptation warning, and copy the exact raw source.
- The root layout builds normalized search entries on the server. The provider owns a compact immutable client snapshot and the dialog uses the existing pure search function.
- Search opens from the header button or exactly one of Ctrl/Cmd+K. Editable origins, repeats, Shift/Alt conflicts, dual Ctrl+Meta, and a concurrent mobile-navigation modal are ignored.
- The portal modal supplies a labelled dialog, combobox/listbox semantics, unique resolvable IDs, `aria-expanded`, `aria-controls`, and `aria-activedescendant`; ArrowUp/Down wrap, Enter activates a Next `Link`, and Escape, backdrop, and the close button dismiss it.
- The modal traps Tab, inerts and aria-hides only background body children, preserves the portal for assistive technology, locks/restores the exact prior body overflow, restores the exact connected invoker after ordinary dismissal, and safely skips focus restoration after result activation or invoker removal.

## Final verification

```text
npm test
Test Files  32 passed (32)
Tests       136 passed (136)

npm run lint
Exit code: 0

npm run typecheck
Exit code: 0

npm run build
Test Files  1 passed (1) — production content gate
Generated static pages: 59/59
Route: /queries
Exit code: 0
```

`git diff --check` reported no whitespace errors. Git emitted only the existing Windows LF-to-CRLF notices.

## Export, browser, and client-boundary audit

- `out/queries/index.html` is 295,455 bytes and contains 25 query cards, 25 adaptation warnings, and server-rendered Shiki markup.
- The fresh export contains 15 static chunk assets. Searches across `out/_next/static/chunks` found no `codeToHtml`, `ContentIntegrityError`, `HuntSchema`, `@shikijs`, `oniguruma`, `data/hunts`, or `shiki` signature.
- At a 390 × 844 browser viewport, the query page had no horizontal overflow. Selecting `zeek` yielded 2 results and both displayed the expected `ZEEK` platform.
- Ctrl+K opened the dialog with the combobox focused. Searching `SNMP`, moving with ArrowDown, and pressing Enter navigated to `/hunts/snmp-fan-out/` and closed the dialog.
- The compact header retained a visible search icon; the desktop-only label and shortcut hint were intentionally clipped by the responsive styles.

## Commit

Planned containing commit message: `feat: add query library and global guide search`. The exact containing commit hash is returned to the SDD controller after commit creation.

## Concerns

No implementation blocker remains. Canonical URL and complete social metadata work remains intentionally deferred to Task 10. Git continues to warn that the user-level global ignore file is unreadable in this sandbox; that does not affect repository state or verification.
