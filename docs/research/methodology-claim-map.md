# Methodology claim map

**Date:** 2026-09-06
**Companion to:** [`methodology-sources.md`](methodology-sources.md)

Maps each substantive methodology claim to the sources that support it. The implementation branch already carries the mechanism: `data/methodology.ts` exports `methodologySections`, where each section has a `sourceIds` array. This document says which IDs belong on which section, and flags the sections that currently assert substantive claims with **no** citation at all.

The three MDX pages (`baselining`, `rarity`, `independent-observation`) have no `sourceIds` field. Their mappings below are keyed by heading, so wiring them requires either moving them into the `methodologySections` shape or adding an evidence block to the MDX. That structural choice belongs to the implementation branch; the mapping is stated either way.

Convention: **●** = section currently has no citations. **+** = source to add to an existing citation set.

---

## `/methodology/behavior`

| Section | Claim needing support | Sources |
|---|---|---|
| Begin with a role, not an alert | Comparison must be against the entity's own history and genuinely comparable peers, not a global population | + `research-denning-1987` (subject-to-object profiles), + `research-peak-framework-2023` (baseline hunting as a named hunt type) |
| Begin with a role, not an alert | Novelty creates a question, not a verdict | + `research-closed-world-2010` (the semantic gap between anomaly and attack) |
| Familiar tools still need context | Familiar executables carry capability that does not require new tooling | + `research-lolbas`, + `research-gtfobins` — both state explicitly that the listed binaries are not malicious, which is the framing this section needs |
| Familiar tools still need context | Living-off-the-land activity is hard to detect without baselines | + `research-cisa-aa24-038a` (amended: LOTL as actor hallmark; advisory states many organizations lack the baselines to detect it) |
| Separate observation from interpretation | One vantage point yields an inference about another system's state, not that state | + `research-insertion-evasion-1998` |
| **● Disconfirm the hypothesis** | Evidence should be weighed by how well it discriminates between competing explanations; checking alternatives before escalating is analytic discipline, not caution | `research-heuer-psychology-1999` |
| **● Disconfirm the hypothesis** | Declaring blind spots, false positives, and a validation step is required practice for anything entering production | `research-ads-framework` |

## `/methodology/velocity`

| Section | Claim needing support | Sources |
|---|---|---|
| **● Measure change, not just count** | Periodicity requires an explicit tolerance because beacon intervals are deliberately randomized by a jitter percentage | `research-beacon-hunting-2020` |
| **● Measure change, not just count** | Low-and-slow activity can be weak in a short window and accumulate over a longer one | `research-attack-t1110-003` — documented pacing at roughly four attempts per hour per account over days or weeks |
| **● Measure change, not just count** | Illustrative windows are analyst choices, not validated cutoffs | `research-axelsson-2000` — the base-rate result is why a threshold cannot be read off the rate alone |
| Keep event time and ingest time separate | Every timestamp carries bounded error, and unsynchronized senders are an anticipated normal condition | + `research-rfc5905-2010`, + `research-rfc5424-2009` (`timeQuality`: `tzKnown`, `isSynced`, `syncAccuracy`) |
| Keep event time and ingest time separate | Records can be lost in transit without any indication to the collector | + `research-rfc3164-2001`, + `research-rfc7011-2013` (sequence numbers and metering statistics exist precisely because loss is expected) |
| Old lesson, current question | Speed does not establish AI involvement | + `research-gtig-genai-misuse-2025` — a provider reporting productivity and volume gains rather than novel capability is the modern counterpart to Slammer's historical point |
| Old lesson, current question | Regularity identifies automation, not malice | + `research-beacon-hunting-2020` — the author states legitimate timer-driven traffic produces several false positives |

## `/methodology/ai-autonomy`

| Section | Claim needing support | Sources |
|---|---|---|
| **● Ask separate questions** | Automation, adaptation, corroborated AI involvement, and malicious intent are four separate findings, not a ladder | `research-ncsc-ai-threat-2024` — assesses uplift as uneven across actor tiers, in graded probabilistic language |
| **● Ask separate questions** | Conventional automation branches after failure too | `research-slammer-2003` (existing), + `research-beacon-hunting-2020` |
| **● Visibility is conditional** | Provider-side records are a different vantage point from victim telemetry, and missing traces mean unknown rather than no AI | `research-gtig-genai-misuse-2025`, `research-openai-disruption-2025` — both are explicitly provider-scoped; neither observes victim networks |
| Reward hacking means gaming the criterion | Reward hacking is precisely a wrong-objective-function problem — the stated goal achieved in an unintended way | + `research-concrete-problems-2016` (the naming reference), + `research-specification-gaming-2020` (literal specification satisfied without the intended outcome) |
| Reward hacking means gaming the criterion | Pursuing an attacker's goal effectively is not reward hacking | + `research-specification-gaming-2020` — its limitation field states this directly |
| AI as an attack surface | Excessive tool authority is a distinct risk from injection itself | + `research-owasp-llm-top10-2025` (LLM06 Excessive Agency, separate from LLM01) |
| AI as an attack surface | Attacks against AI systems form their own technique set | + `research-mitre-atlas` |
| AI as an attack surface | Retrieval and embedding components are their own risk surface | + `research-owasp-llm-top10-2025` (LLM08) |

## `/methodology/baselining` (MDX)

