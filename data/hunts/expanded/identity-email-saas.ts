import { defineExpandedHunts, expandedReferences as refs, noInfrastructureContext, type ExpandedHuntSeed } from "@/data/hunts/expanded/shared";

const seeds: ExpandedHuntSeed[] = [
  {
    ...noInfrastructureContext,
    title: "Distributed Password Spray Across a Long Window", slug: "distributed-password-spray", family: "cross-domain",
    summary: "Aggregate sparse failures across identities, applications, and changing source addresses before a success.",
    hypothesis: "One operation is distributing a small password set across many identities and source addresses slowly enough to evade per-IP and short-window thresholds.",
    rationale: "A single source can look quiet while the tenant-wide relationship between attempted identities, password-spray risk, proxy churn, and a later success becomes unusual. The useful unit is the campaign-like cluster, not raw speed.",
    expectedBehavior: ["Failed sign-ins usually cluster around one user, known device, application, or support event and do not culminate in a new session for another targeted identity."],
    severity: "high", confidence: "medium", scopes: ["identity"], behaviors: ["credential-use", "new-relationships"], temporalPatterns: ["low-and-slow", "fan-out"], aiRoles: [],
    temporal: { interpretation: "Accumulate low-volume attempts by password-risk signal, ASN, client fingerprint, and target overlap across 24 hours or more; no event rate implies AI involvement.", baseline: "Compare targeted-identity breadth and source churn with the tenant's own failed-authentication clusters by application and weekday.", confounders: ["Approved password audits", "Broken mobile clients", "Large carrier-grade NAT pools"] },
    evidence: [
      { claim: "Microsoft observed a low-attempt password spray distributed through residential proxy infrastructure in its Midnight Blizzard investigation.", sourceIds: ["research-midnight-2024"], kind: "observation" },
      { claim: "Editorial hypothesis: sparse failures sharing targets or client traits and followed by a new successful session may represent one coordinated spray.", sourceIds: ["research-midnight-2024"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "identity.id", "application.id", "source.ip", "source.asn", "client.fingerprint", "auth.result", "session.id"],
    limitations: ["Shared proxies and incomplete client fingerprints can merge unrelated users; password values should not be logged to support this hunt."],
    techniques: ["T1110.003 Password Spraying"], telemetry: { recommended: ["identity-audit"], optional: ["saas-audit", "endpoint-events"] },
    suspiciousBehavior: ["Many identities receive one or two failures from rotating sources sharing infrastructure or client traits.", "A targeted identity later succeeds from a new source, device, or application."],
    investigationSteps: ["Cluster failures by target overlap, ASN, client, and application using event time.", "Confirm whether a successful session belongs to a targeted identity and resolve its device and MFA context.", "Review that session's OAuth grants, mailbox access, and privilege changes, then disconfirm testing or client faults."],
    escalationConditions: ["A targeted identity succeeds from an unmanaged context and performs sensitive actions.", "The cluster cannot be explained by an approved assessment or service fault."],
    falsePositives: ["Credential audit services", "Misconfigured shared clients repeatedly using an expired secret"],
    enrichment: ["ASN ownership", "device compliance", "MFA method", "application sensitivity", "downstream session actions"],
    detectionStrategy: "Build long-window clusters from low-count failures using shared targets and client or network traits, then rank clusters with a new success and sensitive follow-on actions.",
    queries: [{ title: "Long-window spray clusters", description: "Vendor-neutral identity aggregation with explicit tunable windows.", platform: "pseudocode", query: `WINDOW failures BY event.time FOR 24h
GROUP WHERE auth.result = "failure" BY source.asn, client.fingerprint, application.id
CALCULATE distinct(identity.id), distinct(source.ip), attempts_per_identity
JOIN successful_sessions WITHIN 6h ON identity.id
RETURN clusters WHERE distinct(identity.id) >= BASELINE_P95 AND attempts_per_identity <= TUNED_LOW_COUNT` }],
    references: [refs.midnight], relatedHunts: ["token-replay-new-device", "oauth-app-mailbox-expansion"],
  },
  {
    ...noInfrastructureContext,
    title: "Session Replay From a New Device Context", slug: "token-replay-new-device", family: "cross-domain",
    summary: "Find established cloud sessions reused from a device, network, or client context that does not match token issuance.",
    hypothesis: "A stolen browser cookie or token is being replayed from another endpoint to access cloud or SaaS resources without a fresh interactive authentication.",
    rationale: "A successful request is expected for a valid token, so the investigation must compare issuance context, session continuity, device posture, and downstream effects instead of treating success as benign.",
    expectedBehavior: ["A session remains associated with compatible device, client, network, and user-agent context until a documented refresh or reauthentication."],
    severity: "high", confidence: "medium", scopes: ["identity", "endpoints"], behaviors: ["credential-use", "trust-boundary"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Measure elapsed event time from token issue or last strong authentication to the context change and first sensitive action.", baseline: "Model context transitions separately for roaming users, virtual desktops, and service sessions.", confounders: ["VPN changes", "Browser upgrades", "Virtual desktop reassignment", "Mobile carrier handoffs"] },
    evidence: [
      { claim: "Microsoft incident-response guidance describes replay of stolen tokens or browser cookies from separate systems without a new MFA exchange.", sourceIds: ["research-token-2022"], kind: "observation" },
      { claim: "Editorial hypothesis: an abrupt session context change followed by persistence or collection is more concerning than the location change alone.", sourceIds: ["research-token-2022"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "event.action", "event.result", "identity.id", "session.id", "token.id", "source.ip", "device.id", "device.compliance", "client.user_agent", "session.fresh_auth"],
    limitations: ["Many providers expose only partial token identifiers, and privacy relays can change network context during legitimate use."],
    techniques: ["T1539 Steal Web Session Cookie"], telemetry: { recommended: ["identity-audit", "saas-audit"], optional: ["endpoint-events"] },
    suspiciousBehavior: ["One session ID appears from incompatible managed and unmanaged device contexts.", "The changed context performs MFA, forwarding, consent, or data-access actions without a fresh authentication."],
    investigationSteps: ["Resolve token issuance, refresh, and strong-authentication events for the session.", "Compare device identity, compliance, IP, ASN, user agent, and client application before and after the change.", "Inspect endpoint credential-store access and all sensitive SaaS actions from the replayed context."],
    escalationConditions: ["The token appears on an unknown device and performs sensitive actions.", "The user denies the context and endpoint evidence suggests cookie access."],
    falsePositives: ["VDI pool reassignment", "Corporate proxy or VPN egress changes"], enrichment: ["token family", "conditional-access result", "device ownership", "session revocation status"],
    detectionStrategy: "Join identity and SaaS records on session or token identifiers, score incompatible context transitions, and require an independently logged downstream action for escalation.",
    queries: [{ title: "Session context discontinuity", description: "INCOMPATIBLE compares the captured issuance device, source network, and client user agent with literal fields on the later use; ENDPOINT_CREDENTIAL_EVENTS is an optional correlated endpoint lookup.", platform: "pseudocode", query: `FOR each session.id ORDER BY event.time
ISSUE = first(event WHERE event.action IN ("token_issue", "strong_auth"))
CAPTURE ISSUE_DEVICE_ID = device.id, ISSUE_SOURCE_IP = source.ip, ISSUE_CLIENT = client.user_agent
USE = later(event WHERE event.action = "resource_access")
RETURN USE WHERE INCOMPATIBLE(ISSUE_DEVICE_ID, device.id, ISSUE_SOURCE_IP, source.ip, ISSUE_CLIENT, client.user_agent)
  AND session.fresh_auth = false
ENRICH WITH event.action, event.result, ENDPOINT_CREDENTIAL_EVENTS` }],
    references: [refs.token], relatedHunts: ["distributed-password-spray", "inbox-rule-after-session-anomaly"],
  },
  {
    ...noInfrastructureContext,
    title: "OAuth Grant Followed by Mailbox Expansion", slug: "oauth-app-mailbox-expansion", family: "cross-domain",
    summary: "Correlate a new application credential or elevated consent with rapid access to previously untouched mailboxes.",
    hypothesis: "A compromised identity granted an OAuth application broad mail permissions that the application then used for collection or persistence.",
    rationale: "Application access can remain after the initiating user is remediated. Consent, credential changes, and mailbox reads should be evaluated as one lineage tied to the same app and service principal.",
    expectedBehavior: ["Approved applications have reviewed publishers, stable credentials, least-privilege scopes, and predictable mailbox populations."],
    severity: "critical", confidence: "high", scopes: ["identity", "saas", "email"], behaviors: ["privilege-change", "persistence", "data-movement"], temporalPatterns: ["stage-transition", "fan-out"], aiRoles: [],
    temporal: { interpretation: "Correlate consent or credential update to first mailbox access and growth in distinct mailboxes across the following days.", baseline: "Compare each application's mailbox breadth and API volume with its own approved workload and deployment calendar.", confounders: ["New backup or e-discovery rollout", "Planned certificate rotation", "Mail migration"] },
    evidence: [
      { claim: "Microsoft observed new OAuth applications, elevated Exchange application permission, and subsequent mailbox access in the Midnight Blizzard investigation.", sourceIds: ["research-midnight-2024"], kind: "observation" },
      { claim: "Editorial hypothesis: a high-privilege grant followed by access outside the application's reviewed mailbox set can indicate malicious persistence or collection.", sourceIds: ["research-midnight-2024"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "event.result", "actor.id", "application.id", "service_principal.id", "permission.scope", "credential.id", "mailbox.id", "api.operation"],
    limitations: ["Legitimate tenant-wide applications can read many mailboxes, and some providers delay consent or mailbox audit events."],
    techniques: ["T1098.003 Additional Cloud Roles", "T1114 Email Collection"], telemetry: { recommended: ["identity-audit", "email-audit", "saas-audit"], optional: [] },
    suspiciousBehavior: ["An unfamiliar actor grants app-only mailbox permissions or adds a service-principal credential.", "The app reaches mailboxes beyond its historical or reviewed scope."],
    investigationSteps: ["Validate publisher, owner, consent actor, requested scopes, credential creation, and change approval.", "Enumerate mailbox access by the app before and after the grant and compare with the approved population.", "Review initiating-session risk, exported items, forwarding changes, and continued access after user remediation."],
    escalationConditions: ["Unapproved app-only permission is used successfully.", "The app reads sensitive mailboxes or expands after a suspicious credential change."],
    falsePositives: ["Approved e-discovery or backup deployment", "Tenant migration"], enrichment: ["publisher verification", "app owner", "mailbox sensitivity", "credential thumbprint", "consent workflow"],
    detectionStrategy: "Build application lineage from consent and credential events to mailbox operations, then compare accessed mailbox sets with reviewed entitlements and historical use.",
    queries: [{ title: "Consent-to-mailbox sequence", description: "Application lineage across identity and email audits; APPROVED_MAILBOX_SCOPE is the reviewed mailbox boundary for each application.", platform: "pseudocode", query: `SEQUENCE BY application.id WITHIN 3d
  grant WHERE permission.scope IN HIGH_RISK_MAIL_SCOPES
  mailbox_use WHERE api.operation IN ("read", "sync", "export") AND event.result = "success"
CALCULATE DISTINCT_MAILBOXES, TIME_BETWEEN FROM mailbox.id
RETURN WHERE mailbox.id NOT IN APPROVED_MAILBOX_SCOPE(application.id)` }],
    references: [refs.midnight], relatedHunts: ["saas-bulk-export-after-consent", "inbox-rule-after-session-anomaly"],
  },
  {
    ...noInfrastructureContext,
    title: "SaaS Bulk Export After Permission Change", slug: "saas-bulk-export-after-consent", family: "cross-domain",
    summary: "Detect bulk SaaS exports by a user or application soon after a permission, consent, or sharing expansion.",
    hypothesis: "A newly privileged SaaS identity is using its expanded access to enumerate and export data beyond its established business role.",
    rationale: "Bulk export is common for backup and analytics, but a stage transition from new permission to unfamiliar object discovery and export narrows the question to a specific actor and authorization path.",
    expectedBehavior: ["Export identities, destinations, object classes, schedules, and approval records remain stable for each sanctioned integration."],
    severity: "high", confidence: "medium", scopes: ["saas", "data-stores"], behaviors: ["privilege-change", "data-movement"], temporalPatterns: ["burst", "stage-transition"], aiRoles: [],
    temporal: { interpretation: "Measure event-time latency from permission change to first export and compare export size with that identity's matched workload periods.", baseline: "Separate interactive users, backup applications, migrations, and analytics jobs before calculating item or byte percentiles.", confounders: ["Legal hold", "Data migration", "Disaster-recovery export", "Month-end reporting"] },
    evidence: [
      { claim: "Microsoft reports elevated OAuth application permissions followed by application access to mailboxes in its Midnight Blizzard investigation.", sourceIds: ["research-midnight-2024"], kind: "observation" },
      { claim: "Editorial hypothesis: an unreviewed permission expansion followed quickly by a new export destination warrants investigation across SaaS products.", sourceIds: ["research-midnight-2024", "research-snowflake-2024"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "event.result", "tenant.id", "actor.id", "permission.grantee_id", "permission.grantee_type", "permission.resource_scope", "principal.id", "principal.type", "resource.service_id", "resource.id", "permission.before", "permission.after", "object.type", "object.count", "transfer.bytes", "export.destination"],
    limitations: ["SaaS audit and the authoritative identity/entitlement directory must identify the grant recipient and exporting principal within tenant, service, and resource boundaries. Missing or ambiguous identity mappings remain unknown; an administrator's later export does not establish recipient use.", "Providers may summarize exports or omit bytes; a high count cannot establish what content left the tenant. Incomplete export logging leaves exercise of the grant unknown."],
    techniques: ["T1530 Data from Cloud Storage"], telemetry: { recommended: ["saas-audit"], optional: ["identity-audit", "data-audit", "cloud-audit"] },
    suspiciousBehavior: ["A new permission or sharing scope precedes discovery and export of unfamiliar object classes.", "An interactive identity creates an export destination normally used only by managed applications."],
    investigationSteps: ["Resolve the permission diff, grant initiator, affected user or application principal, approval, and tenant/service/resource boundary through authoritative identity records.", "Match the exporter to the recipient and reconstruct searches, previews, export completion, object counts, bytes, and destination ownership; retain unresolved mappings for review.", "Compare with the recipient's historical exports and confirm the business owner expected both scope and timing."],
    escalationConditions: ["The grant or destination is unapproved and export completed.", "Sensitive records were accessed by an unfamiliar application."],
    falsePositives: ["Approved tenant migration", "New backup integration"], enrichment: ["data classification", "destination tenant", "grant ticket", "app publisher", "export checksum"],
    detectionStrategy: "Correlate permission diffs with completed exports by the affected principal within the granted tenant, service, and resource scope. Preserve the grant initiator as context and keep unknown identity or coverage cases separate from verified recipient use.",
    queries: [{ title: "Permission-to-export transition", description: "Cross-SaaS pseudocode: AUTHORITATIVE_PRINCIPAL maps a tenant-scoped typed user or application/service-principal ID to the same canonical identity using event-time directory records; missing, ambiguous, or delegated identities require verified mapping and remain unknown otherwise. Interactive users need no application ID. RESOURCE_IN_SCOPE checks the exported resource against the grant's service/resource scope. APPROVED_DESTINATIONS is the sanctioned export set for that recipient's workload class. EXPORT_COVERAGE and UNRESOLVED_EXPORT_CANDIDATES come from the audit coverage inventory and same-boundary candidate review for the forward 72h window; unresolved candidates are not attached as recipient exports.", platform: "pseudocode", query: `FOR each permission_change WHERE expands_scope(permission.before, permission.after)
CAPTURE GRANT_TIME = event.time, GRANT_ACTOR = actor.id, GRANT_TENANT = tenant.id
CAPTURE GRANT_SERVICE = resource.service_id, GRANTED_SCOPE = permission.resource_scope
CAPTURE GRANTEE = AUTHORITATIVE_PRINCIPAL(tenant.id, permission.grantee_type, permission.grantee_id, GRANT_TIME)
LEFT JOIN export ON GRANTEE IS NOT NULL AND tenant.id = GRANT_TENANT
  AND resource.service_id = GRANT_SERVICE AND RESOURCE_IN_SCOPE(resource.id, GRANTED_SCOPE)
  AND AUTHORITATIVE_PRINCIPAL(tenant.id, principal.type, principal.id, event.time) = GRANTEE
  AND event.time > GRANT_TIME AND event.time <= GRANT_TIME + 72h AND event.result = "success"
EXPORT_STATUS = CASE
  WHEN export IS PRESENT THEN "verified_recipient_export"
  WHEN GRANTEE IS MISSING OR GRANT_TENANT IS MISSING OR GRANT_SERVICE IS MISSING OR GRANTED_SCOPE IS MISSING OR UNRESOLVED_EXPORT_CANDIDATES IS MISSING OR UNRESOLVED_EXPORT_CANDIDATES THEN "unknown_identity_or_scope"
  WHEN EXPORT_COVERAGE IS MISSING OR EXPORT_COVERAGE != "sufficient" THEN "unknown_export_coverage"
  ELSE "no_recipient_export_in_covered_window"
RETURN ALL GRANT_ACTOR, GRANTEE, GRANT_TENANT, GRANT_SERVICE, GRANTED_SCOPE, EXPORT_STATUS, object.count, transfer.bytes, export.destination
PRIORITIZE verified_recipient_export WHERE export.destination NOT IN APPROVED_DESTINATIONS` }],
    references: [refs.midnight, refs.snowflake], relatedHunts: ["oauth-app-mailbox-expansion", "data-warehouse-discovery-export"],
  },
  {
    ...noInfrastructureContext,
    title: "Inbox Rule After Session Anomaly", slug: "inbox-rule-after-session-anomaly", family: "cross-domain",
    summary: "Link risky or discontinuous sessions to mailbox rules that hide, redirect, or delete messages.",
    hypothesis: "A replayed session created an inbox rule or forwarding target to retain access to communications or conceal follow-on fraud.",
    rationale: "Rules can be legitimate and low volume. Their meaning changes when an anomalous session creates a predicate targeting financial, security, or reply traffic and later mail activity matches the rule.",
    expectedBehavior: ["User-created rules reflect established destinations and are made from recognized sessions; administrative forwarding follows a documented workflow."],
    severity: "high", confidence: "high", scopes: ["email", "identity"], behaviors: ["persistence", "evidence-tampering"], temporalPatterns: ["stage-transition"], aiRoles: [],
    temporal: { interpretation: "Order session anomaly, rule creation, matching-message arrival, and outbound reply using event time while retaining ingest delays.", baseline: "Compare rule predicates, actions, destination domains, and creation context with each mailbox's history.", confounders: ["User mail cleanup", "Help-desk rule repair", "Approved forwarding during leave"] },
    evidence: [
      { claim: "Microsoft describes risky sign-in or session replay followed by mailbox-rule creation as an observed and recommended correlation in token-theft and AiTM investigations.", sourceIds: ["research-token-2022", "research-aitm-2023"], kind: "observation" },
      { claim: "Editorial hypothesis: a novel rule that suppresses security or financial messages after a context-discontinuous session may support persistence or concealment.", sourceIds: ["research-aitm-2023"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "mailbox.id", "actor.id", "session.id", "session.risk", "source.ip", "device.id", "rule.id", "rule.predicate", "rule.action", "forward.destination"],
    limitations: ["Rule text may be localized or partially logged, and mobile or delegated clients can create rules through unfamiliar contexts. T1114.003 applies to forwarding for collection; delete, move, and mark-read concealment actions need separate action-specific assessment and are not automatically mapped to that technique."],
    techniques: ["T1114.003 Email Forwarding Rule"], telemetry: { recommended: ["email-audit", "identity-audit"], optional: ["saas-audit"] },
    suspiciousBehavior: ["A risky or replay-like session creates a delete, move, mark-read, or external-forward rule.", "Subsequent messages matching financial or security terms are acted on by the new rule."],
    investigationSteps: ["Recover the complete rule predicate, action, destination, creator, and session.", "Review authentication, device, MFA, token, delegation, and administrator context around creation.", "Trace matched messages, outbound replies, forwarding delivery, and any MFA or consent changes."],
    escalationConditions: ["User denies the rule and it moved or forwarded sensitive messages.", "The same session changed authentication methods or sent fraudulent mail."],
    falsePositives: ["Documented delegate setup", "User-created travel or leave processing"], enrichment: ["message sensitivity", "destination age", "session risk", "delegation", "rule match count"],
    detectionStrategy: "Join rule changes to identity sessions and later matched-message actions; prioritize external destinations, concealment verbs, sensitive predicates, and denied user intent.",
    queries: [{ title: "Risky session to rule creation", description: "Ordered identity and mailbox correlation; CONTEXT_DISCONTINUITY compares device ID, source network, and client context with the session's issuance record.", platform: "pseudocode", query: `SEQUENCE BY mailbox.id WITHIN 4h
  session WHERE session.risk != "normal" OR CONTEXT_DISCONTINUITY = true
  rule_change WHERE rule.action IN ("delete", "move", "mark_read", "forward_external")
JOIN later_message_actions ON rule.id
RETURN session, rule_change, MATCHED_MESSAGE_COUNT, forward.destination` }],
    references: [refs.token, refs.aitm], relatedHunts: ["token-replay-new-device", "trusted-vendor-phishing-propagation"],
  },
  {
    ...noInfrastructureContext,
    title: "Trusted Vendor Mailbox Starts Phishing Propagation", slug: "trusted-vendor-phishing-propagation", family: "cross-domain",
    summary: "Detect a previously trusted sender shifting from normal correspondence to repeated lure delivery and follow-on account activity.",
    hypothesis: "A vendor mailbox was compromised and is being used to propagate phishing through established trust relationships.",
    rationale: "Sender reputation alone becomes misleading after compromise. Compare the mailbox's recipient graph, subject and URL patterns, reply behavior, and session context with its prior business conversations.",
    expectedBehavior: ["Vendor mail follows known counterpart relationships, topics, volumes, and sending clients without synchronized links to unrelated recipients."],
    severity: "high", confidence: "medium", scopes: ["email", "saas"], behaviors: ["trust-boundary", "new-relationships"], temporalPatterns: ["burst", "fan-out"], aiRoles: [],
    temporal: { interpretation: "Compare recipient fan-out and repeated lure timing to the sender's own historical conversations; speed is neither necessary nor sufficient.", baseline: "Build vendor-specific recipient, subject, URL-domain, and client baselines by business calendar.", confounders: ["Marketing campaigns", "Emergency vendor notices", "Billing platform migration"] },
    evidence: [
      { claim: "Microsoft observed phishing sent from a compromised trusted vendor and later outbound propagation from additional compromised organizations.", sourceIds: ["research-aitm-2023"], kind: "observation" },
      { claim: "Editorial hypothesis: a trusted sender reaching novel recipients with repeated redirect patterns and a changed session context may be propagating compromise.", sourceIds: ["research-aitm-2023"], kind: "hypothesis" },
    ],
    requiredFields: ["event.time", "message.id", "sender.id", "recipient.id", "conversation.id", "url.domain", "auth.result", "client.id", "session.id", "delivery.result"],
    limitations: ["Content inspection may be restricted, and legitimate mass communications can resemble recipient fan-out."],
    techniques: ["T1566.002 Spearphishing Link"], telemetry: { recommended: ["email-audit"], optional: ["identity-audit", "saas-audit"] },
    suspiciousBehavior: ["A vendor sender reaches a new cross-company recipient set with templated subjects or redirect domains.", "The sender's session, forwarding, or MFA context changed shortly before the mail burst."],
    investigationSteps: ["Compare recipient and conversation graphs with the sender's prior 30–90 days.", "Resolve URL redirect chains safely through security tooling and review message authentication and delivery changes.", "Contact the vendor through an established channel and trace clicks, token anomalies, and downstream sends."],
    escalationConditions: ["The vendor confirms compromise or recipients show linked session theft.", "Messages contain an unapproved credential flow and span multiple trusted relationships."],
    falsePositives: ["Planned vendor bulletin", "New invoicing or campaign platform"], enrichment: ["vendor owner", "URL age", "message authentication", "click telemetry", "recipient relationship"],
    detectionStrategy: "Model sender relationship and URL novelty, then correlate fan-out with identity or mailbox changes and recipient-side effects.",
    queries: [{ title: "Trusted-sender relationship drift", description: "Mailbox-centric graph and sequence logic; TRUSTED_VENDORS and SENDER_BASELINE_P99 are derived from approved relationships and matched historical campaigns.", platform: "pseudocode", query: `FOR each sender.id IN TRUSTED_VENDORS WINDOW event.time 2h
CALCULATE DISTINCT_RECIPIENTS, PERCENT_NEW_RECIPIENTS, REPEATED_URL, CLIENT_CHANGE FROM recipient.id, url.domain, client.id
JOIN identity_audit ON sender.id, session.id WITHIN 24h
RETURN WHERE PERCENT_NEW_RECIPIENTS > SENDER_BASELINE_P99 AND REPEATED_URL AND CLIENT_CHANGE` }],
    references: [refs.aitm], relatedHunts: ["inbox-rule-after-session-anomaly", "distributed-password-spray"],
  },
];

export const identityEmailSaasHunts = defineExpandedHunts(seeds);
