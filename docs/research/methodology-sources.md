# Threat hunting methodology — annotated source corpus

**Date:** 2026-09-06
**Status:** Verified; ready to merge into the implementation registry
**Machine-readable form:** [`records/methodology-sources.json`](records/methodology-sources.json)
**Amendments to existing records:** [`records/existing-record-amendments.json`](records/existing-record-amendments.json)

This annex supplies the research layer the `hunt-tricks` design calls for. That spec seeds the work with eight anchors and states that "additional scope-specific primary research is required while authoring hunts." These 39 new records extend the anchors across the six methodology routes, and six existing registry records are amended to carry the claim-level evidence fields the spec requires of every source.

Every URL here was fetched and every title, author, publisher, and date confirmed against the retrieved document during authoring on 2026-09-06. Sources that could not be verified were dropped rather than softened.

---

## How to read a record

Each record answers three questions in this order, and the order matters:

1. **What is it?** — `title`, `organization`, `publishedAt`, `sourceUrl`, `summary`.
2. **What does it actually establish?** — `supportedClaims`, phrased as what the document demonstrates, not what a hunt would like it to demonstrate.
3. **What can it not carry?** — `limitations`, which is where a historical mechanism is separated from a modern threshold and an experiment is separated from a prevalence claim.

`evidenceType` is the discipline that keeps those apart:

| Type | Means | Can support | Cannot support |
|---|---|---|---|
| `incident-report` | Investigator or provider account of observed activity | That the described behavior occurred somewhere, in that environment | Base rates, prevalence, or that the same shape is malicious elsewhere |
| `experiment` | Controlled or measured study | That the effect occurs under the stated conditions | That it occurs at that rate in production, or in intrusions |
| `framework` | Standard, taxonomy, knowledge base, process guidance | Definitions, structure, engineering requirements, protocol properties | That any observation is malicious, or how often anything happens |
| `historical-research` | Foundational work whose mechanism outlives its era | The enduring mechanism and why it still binds | Any current field, product, threshold, or query |

---

## Tier 1 — Hunting process and analytic tradecraft

Ten sources covering how a hunt is framed, structured, documented, and reasoned about. The guide currently teaches hunting practice without citing the practice literature; this tier closes that gap.

**`research-hunting-maturity-model-2015`** — Bianco's five-level model, 11 October 2015. Useful precisely because of where it draws the line: at HMM0 analysts only resolve tool-generated alerts and *no hunting occurs*. Frequency analysis over broad enterprise data sits at HMM2, which the author names as a realistic starting point. Cannot support any claim about detection efficacy — it measures capability, not outcomes.

**`research-pyramid-of-pain-2013`** — Bianco, 1 March 2013. The cost-to-adversary ranking from hashes up to TTPs. Its limitation is the half people forget: the ranking says nothing about false-positive rate, and TTP-level detection is simultaneously the most durable and the noisiest.

**`research-peak-framework-2023`** — Splunk/Bianco, 18 April 2023. Names *baseline hunting* as a distinct hunt type whose first task is characterizing normal, which is the direct antecedent of the guide's baselining methodology page. Vendor process guidance; measures nothing.

**`research-tahiti-2018`** — Betaalvereniging Nederland and the Dutch financial sector FI-ISAC. Three phases (Initiate, Hunt, Finalize) across six steps; a trigger becomes an investigation abstract on a managed hunting backlog. The original `betaalvereniging.nl` path now redirects; the record cites the NVB-hosted PDF that resolves.

**`research-ttp-based-hunting-2020`** — Daszczyszak, Ellis, Luke, and Whitley, MITRE, 10 July 2020. The argument that the victim's technology constrains the available technique space, so filtering by technique knowledge is tractable. Written for a mission context with corresponding data access.

**`research-kill-chain-2011`** — Hutchins, Cloppert, and Amin, Lockheed Martin. Phased intrusion analysis and the indicator lifecycle. Its recorded limitation matters for this guide specifically: the linear phase model fits externally initiated intrusions best and maps less cleanly onto valid-credential abuse and infrastructure already inside the trust boundary — which is most of what this guide hunts.

