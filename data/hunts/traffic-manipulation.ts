import { defineHunts, references, type HuntSeed } from "@/data/hunts/shared";

const seeds: HuntSeed[] = [
  {
    title: "Unexpected GRE Tunnel",
    slug: "unexpected-gre-tunnel",
    family: "traffic-manipulation",
    summary: "Detect new GRE encapsulation from infrastructure devices to unauthorized tunnel endpoints.",
    hypothesis: "An edge or internal infrastructure device is encapsulating traffic with GRE toward an endpoint outside the approved tunnel inventory, indicating covert redirection, traffic collection, inspection bypass, persistence, or an unauthorized overlay.",
    rationale: "GRE has no port and can carry many network-layer payloads, so port-centric monitoring can overlook it. Legitimate GRE endpoint pairs, selected routes, ACLs, and purposes should be explicit and stable. An appliance suddenly originating IP protocol 47 to a new endpoint is particularly significant when configuration changes select customer or management traffic, outbound encapsulated bytes rise, or the endpoint is external. Independent upstream flow and packet evidence remains essential because the device can hide its own tunnel state.",
    expectedBehavior: ["GRE tunnel source and destination pairs, keepalive behavior, routes, ACLs, and carried networks match an approved design.", "Change records explain tunnel creation, endpoint changes, and selected traffic."],
    severity: "critical",
    confidence: "high",
    planes: ["control", "data"],
    devices: ["firewall", "router", "switch", "vpn-gateway"],
    protocols: ["GRE", "VXLAN"],
    techniques: ["T1572 Protocol Tunneling", "T1090 Proxy", "T1565.002 Transmitted Data Manipulation", "T1041 Exfiltration Over C2 Channel"],
    telemetry: { recommended: ["netflow-ipfix", "configuration-diffs", "packet-capture"], optional: ["cli-audit", "zeek", "syslog"] },
    suspiciousBehavior: ["IP protocol 47 appears between an infrastructure source and a new or unapproved endpoint.", "New tunnel interfaces, routes, ACLs, or policy selectors direct sensitive traffic into GRE.", "Encapsulated byte volume or inner traffic is inconsistent with the documented service."],
    investigationSteps: [
      "Confirm the outer source and destination, initiator, IP protocol 47 classification, first seen time, duration, and bytes using upstream telemetry.",
      "Map both tunnel endpoints to owners, sites, routing domains, interfaces, NAT, ASN, geography, and approved tunnel inventory.",
      "Review configuration diffs for tunnel interfaces, source addresses, destinations, keepalives, routes, VRFs, ACLs, policy routing, or mirroring.",
      "Identify the account, administrative source, command or API operation, commit time, and change ticket responsible for related state.",
      "Inspect a lawful independent packet sample to validate GRE headers, keys or sequence fields, inner address families, and carried traffic classes.",
      "Measure the inner source/destination scope and determine whether management, authentication, customer, or other sensitive traffic is selected.",
      "Search for endpoint changes, parallel IPsec/VPN sessions, new external destinations, logging suppression, or packet-capture activity.",
      "Compare running state and boot configuration with the trusted baseline and verify whether the tunnel survives reload or failover.",
      "Preserve configuration, flow, packet, AAA, and CLI evidence before approved containment changes the tunnel path.",
    ],
    escalationConditions: [
      "The endpoint pair, tunnel interface, route, or selecting ACL is absent from the approved design and change record.",
      "The external endpoint is malicious, actor-controlled, newly registered, or unrelated to an authorized provider.",
      "The tunnel carries management, authentication, customer, mirrored, or otherwise sensitive traffic outside its intended path.",
      "GRE creation follows suspicious privileged access, packet capture, configuration export, or telemetry suppression.",
      "Independent telemetry observes encapsulation that the device configuration or logs do not acknowledge.",
    ],
    falsePositives: ["A provider migration, DDoS scrubbing service, SD-WAN overlay, lab, or emergency engineering tunnel was approved but not yet inventoried.", "Asymmetric routing or exporter sampling records only one side of an established approved tunnel.", "A platform reports another encapsulation or keepalive as GRE and requires packet-level confirmation."],
    enrichment: ["Tunnel owner, business purpose, endpoint/ASN, route and ACL selectors, inner prefixes, change ticket, device role, and peer-group state.", "Outer/inner byte counts, GRE key or sequence behavior, packet header validation, AAA identity, configuration commit, and persistence across reload."],
    detectionStrategy: "Inventory approved GRE pairs with device, interface, outer endpoints, routes, selectors, and active periods. Compare IP protocol 47 flows and configuration state against that inventory, prioritize new external endpoints or high-value inner traffic, and corroborate with independent packets so port-based assumptions or device-local omissions do not hide the tunnel.",
    queries: [
      {
        title: "GRE outside approved tunnel pairs",
        description: "Example Splunk correlation over normalized IPFIX protocol numbers and a local tunnel inventory.",
        platform: "splunk",
        query: `index=network ip_protocol=47
| lookup network_assets ip AS src_ip OUTPUT asset_type AS src_type device_id AS src_device
| where src_type IN ("firewall", "router", "switch", "vpn_gateway")
| lookup approved_tunnels device_id AS src_device outer_destination AS dest_ip tunnel_type AS "GRE" OUTPUT tunnel_id approval_status
| where isnull(tunnel_id) OR approval_status!="approved"
| stats count sum(bytes_out) AS encapsulated_bytes earliest(_time) AS first_seen latest(_time) AS last_seen by src_device src_ip dest_ip
| sort - encapsulated_bytes`,
      },
      {
        title: "New GRE endpoint with configuration context",
        description: "Example KQL over normalized session and configuration-change tables.",
        platform: "kql",
        query: `NetworkSession
| where IpProtocolNumber == 47 and SourceAssetType in ("firewall", "router", "switch", "vpn-gateway")
| where ApprovedTunnel == false
| summarize Sessions=count(), EncapsulatedBytes=sum(BytesSent), FirstSeen=min(TimeGenerated), LastSeen=max(TimeGenerated) by DeviceId, SourceIp, DestinationIp
| join kind=leftouter (InfrastructureConfigChange | where ChangeCategory in ("tunnel", "route", "acl", "policy-routing") | summarize Changes=make_set(ChangeSummary), Actors=make_set(Actor) by DeviceId) on DeviceId
| order by EncapsulatedBytes desc`,
      },
    ],
    references: [references.ncscEdgeRouters, references.mitreProtocolTunneling],
    relatedHunts: ["new-ipsec-tunnel", "management-acl-modified", "packet-capture-followed-by-file-transfer"],
    behaviorComparison: {
      expected: {
        title: "Approved tunnel path",
        nodes: [{ id: "gateway", label: "Managed gateway" }, { id: "peer", label: "Approved GRE peer" }],
        edges: [{ source: "gateway", target: "peer", label: "Inventoried GRE pair and routes" }],
        textAlternative: ["A managed gateway exchanges GRE only with an approved peer using inventoried routes and traffic selectors."],
      },
      suspicious: {
        title: "Covert GRE redirection",
        nodes: [{ id: "device", label: "Compromised edge device" }, { id: "actor", label: "Unauthorized external endpoint" }],
        edges: [{ source: "device", target: "actor", label: "Encapsulates selected traffic" }],
        textAlternative: ["A compromised edge device encapsulates selected traffic in GRE and redirects it to an unauthorized external endpoint."],
      },
    },
  },
  {
    title: "New IPsec Tunnel",
    slug: "new-ipsec-tunnel",
    family: "traffic-manipulation",
    summary: "Find new IPsec peers or security associations outside approved site and remote-access designs.",
    hypothesis: "An infrastructure gateway has established IKE or IPsec security associations with a new peer, identity, selector set, or routed network, indicating unauthorized encrypted persistence, inspection bypass, or covert access into protected segments.",
    rationale: "Approved IPsec relationships are defined by peer identity, certificate or key, cryptographic proposal, traffic selectors, routes, and business owner. A new peer can create trusted encrypted reachability that perimeter inspection cannot see, even when the cryptography itself is healthy and authentication succeeds.",
    expectedBehavior: ["Named gateways establish IPsec only with inventoried site, partner, or remote-access peers and approved selectors."],
    severity: "critical",
    confidence: "high",
    planes: ["control", "data"],
    devices: ["firewall", "router", "vpn-gateway"],
    protocols: ["IPsec", "WireGuard", "OpenVPN"],
    techniques: ["T1572 Protocol Tunneling", "T1133 External Remote Services", "T1090 Proxy"],
    telemetry: { recommended: ["configuration-diffs", "netflow-ipfix", "syslog"], optional: ["aaa", "cli-audit", "packet-capture"] },
    suspiciousBehavior: ["IKE UDP/500 or 4500, ESP IP/50, or new VPN state uses an unknown peer or identity.", "Selectors, routes, or allowed networks expose segments not present in the approved design."],
    investigationSteps: ["Inventory the outer peer addresses, authenticated identities, certificates or keys, proposals, and first establishment time.", "Compare tunnel state, selectors, routes, NAT exemptions, and allowed networks with the approved VPN design.", "Review configuration commits and AAA/CLI evidence for the actor and management source.", "Measure encrypted byte directions, session continuity, rekeys, and internal networks reached through the tunnel.", "Check for parallel GRE, WireGuard, OpenVPN, ACL, resolver, or logging changes."],
    escalationConditions: ["The peer, identity, key, selector, or routed network is unapproved and the tunnel established successfully.", "The tunnel exposes management or sensitive networks, persists without a ticket, or conflicts with device-local evidence."],
    falsePositives: ["A planned partner, site migration, disaster-recovery exercise, or dynamic remote-access address changes the observed peer.", "NAT traversal or a provider gateway changes the outer endpoint while the authenticated identity remains approved."],
    enrichment: ["IKE identity, certificate, cryptographic suite, selectors, routed prefixes, NAT, tunnel owner, bytes, rekey cadence, configuration actor, and reachable assets."],
    detectionStrategy: "Join IKE/IPsec session and configuration state to an approved tunnel inventory keyed by gateway, peer identity, certificate or key, selectors, and active dates. Alert on new authenticated relationships or expanded networks rather than relying only on UDP ports or changing outer addresses.",
    queries: [{ title: "Unknown encrypted tunnel relationship", description: "Abstract control-plane and configuration comparison for IPsec and related VPNs.", platform: "pseudocode", query: `FOR each vpn_security_association WHERE gateway.asset_class = "network_infrastructure"
LOOKUP approved_tunnel BY gateway.device_id, peer.authenticated_identity, tunnel.type
RETURN association WHERE approved_tunnel is missing OR association.selectors NOT WITHIN approved_tunnel.selectors OR association.routes NOT WITHIN approved_tunnel.routes
ENRICH WITH bytes, duration, rekeys, configuration_actor` }],
    references: [references.cisaRouters, references.mitreProtocolTunneling],
    relatedHunts: ["unexpected-gre-tunnel", "management-acl-modified", "infrastructure-telemetry-gap"],
  },
  {
    title: "Logging Destination Modified",
    slug: "logging-destination-modified",
    family: "traffic-manipulation",
    summary: "Detect device logging redirected, removed, weakened, or pointed to an unauthorized collector.",
    hypothesis: "A privileged change has modified an infrastructure device's external logging destinations, source interface, transport, severity filter, or facility, indicating evidence suppression, redirection to an actor-controlled collector, or preparation for concealed follow-on activity.",
    rationale: "External logging is a critical independent control for devices with limited endpoint monitoring. Removing a collector, changing the source path, lowering verbosity, or redirecting events can create a believable silence while an attacker operates. Configuration state and collector receipt telemetry must be evaluated together because either side alone can be incomplete.",
    expectedBehavior: ["Devices send required facilities and severities to redundant approved collectors over a protected management path."],
    severity: "critical",
    confidence: "high",
    planes: ["management"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["SSH", "HTTPS", "NETCONF", "RESTCONF"],
    techniques: ["T1562.001 Impair Defenses", "T1070 Indicator Removal", "T1059.008 Network Device CLI"],
    telemetry: { recommended: ["configuration-diffs", "syslog", "cli-audit"], optional: ["aaa", "netflow-ipfix", "packet-capture"] },
    suspiciousBehavior: ["An approved collector is removed or replaced, or severity/facility filters are reduced.", "Collector receipts stop or shift source identity after a privileged configuration change."],
    investigationSteps: ["Compare running and intended logging configuration with the trusted baseline.", "Identify the commit, account, administrative source, command/API action, and ticket.", "Confirm collector reachability and last-received event independently of device status.", "Enrich any new destination and determine whether it actually received logs.", "Correlate the change with other authentication, discovery, tunnel, ACL, or egress activity."],
    escalationConditions: ["The change is unauthorized, removes independent evidence, or redirects logs to an unapproved endpoint.", "A receipt gap overlaps suspicious device activity or device-local records conflict with collector evidence."],
    falsePositives: ["A planned SIEM migration, collector failover, severity tuning, or source-interface change was not yet reflected in the baseline.", "Transport failure or parser changes create an apparent receipt gap without device configuration tampering."],
    enrichment: ["Before/after configuration, collector ownership and receipts, transport protection, facilities, severity filters, source interface, AAA actor, and concurrent anomalies."],
    detectionStrategy: "Diff logging configuration against approved redundant collectors and independently monitor heartbeat or receipt continuity per device. Correlate destination, source-interface, transport, facility, and severity changes with the administrative identity and any ensuing gap or conflicting network evidence.",
    queries: [{ title: "Logging control drift", description: "Vendor-neutral configuration and collector-receipt correlation.", platform: "pseudocode", query: `FOR each infrastructure_device
CONFIG_DRIFT = diff(current.logging_destinations, approved.logging_destinations) OR diff(current.log_filters, approved.log_filters)
RECEIPT_GAP = collector.last_event(device.id) older than expected_heartbeat(device.role)
RETURN device WHERE CONFIG_DRIFT OR RECEIPT_GAP
ENRICH WITH configuration_actor, new_destination, changed_transport, concurrent_suspicious_activity` }],
    references: [references.ghostRouter, references.arcaneDoor],
    relatedHunts: ["infrastructure-telemetry-gap", "management-acl-modified", "new-aaa-destination"],
  },
  {
    title: "Infrastructure Telemetry Gap",
    slug: "infrastructure-telemetry-gap",
    family: "traffic-manipulation",
    summary: "Detect unexplained silence or contradictions between appliance telemetry and independent sensors.",
    hypothesis: "An infrastructure device's expected flow, log, AAA, configuration, audit, or time telemetry has stopped or diverged from independent observations, indicating deliberate suppression, collector redirection, device impairment, or a blind spot being used for follow-on activity.",
    rationale: "A compromised appliance can lie by omission. Regular collector heartbeats and cross-source expectations make silence observable: upstream flows may show sessions while device logs remain empty, AAA may show administration without commands, or configuration management may lose contact immediately before unusual traffic. The contradiction is often more important than any single missing event.",
    expectedBehavior: ["Independent collectors receive timely, consistent flow, syslog, AAA, configuration, audit, and time evidence appropriate to each device role."],
    severity: "critical",
    confidence: "medium",
    planes: ["management", "control", "data"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["NTP", "BGP", "OSPF", "HTTPS"],
    techniques: ["T1562.001 Impair Defenses", "T1070 Indicator Removal"],
    telemetry: { recommended: ["netflow-ipfix", "configuration-diffs", "syslog"], optional: ["aaa", "cli-audit", "zeek", "packet-capture", "dns"] },
    suspiciousBehavior: ["A normally continuous device feed becomes silent outside maintenance.", "Independent flow or packet evidence shows activity missing from device-controlled logs.", "Multiple feeds drift after a privileged change, reboot, or time-source modification."],
    investigationSteps: ["Establish the last good event and first missing interval for every expected telemetry source.", "Check collector health, network path, parser, certificate, retention, and platform-wide ingestion incidents.", "Compare the affected device with peer devices at the same site and role.", "Inspect configuration changes to logging, flow export, AAA accounting, audit, NTP, filters, and source interfaces.", "Correlate independent sessions, authentications, packet evidence, reboots, and follow-on changes during the gap."],
    escalationConditions: ["Independent sensors record sensitive device activity that device-controlled telemetry omits.", "The gap follows unauthorized privileged access or configuration drift and is isolated to the device."],
    falsePositives: ["Collector maintenance, transport failure, parser regression, certificate expiry, or site outage affects telemetry without compromise.", "A device upgrade or reboot legitimately interrupts feeds within an approved window."],
    enrichment: ["Collector health, peer feed status, clock offset, last/first event times, sequence gaps, config actor, maintenance window, and independent traffic graph."],
    detectionStrategy: "Define expected heartbeat and cross-source relationships per device role. Alert on statistically abnormal silence and contradictions such as observed upstream sessions without corresponding external logs, then suppress only when collector-wide health or an approved maintenance window explains the same interval.",
    queries: [{ title: "Cross-source device silence", description: "Abstract heartbeat and contradiction analysis across independent collectors.", platform: "pseudocode", query: `FOR each infrastructure_device OVER 15m
EXPECTED = telemetry_contract(device.role)
OBSERVED = sources_with_recent_events(device.id)
INDEPENDENT_ACTIVITY = upstream_flow_or_packet_sessions(device.id)
RETURN device WHERE missing(EXPECTED, OBSERVED) is abnormal
   OR (INDEPENDENT_ACTIVITY exists AND device_controlled_logs are silent)
ENRICH WITH collector_health, peer_status, maintenance_window, configuration_changes` }],
    references: [references.ghostRouter, references.cisaVoltTyphoon],
    relatedHunts: ["logging-destination-modified", "unexpected-management-interface-egress", "unexpected-gre-tunnel"],
  },
  {
    title: "Management ACL Modified",
    slug: "management-acl-modified",
    family: "traffic-manipulation",
    summary: "Detect unauthorized changes that expand, redirect, or conceal access to infrastructure management services.",
    hypothesis: "A privileged change has altered a management ACL, control-plane filter, policy route, or interface binding to admit a new source, expose administration, select traffic for redirection, or remove defensive visibility.",
    rationale: "Management ACLs define who can reach privileged device services and often encode traffic selection for policing or mirroring. A small rule-order or object-group change can silently expose SSH, HTTPS, SNMP, or AAA paths, enable a new tunnel, or hide actor traffic. Effective policy must be calculated, not inferred from changed text alone.",
    expectedBehavior: ["Management access is restricted to named control points and changes only through reviewed, tested, and time-bounded workflows."],
    severity: "critical",
    confidence: "high",
    planes: ["management", "control", "data"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["SSH", "HTTPS", "NETCONF", "RESTCONF", "GRE"],
    techniques: ["T1562.004 Disable or Modify System Firewall", "T1059.008 Network Device CLI", "T1090 Proxy"],
    telemetry: { recommended: ["configuration-diffs", "cli-audit", "aaa"], optional: ["netflow-ipfix", "syslog", "packet-capture"] },
    suspiciousBehavior: ["A rule admits a new source or service to management addresses or changes precedence unexpectedly.", "An ACL or policy selects traffic for an unapproved tunnel, mirror, bypass, or external path."],
    investigationSteps: ["Compute the effective before/after policy including object groups, sequence, implicit rules, interface, direction, and VRF.", "Identify the account, management source, command/API action, commit, reviewer, and change ticket.", "Determine newly reachable services, source ranges, destinations, and affected devices.", "Check whether new sources attempted or established access before or after the change.", "Correlate with tunnel, routing, resolver, logging, packet-capture, and configuration-export activity."],
    escalationConditions: ["The change is unauthorized and expands access to privileged services or sensitive traffic.", "A newly admitted source connects successfully, or the rule selects traffic for an unapproved tunnel or bypass."],
    falsePositives: ["A planned management network migration, scanner addition, emergency access rule, or object-group cleanup changes effective policy.", "Automated policy compilation reorders equivalent rules without changing reachability."],
    enrichment: ["Semantic policy diff, newly reachable graph, object owners, rule hits, administrative identity, ticket, target criticality, and subsequent sessions."],
    detectionStrategy: "Perform semantic configuration diffs that calculate effective management reachability rather than matching line text. Prioritize new source-service paths, external or broad prefixes, deny removal, rule-order changes, tunnel selectors, and immediate use by newly permitted sources.",
    queries: [{ title: "Effective management policy expansion", description: "Vendor-neutral semantic diff over parsed ACL and management-service state.", platform: "pseudocode", query: `BEFORE = compute_effective_management_reachability(previous_configuration)
AFTER = compute_effective_management_reachability(current_configuration)
NEW_PATHS = AFTER MINUS BEFORE
RETURN NEW_PATHS WHERE destination.service IN (SSH, HTTPS, SNMP, NETCONF, RESTCONF) OR path.action IN (mirror, redirect, tunnel)
ENRICH WITH configuration_actor, ticket, rule_hits, observed_new_sessions` }],
    references: [references.ncscEdgeRouters, references.cisaRouters],
    relatedHunts: ["unexpected-gre-tunnel", "new-ipsec-tunnel", "logging-destination-modified"],
  },
];

export const trafficManipulationHunts = defineHunts(seeds);
