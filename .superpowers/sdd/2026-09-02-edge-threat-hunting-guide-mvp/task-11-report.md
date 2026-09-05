# Task 11 Report: Production browser journeys and release polish

## Outcome

- Added Playwright production-export coverage for Chromium at 1440×1000 and 390×844, with clipboard read/write permissions and no server reuse in CI.
- Covered the home → filtered SNMP hunt → Back/Forward restoration → copied query → related hunt journey, including comparison of the complete clipboard value after platform newline normalization.
- Covered global search shortcut activation, focus, active-result scrolling, and SNMP result navigation.
- Covered mobile navigation open/close/focus restoration, telemetry disclosures, desktop primary navigation and hunt comparison layout, reduced motion, document overflow, local table/code/diagram scrollers, and the deferred Task 7 chip/clear touch targets.
- Made code and diagram scrollers keyboard-focusable named regions with visible focus treatment; increased hunt filter chip/clear targets to at least 44px high.
- Stacked protocol flow diagrams within the reading column so the normal SNMP graph shows both endpoints at 1440px, while retaining the required two-column hunt comparison.
- Excluded `tests/e2e/**` from Vitest discovery so the non-browser and Playwright runners remain independent.
- Added a concise README with install, dev, check, build, browser, preview, and static-host `NEXT_PUBLIC_SITE_URL`/`NEXT_PUBLIC_BASE_PATH` configuration. No deployment was performed.

## Test-driven evidence

- Critical journey RED initially exposed selector/subpixel precision in the test itself; after correction, search passed in both projects and the clipboard comparison proved that Windows returned the correct query with CRLF line endings. The final focused critical run passed 4/4.
- Responsive RED: 3 failed, 3 passed, and 2 project-specific tests skipped. Both sizes reported the missing `tabindex`, role, and accessible name on code scrollers; mobile measured the Task 7 filter chip at 30.78px high instead of 44px.
- Responsive GREEN after the scoped fixes: 6 passed and 2 intentional project skips.
- Visual-review RED: at 1440px the normal SNMP graph's final node ended at x=967.16 while its canvas ended at x=695. After stacking only protocol flows, the focused desktop regression passed; the separate hunt comparison remained side-by-side.
- Final `npm run test:e2e`: 10 passed, 2 intentional cross-project skips, 0 failed.
- Final `npm run check && npm run build`: 35 Vitest files and 150 tests passed; lint and typecheck exited 0; Next generated all 65 routes and exited 0.

## Build and browser provenance

`npx playwright install chromium` first failed inside the sandbox with `EPERM` while creating `C:\Users\Mango\AppData\Local\ms-playwright\__dirlock`; the same pinned install succeeded with the required filesystem permission.

The first normal worktree build successfully compiled, typechecked, and generated 65 pages, then reproduced the existing Windows directory-handle failure: `EBUSY: resource busy or locked, rmdir ...\edge-threat-hunting-guide-mvp\out`. No process was broadly terminated. Production browser and final build verification therefore ran in the retained physical-dependency copy at `C:\Users\Mango\edgeTH\.task10-verify`. Only the Task 11 source, config, tests, and README were synchronized from the worktree; its installed `node_modules` were preserved. An owned `npm run preview:static` session served that exact successful export for iterative and final Playwright runs and was stopped explicitly afterward.

## Screenshots

The preserved review directory is:

`C:\Users\Mango\edgeTH\.task10-verify\test-results\task-11-screenshots\`

It contains desktop and mobile full-page captures for `home`, `hunt-catalog`, `flagship-hunt`, `protocol-snmp`, `telemetry`, `query-library`, and `search-dialog`, plus viewport-detail captures for `query-library-viewport` and `search-dialog-viewport` at both sizes (18 PNGs total). The desktop protocol capture was regenerated after the diagram layout fix.

## Concern

The original worktree `out` directory remains locked by an unidentified external Windows handle. The source and production export are verified in the retained copy, which must remain available for Task 12's audit and screenshot review.
