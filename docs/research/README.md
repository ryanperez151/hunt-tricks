# Research annex

Verified source corpus and claim mappings for the hunt-tricks threat hunting methodology.

| File | Purpose |
|---|---|
| [`methodology-sources.md`](methodology-sources.md) | Annotated corpus: what each source is, what it establishes, what it cannot carry |
| [`methodology-claim-map.md`](methodology-claim-map.md) | Each methodology claim mapped to its supporting source IDs |
| [`records/methodology-sources.json`](records/methodology-sources.json) | 39 new records in `ResearchSchema` shape |
| [`records/existing-record-amendments.json`](records/existing-record-amendments.json) | 6 existing registry records, re-verified and completed |
| [`records/registry-context.json`](records/registry-context.json) | Hunt slugs and existing research IDs, generated from the implementation branch |
| [`validate-records.mjs`](validate-records.mjs) | Dependency-free validator |

## Why this lives in `docs/`

This annex preserves the research review from September 6, 2026. It is supporting documentation, not an additional application registry. The source records and claim map describe the application snapshot reviewed on that date; later methodology edits may already address some observations. The live website uses the validated records in `data/research*.ts`.

Before promoting an annex record into the live registry, recheck its source, reconcile overlapping records and amendments, and validate its claims against the current page. The annex validator checks its recorded snapshot context; it does not establish that every proposed record is current or already published on the website.

## Validate

```bash
node docs/research/validate-records.mjs
```

Checks every rule `ResearchSchema` enforces (required fields, `publishedAt` as `YYYY` / `YYYY-MM` / `YYYY-MM-DD`, absolute HTTP(S) `sourceUrl`, `evidenceType` enum, non-empty `affectedTechnology` and `relevantBehaviors`) plus annex-specific rules the app schema does not:

- `supportedClaims` and `limitations` are **required**, not defaulted to empty. A record without both is not publishable here.
- Every `relatedHunts` slug must exist in the implementation branch's hunt registry.
- No duplicate IDs, no duplicate source URLs, no unknown fields.
- New records may not reuse an existing registry ID; amendments must target one that exists.

Current output:

```
PASS
  new records:        39
  amended records:    6
  distinct ids:       45
  distinct URLs:      45
  hunt slugs known:   45 (from feat/edge-threat-hunting-guide-mvp)
  evidence types:     framework=29, historical-research=6, experiment=2, incident-report=2
```

The `framework` count is high by design: a methodology corpus rests on standards, taxonomies, protocol specifications, and process guidance. Incident reporting concentrates in the scoped hunt records that already exist in the registry.

Regenerate `registry-context.json` whenever hunts or research records change on the implementation branch — the script that produced it reads `data/hunts/**` and `data/research*.ts` from that branch.

## Merging into the application

1. Append the contents of `records/methodology-sources.json` to the `seeds` array in `data/research-expanded.ts`. The file already mixes JSON-style and TypeScript-style object literals, so quoted keys parse as-is.
2. Replace the six records named in `records/existing-record-amendments.json` in `data/research.ts` and `data/research-expanded.ts`, matching on `id`.
3. Wire `sourceIds` per [`methodology-claim-map.md`](methodology-claim-map.md). `data/methodology.ts` already has the field on every section in `methodologySections`; the three MDX pages need either a move into that shape or an evidence block.
4. Run the branch's own gate: content validation, unit and component tests, lint, types, `next build`.

The search index projects research records, so new entries become searchable without further work.

## Conventions

**Verification.** All verification was performed on 2026-09-06. Sources that could not be confirmed were dropped rather than softened. Two confirmation levels are used, and the difference is recorded honestly:

*Direct* — the document or its canonical publisher page was retrieved and title, author, publisher, and date read from it. This covers 32 of the 39 new records and all 6 amendments.

*Secondary* — the publisher blocks automated retrieval (ACM, IEEE) or the retrieved document carries no explicit date line. Metadata was confirmed from multiple independent references agreeing on the same values, and where a PDF was retrievable its title and authors were read directly from the file even when the date was not present:

| Record | What was read directly | What rests on secondary confirmation |
|---|---|---|
| `research-axelsson-2000` | — (ACM blocked) | Title, author, venue, volume, August 2000 date |
| `research-denning-1987` | — (IEEE blocked) | Title, author, venue, February 1987 date, abstract |
| `research-beehive-2013` | — (ACM blocked) | Title, seven authors, ACSAC 2013, pages |
| `research-kill-chain-2011` | Title, authors, affiliation, abstract, case-study content from the PDF | 2011 publication year |
| `research-diamond-model-2013` | Title, three authors, abstract, core features from the PDF | 2013 publication year |
| `research-tahiti-2018` | Title, publisher, three phases, six steps, backlog model from the PDF | 2018 year, inferred from the document's own 2018 references |
| `research-anderson-1980` | Document identity and trace-record content from the PDF | February/April 1980 dates |

Nothing in the corpus depends on these dates being exact to the month; each is used only to place a source in its era.

**Dates.** `publishedAt` is the date the source states. For living resources with no publication date — knowledge bases, community catalogs, control frameworks — the field carries the corpus verification year and the record's `limitations` says so explicitly. Records affected: `research-ads-framework`, `research-cis-control-1`, `research-lolbas`, `research-gtfobins`, `research-mitre-atlas`.

ATT&CK technique records carry the page's own **Last Modified** date instead: `research-attack-t1070` (v3.0, 12 May 2026), `research-attack-t1685` (v1.0, created 14 April 2026, modified 12 May 2026), `research-attack-t1110-003` (v1.8, 24 October 2025).

**URLs.** Canonical publisher URLs, and where a canonical URL redirects or blocks, the resolved location that actually serves the document. `research-tahiti-2018` cites the NVB-hosted PDF because the original Betaalvereniging path now redirects; `research-gtfobins` cites `gtfobins.org` because `gtfobins.github.io` now redirects there.

**Claims.** `supportedClaims` states what the document demonstrates, not what a hunt would like it to demonstrate. `limitations` separates a historical mechanism from a modern threshold, an experiment from a prevalence claim, and provider-side visibility from victim telemetry.

## Known issue surfaced during verification

MITRE ATT&CK is now at **v19.2** and the enterprise taxonomy has changed: `TA0005` is renamed **Stealth**, a new `TA0112` **Defense Impairment** tactic exists, and `T1562` is renumbered **`T1685`** and moved under it. Hunt records carry ATT&CK IDs in their `techniques` field and should be audited against v19.2. Details in [`methodology-sources.md`](methodology-sources.md#maintenance-note-attck-v19-restructuring).
