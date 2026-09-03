# Task 3 report — secondary content foundations

## Status

Implemented all Task 3 registries and methodology bodies in the isolated `edge-threat-hunting-guide-mvp` worktree. Protocol, telemetry, research, and attack-path records are parsed by their Task 2 Zod schemas at module load. `lib/content.ts` was intentionally not changed; Task 4 remains responsible for activating the combined registry gate.

## TDD evidence

### RED

Created `tests/secondary-content.test.ts` first with the required protocol order and collection-completeness assertions, plus schema parsing of every schema-backed record.

Command:

```text
npm test -- tests/secondary-content.test.ts
```

Output:

```text
> hunt-the-infrastructure@0.1.0 test
> vitest run tests/secondary-content.test.ts

 RUN  v4.1.11 C:/Users/Mango/edgeTH/.worktrees/edge-threat-hunting-guide-mvp

 ❯ tests/secondary-content.test.ts (0 test)

 FAIL  tests/secondary-content.test.ts [ tests/secondary-content.test.ts ]
Error: Failed to resolve import "@/data/attack-paths" from "tests/secondary-content.test.ts". Does the file exist?
  Plugin: vite:import-analysis
  File: C:/Users/Mango/edgeTH/.worktrees/edge-threat-hunting-guide-mvp/tests/secondary-content.test.ts:2:28
  1  |  import { describe, expect, test } from "vitest";
  2  |  import { attackPaths } from "@/data/attack-paths";
     |                               ^
  3  |  import { huntFamilies } from "@/data/families";
  4  |  import { homeContent } from "@/data/home";

 Test Files  1 failed (1)
      Tests  no tests
```

The failure was expected and specific: the first required registry module did not exist.

### GREEN

After implementing the minimal complete registries and MDX bodies, ran the required focused and existing schema suites.

Command:

```text
npm test -- tests/secondary-content.test.ts tests/schema.test.ts
```

Output:

```text
> hunt-the-infrastructure@0.1.0 test
> vitest run tests/secondary-content.test.ts tests/schema.test.ts

 RUN  v4.1.11 C:/Users/Mango/edgeTH/.worktrees/edge-threat-hunting-guide-mvp

 Test Files  2 passed (2)
      Tests  13 passed (13)
   Duration  1.74s
```

During the first GREEN attempt, a supplementary direct `.mdx` import assertion exposed that Vitest has no MDX transform while Next does. That assertion was removed because it tested an unavailable test-runner loader rather than the content registries; the Next MDX integration remains covered by the configured production toolchain and the files follow Next's local MDX contract.

## Implemented content

- Seeded all 24 protocols in the required order. Every record includes a protocol-specific definition, legitimate infrastructure uses, expected direction, suspicious patterns, attacker abuse, structured expected/suspicious flows, and accessible text alternatives. All `relatedHunts` arrays are empty for Task 4.
- Modeled SNMP direction explicitly: NMS to router on UDP/161, router to NMS on UDP/162, and router-originated UDP/161 fan-out as suspicious.
- Seeded eight telemetry sources with `low | medium | high` word coverage for C2, lateral movement, discovery, and manipulation, plus collection, investigation, and limitation guidance.
- Added four hunt-family labels/objectives and structured homepage hero, origin/transit, appliance characteristics, plane examples, and independent-observation content. Updated `app/page.tsx` to consume the structured hero copy so security content is not duplicated in the component.
- Added three methodology metadata records and local MDX bodies covering the dependency inventory, directional allow matrix, rarity factors, and all eight specified independent telemetry sources.
- Added accessible, static-export-compatible MDX component mappings with semantic headings, prose, lists, links, blockquotes, code, and horizontally scrollable tables.
- Added four structured attack paths with ordered nodes, labeled edges, and adjacent text alternatives; no graph dependency was introduced.
- Added seven curated research records with exact required titles, organizations, publication dates, and source URLs. Related-hunt arrays remain empty until Task 4 provides real slugs.

## Source handling

On 2026-09-03, the specified primary-source pages were accessed directly and used only to paraphrase infrastructure-relevant behaviors:

1. CISA AA25-239A — router modification, trusted pivots, backbone/PE/CE targeting.
2. Cisco Talos ArcaneDoor — perimeter-device implants, configuration changes, capture/exfiltration, and possible lateral movement.
3. Mandiant Ghost in the Router — Junos OS backdoors, trusted-process injection, log suppression, and credential-based movement.
4. Mandiant Cloaked and Covert — valid credentials, SSH movement, TACACS+ collection, and stealth tooling on under-monitored infrastructure.
5. NCSC UK edge-router advisory — legitimate SNMP credentials, TFTP configuration export, engineering access, ACL-selected GRE exfiltration.
6. Microsoft Threat Intelligence SOHO router report — resolver reconfiguration, traffic collection, and DNS-assisted adversary-in-the-middle activity.
7. CISA AA24-038A — valid accounts, living-off-the-land administration, proxy infrastructure, persistence, and lateral preparation.

No source prose was copied into the registry. The supplied publication dates were retained exactly; CISA AA25-239A currently displays a later revision date on its page, which does not replace the brief's required publication date.

## Self-review

- Confirmed protocol names exactly match `PROTOCOL_NAMES`, including spelling/case and required order.
- Confirmed telemetry keys exactly match `TELEMETRY_KEYS`; all coverage values are schema-valid words rather than numeric or color-only values.
- Confirmed every schema-backed array is parsed by its Task 2 Zod schema.
- Confirmed attack-path edge endpoints correspond to declared node IDs and every path has a usable prose sequence.
- Confirmed all protocol and research related-hunt arrays are empty to avoid references to Task 4 slugs.
- Confirmed research summaries stay on network-infrastructure behavior and do not expand into generic incident/news summaries.
- Confirmed no Task 3 registries were imported into `lib/content.ts`.
- `git diff --check` reported no whitespace errors; the only diagnostic was Git's existing LF-to-CRLF notice for `app/page.tsx` on Windows.

## Final verification

### Full test suite

```text
npm test

 Test Files  4 passed (4)
      Tests  19 passed (19)
   Duration  3.53s
```

### Lint

```text
npm run lint

> eslint .
```

Exit code: `0`.

### TypeScript

```text
npm run typecheck

> tsc --noEmit
```

Exit code: `0`.

### Production build

```text
npm run build

▲ Next.js 16.3.4 (Turbopack)
✓ Compiled successfully in 1282ms
✓ Finished TypeScript in 2.8s
✓ Generating static pages using 5 workers (4/4) in 742ms
○  (Static)  prerendered as static content
```

Exit code: `0`.

## Files changed

- `.superpowers/sdd/2026-09-02-edge-threat-hunting-guide-mvp/task-3-report.md`
- `app/page.tsx`
- `content/methodology/baselining.mdx`
- `content/methodology/independent-observation.mdx`
- `content/methodology/rarity.mdx`
- `data/attack-paths.ts`
- `data/families.ts`
- `data/home.ts`
- `data/methodology.ts`
- `data/protocols.ts`
- `data/research.ts`
- `data/telemetry.ts`
- `mdx-components.tsx`
- `tests/secondary-content.test.ts`

## Concerns

No implementation blocker remains. The methodology MDX files are intentionally content modules without routes in this task; Task 8 will import them into their explicit static pages. The combined registry integrity gate remains intentionally deferred to Task 4 as required.
