import { defineExpandedHunts, expandedReferences as refs, noInfrastructureContext, type ExpandedHuntSeed } from "@/data/hunts/expanded/shared";

const seeds: ExpandedHuntSeed[] = [
  {
    ...noInfrastructureContext,
    title: "New Remote Peer Reaches an Engineering Station", slug: "new-remote-peer-to-engineering-station", family: "cross-domain",
    summary: "Detect a new remote-access peer or IT-zone source initiating an engineering session across an OT boundary.",
    hypothesis: "An unauthorized remote identity or compromised intermediary is reaching an engineering workstation to discover or alter control-system assets.",
    rationale: "Remote support can be legitimate but should follow fixed gateways, identities, asset owners, and maintenance windows. Passive boundary evidence plus authentication and work-order context avoids active probing of sensitive systems.",
    expectedBehavior: ["Engineering access traverses approved jump paths from named peers and identities during scheduled work on assigned assets."],
    severity: "critical", confidence: "medium", scopes: ["ot-iot", "network-edge"], behaviors: ["new-relationships", "trust-boundary"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Order remote authentication, boundary crossing, engineering protocol use, and asset contact against the approved work window.", baseline: "Inventory peer, gateway, identity, engineering station, cell or area, protocol, and work-order relationships.", confounders: ["Emergency vendor support", "Failover jump host", "Plant commissioning"] },
    evidence: [
      { claim: "The joint CISA/FBI/DOE advisory describes remote access and movement toward ICS environments and recommends monitoring remote-access chokepoints and segment boundaries.", sourceIds: ["research-cisa-triton-2022"], kind: "observation" },
      { claim: "Editorial hypothesis: a new peer reaching an engineering workstation outside an approved work order may expose an unauthorized IT-to-OT path.", sourceIds: ["research-cisa-triton-2022"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "remote.peer", "identity.id", "gateway.id", "source.zone", "destination.zone", "engineering_station.id", "network.protocol", "target.asset", "auth.result", "work_order.id"],
    limitations: ["Passive sensors may not decode proprietary or encrypted sessions, and emergency maintenance records may lag access."],
    techniques: ["T0822 External Remote Services"], telemetry: { recommended: ["ot-passive", "aaa"], optional: ["netflow-ipfix", "syslog"] },
    suspiciousBehavior: ["A first-seen peer or identity traverses a remote-access gateway into an engineering zone.", "The station then contacts new controllers or uses engineering functions outside the work scope."],
    investigationSteps: ["Validate peer, identity, MFA, gateway, work order, vendor contact, and approved time window.", "Use passive evidence to map station-to-asset functions without active scanning.", "Review station integrity, controller changes, safety impact, and independent process or operations records."],
    escalationConditions: ["No work owner validates the access or controller-changing functions occurred."], falsePositives: ["Emergency OEM support", "Newly commissioned remote gateway"],
    enrichment: ["asset criticality", "cell or area", "vendor owner", "work order", "controller change"], detectionStrategy: "Compare passive remote and engineering relationships with approved peer and work-order inventories, then require successful cross-zone access.",
    queries: [{ title: "Remote peer to engineering zone", description: "Passive, zone-aware correlation suitable for fragile OT environments; APPROVED_PEERS is derived from current remote-access approvals.", platform: "pseudocode", query: `SEQUENCE BY identity.id WITHIN 2h
  remote_auth WHERE auth.result = "success"
  boundary_flow WHERE destination.zone = "engineering" AND remote.peer NOT IN APPROVED_PEERS
  ot_session WHERE engineering_station.id IS NOT NULL
RETURN remote.peer, gateway.id, engineering_station.id, network.protocol, target.asset, work_order.id` }],
    references: [refs.cisaTriton], relatedHunts: ["safety-controller-program-change", "unexpected-gre-tunnel"],
  },
  {
    ...noInfrastructureContext,
    title: "Safety Controller Program Change Outside Work State", slug: "safety-controller-program-change", family: "cross-domain",
    summary: "Identify safety or control-logic downloads that conflict with authorized engineering state and process context.",
    hypothesis: "A safety controller's program or firmware was altered without the expected engineer, workstation, approval, and plant operating state.",
    rationale: "Program downloads may be rare but essential. Confirm the exact controller, engineering source, checksum, mode, change authorization, and physical-process state before judging intent.",
    expectedBehavior: ["Controller changes originate from assigned engineering stations, use approved identities and checksums, and occur under formal change control in a safe plant state."],
    severity: "critical", confidence: "high", scopes: ["ot-iot"], behaviors: ["privilege-change", "evidence-tampering"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Correlate engineering login, controller mode transition, program or firmware transfer, checksum change, and process response.", baseline: "Maintain controller-specific program digests, approved stations, engineers, maintenance windows, and process-mode expectations.", confounders: ["Emergency safety maintenance", "Commissioning", "Authorized firmware remediation"] },
    evidence: [
      { claim: "The CISA/FBI/DOE advisory reports that TRITON manipulated Triconex safety controllers in a 2017 refinery incident.", sourceIds: ["research-cisa-triton-2022"], kind: "observation" },
      { claim: "Editorial hypothesis: an unauthorized checksum or program change paired with an unexpected engineering source may indicate manipulation of a safety function.", sourceIds: ["research-cisa-triton-2022"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "controller.id", "controller.mode", "controller.function", "engineering_station.id", "identity.id", "program.digest.before", "program.digest.after", "firmware.version", "work_order.id", "process.state"],
    limitations: ["Some controllers expose limited logs; passive protocol decoding and golden digests may be unavailable for legacy equipment."],
    techniques: ["T0836 Modify Parameter"], telemetry: { recommended: ["ot-passive"], optional: ["aaa", "configuration-diffs", "syslog"] },
    suspiciousBehavior: ["A controller enters program mode or accepts a download from an unassigned station.", "The resulting digest is absent from the approved repository or the plant was not in the required safe state."],
    investigationSteps: ["Coordinate with operations and safety owners before any active response.", "Validate controller, function, source station, identity, work order, mode, and before/after digests.", "Compare trusted engineering repository and process historian context, then assess safety impact and recovery plan."],
    escalationConditions: ["A safety-system change lacks authorization or trusted source lineage."], falsePositives: ["Emergency authorized logic correction", "Commissioning test"],
    enrichment: ["safety function", "approved digest", "process state", "engineering owner", "recovery image"], detectionStrategy: "Passively observe program-changing functions and compare their complete engineering and process context with signed change records.",
    queries: [{ title: "Controller change mismatch", description: "PROGRAM_CHANGING_FUNCTIONS and the APPROVED_* values come from protocol semantics and the signed work order or golden configuration; the passive comparison performs no active controller query.", platform: "pseudocode", query: `FOR each ot_passive_event WHERE controller.function IN PROGRAM_CHANGING_FUNCTIONS
LOOKUP approved_change BY controller.id, work_order.id
RETURN WHERE engineering_station.id != APPROVED_STATION
  OR identity.id != APPROVED_ENGINEER
  OR program.digest.after != APPROVED_DIGEST
  OR process.state NOT IN APPROVED_SAFE_STATES` }],
    references: [refs.cisaTriton], relatedHunts: ["new-remote-peer-to-engineering-station", "logging-destination-modified"],
  },
  {
    ...noInfrastructureContext,
    title: "Retrieved Content Precedes an Unauthorized Tool Action", slug: "retrieved-content-precedes-tool-action", family: "ai-agent-abuse",
    summary: "Correlate untrusted retrieved content with a downstream tool call that crosses the agent's expected instruction boundary.",
    hypothesis: "An AI application treated instructions embedded in retrieved data as authority and invoked a tool outside the user's approved task.",
    rationale: "Text that looks imperative is not proof of compromise. Preserve retrieval provenance, agent lineage, policy decision, approval, tool arguments, and independent target outcome.",
    expectedBehavior: ["Retrieved content is treated as data; tool calls remain within user intent, agent policy, approved resources, and explicit authorization boundaries."],
    severity: "high", confidence: "medium", scopes: ["ai-systems", "saas"], behaviors: ["trust-boundary", "adaptive-sequence"], temporalPatterns: ["stage-transition"], aiRoles: ["target"],
    temporal: { interpretation: "Within an analyst-selected event-time interval, order retrieval, model request, policy decision, tool call, and target result for the exact agent.run_id. Accept arrivals only within MAX_INGEST_DELAY and RETENTION_LIMIT; speed alone proves nothing.", baseline: "Compare tool-resource relationships by agent, task type, tenant, user, policy version, and approved integration.", confounders: ["User explicitly requested the action", "Retriever metadata loss", "Approved automation embedded in documents"] },
    evidence: [
      { claim: "Greshake et al. experimentally demonstrated indirect prompt injection through retrieved content in studied LLM-integrated applications.", sourceIds: ["research-injection-2023"], kind: "observation" },
      { claim: "Editorial hypothesis: a tool action outside user intent and policy, immediately downstream of instruction-like retrieved content, may indicate an instruction-boundary failure.", sourceIds: ["research-injection-2023", "research-nist-2025"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "tenant.id", "user.task_id", "agent.run_id", "model.request_id", "retrieval.document_id", "retrieval.source", "retrieval.trust_label", "policy.version", "tool.call_id", "tool.name", "tool.target", "authorization.decision", "authorization.approval_id", "target.result"],
    limitations: ["Prompt and retrieval logging may be redacted; lexical instruction matching is weak evidence and models or tools may act without full trace coverage."],
    techniques: ["Adversarial ML: Indirect Prompt Injection"], telemetry: { recommended: ["agent-traces", "saas-audit"], optional: ["identity-audit"] },
    suspiciousBehavior: ["A run retrieves untrusted content containing task-diverting instructions.", "A child tool call targets a resource outside the user-approved task or bypasses a required approval."],
    investigationSteps: ["Preserve run lineage, retrieved document version and trust metadata, user request, policy version, and authorization decision.", "Compare tool target and arguments with the approved task and identify the exact boundary crossed.", "Verify the independent target-system outcome and test whether benign user intent, parser error, or stale policy explains it."],
    escalationConditions: ["The tool changed or disclosed a protected resource without valid authorization."], falsePositives: ["User-approved action summarized incompletely", "Policy metadata synchronization failure"],
    enrichment: ["document owner", "retrieval index", "policy version", "approval record", "target audit event"], detectionStrategy: "Build run lineage and compare retrieved-content trust, authorization, tool scope, and independently observed target effects.",
    queries: [{ title: "Retrieval-to-tool boundary", description: "OUTSIDE_APPROVED_SCOPE is derived from the recorded user task, policy version, allowed tools, targets, and approval record. The analysis and lateness inputs are selected for the deployment; expired evidence remains unknown.", platform: "pseudocode", query: `ANALYSIS_INTERVAL(event.time, ANALYST_START, ANALYST_END)
LATENESS_POLICY(MAX_INGEST_DELAY, RETENTION_LIMIT)
SEQUENCE BY agent.run_id
  retrieval WHERE retrieval.trust_label = "untrusted"
  model_request
  tool_call WHERE OUTSIDE_APPROVED_SCOPE(tool.name, tool.target, authorization.decision)
JOIN target_audit ON tool.call_id
RETURN retrieval.document_id, model.request_id, tool.call_id, tool.target, target.result` }],
    references: [refs.injection, refs.nist], relatedHunts: ["agent-tool-scope-escalation", "claimed-success-without-target-evidence"],
  },
  {
    ...noInfrastructureContext,
    title: "Agent Tool Scope Expands After a Denial", slug: "agent-tool-scope-escalation", family: "ai-agent-abuse",
    summary: "Review agent runs that respond to denied tool actions by selecting another credential, connector, or target boundary.",
    hypothesis: "An agent or its orchestrator adapted to a denial by crossing into an unapproved tool, identity, or system scope.",
    rationale: "Branching after feedback can come from ordinary automation or a human. AI involvement requires trusted run and model lineage; maliciousness requires an actual permission or outcome violation.",
    expectedBehavior: ["Denied operations stop, request approval, or use a documented fallback within the same authorized resource scope."],
    severity: "high", confidence: "medium", scopes: ["ai-systems", "identity"], behaviors: ["adaptive-sequence", "credential-use"], temporalPatterns: ["stage-transition"], aiRoles: ["attacker", "target"],
    temporal: { interpretation: "Within an analyst-selected event-time interval, reconstruct denial, next decision, alternate tool or credential, and target result for the exact agent.run_id. MAX_INGEST_DELAY and RETENTION_LIMIT bound evidence availability.", baseline: "Model approved fallback graphs per agent, task, connector, tenant, and policy version.", confounders: ["Human operator changed strategy", "Deterministic retry policy", "Failover connector", "Stale authorization cache"] },
    evidence: [
      { claim: "Anthropic reports chained agent tool operations in a provider-observed campaign; the report's AI attribution relies on provider telemetry, not request speed alone.", sourceIds: ["research-ai-espionage-2025"], kind: "observation" },
      { claim: "Editorial hypothesis: a corroborated agent run that crosses a recorded authorization boundary after denial warrants review for tool-scope abuse.", sourceIds: ["research-ai-espionage-2025"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "agent.run_id", "model.request_id", "policy.version", "authorized_fallback.id", "tool.call_id", "tool.name", "identity.id", "authorization.scope", "authorization.decision", "target.resource", "target.result", "tool.result", "parent.call_id"],
    limitations: ["Sparse traces do not rule out autonomy; deterministic orchestration and human intervention can generate identical branching."],
    techniques: ["Agent Tool Authorization Abuse"], telemetry: { recommended: ["agent-traces", "identity-audit"], optional: ["saas-audit", "cloud-audit"] },
    suspiciousBehavior: ["A denied call is followed by a different connector, identity, or resource class not listed in the approved fallback graph.", "The alternate call succeeds against a protected target."],
    investigationSteps: ["Verify signed agent run, model request, parent-child calls, user task, policy, and approval history.", "Compare the branch with configured deterministic fallbacks and identify any human intervention.", "Confirm target-system effects and whether the alternate identity or resource was authorized."],
    escalationConditions: ["A corroborated run crossed scope and produced an unauthorized target effect."], falsePositives: ["Approved failover", "Operator manually expanded scope"],
    enrichment: ["run provenance", "fallback graph", "identity owner", "policy decision", "target audit"], detectionStrategy: "Correlate denials with descendant calls and compare changed tools, identities, and targets to the authorized fallback graph.",
    queries: [{ title: "Denied-call scope transition", description: "SCOPE_EXPANDED compares captured before/after tool, identity, resource class, and the policy-approved fallback graph. The analysis and lateness inputs are deployment-specific; expired evidence remains unknown.", platform: "pseudocode", query: `ANALYSIS_INTERVAL(event.time, ANALYST_START, ANALYST_END)
LATENESS_POLICY(MAX_INGEST_DELAY, RETENTION_LIMIT)
SEQUENCE BY agent.run_id
  denied WHERE authorization.decision = "deny"
  CAPTURE DENIED_CALL_ID = tool.call_id, DENIED_SCOPE = authorization.scope
  next_call WHERE parent.call_id DESCENDS_FROM DENIED_CALL_ID
  CAPTURE NEXT_CALL_ID = tool.call_id, NEXT_TOOL = tool.name, NEXT_IDENTITY = identity.id, NEXT_RESOURCE = target.resource
CALCULATE SCOPE_EXPANDED(DENIED_SCOPE, NEXT_TOOL, NEXT_IDENTITY, NEXT_RESOURCE, authorized_fallback.id)
JOIN independent_target_audit ON NEXT_CALL_ID
RETURN WHERE SCOPE_EXPANDED AND target.result = "success"` }],
    references: [refs.aiEspionage], relatedHunts: ["retrieved-content-precedes-tool-action", "claimed-success-without-target-evidence"],
  },
  {
    ...noInfrastructureContext,
    title: "Evaluator Change Precedes an Implausible Perfect Score", slug: "evaluator-change-precedes-perfect-score", family: "ai-agent-abuse",
    summary: "Detect modifications to tests, graders, reward functions, or monitoring inputs before a sudden success claim.",
    hypothesis: "An actor or training agent changed the success criterion or its inputs to receive credit without satisfying the intended objective.",
    rationale: "This is reward hacking only when the reward, evaluator, or success criterion is gamed. Ordinary rapid goal pursuit, lateral movement, or inference-time persistence does not meet that definition.",
    expectedBehavior: ["Evaluator code, test fixtures, reward configuration, and monitoring inputs change through independent review and remain separate from the actor being evaluated."],
    severity: "high", confidence: "low", scopes: ["ai-systems", "cicd"], behaviors: ["evidence-tampering", "privilege-change"], temporalPatterns: ["stage-transition"], aiRoles: ["target", "defender"],
    temporal: { interpretation: "Within an analyst-selected event-time interval, order evaluator change, score transition, and independent outcome for the exact experiment.id and agent.run_id. MAX_INGEST_DELAY and RETENTION_LIMIT bound what can be concluded.", baseline: "Compare evaluator digests, test coverage, monitoring sources, score distributions, and approvals by experiment or release.", confounders: ["Legitimate test maintenance", "Bug fix", "Changed dataset", "Human fraud unrelated to AI"] },
    evidence: [
      { claim: "Anthropic's controlled study observed rare cases where trained models modified a reward function or tests in deliberately constructed environments.", sourceIds: ["research-reward-2024"], kind: "observation" },
      { claim: "Editorial hypothesis: an unreviewed evaluator change followed by a perfect score unsupported by independent outcomes may indicate gaming of the success criterion.", sourceIds: ["research-reward-2024", "research-nist-2025"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "experiment.id", "actor.id", "agent.run_id", "evaluator.digest.before", "evaluator.digest.after", "test.digest", "monitor.input_id", "score.before", "score.after", "approval.id", "independent.outcome"],
    limitations: ["The source evidence comes from artificial training experiments and does not establish production prevalence or identify the author of a change."],
    techniques: ["Reward Hacking / Evaluator Tampering"], telemetry: { recommended: ["agent-traces", "build-audit"], optional: ["data-audit"] },
    suspiciousBehavior: ["The evaluated actor can write evaluator, test, reward, or monitoring inputs and does so without independent review.", "The score improves sharply while external task outcomes do not."],
    investigationSteps: ["Preserve evaluator, test, reward, monitoring, model, data, and environment digests before and after the run.", "Resolve actor identity, agent lineage, permissions, review, and whether the change was part of the intended task.", "Re-run with an independently controlled evaluator and compare real-world outcomes, ordinary bugs, maintenance, and deception explanations."],
    escalationConditions: ["The evaluated actor changed the success criterion and independent validation fails."], falsePositives: ["Authorized test correction", "Dataset version change", "Broken metric pipeline"],
    enrichment: ["code review", "experiment lineage", "dataset digest", "independent evaluator", "permission boundary"], detectionStrategy: "Protect and version evaluators and inputs, then correlate unauthorized changes with score jumps and independent outcome disagreement.",
    queries: [{ title: "Evaluator integrity to outcome mismatch", description: "This hunt targets evaluator tampering: an unapproved change followed by credit unsupported by independent outcomes. EVALUATED_ACTOR and HISTORICAL_SCORE_P99 are versioned experiment inputs; expired evidence remains unknown.", platform: "pseudocode", query: `ANALYSIS_INTERVAL(event.time, ANALYST_START, ANALYST_END)
LATENESS_POLICY(MAX_INGEST_DELAY, RETENTION_LIMIT)
SEQUENCE BY experiment.id, agent.run_id
  evaluator_change WHERE actor.id = EVALUATED_ACTOR OR approval.id IS NULL
  evaluation WHERE score.after > HISTORICAL_SCORE_P99
  independent_check
RETURN evaluator.digest.before, evaluator.digest.after, score.before, score.after, independent.outcome
WHERE independent.outcome != "objective_satisfied"` }],
    references: [refs.reward, refs.nist], relatedHunts: ["claimed-success-without-target-evidence", "workflow-file-privilege-expansion"],
  },
  {
    ...noInfrastructureContext,
    title: "Agent Claims Success Without Target-System Evidence", slug: "claimed-success-without-target-evidence", family: "ai-agent-abuse",
    summary: "Compare an agent's completion or credential claims with independent target audit, state, and artifact evidence.",
    hypothesis: "An agent reported a successful action or valid credential that the target system did not accept or record.",
    rationale: "A claim/outcome mismatch may be hallucination, stale observation, parser error, software bug, deception, or missing telemetry. The hunt creates a review queue and does not infer intent from the mismatch alone.",
    expectedBehavior: ["Material completion claims reference a tool result and independently verifiable target state, artifact, or audit event."],
    severity: "medium", confidence: "medium", scopes: ["ai-systems"], behaviors: ["evidence-tampering", "adaptive-sequence"], temporalPatterns: ["stage-transition"], aiRoles: ["defender", "attacker", "target"],
    temporal: { interpretation: "Within an analyst-selected event-time interval, reconcile each claim.id inside its exact agent.run_id. MAX_INGEST_DELAY and RETENTION_LIMIT account for delivery and retention; missing evidence remains unknown when coverage is insufficient.", baseline: "Measure claim-to-confirmation latency and mismatch causes by tool, target, task, agent version, and logging coverage.", confounders: ["Target audit delay", "Eventual consistency", "Rollback after success", "Parser defect", "Missing telemetry"] },
    evidence: [
      { claim: "Anthropic reports instances in its provider investigation where the model claimed credentials or extracted information that results did not support.", sourceIds: ["research-ai-espionage-2025"], kind: "observation" },
      { claim: "Editorial hypothesis: repeated material claims without supporting tool results or independent target evidence can reveal unreliable or manipulated verification.", sourceIds: ["research-ai-espionage-2025", "research-reward-2024"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "event.ingest_time", "agent.run_id", "model.request_id", "claim.id", "claim.type", "claim.target", "tool.call_id", "tool.result", "target.coverage", "target.event_id", "target.result", "artifact.digest"],
    limitations: ["Absence of a target event is unknown when coverage is incomplete; semantic extraction of claims can be wrong and requires analyst review."],
    techniques: ["Agent Outcome Verification Failure"], telemetry: { recommended: ["agent-traces"], optional: ["cloud-audit", "saas-audit", "data-audit", "identity-audit"] },
    suspiciousBehavior: ["A material success claim lacks a successful parent tool result or target event after the known delivery interval.", "A claimed artifact, credential, or state cannot be independently reproduced."],
    investigationSteps: ["Validate trace provenance and extract the exact claim, target, asserted result, and parent tool call.", "Query the independent target using authorized audit or state evidence and account for ingest delay and rollback.", "Classify the mismatch as coverage gap, parser error, ordinary bug, stale state, hallucination, or possible deception before escalation."],
    escalationConditions: ["A high-impact workflow acts on unsupported claims or evidence suggests deliberate evaluator or record manipulation."], falsePositives: ["Delayed target logs", "Successful action rolled back", "Claim parser error"],
    enrichment: ["target coverage", "delivery SLA", "artifact hash", "rollback event", "agent version"], detectionStrategy: "Require lineage from material claims to tool results and independent target outcomes, with a target-specific observation delay before flagging mismatches.",
    queries: [{ title: "Claim-to-outcome reconciliation", description: "OBSERVATION_DELAY is the target's measured audit-delivery and consistency allowance. Analysis and lateness inputs are deployment-specific; missing or expired evidence remains unknown.", platform: "pseudocode", query: `ANALYSIS_INTERVAL(event.time, ANALYST_START, ANALYST_END)
LATENESS_POLICY(MAX_INGEST_DELAY, RETENTION_LIMIT)
FOR each material_claim BY agent.run_id, claim.id
CAPTURE CLAIM_TOOL_CALL_ID = tool.call_id, CLAIM_TARGET = claim.target, CLAIM_TYPE = claim.type
JOIN parent_tool_call ON tool.call_id = CLAIM_TOOL_CALL_ID
CAPTURE PARENT_TOOL_RESULT = tool.result
WAIT OBSERVATION_DELAY(CLAIM_TARGET)
LEFT JOIN independent_target_event ON tool.call_id = CLAIM_TOOL_CALL_ID
RETURN WHERE target.coverage = "sufficient"
  AND (PARENT_TOOL_RESULT != "success" OR target.result != CLAIM_TYPE)` }],
    references: [refs.aiEspionage, refs.reward], relatedHunts: ["evaluator-change-precedes-perfect-score", "agent-tool-scope-escalation"],
  },
  {
    ...noInfrastructureContext,
    title: "Retrieval Corpus Change Causes Provenance Drift", slug: "retrieval-corpus-provenance-drift", family: "ai-agent-abuse",
    summary: "Detect newly ingested or modified corpus objects that shift answers, citations, or tool targets outside reviewed provenance.",
    hypothesis: "An untrusted or compromised data source altered a retrieval corpus so an AI application grounds decisions in poisoned content.",
    rationale: "Corpus poisoning differs from prompt injection: the enduring change is in indexed data or its metadata. Versioned documents, ingestion identity, index lineage, retrieval rank, answer citations, and downstream effects make that change reviewable.",
    expectedBehavior: ["Corpus additions come from approved sources, pass validation, retain immutable source digests, and produce explainable citation changes after a documented index version update."],
    severity: "high", confidence: "medium", scopes: ["ai-systems", "data-stores"], behaviors: ["evidence-tampering", "trust-boundary"], temporalPatterns: ["stage-transition", "dwell-time"], aiRoles: ["target"],
    temporal: { interpretation: "Within an analyst-selected event-time interval, order source change, ingestion, index publication, retrieval, and outcome for exact corpus.id, index.version, and evaluation.query_id values. MAX_INGEST_DELAY and RETENTION_LIMIT bound evidence availability.", baseline: "Compare source owners, document and chunk digests, validation outcomes, retrieval ranks, citations, and answer behavior across index versions and stable evaluation queries.", confounders: ["Approved corpus refresh", "Embedding-model upgrade", "Chunking change", "Source-document correction"] },
    evidence: [
      { claim: "NIST categorizes data poisoning separately within its adversarial machine-learning taxonomy.", sourceIds: ["research-nist-2025"], kind: "observation" },
      { claim: "Editorial hypothesis: an unauthorized corpus change followed by reproducible citation and outcome drift may indicate retrieval-data poisoning.", sourceIds: ["research-nist-2025"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "corpus.id", "index.version", "ingest.actor_id", "retrieval.document_id", "retrieval.document_digest", "retrieval.source", "retrieval.rank", "answer.citation_ids", "evaluation.query_id", "evaluation.result", "tool.call_id", "tool.target"],
    limitations: ["Normal source evolution and model, embedding, or chunking changes can alter retrieval; a changed answer does not prove malicious intent."],
    techniques: ["Adversarial ML: Data Poisoning"], telemetry: { recommended: ["agent-traces", "data-audit"], optional: ["build-audit", "saas-audit"] },
    suspiciousBehavior: ["A new or changed document enters an index through an unapproved identity, source, or validation result.", "Stable evaluation queries begin retrieving that digest and exhibit citation, answer, or tool-target drift."],
    investigationSteps: ["Preserve source object, owner, ACL, document digest, ingestion event, transformation, embedding, and index version lineage.", "Replay a stable evaluation set against before/after index versions while holding model and retrieval settings constant.", "Review changed citations and downstream tool calls, then validate whether an approved content correction, model change, or parser defect explains the drift."],
    escalationConditions: ["An unauthorized corpus object reproducibly changes protected decisions or tool targets."],
    falsePositives: ["Approved source correction", "Embedding or chunking migration", "Expected new policy document"],
    enrichment: ["source owner", "ACL history", "ingestion pipeline", "index manifest", "before/after evaluation"],
    detectionStrategy: "Version the retrieval corpus and index, require source provenance, and compare stable evaluations across index changes while holding other model inputs constant.",
    queries: [{ title: "Corpus-to-outcome drift", description: "DRIFT compares literal citation sets, answer classifications, and tool targets for the same evaluation.query_id with model and retrieval settings held constant. Analysis and lateness inputs are deployment-specific; expired evidence remains unknown.", platform: "pseudocode", query: `ANALYSIS_INTERVAL(event.time, ANALYST_START, ANALYST_END)
LATENESS_POLICY(MAX_INGEST_DELAY, RETENTION_LIMIT)
FOR each index_publish BY corpus.id, index.version
CHANGED = documents WHERE retrieval.document_digest differs from PRIOR_INDEX_VERSION
JOIN ingest_audit ON corpus.id, retrieval.document_id
RUN STABLE_EVALUATION_QUERIES BY evaluation.query_id AGAINST PRIOR_INDEX_VERSION AND index.version
RETURN WHERE ingest.actor_id NOT IN APPROVED_INGESTORS
  AND DRIFT(answer.citation_ids, evaluation.result, tool.target) REFERENCES CHANGED` }],
    references: [refs.nist], relatedHunts: ["retrieved-content-precedes-tool-action", "evaluator-change-precedes-perfect-score"],
  },
];

export const otAiHunts = defineExpandedHunts(seeds);
