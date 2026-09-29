# Pre-GitHub project review

Reviewed September 28, 2026. Verdict: **resolve the publication blockers and targeted correctness issues before the first GitHub push.** The application builds successfully and its existing automated checks pass. The root checkout does not yet contain the application that was tested.

This was a review, not a remediation pass. Application source, existing edits, branches, commits, and remotes were preserved. This report is the only new non-generated file created by the review.

**Scope and repository state**

- Root checkout: `C:/Users/Mango/edgeTH`, branch `main`, commit `e08f617`. It tracks only `.gitignore` and three planning/specification documents.
- Application reviewed: `C:/Users/Mango/edgeTH/.worktrees/edge-threat-hunting-guide-mvp`, branch `feat/edge-threat-hunting-guide-mvp`, commit `7dc23c9`, including its existing uncommitted content changes.
- `main` and the application branch have diverged: one commit is unique to `main`, and 48 are unique to the application branch. They cannot be reconciled by assuming `main` is simply behind.
- The application has six modified tracked files: three methodology MDX articles, `data/methodology.ts`, `data/research-expanded.ts`, and `tests/content-production-validation.test.ts`. Its existing `docs/research-review-2026-09-06.md` is untracked. These changes were present before the review.
- A separate research branch, `claude/threat-hunting-research-3110ba` at `c3881ae`, contains seven `docs/research/` files absent from the application branch. Its research annex should be assessed explicitly before publication; it is not included merely by publishing the app branch.
- No Git remote is configured. Local Git history already exists, so the next publication would be the first push, not the first local commit.

**Prioritized findings**

1. **P1 — The current publication branch omits the application and latest content edits.**

   A normal push of root `main` would publish planning documents without `package.json`, application source, tests, or README. Pushing the application branch alone would omit its six uncommitted edits and untracked research-review note. Integrate the intended application snapshot into the chosen default branch, explicitly preserve the content edits, and decide whether to include the separate research annex. Verify the resulting branch with `git ls-tree` and a fresh checkout before pushing. This is a repository-state issue, not a failure of the application build.

2. **P2 — Root staging can accidentally include an obsolete verification copy.**

   Location: `.gitignore:10-11` in the root and application checkouts.

   The root has 129 untracked files under `.task10-verify/`, including another application tree, README, tests, and package lock. That directory is not excluded, so `git add .` at the root would stage it. Exclude this scratch directory before broad staging. Seven `.superpowers/sdd/.../task-*-report.md` files are also already tracked on the application branch, despite `.superpowers/` being ignored; ignore rules do not remove tracked files. Decide whether these local process reports belong in the public repository and remove them from tracking if they do not. Preserve the local files until their existing uses have been accounted for.

3. **P2 — The management-egress Splunk example suppresses unapproved services to approved peers.**

   Location: `data/hunts/management-plane-c2.ts:75-79` in the application worktree.

   The dependency lookup uses only `src_ip` and `dest_ip`, and the filter keeps only null `approved` values. If device A may contact host B on TCP/443, an unapproved TCP/22 connection to B matches the same IP pair and disappears. An explicit non-null `approved=false` row is also suppressed. This conflicts with the hunt's stated destination/protocol/port dependency model. Match the full allowed relationship, including the service fields, and suppress only positively approved matches. Document any assumed direction/interface normalization. A synthetic tuple comparison confirmed the false-negative scenario; no Splunk instance or production telemetry was used.

4. **P2 — Query search results lose the selected query.**

   Locations: `lib/search-index.ts:101-108` and `components/queries/QueryCard.tsx:23`.

   Every `QUERY` result links to `/queries/`, and query cards have no matching fragment IDs. Browser reproduction: search for “Workflow authority diff,” choose its QUERY result, and arrive at the unfiltered library. The selected heading was approximately 27,288 pixels below the viewport in the 1440×1000 run. Give queries stable anchors and include the fragment in each result, or navigate to a route/filter that identifies the selected query. Add a browser assertion for selecting a QUERY result; the current search journeys select HUNT results.