**`research-diamond-model-2013`** — Caltagirone, Pendergast, and Betz. Adversary, capability, infrastructure, victim, plus pivoting and activity threads. Recorded limitation: pivoting to the *adversary* feature is where attribution error concentrates.

**`research-heuer-psychology-1999`** — Heuer, CIA Center for the Study of Intelligence. The discipline behind the guide's hypothesis-first structure: evaluate competing hypotheses rather than confirming a favored one, and weight evidence by how well it *discriminates* between them. Evidence consistent with every hypothesis has no diagnostic value — which is the cleanest available statement of why "the device is beaconing" is not a finding.

**`research-ads-framework`** — Palantir's Alerting and Detection Strategy template. Nine required sections including *blind spots and assumptions*, *false positives*, and *validation* before a detection reaches production. This maps almost field-for-field onto the guide's own hunt contract, which is a useful external corroboration that the contract is not idiosyncratic.

**`research-attack-design-philosophy-2020`** — Strom et al., MITRE, 31 March 2020. How ATT&CK abstracts techniques from reporting, and its explicit self-description as a living structure. See the ATT&CK maintenance note below.

## Tier 2 — Baselining

Six sources for `/methodology/baselining`. The through-line: an anomaly is only meaningful against a declared expectation, and declaring that expectation is engineering work that happens before the hunt.

**`research-anderson-1980`** — James P. Anderson Co., April 1980. The founding statement of audit-based detection. Its enduring point is not the technique but the precondition: ordinary accounting logs were insufficient, and purpose-designed trace records plus an explicit notion of normal use were required. Nothing in it validates a modern field or threshold.

**`research-denning-1987`** — Denning, IEEE TSE, February 1987. Profiles of subject-to-object behavior with statistical metrics, learned and updated from audit records, specified independently of any particular system or vulnerability. The origin of "baseline the entity, not the network."

**`research-nist-800-94-2007`**, **`research-nist-800-137-2011`**, **`research-nist-800-128-2011`** — the engineering scaffolding: detection-class coverage, continuous monitoring defined to include *asset* visibility rather than only event visibility, and approved configuration baselines as the precondition that turns a change into a deviation. Note that SP 800-128's original 2011 publication was withdrawn on 10 October 2019 and superseded by Update 1; the record says so.

**`research-cis-control-1`** — CIS Control 1 (v8.1). Asset inventory as the foundational control. Supports the guide's dependency-inventory requirement directly: you cannot call a destination new if you never enumerated the old ones.

## Tier 3 — Rarity

Four sources for `/methodology/rarity`. This is the tier that keeps the Infrastructure Hunt Score honest.

**`research-axelsson-2000`** — Axelsson, ACM TISSEC, August 2000. The base-rate result: when intrusive activity is very rare, the probability that an alert is real is dominated by the false-positive rate, so efficacy must be judged by that probability rather than by detection rate. This is the formal reason rarity is a *prioritization* heuristic and not evidence.

**`research-closed-world-2010`** — Sommer and Paxson, IEEE S&P 2010. The semantic gap: an anomaly is a deviation from a learned profile of benign traffic, which is not the same object as an attack, and closing that gap requires domain interpretation. Also the observation that network traffic is far more variable than the closed-world settings where these methods succeed.

**`research-spearphish-scoring-2017`** — Ho, Sharma, Javed, Paxson, and Wagner, USENIX Security 2017. The strongest empirical anchor in this tier: directed anomaly scoring found the same attacks as standard anomaly detection while producing at least *nine times* fewer alerts, evaluated over 370M+ emails, with practicality measured as analyst review time — under 15 minutes for a month of alerts. Treats the alert budget as a design constraint rather than an afterthought.

**`research-beehive-2013`** — Yen et al., ACSAC 2013. Behavioral analysis over existing heterogeneous enterprise logs surfaced incidents the deployed signature products did not flag, after substantial normalization. Findings include policy violations as well as malicious activity.

## Tier 4 — Independent observation

Seven sources for `/methodology/independent-observation`, the guide's central principle. The corpus makes the principle a technical claim rather than an assertion.

