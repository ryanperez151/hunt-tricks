# hunt-tricks — design

Date: 2026-09-05
Status: Direction approved; written specification awaiting review.

## Purpose and architecture

Expand the existing Hunt the Infrastructure static Next.js field guide into hunt-tricks, a research-backed workbench for defensive threat hunting across environments. Keep its static export, structured TypeScript content, Zod validation, accessible dark visual system, query library, and local search. The implementation source is `.worktrees/edge-threat-hunting-guide-mvp`. Preserve existing hunt URLs and operational infrastructure material.

The core reader journey is scope → behavior → temporal pattern → hypothesis → telemetry → query → investigation → evidence. This is a publication and investigation aid, with no live execution or automated attribution.

## Classification and initial coverage

Add independent scope, behavior, temporal-pattern, and AI-role vocabularies. Infrastructure planes and device types remain optional contextual fields for applicable hunts rather than requirements imposed on every scope. Retain existing family routes and broaden families where needed.

Cover endpoints; identity; cloud control planes; SaaS; email; network and edge; containers and orchestration; CI/CD; software supply chains; data stores; OT/IoT; and AI applications and agents. Add at least two substantive hunts per scope, allowing a hunt to span scopes where its actual telemetry and investigation justify it. Existing infrastructure hunts count toward network and edge coverage. Do not create empty category pages to imply breadth.

Behavior lenses include role deviation, new relationships, privilege changes, discovery, credential use, persistence, data movement, trust-boundary crossing, evidence tampering, and adaptive action sequences. Temporal lenses include bursts, acceleration, periodicity, fan-out, dwell time, stage-transition latency, and low-and-slow activity.

## Velocity, autonomy, and attribution — required editorial rules

Display this principle prominently on the home page, velocity methodology, and relevant hunts: **High velocity can be scripted just as readily as AI-driven. Speed alone does not identify AI involvement.**

The distinguishing question is how an operation responds to new information: discovery followed by tool selection, failed action followed by a changed approach, credential discovery followed by cross-system access, and repeated observe–act–evaluate cycles. Conventional adaptive automation and human-directed tooling can produce these patterns too. Present them as investigation hypotheses, not an AI fingerprint.

Examine combined sequences, branching, concurrency, and time between consequential stages against comparable workloads. Separate event time from ingest time, normalize by entity and workload, and explain clock skew, batching, scheduled jobs, retries, scanners, and approved orchestration as alternatives. Illustrative windows and thresholds are tunable examples, never universal maliciousness cutoffs.

Autonomous agents may generate substantial traces through discovery requests, failed calls, retries, cross-system authentication, tool invocation, intermediate artifacts, and output verification. Their visibility depends on permissions, architecture, task, logging, and operational choices. Instructions or design can constrain traces, but missing telemetry and quiet execution are additional reasons trails may be sparse; absence of obvious noise does not rule out autonomy. Do not claim that autonomous AI necessarily leaves a distinctive or detectable trail.

Distinguish high-rate activity, adaptive automation, corroborated AI involvement, and malicious intent as separate findings. Stronger corroboration may come from authorized access to agent run IDs, model gateway records, orchestration traces, tool-call lineage, and independently observed system actions. These still require context and provenance validation.

## Reward hacking

Use reward hacking precisely: exploiting a reward, evaluator, or success criterion instead of fulfilling the intended objective. Rapid lateral movement or persistent pursuit of an attacker's goal is not by itself reward hacking, and an inference-time agent need not be learning online.

Include hunts for changes to evaluators or tests, manipulation of monitoring inputs, unsupported success reports, and discrepancies between agent claims and independent outcomes. Explain that ordinary software bugs, test maintenance, human fraud, and non-AI automation are alternative causes. Label research about controlled training or evaluation settings as such; do not present it as proof of prevalence in real intrusions.

## AI roles

Treat AI as a defender aid, an attacker capability, and an attack surface. Defender examples include hypothesis drafting, query adaptation, enrichment, and evidence summarization with analyst verification. Attacker examples examine adaptive orchestration and scaled activity through observable evidence. AI-system hunts include prompt injection, tool authorization misuse, retrieval or training-data poisoning, data exposure, and evaluation manipulation. Never infer attack intent merely from use of AI.

