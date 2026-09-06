import { defineExpandedHunts, expandedReferences as refs, noInfrastructureContext, type ExpandedHuntSeed } from "@/data/hunts/expanded/shared";

const seeds: ExpandedHuntSeed[] = [
  {
    ...noInfrastructureContext,
    title: "Service Account Crosses Into a New Namespace", slug: "kubernetes-service-account-new-namespace", family: "cross-domain",
    summary: "Detect service-account API use against a namespace or resource class outside its established workload role.",
    hypothesis: "A workload credential is being used to discover or change resources beyond the namespace and verbs its service normally requires.",
    rationale: "Service accounts are expected automation, so the useful deviation is a new actor-resource relationship supported by RBAC, workload identity, and API results.",
    expectedBehavior: ["A service account uses a stable verb and resource set inside its workload namespaces from expected pods or nodes."],
    severity: "high", confidence: "medium", scopes: ["containers"], behaviors: ["role-deviation", "discovery"], temporalPatterns: ["fan-out"], aiRoles: [],
    temporal: { interpretation: "Compare namespace and resource fan-out per service account over equivalent deployment windows.", baseline: "Baseline by cluster, workload version, controller type, namespace, verb, and resource.", confounders: ["Controller upgrade", "Cluster migration", "New multi-namespace operator"] },
    evidence: [
      { claim: "Kubernetes documents audit events that identify API users, verbs, resources, namespaces, stages, and response status when policy coverage is configured.", sourceIds: ["research-kubernetes-audit-2025"], kind: "observation" },
      { claim: "Editorial hypothesis: successful service-account access to first-seen namespaces and resource classes may indicate stolen-token use or over-broad RBAC.", sourceIds: ["research-kubernetes-audit-2025"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "audit.id", "cluster.id", "user.name", "source.ip", "kubernetes.verb", "kubernetes.resource", "kubernetes.namespace", "response.code", "pod.uid"],
    limitations: ["Audit policy may omit read events or request bodies, and control-plane aggregation can blur pod attribution."],
    techniques: ["T1613 Container and Resource Discovery"], telemetry: { recommended: ["kubernetes-audit"], optional: ["cloud-audit"] },
    suspiciousBehavior: ["A service account lists secrets, roles, or pods in a new namespace.", "The source pod or node differs from the account's normal workload."],
    investigationSteps: ["Resolve the account's RoleBindings, ClusterRoleBindings, token type, and expected namespaces.", "Map the source IP to pod, node, workload revision, and image digest.", "Order successful reads or changes and inspect affected secrets, roles, and workloads."],
    escalationConditions: ["The account accessed secrets or modified workloads outside its role."], falsePositives: ["New cluster operator", "Approved backup controller"],
    enrichment: ["RBAC diff", "pod UID", "image digest", "token audience", "namespace owner"], detectionStrategy: "Build service-account relationship baselines from Kubernetes audit events and alert on successful namespace or resource expansion.",
    queries: [{ title: "Service-account relationship expansion", description: "EXPECTED_NAMESPACES and EXPECTED_RESOURCES are derived from effective RBAC plus the service account's matched workload history.", platform: "pseudocode", query: `FOR each kubernetes_audit WHERE user.name STARTS_WITH "system:serviceaccount:"
GROUP BY cluster.id, user.name WINDOW event.time 1h
RETURN successful events WHERE kubernetes.namespace NOT IN EXPECTED_NAMESPACES(user.name)
  OR kubernetes.resource NOT IN EXPECTED_RESOURCES(user.name)
ENRICH WITH pod.uid, source.ip, kubernetes.verb, response.code, RBAC_DIFF` }],
    references: [refs.kubernetesAudit], relatedHunts: ["kubernetes-exec-after-secret-read", "cloud-role-grant-then-object-access"],
  },
  {
    ...noInfrastructureContext,
    title: "Secret Read Followed by Pod Exec", slug: "kubernetes-exec-after-secret-read", family: "cross-domain",
    summary: "Correlate secret access with an exec or attach request into a different workload.",
    hypothesis: "An identity read credentials and then opened an interactive channel into a pod to use or stage them.",
    rationale: "Secret reads and pod exec both support operations. Their ordered relationship across namespaces, identities, and workloads exposes a consequential pivot for review.",
    expectedBehavior: ["Controllers read scoped secrets; human exec sessions are ticketed, originate from approved administration, and target owned workloads."],
    severity: "critical", confidence: "high", scopes: ["containers"], behaviors: ["credential-use", "trust-boundary"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Link the secret read to exec or attach by authenticated identity and event time; do not infer command content when the audit level omits it.", baseline: "Separate controllers, break-glass users, deployment systems, and interactive administrators.", confounders: ["Approved troubleshooting", "Secret rotation validation", "Deployment hooks"] },
    evidence: [
      { claim: "Kubernetes audit documentation shows that recorded request detail depends on audit level and that events describe request stages and authenticated users.", sourceIds: ["research-kubernetes-audit-2025"], kind: "observation" },
      { claim: "Editorial hypothesis: a principal reading a new secret and soon opening exec into another workload may be pivoting across trust boundaries.", sourceIds: ["research-kubernetes-audit-2025"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "audit.id", "cluster.id", "user.name", "source.ip", "kubernetes.verb", "kubernetes.resource", "kubernetes.subresource", "kubernetes.namespace", "object.name", "response.code"],
    limitations: ["Metadata-level policies may not record commands, and direct node or runtime access may bypass the API server."],
    techniques: ["T1552 Unsecured Credentials"], telemetry: { recommended: ["kubernetes-audit"], optional: ["endpoint-events", "cloud-audit"] },
    suspiciousBehavior: ["A user or service account reads a first-seen secret.", "The same principal opens pods/exec or pods/attach in another workload shortly afterward."],
    investigationSteps: ["Confirm the exact secret metadata, namespace, response, and principal entitlement.", "Resolve exec target, source, audit level, pod UID, container, and workload owner.", "Inspect pod, node, identity, and cloud actions after the sequence without assuming an unlogged command."],
    escalationConditions: ["Unapproved secret access precedes successful exec into a sensitive workload."], falsePositives: ["Ticketed debugging", "Deployment controller reconciliation"],
    enrichment: ["RBAC", "secret type", "pod UID", "container image", "change ticket"], detectionStrategy: "Sequence successful secret reads and exec/attach requests by principal, then score namespace crossing and entitlement mismatch.",
    queries: [{ title: "Secret-to-exec transition", description: "SECRET_NAMESPACE, EXEC_NAMESPACE, and EXEC_OBJECT preserve event-local values without inventing alias-qualified raw fields; command text is not required.", platform: "pseudocode", query: `SEQUENCE BY cluster.id, user.name WITHIN 30m
  secret_read WHERE kubernetes.verb IN ("get", "list") AND kubernetes.resource = "secrets" AND response.code < 300
  CAPTURE SECRET_NAMESPACE = kubernetes.namespace
  interactive WHERE kubernetes.resource = "pods" AND kubernetes.subresource IN ("exec", "attach") AND response.code < 300
  CAPTURE EXEC_NAMESPACE = kubernetes.namespace, EXEC_OBJECT = object.name
RETURN WHERE SECRET_NAMESPACE != EXEC_NAMESPACE OR EXEC_OBJECT IS NEW FOR user.name` }],
    references: [refs.kubernetesAudit], relatedHunts: ["kubernetes-service-account-new-namespace", "credential-store-read-then-cloud-auth"],
  },
  {
    ...noInfrastructureContext,
    title: "Workflow Change Expands Runner Privilege", slug: "workflow-file-privilege-expansion", family: "cross-domain",
    summary: "Detect reviewed workflow changes that add write tokens, secrets, privileged execution, or unpinned dependencies.",
    hypothesis: "A workflow revision expanded a CI job's authority or supply-chain reach beyond the stated code change.",
    rationale: "Workflow files are executable control-plane configuration. Diffing permissions, secret exposure, runner class, triggers, and dependency references reveals security-relevant changes hidden in ordinary commits.",
    expectedBehavior: ["Privilege-affecting workflow changes receive designated review and retain least-privilege tokens, pinned actions, and approved runner classes."],
    severity: "high", confidence: "medium", scopes: ["cicd"], behaviors: ["privilege-change", "trust-boundary"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Starting at change event time, select the first run that used the changed workflow revision in the changed repository within the analyst's analysis and retention bounds; later runs of older revisions do not qualify.", baseline: "Compare permission and dependency diffs with repository policy, owners, branch protection, and workflow purpose.", confounders: ["Approved release automation", "OIDC migration", "Runner platform change"] },
    evidence: [
      { claim: "StepSecurity reports that a compromised third-party action exposed CI secrets and that mutable references enabled altered code to run broadly.", sourceIds: ["research-tj-actions-2025"], kind: "observation" },
      { claim: "Editorial hypothesis: an unreviewed workflow privilege expansion followed by a privileged run may create a CI persistence or secret-access path.", sourceIds: ["research-tj-actions-2025"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "repository.id", "commit.sha", "actor.id", "reviewer.id", "review.status", "workflow.path", "workflow.effective_revision", "workflow.trigger", "token.permissions", "token.use", "secret.ids", "permission.before", "permission.after", "dependency.ref", "runner.id", "runner.class", "run.id", "artifact.destination", "artifact.digest"],
    limitations: ["Build audit must provide resolved workflow provenance as well as source diffs and run-scoped token/artifact records. The run's application commit is not necessarily its effective workflow revision; reusable workflows require a resolved repository/path/revision chain.", "Keep expanded revisions with unresolved run lineage or incomplete audit retention as unknown. A fully covered window with no matching run supports only no observed use in that window."],
    techniques: ["T1195 Supply Chain Compromise"], telemetry: { recommended: ["build-audit"], optional: ["saas-audit", "identity-audit"] },
    suspiciousBehavior: ["A workflow adds write permission, secrets, privileged runners, broad triggers, or a floating action reference.", "The first run uses the new authority before designated review."],
    investigationSteps: ["Produce a semantic diff of triggers, tokens, secrets, runners, dependencies, and artifact destinations.", "Validate authorship, review, branch protection, commit signature, and linked change.", "Trace the first affected runs, secret access, network activity, artifacts, and promotions."],
    escalationConditions: ["Unapproved authority was exercised or an artifact was promoted."], falsePositives: ["Approved release workflow redesign", "Emergency pipeline repair"],
    enrichment: ["CODEOWNERS", "signature", "token claims", "runner group", "artifact digest"], detectionStrategy: "Parse workflow revisions into security-relevant diffs and optionally link each to the first run that actually used that exact effective workflow revision in its repository. Attach token use and artifacts only by that run's verified lineage.",
    queries: [{ title: "Workflow authority diff", description: "Pseudocode: AUTHORITY_DIFF compares the literal trigger, token, secret, runner, dependency, and destination fields; EXPANDS_AUTHORITY applies repository policy. workflow.effective_revision is an immutable source revision or content digest resolved from platform execution metadata, including reusable workflow repository/path/revision chains. Resolve it from commit.sha on the change and from the workflow actually loaded on the run; never substitute the run's application checkout SHA or a mutable tag. RUN_COVERAGE comes from the independent build-audit inventory for the changed repository/workflow and change-to-analysis-end window; sufficient requires complete delivery and retention. ANY_RELEVANT_RUN_LINEAGE_UNRESOLVED is true if a candidate in that boundary lacks resolved workflow provenance, false only after complete candidate review. Select the first verified matching run; unresolved candidates leave first-use timing unknown and receive no token or artifact attribution.", platform: "pseudocode", query: `ANALYSIS_INTERVAL(event.time, ANALYST_START, ANALYST_END)
LATENESS_POLICY(MAX_INGEST_DELAY, RETENTION_LIMIT)
FOR each workflow_revision
CAPTURE CHANGED_REPOSITORY = repository.id, CHANGED_WORKFLOW = workflow.path
CAPTURE CHANGED_COMMIT = commit.sha, CHANGED_REVISION = workflow.effective_revision, CHANGE_TIME = event.time, CHANGE_REVIEW = review.status
AUTHORITY_DIFF = DIFF workflow.trigger, token.permissions, secret.ids, runner.class, dependency.ref, artifact.destination
KEEP WHERE EXPANDS_AUTHORITY(AUTHORITY_DIFF) AND (CHANGE_REVIEW IS MISSING OR CHANGE_REVIEW != "approved")
LEFT JOIN FIRST workflow_run ORDER BY event.time, run.id
  ON repository.id = CHANGED_REPOSITORY AND workflow.path = CHANGED_WORKFLOW
  AND CHANGED_REVISION IS NOT NULL AND workflow.effective_revision = CHANGED_REVISION
  AND event.time >= CHANGE_TIME AND event.time <= ANALYST_END
CAPTURE MATCHED_RUN = run.id
RUN_STATUS = CASE
  WHEN MATCHED_RUN IS PRESENT AND (ANY_RELEVANT_RUN_LINEAGE_UNRESOLVED IS MISSING OR ANY_RELEVANT_RUN_LINEAGE_UNRESOLVED OR RUN_COVERAGE IS MISSING OR RUN_COVERAGE != "sufficient") THEN "verified_revision_run_first_use_unknown"
  WHEN MATCHED_RUN IS PRESENT THEN "verified_revision_run"
  WHEN CHANGED_REPOSITORY IS MISSING OR CHANGED_WORKFLOW IS MISSING OR CHANGED_REVISION IS MISSING OR ANY_RELEVANT_RUN_LINEAGE_UNRESOLVED IS MISSING OR ANY_RELEVANT_RUN_LINEAGE_UNRESOLVED THEN "unknown_revision_lineage"
  WHEN RUN_COVERAGE != "sufficient" OR RUN_COVERAGE IS MISSING THEN "unknown_run_coverage"
  ELSE "no_matching_run_in_covered_window"
OPTIONALLY ENRICH token_and_artifact_records ON MATCHED_RUN IS NOT NULL
  AND repository.id = CHANGED_REPOSITORY AND run.id = MATCHED_RUN
RETURN ALL CHANGED_REPOSITORY, CHANGED_COMMIT, CHANGED_REVISION, MATCHED_RUN, RUN_STATUS, token.use, runner.id, artifact.digest` }],
    references: [refs.tjActions], relatedHunts: ["runner-egress-after-action-update", "floating-release-tag-retargeted"],
  },
  {
    ...noInfrastructureContext,
    title: "Runner Egress After Dependency Update", slug: "runner-egress-after-action-update", family: "cross-domain",
    summary: "Link a changed action or build dependency to new network destinations and secret-bearing output from its first runs.",
    hypothesis: "A newly resolved dependency is causing CI runners to contact an unapproved endpoint or expose secrets through logs or artifacts.",
    rationale: "The relevant unit is dependency digest → workflow run → process/network behavior → output, which distinguishes the responsible step from ambient runner traffic.",
    expectedBehavior: ["Each build step resolves to reviewed digests and contacts a documented destination set without emitting unmasked secrets."],
    severity: "critical", confidence: "high", scopes: ["cicd", "supply-chain"], behaviors: ["new-relationships", "data-movement"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Compare the first run after dependency resolution changes with matched runs from the prior digest.", baseline: "Baseline destinations, processes, output entropy, and artifacts per workflow step and immutable dependency digest.", confounders: ["Dependency registry migration", "Telemetry upload addition", "Cache miss"] },
    evidence: [
      { claim: "StepSecurity reports detecting the tj-actions compromise through an unexpected runner endpoint and finding secrets exposed in public build logs.", sourceIds: ["research-tj-actions-2025"], kind: "observation" },
      { claim: "Editorial hypothesis: new runner egress or secret-like output beginning exactly with a dependency digest change may localize a compromised build component.", sourceIds: ["research-tj-actions-2025"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "repository.id", "run.id", "step.id", "dependency.name", "dependency.digest", "runner.id", "process.path", "destination.domain", "network.bytes", "output.classification", "artifact.digest"],
    limitations: ["Runner network telemetry may lack step attribution; masked secrets can still be transformed before output."],
    techniques: ["T1195 Supply Chain Compromise"], telemetry: { recommended: ["build-audit", "netflow-ipfix"], optional: ["dns", "endpoint-events"] },
    suspiciousBehavior: ["A dependency digest change introduces a first-seen destination for the same build step.", "The step emits secret-like values or unfamiliar artifacts."],
    investigationSteps: ["Resolve dependency name, immutable digest, tag history, commit, and first affected run.", "Map process and network events to the exact runner step and compare with prior digest runs.", "Inspect logs and artifacts with secret-safe tooling, rotate exposed values, and inventory all consumers."],
    escalationConditions: ["Unapproved code accessed secrets or produced sensitive output."], falsePositives: ["New telemetry endpoint", "Approved dependency mirror"],
    enrichment: ["tag history", "commit signature", "step process tree", "destination owner", "secret rotation"], detectionStrategy: "Diff behavior by immutable dependency digest and require a new runner destination or sensitive output tied to the changed step.",
    queries: [{ title: "Dependency behavior delta", description: "OLD_DIGEST, NEW_DIGEST, MATCHED_RUNS, and FIRST_RUNS are captured from resolution history for before/after comparison.", platform: "pseudocode", query: `FOR each dependency_resolution_change
BEFORE = RUNNER_EVENTS(step.id, OLD_DIGEST, MATCHED_RUNS)
AFTER = RUNNER_EVENTS(step.id, NEW_DIGEST, FIRST_RUNS)
RETURN AFTER MINUS BEFORE WHERE destination.domain IS NEW OR output.classification = "secret_like"
ENRICH WITH run.id, process.path, network.bytes, artifact.digest` }],
    references: [refs.tjActions], relatedHunts: ["workflow-file-privilege-expansion", "source-release-artifact-provenance-gap"],
  },
  {
    ...noInfrastructureContext,
    title: "Floating Release Tag Retargeted", slug: "floating-release-tag-retargeted", family: "cross-domain",
    summary: "Detect a release tag or mutable dependency reference moving to an unexpected commit across active consumers.",
    hypothesis: "A trusted dependency label was retargeted so unchanged workflows resolve and execute different code.",
    rationale: "A consumer diff may be empty while resolution changes underneath it. Preserve tag history and compare resolved digests at execution time.",
    expectedBehavior: ["Published release tags are immutable or changes are signed, reviewed, announced, and reconciled with consumer lock data."],
    severity: "critical", confidence: "high", scopes: ["supply-chain", "cicd"], behaviors: ["persistence", "trust-boundary"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Link tag movement to the first consumer resolution and execution; scheduled runs determine exposure timing.", baseline: "Track every tag-to-commit mapping, signature, release record, and consumer resolution over time.", confounders: ["Documented tag repair", "Release rollback", "Repository migration"] },
    evidence: [
      { claim: "StepSecurity reports multiple tj-actions release tags being updated to point to one malicious commit.", sourceIds: ["research-tj-actions-2025"], kind: "observation" },
      { claim: "Editorial hypothesis: unsigned retargeting of a consumed release tag can silently change executed build code without a consumer commit.", sourceIds: ["research-tj-actions-2025"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "repository.id", "tag.name", "commit.before", "commit.after", "actor.id", "signature.status", "release.approval", "consumer.id", "run.id", "resolved.digest", "artifact.digest"],
    limitations: ["Registries and mirrors may expose incomplete tag history; legitimate force-updates exist in some projects."],
    techniques: ["T1195.001 Compromise Software Dependencies and Development Tools"], telemetry: { recommended: ["build-audit", "saas-audit"], optional: [] },
    suspiciousBehavior: ["A published tag moves to a different commit without expected signature or release process.", "Unchanged consumers resolve the new digest and execute it."],
    investigationSteps: ["Preserve before/after tag mappings, commits, signatures, actor, and provider audit event.", "List all consumers and runs resolving each digest during the exposure window.", "Compare code and runner behavior, revoke credentials, and rebuild affected artifacts from trusted inputs."],
    escalationConditions: ["Unapproved tag movement reached a privileged build."], falsePositives: ["Documented release rollback", "Maintainer correcting a broken tag"],
    enrichment: ["release attestation", "maintainer identity", "consumer inventory", "runner behavior", "artifact promotion"], detectionStrategy: "Continuously snapshot mutable reference resolution and correlate unexpected movement with consumer execution and behavior changes.",
    queries: [{ title: "Mutable reference movement", description: "Tag history joined to consumer resolutions.", platform: "pseudocode", query: `FOR each tag_mapping_change WHERE commit.before != commit.after
JOIN consumer_resolution ON repository.id, tag.name AFTER event.time
RETURN WHERE signature.status != "verified" OR release.approval != "approved"
ENRICH WITH consumer.id, run.id, resolved.digest, artifact.digest` }],
    references: [refs.tjActions], relatedHunts: ["runner-egress-after-action-update", "source-release-artifact-provenance-gap"],
  },
  {
    ...noInfrastructureContext,
    title: "Source, Release, and Artifact Provenance Diverge", slug: "source-release-artifact-provenance-gap", family: "cross-domain",
    summary: "Find released packages whose contents or build lineage cannot be reproduced from the reviewed source revision.",
    hypothesis: "Malicious or unintended content entered between source review, release packaging, and downstream artifact production.",
    rationale: "Source inspection alone misses release tarball, generated file, build-environment, or promotion changes. Compare signed lineage and reproducible output at each boundary.",
    expectedBehavior: ["Release source, generated inputs, builder identity, dependencies, artifact digest, attestation, and promotion record form a verifiable chain."],
    severity: "critical", confidence: "medium", scopes: ["supply-chain"], behaviors: ["evidence-tampering", "trust-boundary"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Constrain the graph to an analyst-selected event-time interval and exact release.digest, builder.id, and source.commit identities. Accept arrivals only within MAX_INGEST_DELAY and the available RETENTION_LIMIT; evidence outside those bounds remains unknown.", baseline: "Compare artifacts built from the same source and declared environment across trusted builders.", confounders: ["Nondeterministic builds", "Generated metadata", "Platform-specific packaging"] },
    evidence: [
      { claim: "Red Hat describes separately assessing malicious XZ package content, build systems, affected products, and its productization pipeline.", sourceIds: ["research-xz-2024"], kind: "observation" },
      { claim: "Editorial hypothesis: an unexplained source-to-release or release-to-artifact difference can identify a compromised packaging or build boundary.", sourceIds: ["research-xz-2024"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "source.commit", "release.digest", "builder.id", "dependency.digest", "artifact.digest", "attestation.id", "signature.status", "promotion.id"],
    limitations: ["Non-reproducible builds create noise, and an internally consistent attestation can still originate from a compromised builder."],
    techniques: ["T1195.002 Compromise Software Supply Chain"], telemetry: { recommended: ["build-audit"], optional: ["endpoint-events"] },
    suspiciousBehavior: ["Release contents include files or transforms absent from reviewed source and declared generation steps.", "Artifact digest lacks a valid attestation to the expected builder and source."],
    investigationSteps: ["Acquire source, release archive, build definition, dependencies, attestation, signature, and artifact independently.", "Rebuild in a trusted environment and categorize every difference by declared nondeterminism.", "Trace builder access and downstream promotions for unexplained differences."],
    escalationConditions: ["Executable differences lack a reviewed source or generation record."], falsePositives: ["Timestamp embedding", "Undeclared but benign generated files"],
    enrichment: ["rebuild diff", "builder identity", "signature chain", "dependency lock", "consumer inventory"], detectionStrategy: "Verify end-to-end provenance and compare reproducible build output, treating unexplained executable differences as investigation leads.",
    queries: [{ title: "Artifact lineage gaps", description: "ANALYST_START, ANALYST_END, MAX_INGEST_DELAY, and RETENTION_LIMIT are deployment inputs. Comparisons use the exact release digest, builder, and source commit; missing late or expired evidence is unknown.", platform: "pseudocode", query: `ANALYSIS_INTERVAL(event.time, ANALYST_START, ANALYST_END)
LATENESS_POLICY(MAX_INGEST_DELAY, RETENTION_LIMIT)
FOR each promoted_artifact BY release.digest, builder.id, source.commit
TRACE artifact.digest <- attestation.id <- builder.id <- source.commit, dependency.digest
REBUILD EXPECTED_ARTIFACT FROM recorded inputs ON TRUSTED_BUILDER
RETURN WHERE LINEAGE_EDGE_MISSING OR signature.status != "verified" OR EXECUTABLE_DIFF(EXPECTED_ARTIFACT, artifact.digest)` }],
    references: [refs.xz], relatedHunts: ["floating-release-tag-retargeted", "runner-egress-after-action-update"],
  },
];

export const deliveryContainerHunts = defineExpandedHunts(seeds);
