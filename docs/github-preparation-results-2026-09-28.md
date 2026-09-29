# GitHub preparation results

Completed September 28, 2026, following the approved order in `pre-github-review-2026-09-28.md`. The original review remains a record of the pre-fix state.

## Changes

1. **Publication branch:** Preserved the six existing content edits and research-review note, reconciled `main` with the application branch, and retained the separate research annex as a dated supporting snapshot. Local `main` now contains the application. All prior commit history and existing working directories were preserved.
2. **Repository contents:** Excluded local worktrees, scratch copies, and verification artifacts from publication and development checks. Removed seven internal reports from the current tracked tree while keeping their local copies and historical commits.
3. **Query correctness:** The management-egress SPL now matches source IP, destination IP, destination port, and transport, and excludes only positively approved service relationships. Direction/interface normalization and lookup requirements are documented. Query search links now identify, reveal, and focus the selected card, including navigation from filtered results, reloads, and changes between fragments.
4. **Dependencies and navigation:** Updated `undici` to 8.11.2. Added visible and accessible current-section navigation for desktop and mobile, including detail routes and prefixed hosting.
5. **Publication configuration:** Added a supported Node/npm baseline, reproducible installation instructions, contribution guidance, CI, example public URL settings, and `public/.nojekyll`. The workflow verifies the source and export; it does not deploy a site.

## Verification

Application/configuration snapshot: `de9f509` (the merge has the same source tree as `2198a0b`).

| Check | Result |
| --- | --- |
| Clean locked installation | Passed: 645 packages installed; zero audit findings |
| Clean quality gate before any build | Passed: lint, typecheck, 39 test files, 210 tests |
| Quality gate after query hydration and tool-exclusion fixes | Passed: lint, typecheck, 210 tests |
| Integrated root quality gate | Passed: lint, typecheck, 39 test files, 210 tests |
| Production export | Passed at the origin root and with `/guide` configured; 95 generated build entries |
| Desktop/mobile Chromium suite | 27 passed; 3 intentional device-specific skips; no failures |
| Subpath browser checks | Passed on desktop and mobile: assets, filtered query selection, reload/focus, and current navigation |
| Pages export marker | `.nojekyll` present in the clean prefixed export |
| Research-annex validator | Passed: 39 proposed additions and 6 amendments against the dated annex context |
| Final lockfile audit | Zero vulnerabilities |
| Independent source review | No actionable findings in the reviewed query, navigation, dependency, and publication changes |
| Repository checks | No scratch/report files in the current tracked tree; ignored copies retained; `git diff --check` passed |

The new query-search browser regression initially failed on filtered navigation and mobile reload. Post-render scrolling/focus corrected those failures; the expanded test also covers hash-only navigation. Screenshots of prefixed query selection and active navigation were visually inspected. The temporary managed verification worktree was archived after its checks; screenshots and the local smoke script remain ignored under `.publication-verify/` in the project root.

## Remaining publication choices and limits

- **License remains undecided**, as requested. No license file was added.
- No GitHub remote is configured and nothing has been pushed or deployed. The repository URL and any live hosting destination remain to be supplied. Public URL settings still use placeholders.
- GitHub-hosted CI has not run yet. Local validation used Windows, Node 24.18.0, npm 11.16.0, and Chromium. Firefox, Safari, and assistive-technology testing were not added.
- npm emitted existing ESLint 10 plugin peer-range warnings and a resolver postinstall approval warning; installation, lint, and builds still passed. The first clean install encountered a missing shared-cache file; retrying with an isolated cache succeeded.
- The SPL correction was checked against lookup semantics and representative allowed/disallowed service cases. No live Splunk execution or production detector-accuracy measurement was performed.
- The preserved annex is not automatically promoted into the live research registry. The optional native filter-control redesign remains deferred.