## Hunt and evidence contracts

Every new hunt requires a hypothesis, expected behavior, suspicious behavior, temporal interpretation, required telemetry and fields, vendor-neutral detection logic, an adaptable query, false positives, investigation steps, escalation criteria, limitations, and claim-linked sources. Use pseudocode where no verified platform data model is available and label it explicitly.

Store references in a shared research registry with stable ID, title, publisher, publication date, URL, evidence type, supported claim, limitations, and relevant hunt IDs. Hunt claim references resolve to this registry. Distinguish primary incident reporting, experimental research, framework guidance, and editorial inference. Attach citations beside substantive claims; generic navigation and product copy need no citations. Preserve historical sources with a specific explanation of the enduring mechanism and limits of transfer to current environments. Do not imply an old study validates a modern threshold or query.

## Routes and presentation

Rebrand shell, metadata, home, about, and search to hunt-tricks. Home leads with scope, behavior, and velocity entry points and the attribution principle. Extend `/hunts` with URL-backed independent filters and clear reset/empty states. Extend detail pages with behavior/velocity interpretation, AI-role context where applicable, and claim-level evidence. Retain query, protocol, telemetry, attack-path, and research routes.

Add `/methodology/velocity`, `/methodology/behavior`, and `/methodology/ai-autonomy`. Expand global search to index new vocabulary, claims, methodology, and sources. Add an accessible illustrative timeline comparing fixed scripts, adaptive automation, and agent workflows; label examples synthetic and allow overlaps rather than suggesting mutually exclusive signatures.

Keep focused modules: vocabulary and schemas; source registry; scoped hunt collections; search/filter projections; shared detail sections; methodology content. Pages consume validated registries rather than maintaining parallel datasets.

## Validation and acceptance

Reject unknown references, duplicate IDs/slugs, broken internal relationships, and missing mandatory hunt evidence at build time. Existing links must resolve. Test combined filters and URL restoration, query aggregation, search, new detail sections, and the separation of temporal signals from AI attribution. Run content validation, lint, type checking, unit/component tests, production export, and critical browser journeys; inspect desktop and mobile layout and keyboard navigation.

Research review checks that each cited source supports the associated claim, experimental findings are qualified, queries match stated telemetry, each promised scope has substantive coverage, and the user's velocity/autonomy distinction appears consistently. The completed export must function without a backend.

## Initial research anchors

These sources seed the work; additional scope-specific primary research is required while authoring hunts.

- Paxson, Bro (1998): historical independent network observation. https://www.usenix.org/conference/7th-usenix-security-symposium/bro-system-detecting-network-intruders-real-time
- Microsoft, Volt Typhoon (2023): valid accounts and native-tool behavior in infrastructure compromise. https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/
- MITRE ATT&CK, T1110.003: password spraying includes long-window activity. https://attack.mitre.org/techniques/T1110/003/
- NIST AI 100-2e2025: adversarial ML taxonomy and mitigations. https://www.nist.gov/publications/adversarial-machine-learning-taxonomy-and-terminology-attacks-and-mitigations-0
- Microsoft researchers (2024), Security Copilot IT-administrator RCTs: bounded experimental evidence for defender assistance, not universal SOC effectiveness. https://arxiv.org/abs/2411.01067
- Anthropic (2025), reported AI-orchestrated espionage: provider investigation, with attribution and visibility limitations. High request rate is not independently diagnostic of AI. https://www.anthropic.com/news/disrupting-AI-espionage
- Anthropic (2024), reward tampering: controlled experimental study, not incident prevalence. https://www.anthropic.com/research/reward-tampering
- Anthropic researchers (2025), reward hacking in production RL environments: experimental evidence about training and generalization. https://arxiv.org/abs/2511.18397

## Delivery order

1. Extend contracts, vocabulary, and evidence validation while preserving current content.
2. Research and author scoped hunts and methodology.
3. Update branding, navigation, catalogs, details, timelines, and search.
4. Complete citation review, regression checks, browser verification, and static export.

No live SIEM connections, accounts, backend, autonomous remediation, or automatic AI attribution are included in this expansion.