5. **P2 — The lockfile contains one moderate development dependency advisory.**

   Location: `package-lock.json:9705-9711`.

   Fresh `npm audit --package-lock-only --json` reported `undici@8.10.1`, reached through the development dependency `jsdom@30.0.1`. The advisory concerns a malformed compressed WebSocket response crashing a Node process; version 8.10.2 fixes the affected 8.x range. Update the compatible lockfile dependency and rerun the checks. This is not evidence that the static website serves a vulnerable Node backend. The audit reported zero high or critical vulnerabilities. See the [maintainer advisory](https://github.com/nodejs/undici/security/advisories/GHSA-3wwx-pv8p-q78v).

6. **P2, conditional — Branch-based GitHub Pages needs Jekyll bypass configuration.**

   Locations: `README.md:34-44`, `next.config.mjs:6-12`, and the generated `out/` artifact.

   The export contains `_next/` assets but no `.nojekyll`, and the repository has no Pages deployment workflow. If the exported files are published through Pages' branch/Jekyll source, underscore directories can be omitted and the site loses styles and scripts. Include `.nojekyll` in that publication artifact or use an Actions artifact deployment that bypasses Jekyll. This does not block storing source on GitHub and does not apply to every static host. The final deployment must also supply the real `NEXT_PUBLIC_SITE_URL` and matching `NEXT_PUBLIC_BASE_PATH`; the default build uses `https://hunt-tricks.example`. See [GitHub's publication instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) and [underscore-directory behavior](https://github.blog/news-insights/bypassing-jekyll-on-github-pages/).

**Smaller improvements before public release**

- Identify the active navigation section visually and with `aria-current` in `components/layout/Header.tsx:19-21` and `components/layout/MobileNavigation.tsx:109`. The original design calls for a current-section indicator.
- Add a GitHub CI workflow that runs the existing quality gate, production build, and browser journeys on a clean checkout. The repository currently has no `.github/` workflow.
- Document a supported Node version and reproducible installation with `npm ci`. This review used Node 24.18.0 and npm 11.16.0 with the existing installed dependencies; it did not prove a clean installation on another machine.
- Choose the intended license before presenting the repository as reusable open-source material. No project license file is present. Add contribution/source-correction instructions if public contributions are wanted.
- Consider replacing the native multi-select filter controls: long family and technique labels are visually truncated in the desktop screenshot. A filter redesign is already documented as deferred work, so this is a usability follow-up rather than an undiscovered release blocker.

**Verification performed**

| Check | Result |
| --- | --- |
| `npm run check` | Passed: ESLint, TypeScript, 39 test files, 204 tests |
| `npm run build` | Passed: production content validation and static export; Next reported 95 generated build entries |
| Production content registry | 45 hunts, 24 protocols, 18 telemetry sources, 31 research entries, 4 attack paths |
| Browser journeys against that fresh export | 25 passed, 3 intentional device-specific skips, zero failures; desktop and mobile Chromium |
| Export path/fragment scan | 92 HTML files and 2,792 distinct per-page internal references checked; no missing paths or fragment targets |
| `git diff --check` | Passed; only existing LF/CRLF conversion warnings |
| Lockfile advisory audit | One moderate development-only dependency finding; zero high/critical findings |
| Common secret-pattern scan | No matches across 406 blobs in all reachable local Git history, about 4.28 MB |
| Query-result navigation reproduction | Confirmed loss of the selected query |
| Existing long-token overflow concern | Not reproduced in current query descriptions at 1440, 1024, 800, or 390 px; not promoted to a finding |

Browser tests reused a preview server started by this review only after the fresh export passed and port 4173 was confirmed free. The command was `npm run test:e2e -- --workers=2`. Generated screenshots remain under the application worktree's ignored `test-results/` directory. Selected desktop query-library, mobile search-dialog, and query-card screenshots were visually inspected. The older report of a Windows `out/` lock did not reproduce in this run.

**What is working well**

The static architecture fits a public reference guide: it has no authentication, database, or live query-execution backend. Structured registries validate content and relationships before page generation. Query examples are clearly presented as adaptable logic, and the AI methodology separates velocity from AI attribution. The current methodology edits improve source qualification, baseline evaluation, and the handling of missing evidence. Search, filtering, browser history restoration, clipboard behavior, mobile navigation, and evidence links have meaningful automated coverage.

**Limits of this review**

The security scan used common token/private-key patterns, not an exhaustive credential detector or a guarantee that every sensitive value is absent. It inspected reachable Git history, not arbitrary private files elsewhere on the machine. The audit and tests apply to the reviewed snapshot and current advisory response.

Research verification was sampled, not a complete source-by-source audit of all 31 entries or every hunt-to-claim mapping. Primary-source spot checks included the [Microsoft SOHO-router report](https://www.microsoft.com/en-us/security/blog/2026/04/07/soho-router-compromise-leads-to-dns-hijacking-and-adversary-in-the-middle-attacks/), [Anthropic's espionage report](https://www.anthropic.com/news/disrupting-AI-espionage), [the Bro paper](https://www.usenix.org/conference/7th-usenix-security-symposium/bro-system-detecting-network-intruders-real-time), and [the NIST adversarial-ML taxonomy](https://www.nist.gov/publications/adversarial-machine-learning-taxonomy-and-terminology-attacks-and-mitigations-0). No production SIEM queries or detector accuracy measurements were run.

No live GitHub deployment, clean-clone install, production subpath browser run, Safari/Firefox run, or assistive-technology audit was performed. The conditional Pages issue and missing current-navigation state were established by source/configuration inspection. No application changes, dependency updates, staging, commits, merges, or pushes were performed.

**Recommended order**

1. Preserve and integrate the intended application, existing content edits, and any selected research-annex material into the publication branch.
2. Exclude the verification copy and settle which internal reports belong in the public tree.
3. Correct the Splunk allowlist matching, query search destination, and vulnerable development dependency.
4. Add the chosen license, supported runtime instructions, and CI; configure Pages only if it is the chosen host.
5. Verify the final branch from a clean checkout, inspect exactly what is staged and in history, then configure the intended GitHub remote and push.