| Heading | Claim needing support | Sources |
|---|---|---|
| Expected-dependency inventory | You cannot call a destination new without having enumerated the expected ones; inventory is the precondition, not a by-product | `research-cis-control-1`, `research-nist-800-137-2011` (monitoring defined to include asset visibility) |
| Expected-dependency inventory | Purpose-designed telemetry plus an explicit notion of normal is the precondition for detecting misuse at all | `research-anderson-1980` |
| Infrastructure Communication Allow Matrix | Expectations are modeled per entity and relationship, and learned/updated from observation rather than fixed in advance | `research-denning-1987` |
| Infrastructure Communication Allow Matrix | Management-plane protocols are configuration surfaces that should be explicitly restricted, which is what makes an allow matrix expressible | `research-nsa-network-infrastructure-2023` |
| Review deviations | An approved configuration baseline is what turns a change into a reviewable deviation | `research-nist-800-128-2011` |
| Review deviations | Baseline hunting is a recognized hunt type whose first task is characterizing normal | `research-peak-framework-2023` |

## `/methodology/rarity` (MDX)

| Heading | Claim needing support | Sources |
|---|---|---|
| Conceptual Infrastructure Hunt Score | Rarity is a prioritization heuristic and not evidence — when intrusive activity is rare, the false-positive rate dominates whether an alert is real | `research-axelsson-2000` |
| Conceptual Infrastructure Hunt Score | The score stays conceptual because a deviation from a learned profile is not the same object as an attack | `research-closed-world-2010` |
| Compare at the right scope | Scoping comparison to the entity and its genuine peers, rather than to a global population, is what makes rarity informative | `research-denning-1987`, `research-hunting-maturity-model-2015` (frequency analysis over broad enterprise data at HMM2) |
| Compare at the right scope | Behavioral analysis over existing heterogeneous logs surfaces findings signature tooling misses, after substantial normalization | `research-beehive-2013` |
| Preserve reasons, not just ranks | Ranking must be judged by analyst review cost, not by detection rate alone | `research-spearphish-scoring-2017` — nine times fewer alerts for the same detections; a month of alerts reviewable in under 15 minutes |
| Preserve reasons, not just ranks | The reasons behind a rank must be documented, including expected false positives and blind spots | `research-ads-framework` |

## `/methodology/independent-observation` (MDX)

| Heading | Claim needing support | Sources |
|---|---|---|
| Independent observation equation | A monitor's reconstruction can differ from the endpoint's, so any single vantage point is an inference | `research-insertion-evasion-1998` |
| Independent observation equation | Observations and the policy interpreting them are separable | `research-bro-1998` (existing) |
| Independent telemetry sources | Flow evidence is bounded by the observation point and carries no payload | `research-rfc7011-2013` |
| Independent telemetry sources | Device-emitted logs can be lost, misdated, or spoofed, and the receiver cannot verify the sender | `research-rfc3164-2001`, `research-rfc5424-2009` |
| Independent telemetry sources | Remote logging off the device and out-of-band administration are baseline hardening, which is what makes independent copies available | `research-nsa-network-infrastructure-2023` |
| Resolve contradictions | An intact-looking log is not evidence of no tampering, because artifacts are modified to resemble expected activity, not only deleted | `research-attack-t1070` |
| Resolve contradictions | Logging pipelines and forwarding are themselves a documented target | `research-attack-t1685`, `research-mandiant-ghost-in-router` (amended: implant disabled syslog around SSH sessions and patched processes to suppress SNMP traps and admin-login audit records) |
| Resolve contradictions | Evidence collected at the point an adversary controls is not independent of that adversary | `research-mandiant-cloaked-and-covert` (amended: credential capture on the AAA and jump systems themselves) |

---

## Editorial boundaries this map preserves

Four claims the corpus deliberately **cannot** be used to make. Each is stated in the `limitations` of the relevant records, so a reviewer can check the map against the records:

1. **Speed does not identify AI.** `research-slammer-2003` and `research-beacon-hunting-2020` establish that machine-speed and highly regular activity are ordinary properties of non-AI automation. `research-gtig-genai-misuse-2025` reports productivity and volume gains rather than novel capability. Nothing in the corpus supports inferring AI involvement from rate.
2. **Experiments are not prevalence.** `research-concrete-problems-2016`, `research-specification-gaming-2020`, and the existing reward-hacking records describe controlled or illustrative settings. None measures how often these behaviors occur in intrusions.
3. **Historical sources do not validate modern thresholds.** `research-anderson-1980`, `research-denning-1987`, `research-insertion-evasion-1998`, `research-axelsson-2000`, and `research-closed-world-2010` carry mechanisms, not fields, products, or cutoffs. Each record says so explicitly.
4. **Provider reports are not victim telemetry.** `research-gtig-genai-misuse-2025` and `research-openai-disruption-2025` describe what actors asked an assistant to do. They support no claim about what a hunter would find in their own logs.

## Suggested new sections

Two claims in the guide are load-bearing but have no home section. Both are small additions rather than restructuring:

- **`/methodology/velocity` — "A rate is not a threshold."** Pairs `research-axelsson-2000` with `research-attack-t1110-003` to state, in one place, that both fast and slow are ordinary, and that a window is an analyst choice. The velocity page currently makes this point inside a longer paragraph with no citation.
- **`/methodology/behavior` — "Write down what would disconfirm it."** Pairs `research-heuer-psychology-1999` with `research-ads-framework`. The guide already practices this in its hunt contract; the methodology page does not yet explain why.
