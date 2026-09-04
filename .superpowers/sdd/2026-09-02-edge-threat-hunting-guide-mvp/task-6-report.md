# Task 6 Report: Infrastructure behavior visualizations

## RED / GREEN evidence

- Initial RED: `npm test -- tests/highlight.test.ts tests/components/CopyButton.test.tsx tests/components/SeverityBadge.test.tsx tests/components/BehaviorComparison.test.tsx tests/components/ProtocolFlowDiagram.test.tsx tests/components/FieldGuidePrimitives.test.tsx` failed because the Task 6 modules did not exist. The literal `expectedFlow`, `suspiciousFlow`, `nodes`, and `edges` fixtures were defined in the tests before implementation.
- Initial GREEN: the focused suite passed with 12 tests after the common primitives, structured diagrams, client interactions, and build-time highlighter were implemented.
- Accessibility RED/GREEN: a repeated-diagram test first failed with duplicate `aria-labelledby` values, then passed after `NetworkFlow` began using `useId()`.
- Review-fix RED/GREEN: a client-environment import of `lib/highlight` and two `PlaneExplorer` instances first failed (the highlighter was importable by client code and tab IDs collided). After adding `server-only`, client-boundary coverage, and `useId()` prefixes, the focused review suite passed with 9 tests.

## Changed files

- Common UI: `Tag`, `SeverityBadge`, `CopyButton`, `CodeBlock`, `SectionHeading`, and `OriginMatters`.
- Hunt UI: behavior comparison, telemetry requirements, and ordered checklist copying.
- Diagrams: SVG network/protocol/attack-path flows, keyboard tabs for plane exploration, and chronological timelines.
- `lib/highlight.ts`: server-only Shiki highlighting with fixed grammars for `splunk`, `kql`, `zeek`, and `pseudocode`.
- `app/globals.css`: field-guide visual styles, contained responsive scrolling, and existing reduced-motion policy coverage.
- Tests: focused behavior, a11y, clipboard race/failure, trusted highlighting, client boundary, and ID-collision coverage.
- `package.json` / lockfile: `server-only` to enforce the build-only highlighter boundary.

## Verification

- Focused Task 6 suite: passed.
- `npm test`: passed — 18 files, 77 tests.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed, including production content validation and static export.
- `git diff --check`: passed.
- Independent review: no Critical findings. The important server-only boundary finding was fixed and reverified.

## Commit

- `feat: add infrastructure behavior visualizations`

## Concerns

- `npm install` emitted existing ESLint peer-dependency warnings because the pinned project uses ESLint 10 while some Next lint plugins declare compatibility through ESLint 9. It completed successfully; lint, typecheck, tests, and build all passed.
- Git emits a non-blocking warning for an unreadable global ignore file in this environment.

## Fix Round 1

### RED / GREEN evidence

- RED geometry: `tests/components/NetworkFlow.test.tsx` failed against center-to-center `<line>` output: no curved edge paths, clipped long-label dimensions, no node-only list, no empty state, and no validation errors for malformed graphs.
- GREEN geometry: the focused diagram suite now verifies bidirectional and branching SNMP paths terminate on source/target rectangle boundaries, carry arrow markers, use distinct curved `Q` paths, wrap seeded long attack-path labels, avoid intermediate nodes for non-adjacent connections, expose graph-derived node/edge lists, and reject duplicate IDs or unknown endpoints.
- RED tabs: every non-selected `aria-controls` target was absent. GREEN renders all panels, hides inactive panels, binds every panel back to its tab, and verifies ArrowLeft/Right/Home/End roving selection, focus, and tab stops.
- RED copy: pending work did not become value-invalid on rerender and had no `Copying…` state. GREEN remounts value-specific attempt state, invalidating stale completions and resetting feedback; deferred tests cover overlapping clicks, value changes, repeated success/failure transitions, and preserved button focus.

### Geometry and accessibility decisions

- `NetworkFlow` normalizes and validates nodes/edges once, then drives visual SVG paths and accessible node/connection lists from that same graph.
- Node labels and edge labels use deterministic word wrapping. Per-label dimensions, lane clearance, and a content-sized SVG viewBox retain all content inside the existing horizontal scroll container.
- Curves begin/end on node boundaries, use lane offsets for parallel, reverse, and branching relationships, and apply an extra lane for non-adjacent edges so they do not run through intermediate nodes.

### Verification

- Focused regression suite: passed — 4 files, 19 tests.
- `npm test`: passed — 19 files, 86 tests.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`: passed.

## Fix Round 2

### RED / GREEN evidence

- RED branch clearance: the actual seeded branching SNMP flow's second connection used its ordinal lane instead of composing it with non-adjacent clearance, so its wrapped label intersected the intermediate peer node.
- GREEN branch clearance: the regression samples the second seeded curve and measures its wrapped label box against the intermediate node; both now clear it. Edge labels render after nodes as an additional paint-order safeguard.
- RED narrow readability: the long-label diagram test had no content-width SVG attribute, leaving a `width: 100%; min-width: 380px` rule to scale a large viewBox down in narrow containers.
- GREEN narrow readability: the SVG now publishes its computed content width as its `width` attribute and inline width, while the scroll canvas retains that intrinsic width; the regression verifies the long graph's rendered width tracks its computed viewBox width.
- RED copy focus: changing the copy value keyed a remount, replacing the focused button element. GREEN retains that exact DOM element and focus while a layout-effect generation change suppresses the stale deferred completion.

### Geometry and interaction decisions

- Network-flow lanes now compose the parallel/ordinal offset with non-adjacent node clearance. The gap between nodes also accounts for the widest wrapped edge label so labels retain dedicated space.
- The SVG has no responsive maximum width: the existing overflow container is responsible for narrow-viewport horizontal scrolling at content-size text scale.
- Copy feedback is scoped to its value and derived as empty immediately after a value change. `requestId` and the current-value ref invalidate outstanding clipboard attempts without remounting the control, while every new attempt announces `Copying…` before its final outcome.

### Verification

- Focused regressions: `npm test -- tests/components/NetworkFlow.test.tsx tests/components/CopyButton.test.tsx` passed — 2 files, 12 tests.
- Full gate: `npm test` passed — 19 files, 87 tests; `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` passed.

## Fix Round 3

### RED / GREEN evidence

- RED completed feedback: after a successful copy of `A`, rerendering `A → B → A` made the old `Copied to clipboard.` feedback visible again because it was keyed only by the value string.
- RED pending feedback: the same `A → B → A` sequence restored an invalidated pending attempt's permanent `Copying…` feedback; resolving that deferred attempt could not safely distinguish the original A generation.
- GREEN: focused regressions verify both completed and deferred A→B→A paths leave the live region empty, preserve the original focused button DOM node, and suppress an old deferred completion.

### Interaction decision

- Copy feedback carries the value-transition generation in state. A conditional value transition clears feedback and advances the generation without remounting the control; every clipboard update uses a functional state update that must match both the attempted value and generation. Request IDs continue to give the most recent overlapping click precedence.

### Verification

- Focused regression: `npm test -- tests/components/CopyButton.test.tsx` passed — 1 file, 7 tests.
- Full gate: `npm test` passed — 19 files, 89 tests; `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check` passed.