**`research-insertion-evasion-1998`** — Ptacek and Newsham, Secure Networks, January 1998. Insertion and evasion arise because a monitor must *infer* how a remote stack will interpret ambiguous traffic. The transferable statement is structural: any single vantage point yields an inference about another system's state, not that state itself. Specific evasions have long been fixed; the epistemics have not changed.

**`research-rfc3164-2001`** and **`research-rfc5424-2009`** — the syslog pair. RFC 3164 states plainly that there is no delivery guarantee, that a device with an incorrect date still emits valid messages, and that a receiver cannot verify the reported sender. RFC 5424 then defines `timeQuality` with `tzKnown`, `isSynced`, and `syncAccuracy` — a protocol-level acknowledgment that unsynchronized senders are an *anticipated normal condition*, not an anomaly.

**`research-rfc7011-2013`** — IPFIX, Internet Standard 77. Flow records describe traffic at a defined observation point, so flow evidence is bounded by where collection happens; the protocol anticipates loss and provides sequence numbers and metering statistics to detect it. Flow data carries no payload and cannot confirm session content.

**`research-nsa-network-infrastructure-2023`** — NSA CTR, version 1.2, October 2023. Remote logging off the device and out-of-band administration as baseline hardening rather than optional maturity. Hardening guidance, so it establishes nothing about whether observed protocol use is malicious.

**`research-attack-t1070`** and **`research-attack-t1685`** — the tampering pair. T1070 documents adversaries *modifying* artifacts to align with expected activity rather than deleting them, which is the reason an intact-looking log is not evidence of no tampering. T1685 documents interference with logging pipelines and forwarding to a SIEM, catalogued as impairment in its own right.

Together with the amended `research-mandiant-ghost-in-router`, which reports an implant that disabled syslog around an SSH session and patched running processes to suppress SNMP traps and administrative-login audit records, this tier moves "a device cannot be the sole witness about itself" from principle to documented mechanism.

## Tier 5 — Velocity and temporal analysis

Three new sources for `/methodology/velocity`, joining the existing `research-dataflow-2015` (event time versus processing time) and `research-slammer-2003` (extreme machine speed without AI).

**`research-rfc5905-2010`** — NTPv4. Offset, delay, and dispersion, where dispersion is the maximum inherent measurement error and grows between synchronizations; practical accuracy of tens to hundreds of microseconds; and an explicit encoding for unsynchronized time. Every timestamp carries bounded error. The RFC does not address deliberate clock manipulation, which is a separate hunt.

**`research-beacon-hunting-2020`** — van Luijk, Fox-IT, 15 January 2020. Beacon intervals are randomized by a configured jitter percentage, so exact fixed-interval matching is the wrong detection shape; metadata-only analysis extends to DNS and domain-fronted channels; and the author states directly that legitimate timer-driven traffic — telemetry, update checks, automated scripts — produces several false positives. The recorded limitation is the one that matters for this guide: **periodicity identifies automation, not malice.**

**`research-attack-t1110-003`** — password spraying, version 1.8. Documented pacing as low as roughly four authentication attempts per hour per account sustained over days or weeks, and protocol selection (LDAP or Kerberos over SMB) partly for logging characteristics. This is the low-and-slow counterweight to the burst literature: a short observation window misses the campaign entirely. The rate is an illustrative documented example, never a maliciousness cutoff.

## Tier 6 — Behavior lenses

**`research-lolbas`** and **`research-gtfobins`** — capability indices for Windows and Unix-like systems respectively. Both projects state explicitly that the listed binaries are not malicious and, in GTFOBins' case, not vulnerable per se. They are recorded here as *capability* references: presence or execution of a listed binary is not an indicator of compromise, which is exactly the framing the role-deviation lens needs. These pair with the amended `research-cisa-aa24-038a`, which reports living-off-the-land use as an actor hallmark and states that many organizations lack the baselines needed to detect it.

## Tier 7 — AI roles, autonomy, and reward hacking

Seven new sources for `/methodology/ai-autonomy`, joining the four existing anchors. This tier is written to hold the editorial line the `hunt-tricks` spec sets: **high velocity can be scripted just as readily as AI-driven, and speed alone does not identify AI involvement.**

