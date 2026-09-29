# Threat hunting methodology research review

Reviewed: 2026-09-06. Scope: the six methodology routes, their source registry and search metadata; detailed edits focus on behavior, baselining, rarity, and independent observation. This is not a source-by-source audit of every existing hunt or a validation against production telemetry.

## Findings and changes

| Finding | Refinement | Location |
| --- | --- | --- |
| Foundational MDX articles lacked inline sources. | Added claim-adjacent primary-source links and research-library anchors. | `content/methodology/*.mdx` |
| Behavior guidance did not specify a complete testable question or result disposition. | Added a scoped hypothesis worksheet, SSH example, alternatives, and four explicit outcome categories. | `data/methodology.ts` |
| Baseline history could be mistaken for approved behavior or evaluated on the same period used to construct it. | Added population and period selection, coverage checks, versioning, contamination handling, and later-period evaluation. | `content/methodology/baselining.mdx` |
| Rarity guidance did not explain evaluation denominators. | Added synthetic alert arithmetic, precision/recall limits, selection bias, and the distinction between an ATT&CK label and tested detection. | `content/methodology/rarity.mdx` |
| External storage could be mistaken for independent observation; empty results lacked a collection gate. | Added evidence-path analysis, field and pipeline checks, validation cases, negative-result boundaries, and handoff details. | `content/methodology/independent-observation.mdx` |
| New concepts would not be discoverable through the limited methodology search projection. | Added explicit search terms using the existing metadata contract. | `data/methodology.ts` |

## Primary sources checked

Four dated publications were added to `data/research-expanded.ts`, each with evidence type, supported claims, and limitations. Existing rendering and indexing consume this registry.

- [MITRE, TTP-Based Hunting](https://www.mitre.org/sites/default/files/2021-11/prs-19-3892-ttp-based-hunting.pdf): report cover March 2019; [landing page](https://www.mitre.org/news-insights/publication/ttp-based-hunting) July 10, 2020. The registry uses the report date and explains the difference. Methodology guidance, not validation of our queries.
- [ASD ACSC and international partners, Best practices for event logging and threat detection](https://www.cyber.gov.au/business-government/detecting-responding-to-threats/event-logging/best-practices-for-event-logging-and-threat-detection): August 22, 2024. Logging and correlation guidance; local collection completeness still needs verification.
- [Pendlebury et al., TESSERACT, USENIX Security](https://www.usenix.org/conference/usenixsecurity19/presentation/pendlebury): August 2019. Experimental findings about Android malware classification. Transfer to hunt evaluation is explicitly editorial, not an observed network-hunting result.
- [NIST SP 800-61 Revision 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final): final April 3, 2025; supersedes Revision 2. Program context for response handoff, not a mandatory hunt case template.

[MITRE CAR](https://car.mitre.org/) was also checked and cited inline for the separation of threat models and analytic implementations. Its home page does not provide a publication date, so no date was invented to fit the current registry's required `publishedAt` field.

## Editorial boundaries

The worksheets, SSH example, result categories, evidence-path checklist, and 100,000-event calculation are guide-authored synthesis or synthetic examples. They are labeled accordingly. No source is presented as validating a universal threshold, guaranteed visibility, production recall, or AI attribution from velocity. Existing velocity and AI-autonomy attribution boundaries are preserved.

Follow-up opportunity: the source contract currently requires a publication date even for living documentation. A future schema change could distinguish publication, update, access date, and unknown dates. Existing legacy sources and all hunt-to-source claims still warrant a separate full audit; this review makes no completeness claim about them.

## Verification

- ESLint and TypeScript checks passed.
- Full unit/component suite: 38 files, 189 tests passed after updating the production registry assertion from 27 to 31 research entries.
- Production content validation and Next.js static export passed (95 generated pages).
- Inspected exported HTML for all four edited methodology pages: added sections present, internal route targets exist, and referenced fragment IDs resolve.
- `git diff --check` passed. Git emitted only line-ending conversion warnings.
- No browser layout or end-to-end test run was performed for this content-only change. No production SIEM query execution or detector-performance validation was performed.
