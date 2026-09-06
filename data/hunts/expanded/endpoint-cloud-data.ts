import { defineExpandedHunts, expandedReferences as refs, noInfrastructureContext, type ExpandedHuntSeed } from "@/data/hunts/expanded/shared";

const seeds: ExpandedHuntSeed[] = [
  {
    ...noInfrastructureContext,
    title: "Credential Store Read Followed by Cloud Authentication", slug: "credential-store-read-then-cloud-auth", family: "cross-domain",
    summary: "Correlate browser or credential-store access on an endpoint with first-seen cloud use of the same identity.",
    hypothesis: "A process accessed local session material and the resulting credential was used shortly afterward from a new cloud context.",
    rationale: "Credential access and cloud sign-in are individually ambiguous. Linking host user, credential family, event time, and a novel cloud session tests whether local access produced a downstream effect.",
    expectedBehavior: ["Approved browsers and credential managers access their own stores; resulting cloud sessions originate from the same managed device context."],
    severity: "critical", confidence: "medium", scopes: ["endpoints", "cloud", "identity"], behaviors: ["credential-use", "trust-boundary"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Measure the delay from unusual store access to token issue and first cloud API call using event time.", baseline: "Compare process ancestry and cloud destinations for the same host role and user population.", confounders: ["Browser updates", "Profile migration", "Enterprise credential backup"] },
    evidence: [
      { claim: "Microsoft describes browser-cookie theft and replay as a path from endpoint compromise to cloud access.", sourceIds: ["research-token-2022"], kind: "observation" },
      { claim: "Editorial hypothesis: anomalous credential-store access followed by a new cloud session for the same user may connect endpoint theft to credential use.", sourceIds: ["research-token-2022", "research-aws-2014"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "event.action", "host.id", "user.id", "process.path", "process.parent", "credential_store.type", "identity.id", "session.id", "device.id", "source.ip", "cloud.action", "cloud.resource", "cloud.result"],
    limitations: ["Endpoint sensors may report store access without the specific secret, while cloud logs may lack a stable token identifier.", "The sequence depends on authoritative mappings from endpoint user.id to cloud identity.id and host.id to cloud device.id; unresolved or shared mappings must remain unmatched."],
    techniques: ["T1555 Credentials from Password Stores"], telemetry: { recommended: ["endpoint-events", "identity-audit", "cloud-audit"], optional: [] },
    suspiciousBehavior: ["An unsigned or unusual process reads browser or credential databases.", "The user then authenticates from a new device or source and calls cloud APIs."],
    investigationSteps: ["Validate process signer, ancestry, user, files, and whether the access was expected for that application.", "Resolve the user's token issuance and cloud session context after the endpoint event.", "Review cloud actions, revoke exposed sessions, and inspect the endpoint for related collection or persistence."],
    escalationConditions: ["The process is unapproved and a new session performs sensitive cloud actions."], falsePositives: ["Credential-manager migration", "Browser profile repair"],
    enrichment: ["authoritative user-to-identity mapping", "authoritative host-to-device mapping", "process reputation", "device compliance", "token family", "cloud resource sensitivity"], detectionStrategy: "Map endpoint users and hosts to cloud identity and device namespaces through authoritative inventories, then join suspicious credential-store reads to new sessions and successful cloud API actions by event time.",
    queries: [{ title: "Endpoint-to-cloud credential sequence", description: "AUTHORITATIVE_IDENTITY_LINK maps endpoint user.id to cloud identity.id; AUTHORITATIVE_DEVICE_LINK maps endpoint host.id to cloud device.id. Unresolved mappings remain unmatched. APPROVED_READERS comes from managed software inventory, and cloud audit is required for action and resource outcomes.", platform: "pseudocode", query: `MAP user.id TO identity.id USING AUTHORITATIVE_IDENTITY_LINK
SEQUENCE BY identity.id WITHIN 2h
  endpoint_event WHERE event.action = "credential_store_read" AND process.path NOT IN APPROVED_READERS
  CAPTURE ENDPOINT_DEVICE_ID = AUTHORITATIVE_DEVICE_LINK(host.id)
  REQUIRE ENDPOINT_DEVICE_ID IS NOT NULL
  cloud_session WHERE device.id != ENDPOINT_DEVICE_ID OR source.ip IS NEW
  cloud_action WHERE cloud.result = "success"
RETURN process.path, session.id, cloud.action, cloud.resource` }],
    references: [refs.token, refs.awsKey], relatedHunts: ["token-replay-new-device", "exposed-key-cross-service-discovery"],
  },
  {
    ...noInfrastructureContext,
    title: "Signed Utility Opens a New External Relationship", slug: "signed-utility-new-external-relationship", family: "cross-domain",
    summary: "Find trusted or signed endpoint utilities connecting to destinations outside their established operational role.",
    hypothesis: "A legitimate signed binary is being repurposed to retrieve, relay, or transfer content through a new external endpoint.",
    rationale: "Signature trust identifies a publisher, not intent. Parent process, arguments, destination ownership, transferred bytes, and later child activity provide the behavioral context.",
    expectedBehavior: ["Administrative and synchronization utilities run from approved parents and contact documented service endpoints for their host role."],
    severity: "high", confidence: "medium", scopes: ["endpoints", "network-edge"], behaviors: ["role-deviation", "new-relationships"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Treat the first external relationship and any file or child-process consequence as an ordered sequence, not a speed signature.", baseline: "Inventory signed utility destinations, parent processes, and invocation cadence by endpoint role.", confounders: ["Vendor endpoint changes", "Certificate renewal", "New management rollout"] },
    evidence: [
      { claim: "Microsoft observed Volt Typhoon using command-line and built-in tools for discovery, credential collection, staging, and proxy setup.", sourceIds: ["research-volt-typhoon-2023"], kind: "observation" },
      { claim: "Editorial hypothesis: a trusted binary crossing a new network boundary and producing an unexpected artifact or child process may represent role abuse.", sourceIds: ["research-volt-typhoon-2023"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "host.id", "host.role", "user.id", "process.path", "process.signer", "process.parent", "destination.domain", "destination.ip", "network.bytes", "file.created", "child_process.path"],
    limitations: ["CDNs and vendor service changes create destination churn; encrypted content prevents payload confirmation."],
    techniques: ["T1218 System Binary Proxy Execution"], telemetry: { recommended: ["endpoint-events", "dns"], optional: ["netflow-ipfix", "zeek"] },
    suspiciousBehavior: ["A signed utility is launched by an unusual parent or account and contacts a first-seen domain.", "The connection precedes a new executable, archive, or child process."],
    investigationSteps: ["Verify binary path, hash, signer, parent, arguments, and user session.", "Resolve domain ownership, certificate, historical prevalence, bytes, and peer endpoints.", "Inspect created artifacts and child processes, then validate any software deployment or support change."],
    escalationConditions: ["Unapproved invocation produces executable content or reaches an unrelated external owner."], falsePositives: ["New vendor CDN", "Approved remote-support rollout"],
    enrichment: ["publisher", "certificate", "domain age", "artifact hash", "change ticket"], detectionStrategy: "Baseline trusted utility relationships by role, then require a novel destination plus a downstream endpoint effect.",
    queries: [{ title: "Trusted utility relationship drift", description: "TRUSTED_PUBLISHERS and EXPECTED_DESTINATIONS are derived from signed-binary inventory and the approved destinations for each host.role and process.path.", platform: "pseudocode", query: `FOR each network_event WHERE process.signer IN TRUSTED_PUBLISHERS
EXPECTED_DESTINATIONS = LOOKUP expected_process_relationships BY host.role, process.path
JOIN file_and_process_events BY host.id WITHIN 30m
RETURN WHERE destination.domain NOT IN EXPECTED_DESTINATIONS
  AND (file.created = true OR child_process.path IS NOT NULL)` }],
    references: [refs.voltTyphoon], relatedHunts: ["credential-store-read-then-cloud-auth", "unexpected-management-interface-egress"],
  },
  {
    ...noInfrastructureContext,
    title: "Cloud Role Grant Followed by Object Access", slug: "cloud-role-grant-then-object-access", family: "cross-domain",
    summary: "Connect a new or expanded cloud role assignment to immediate access of resources outside prior use.",
    hypothesis: "An identity obtained new cloud privileges and used them to enumerate or retrieve sensitive objects before normal review could catch the change.",
    rationale: "Privilege changes become more informative when joined to actual resource access, session issuer, approval, and historical entitlements.",
    expectedBehavior: ["Role grants originate from approved administrators or automation, carry a ticket, and are used only for documented resources and time bounds."],
    severity: "critical", confidence: "high", scopes: ["cloud"], behaviors: ["privilege-change", "data-movement"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Measure grant-to-use latency and retain event/ingest times because cloud feeds can arrive out of order.", baseline: "Compare role use by principal type, service, region, resource class, and approved access window.", confounders: ["Just-in-time access", "Incident response", "Infrastructure deployment"] },
    evidence: [
      { claim: "AWS guidance recommends using CloudTrail to review actions taken with a credential during exposure response.", sourceIds: ["research-aws-2014"], kind: "observation" },
      { claim: "Editorial hypothesis: an unapproved role grant followed by first-seen sensitive object access is stronger than either event alone.", sourceIds: ["research-aws-2014"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "event.ingest_time", "event.result", "actor.id", "principal.id", "session.issuer", "role.before", "role.after", "resource.id", "cloud.action"],
    limitations: ["Assumed roles can obscure the initiating identity; data-event logging may be disabled for some services."],
    techniques: ["T1098 Account Manipulation"], telemetry: { recommended: ["cloud-audit", "identity-audit"], optional: [] },
    suspiciousBehavior: ["A role expands outside an approved workflow.", "The new session lists or reads resources the principal has not used before."],
    investigationSteps: ["Resolve grant actor, source session, request parameters, role diff, and approval record.", "Enumerate every API and resource accessed through sessions issued after the grant.", "Compare resource sensitivity and prior access, then revoke or scope the grant if unauthorized."],
    escalationConditions: ["The grant is unapproved and enabled successful access to sensitive data."], falsePositives: ["Approved JIT elevation", "New deployment service role"],
    enrichment: ["session issuer", "resource tags", "approval", "region", "data classification"], detectionStrategy: "Link role changes to descendant sessions and their API calls, then rank short latency, new resources, and missing approvals.",
    queries: [{ title: "Role grant to resource use", description: "Cloud-neutral privilege lineage; HISTORICAL_RESOURCES is the principal's peer- and workload-matched prior resource set.", platform: "pseudocode", query: `SEQUENCE BY principal.id WITHIN 6h
  grant WHERE expands(role.before, role.after)
  CAPTURE GRANT_ACTOR_ID = actor.id
  issued_session WHERE session.issuer = principal.id
  access WHERE event.result = "success" AND resource.id NOT IN HISTORICAL_RESOURCES(principal.id)
RETURN GRANT_ACTOR_ID, role.after, cloud.action, resource.id, TIME_BETWEEN` }],
    references: [refs.awsKey], relatedHunts: ["exposed-key-cross-service-discovery", "saas-bulk-export-after-consent"],
  },
  {
    ...noInfrastructureContext,
    title: "Exposed Key Fans Out Across Cloud Services", slug: "exposed-key-cross-service-discovery", family: "cross-domain",
    summary: "Detect one access key or session rapidly touching unrelated cloud services and regions for the first time.",
    hypothesis: "A stolen cloud credential is being tested and used for cross-service discovery before resource changes or collection.",
    rationale: "Fan-out should be normalized by workload: an orchestrator routinely spans services, while a billing export key may never enumerate identity, compute, and storage in one session.",
    expectedBehavior: ["Each programmatic credential calls a documented service set from known workloads and regions."],
    severity: "high", confidence: "medium", scopes: ["cloud"], behaviors: ["discovery", "credential-use"], temporalPatterns: ["fan-out", "burst"], aiRoles: [],
    temporal: { interpretation: "Count distinct service-action families per credential in tunable windows and compare with successful workload units; velocity does not identify AI.", baseline: "Build key-specific service, region, source, and error-pattern baselines over equivalent deployment cycles.", confounders: ["New infrastructure rollout", "Cloud inventory scanner", "Disaster recovery exercise"] },
    evidence: [
      { claim: "AWS advises responders to review CloudTrail for activity performed with an inadvertently exposed access key.", sourceIds: ["research-aws-2014"], kind: "observation" },
      { claim: "Editorial hypothesis: service fan-out that violates a key's workload role and precedes new resources or reads may indicate unauthorized key use.", sourceIds: ["research-aws-2014"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "event.result", "credential.id", "principal.id", "session.id", "source.ip", "cloud.service", "cloud.action", "cloud.region", "resource.id"],
    limitations: ["Central automation can legitimately fan out; management-only logging misses object access."],
    techniques: ["T1580 Cloud Infrastructure Discovery"], telemetry: { recommended: ["cloud-audit"], optional: ["identity-audit"] },
    suspiciousBehavior: ["A stable key begins calling unrelated inventory APIs from a new source or region.", "Discovery is followed by resource creation, role changes, or data reads."],
    investigationSteps: ["Map the credential to owner, workload, issuance, and expected services.", "Order service calls, errors, region changes, and successful consequences by session.", "Disable and replace an exposed key, then review all affected resources and descendant credentials."],
    escalationConditions: ["Owner denies use and successful sensitive actions occurred."], falsePositives: ["New asset inventory tooling", "Approved multi-region deployment"],
    enrichment: ["key age", "repository exposure", "source ASN", "resource tags", "session issuer"], detectionStrategy: "Baseline service sets per credential and correlate anomalous fan-out with source novelty and successful consequences.",
    queries: [{ title: "Credential service fan-out", description: "Cloud-neutral key workload deviation; EXPECTED_SOURCES and CREDENTIAL_SERVICE_BASELINE_P99 are derived from matched workload history.", platform: "pseudocode", query: `WINDOW cloud_audit BY event.time FOR 30m
GROUP BY credential.id, session.id
CALCULATE DISTINCT_SERVICES, DISTINCT_REGIONS, ERROR_COUNT, SUCCESSFUL_SENSITIVE_ACTIONS FROM cloud.service, cloud.region, event.result
RETURN WHERE DISTINCT_SERVICES > CREDENTIAL_SERVICE_BASELINE_P99
  AND source.ip NOT IN EXPECTED_SOURCES(credential.id)` }],
    references: [refs.awsKey], relatedHunts: ["cloud-role-grant-then-object-access", "credential-store-read-then-cloud-auth"],
  },
  {
    ...noInfrastructureContext,
    title: "Data Warehouse Discovery to Staged Export", slug: "data-warehouse-discovery-export", family: "cross-domain",
    summary: "Identify an interactive data session moving from broad discovery to temporary staging and external download.",
    hypothesis: "A credential is being used to enumerate a warehouse, stage selected data, and export it to an untrusted client or destination.",
    rationale: "The sequence of metadata discovery, large reads, temporary stage creation, copy, and download is more precise than a generic large-query alert.",
    expectedBehavior: ["Analysts query approved schemas; managed export jobs use named stages, stable clients, scheduled windows, and documented destinations."],
    severity: "critical", confidence: "high", scopes: ["data-stores"], behaviors: ["discovery", "data-movement"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Order discovery, stage creation, copy, and download by session and compare latency with sanctioned export jobs.", baseline: "Separate interactive clients from ETL identities and baseline object breadth, rows, bytes, stages, and destinations.", confounders: ["Data science exploration", "Approved export", "Migration validation"] },
    evidence: [
      { claim: "Mandiant observed UNC5537 listing warehouse objects, creating temporary stages, copying data into them, and downloading staged data.", sourceIds: ["research-snowflake-2024"], kind: "observation" },
      { claim: "Editorial hypothesis: a first-seen client executing the same discovery-to-export stages against sensitive data warrants urgent review.", sourceIds: ["research-snowflake-2024"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "event.result", "principal.id", "identity.role", "session.id", "source.ip", "client.application", "query.category", "object.id", "query.rows", "query.bytes", "stage.id", "export.destination"],
    limitations: ["Prepared statements and summarized audit records may omit full query semantics or reliable byte counts."],
    techniques: ["T1213 Data from Information Repositories"], telemetry: { recommended: ["data-audit"], optional: ["identity-audit", "saas-audit"] },
    suspiciousBehavior: ["A new client enumerates roles, tables, or stages and then creates a temporary stage.", "Large copy and download operations target new objects or paths."],
    investigationSteps: ["Resolve credential owner, MFA, client, source, role, and session history.", "Reconstruct discovered objects, selected data, temporary stages, copy sizes, and download destination.", "Compare with approved jobs and preserve query and access history before containment."],
    escalationConditions: ["Unapproved client downloaded sensitive staged data."], falsePositives: ["Approved migration", "Incident-response collection"],
    enrichment: ["object classification", "client version", "stage lifetime", "destination owner", "credential exposure history"], detectionStrategy: "Detect session-ordered discovery, temporary staging, and download, then rank source, client, object, and destination novelty.",
    queries: [{ title: "Discovery-stage-export chain", description: "Data-platform-neutral session sequence.", platform: "pseudocode", query: `SEQUENCE BY principal.id, session.id WITHIN 8h
  discover WHERE query.category IN ("list_roles", "list_tables", "list_stages")
  stage WHERE query.category = "create_temporary_stage"
  copy WHERE query.category = "copy_to_stage" AND event.result = "success"
  download WHERE query.category = "download_stage"
RETURN object.id, query.rows, query.bytes, stage.id, export.destination, client.application` }],
    references: [refs.snowflake], relatedHunts: ["database-access-policy-relaxed", "saas-bulk-export-after-consent"],
  },
  {
    ...noInfrastructureContext,
    title: "Database Access Policy Relaxed Before New Client", slug: "database-access-policy-relaxed", family: "cross-domain",
    summary: "Correlate MFA, network, or role-policy weakening with the first successful database session from an unfamiliar client.",
    hypothesis: "A control was relaxed to permit a stolen or newly created credential to reach a data platform from an untrusted context.",
    rationale: "A policy change can be routine. Its relationship to a new client, historical credential exposure, discovery, and export determines the investigative priority.",
    expectedBehavior: ["Access policies change through approved administration and new clients appear only after owner validation and compensating controls."],
    severity: "critical", confidence: "medium", scopes: ["data-stores", "identity"], behaviors: ["privilege-change", "credential-use"], temporalPatterns: ["stage-transition", "dwell-time"], aiRoles: [],
    temporal: { interpretation: "Measure policy-change-to-first-use latency and also review dormant credentials that become active much later.", baseline: "Compare policy, network, MFA, role, and client changes with platform maintenance and onboarding history.", confounders: ["Emergency access", "Contractor onboarding", "Network migration"] },
    evidence: [
      { claim: "Mandiant reports compromised Snowflake customer accounts lacking MFA or network allow lists and using credentials exposed in earlier infostealer infections.", sourceIds: ["research-snowflake-2024"], kind: "observation" },
      { claim: "Editorial hypothesis: weakened access policy followed by a new client and sensitive query sequence may indicate deliberate enablement of unauthorized access.", sourceIds: ["research-snowflake-2024"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "event.result", "actor.id", "principal.id", "policy.type", "policy.before", "policy.after", "source.ip", "client.application", "session.id", "query.category", "query.bytes"],
    limitations: ["Legacy platforms may not version policies or log the actor; credential exposure date is often unknown."],
    techniques: ["T1098 Account Manipulation"], telemetry: { recommended: ["data-audit", "identity-audit"], optional: ["cloud-audit"] },
    suspiciousBehavior: ["MFA, allow-list, or role restrictions are reduced without a matching approval.", "A dormant account then succeeds from a new client or source and performs discovery."],
    investigationSteps: ["Diff the policy and identify actor, source session, approval, and affected principals.", "Resolve the first new client session and enumerate all queries and exports.", "Check credential age and exposure, restore controls, and rotate affected secrets if unauthorized."],
    escalationConditions: ["Unapproved weakening enabled a new client to access sensitive data."], falsePositives: ["Emergency break-glass use", "Approved network readdressing"],
    enrichment: ["credential age", "MFA state", "network rule", "client fingerprint", "data sensitivity"], detectionStrategy: "Join control-plane policy diffs to later database sessions and require context novelty plus successful sensitive actions.",
    queries: [{ title: "Policy relaxation to new database use", description: "Policy and session transition logic; NEW compares source.ip and client.application with the principal's matched access history.", platform: "pseudocode", query: `SEQUENCE BY principal.id WITHIN 7d
  policy_change WHERE weakens(policy.before, policy.after)
  CAPTURE POLICY_ACTOR_ID = actor.id
  login WHERE event.result = "success" AND (source.ip IS NEW OR client.application IS NEW)
  CAPTURE LOGIN_SOURCE_IP = source.ip
  query WHERE query.category IN ("discovery", "bulk_read", "export")
RETURN POLICY_ACTOR_ID, policy.type, LOGIN_SOURCE_IP, query.category, query.bytes` }],
    references: [refs.snowflake], relatedHunts: ["data-warehouse-discovery-export", "cloud-role-grant-then-object-access"],
  },
];

export const endpointCloudDataHunts = defineExpandedHunts(seeds);