**`research-concrete-problems-2016`** and **`research-specification-gaming-2020`** supply the definitions the spec demands be used precisely. Reward hacking is a wrong-objective-function problem — a system achieving its *stated* goal in an unintended way. Specification gaming is satisfying the literal specification without achieving the intended outcome. Both records carry the limitation that follows: an adversary pursuing an intended goal effectively is not reward hacking, and the illustrative examples come from research and game environments, establishing no prevalence anywhere.

**`research-owasp-llm-top10-2025`** and **`research-mitre-atlas`** supply the AI-as-attack-surface taxonomy — prompt injection, excessive agency as a distinct class from injection itself, retrieval and embedding components as their own risk surface, and AI-specific techniques catalogued separately from the enterprise techniques used to reach the hosting system.

**`research-ncsc-ai-threat-2024`**, **`research-gtig-genai-misuse-2025`**, and **`research-openai-disruption-2025`** are the attribution-discipline sources. NCSC assesses uplift as *uneven* across actor tiers and concentrated in reconnaissance and social engineering, in graded probabilistic language. GTIG states it saw no indications of actors developing novel capabilities and that current LLMs alone are unlikely to enable breakthrough capabilities — productivity and volume, not new capability. OpenAI's report corroborates the pattern from a second provider.

The shared limitation across the provider reports is the one the guide must display: **provider-side visibility only.** These reports describe what actors asked an assistant to do, not what appeared in a victim's telemetry, so they support no inference about detectability in the environments this guide's readers actually hunt in.

---

## Amendments to existing records

Six registry records carried no `evidenceType`, `supportedClaims`, or `limitations`, which the `hunt-tricks` spec requires. All six were re-verified against their source and are supplied complete in [`records/existing-record-amendments.json`](records/existing-record-amendments.json). All six URLs resolve and all six dates are correct as recorded.

Three substantive corrections beyond the added fields:

- **`research-cisa-aa25-239a`** — `organization` was `CISA`; the advisory is issued by NSA, CISA, FBI, DC3 and international partners. It is also versioned (v1.0 27 August 2025, v1.1 3 September 2025).
- **`research-cisa-aa24-038a`** — `organization` was `CISA`; the advisory is joint with NSA, FBI and international partners.
- **`research-cisco-talos-arcanedoor`** — Talos states it did **not** determine the initial access vector. This is now recorded as a limitation, because it bounds what the source can support: the report backs appliance-originated capture and egress hunts, not anything framed around an entry point.

Two additions worth noting for hunt authors:

- **`research-mandiant-ghost-in-router`** documents *passive* backdoors activated by packet sniffing rather than outbound C2. Recorded as a limitation, because it means this report specifically does **not** support egress-only hunting as sufficient coverage for router compromise.
- **`research-mandiant-cloaked-and-covert`** documents credential capture on the AAA and jump systems themselves, so AAA logs from those hosts are not independent evidence about that activity — a direct instance of the independent-observation principle.

---

## Maintenance note: ATT&CK v19 restructuring

Verification surfaced a change that affects existing content on the implementation branch. The live knowledge base is at **v19.2**, and the enterprise tactic list has changed:

- **`TA0005` is now named "Stealth"**, not "Defense Evasion".
- **`TA0112` "Defense Impairment"** is a new tactic.
- **`T1562` "Impair Defenses" is renumbered `T1685` "Disable or Modify Tools"** and moved under Defense Impairment. The old URL redirects.

Hunt records reference ATT&CK technique IDs in their `techniques` field. Those mappings should be audited against v19.2 rather than assumed current. This annex records the current identifiers; it deliberately does not rewrite hunt content, which belongs on the implementation branch.

---

## Sources

Primary sources cited above, in corpus order:

- [A Simple Hunting Maturity Model](https://detect-respond.blogspot.com/2015/10/a-simple-hunting-maturity-model.html)
- [The Pyramid of Pain](https://detect-respond.blogspot.com/2013/03/the-pyramid-of-pain.html)
- [Introducing the PEAK Threat Hunting Framework](https://www.splunk.com/en_us/blog/security/peak-threat-hunting-framework.html)
- [TaHiTI: a threat hunting methodology](https://www.nvb.nl/media/rygbrwew/def-tahiti-threat-hunting-methodology.pdf)
- [TTP-Based Hunting](https://www.mitre.org/news-insights/publication/ttp-based-hunting)
- [Intelligence-Driven Computer Network Defense](https://www.lockheedmartin.com/content/dam/lockheed-martin/rms/documents/cyber/LM-White-Paper-Intel-Driven-Defense.pdf)
- [The Diamond Model of Intrusion Analysis](https://www.activeresponse.org/wp-content/uploads/2013/07/diamond.pdf)
- [Psychology of Intelligence Analysis](https://www.cia.gov/resources/csi/books-monographs/psychology-of-intelligence-analysis-2/)
- [Alerting and Detection Strategy Framework](https://github.com/palantir/alerting-detection-strategy-framework)
- [MITRE ATT&CK: Design and Philosophy](https://www.mitre.org/news-insights/publication/mitre-attck-design-and-philosophy)
- [Computer Security Threat Monitoring and Surveillance](https://csrc.nist.gov/files/pubs/conference/1998/10/08/proceedings-of-the-21st-nissc-1998/final/docs/early-cs-papers/ande80.pdf)
- [An Intrusion-Detection Model](https://ieeexplore.ieee.org/document/1702202)
- [NIST SP 800-94](https://csrc.nist.gov/pubs/sp/800/94/final) · [NIST SP 800-137](https://csrc.nist.gov/pubs/sp/800/137/final) · [NIST SP 800-128](https://csrc.nist.gov/pubs/sp/800/128/final)
- [CIS Control 1](https://www.cisecurity.org/controls/inventory-and-control-of-enterprise-assets)
- [The Base-Rate Fallacy and the Difficulty of Intrusion Detection](https://dl.acm.org/doi/10.1145/357830.357849)
- [Outside the Closed World](https://www.icir.org/robin/papers/oakland10-ml.pdf)
- [Detecting Credential Spearphishing in Enterprise Settings](https://www.usenix.org/conference/usenixsecurity17/technical-sessions/presentation/ho)
- [Beehive](https://dl.acm.org/doi/10.1145/2523649.2523670)
- [Insertion, Evasion, and Denial of Service](https://insecure.org/stf/secnet_ids/secnet_ids.pdf)
- [RFC 3164](https://www.rfc-editor.org/rfc/rfc3164) · [RFC 5424](https://www.rfc-editor.org/rfc/rfc5424) · [RFC 7011](https://www.rfc-editor.org/rfc/rfc7011) · [RFC 5905](https://www.rfc-editor.org/rfc/rfc5905)
- [NSA Network Infrastructure Security Guide](https://www.nsa.gov/Press-Room/Digital-Media-Center/Document-Gallery/igphoto/2003018261/)
- [ATT&CK T1070](https://attack.mitre.org/techniques/T1070/) · [ATT&CK T1685](https://attack.mitre.org/techniques/T1685/) · [ATT&CK T1110.003](https://attack.mitre.org/techniques/T1110/003/)
- [Hunting for beacons](https://blog.fox-it.com/2020/01/15/hunting-for-beacons/)
- [LOLBAS](https://lolbas-project.github.io/) · [GTFOBins](https://gtfobins.org/)
- [Specification gaming](https://deepmind.google/discover/blog/specification-gaming-the-flip-side-of-ai-ingenuity/)
- [Concrete Problems in AI Safety](https://arxiv.org/abs/1606.06565)
- [The near-term impact of AI on the cyber threat](https://www.ncsc.gov.uk/report/impact-of-ai-on-cyber-threat)
- [Adversarial Misuse of Generative AI](https://cloud.google.com/blog/topics/threat-intelligence/adversarial-misuse-generative-ai)
- [Disrupting malicious uses of AI: June 2025](https://cdn.openai.com/threat-intelligence-reports/5f73af09-a3a3-4a55-992e-069237681620/disrupting-malicious-uses-of-ai-june-2025.pdf)
- [OWASP Top 10 for LLM and Gen AI Applications](https://genai.owasp.org/llm-top-10/)
- [MITRE ATLAS](https://atlas.mitre.org/)
