import { defineHunts, references, type HuntSeed } from "@/data/hunts/shared";

const seeds: HuntSeed[] = [
  {
    title: "Unexpected Management Interface Egress",
    slug: "unexpected-management-interface-egress",
    family: "management-plane-c2",
    showOriginMatters: true,
    summary: "Find infrastructure management addresses initiating sessions outside their approved dependency inventory.",
    hypothesis: "A firewall, router, switch, controller, load balancer, or VPN gateway is originating traffic from its management context to an unapproved destination, indicating command-and-control, collection, pivoting, or an unauthorized dependency.",
    rationale: "Infrastructure appliances normally accept administration and initiate only a narrow set of documented services such as AAA, DNS, time, logging, licensing, and updates. A session initiated from a management address is materially different from traffic merely forwarded through the device. Because privileged implants can suppress local logging, an unapproved device-originated connection observed by an upstream flow exporter or passive sensor is high-value independent evidence that the appliance itself may be acting as a client.",
    expectedBehavior: [
      "Administrators and controllers initiate sessions toward device management interfaces.",
      "Device-originated service traffic reaches inventoried AAA, DNS, NTP, logging, update, and controller destinations.",
    ],
    severity: "critical",
    confidence: "medium",
    planes: ["management"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["SSH", "HTTPS", "NETCONF", "RESTCONF", "SMB", "RDP", "WinRM"],
    techniques: ["T1071 Application Layer Protocol"],
    telemetry: {
      recommended: ["netflow-ipfix", "zeek", "configuration-diffs"],
      optional: ["dns", "aaa", "cli-audit", "packet-capture", "syslog"],
    },
    suspiciousBehavior: [
      "A management address initiates a session to a destination absent from the approved dependency inventory.",
      "The destination is external, newly registered, rare for the device role, or contacted with stable cadence.",
      "The appliance has no corresponding approved change, operator session, or documented service dependency.",
    ],
    investigationSteps: [
      "Confirm from flow direction and interface context that the appliance initiated the session rather than forwarded it.",
      "Identify the device, software release, management address, egress interface, routing instance, and operational owner.",
      "Compare the destination, port, protocol, and timing with the approved dependency inventory and recent change tickets.",
      "Resolve destination ownership, ASN, geography, reverse DNS, registration age, reputation, and prior enterprise prevalence.",
      "Pivot across independent NetFlow/IPFIX and Zeek records to establish first seen, cadence, bytes, TLS or SSH metadata, and peer scope.",
      "Review AAA and remote CLI accounting for sessions, accounts, commands, and automation identities immediately before first contact.",
      "Diff configuration, packages, processes, scheduled jobs, local users, certificates, and boot state against the trusted baseline.",
      "Check DNS, syslog, and packet evidence for related lookups, suppression gaps, transfers, tunnels, or secondary internal connections.",
      "Preserve off-device evidence and capture volatile device state through an approved incident-response procedure.",
    ],
    escalationConditions: [
      "The destination is unapproved and Internet-routable or associated with malicious infrastructure.",
      "The session is periodic, encrypted with an unknown fingerprint, long-lived, or followed by internal administration traffic.",
      "Configuration, process, package, account, or boot-integrity state differs from the trusted baseline without authorization.",
      "Device-local logs are absent or conflict with independent flow, DNS, AAA, or passive network observations.",
      "The device has an exposed management service, known vulnerable release, or related suspicious authentication activity.",
    ],
    falsePositives: [
      "A newly approved vendor update, licensing, certificate, telemetry, or controller service has not yet been entered in the dependency inventory.",
      "NAT, virtual routing, clustering, or exporter attribution makes forwarded traffic appear to originate from the device.",
      "A ticketed diagnostic or vendor-support session temporarily introduces an external destination.",
    ],
    enrichment: [
      "Asset role, management VRF, expected service dependencies, maintenance window, owner, exposure, and software support status.",
      "Passive TLS/SSH fingerprints, DNS history, certificate details, ASN, WHOIS, geolocation, reputation, and organization-wide prevalence.",
      "AAA identity, privileged commands, configuration commit metadata, integrity measurements, and independent packet evidence.",
    ],
    detectionStrategy: "Model every infrastructure device as a client with an explicit allowlist of destination, protocol, port, direction, and timing. Alert on device-initiated sessions absent from that model, then rank externality, destination novelty, cadence, volume, and independent corroboration without treating a management subnet alone as proof of device origin.",
    queries: [
      {
        title: "Unexpected infrastructure egress",
        description: "Example SPL over normalized device-originated management sessions: initiator=source and network_plane=management must be established from direction and interface evidence before ingestion. The dependency lookup must use src_ip, dest_ip, numeric dest_port, and lowercase transport (tcp/udp); approved must be true only for the complete authorized service relationship. Missing, false, or unknown approvals remain visible. Map these fields and asset roles to your environment.",
        platform: "splunk",
        query: `index=network initiator=source network_plane=management
| lookup network_assets ip AS src_ip
    OUTPUT asset_type AS src_type
| where src_type IN (
    "firewall",
    "router",
    "switch",
    "wireless_controller",
    "vpn_gateway",
    "load_balancer"
)
| eval transport=lower(transport)
| fields - dependency_approved
| lookup approved_infrastructure_dependencies
    src_ip
    dest_ip
    dest_port
    transport
    OUTPUT approved AS dependency_approved
| where coalesce(lower(trim(dependency_approved)), "false") != "true"
| stats
    count
    sum(bytes_out) AS bytes_out
    sum(bytes_in) AS bytes_in
    values(dest_port) AS dest_ports
    earliest(_time) AS first_seen
    latest(_time) AS last_seen
    by src_ip dest_ip
| sort count`,
      },
      {
        title: "Management clients outside the dependency model",
        description: "Example KQL over a locally normalized NetworkSession table with asset and dependency enrichment.",
        platform: "kql",
        query: `NetworkSession
| where SourceAssetType in ("firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway")
| where Initiator == "source" and NetworkPlane == "management"
| where ApprovedDependency == false
| summarize Sessions=count(), BytesOut=sum(BytesSent), FirstSeen=min(TimeGenerated), LastSeen=max(TimeGenerated), Ports=make_set(DestinationPort) by SourceIp, DestinationIp
| order by Sessions desc`,
      },
    ],
    references: [references.cisaRouters, references.arcaneDoor],
    relatedHunts: ["new-infrastructure-external-destination", "infrastructure-beaconing", "unexpected-ssh-egress"],
    behaviorComparison: {
      expected: {
        title: "Expected management dependency",
        nodes: [
          { id: "device", label: "Infrastructure device" },
          { id: "service", label: "Approved management service" },
        ],
        edges: [{ source: "device", target: "service", label: "Documented client dependency" }],
        textAlternative: ["The infrastructure device initiates only a documented service connection to an approved management dependency."],
      },
      suspicious: {
        title: "Unapproved device-originated egress",
        nodes: [
          { id: "device", label: "Infrastructure device" },
          { id: "external", label: "Unknown external destination" },
        ],
        edges: [{ source: "device", target: "external", label: "Unapproved management-origin session" }],
        textAlternative: ["An infrastructure device initiates a management-context session to an unknown external destination."],
      },
    },
  },
  {
    title: "New Infrastructure External Destination",
    slug: "new-infrastructure-external-destination",
    family: "management-plane-c2",
    showOriginMatters: true,
    summary: "Identify the first connection from an infrastructure asset to a previously unseen external endpoint.",
    hypothesis: "An infrastructure device has begun contacting an external destination that has no prior history for that device role or site, potentially exposing a new command channel, proxy path, unauthorized update service, or attacker-controlled relay.",
    rationale: "The external dependencies of infrastructure appliances are typically smaller and more stable than those of user endpoints. A first-seen destination is therefore a practical discovery signal, especially when it is rare across peer devices, lacks an approved business purpose, or appears after authentication or configuration anomalies.",
    expectedBehavior: ["External update, licensing, certificate, and cloud-controller destinations are documented and recur across comparable devices."],
    severity: "high",
    confidence: "medium",
    planes: ["management"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["HTTPS", "DNS", "NTP", "WireGuard", "OpenVPN"],
    techniques: ["T1071 Application Layer Protocol"],
    telemetry: { recommended: ["netflow-ipfix", "dns"], optional: ["zeek", "configuration-diffs", "syslog"] },
    suspiciousBehavior: ["The destination is new for the device and its peer group.", "The endpoint is external, low-prevalence, or contacted soon after a device change."],
    investigationSteps: [
      "Verify the source is a device-owned address and the session was initiated by the appliance.",
      "Determine first seen, last seen, frequency, volume, destination ports, and all devices contacting the endpoint.",
      "Compare the endpoint with vendor service documentation, proxy policy, dependency inventory, and approved changes.",
      "Enrich domain, certificate, ASN, hosting provider, registration history, reputation, and passive DNS.",
      "Inspect adjacent DNS, TLS, authentication, configuration, and file-transfer events for a causal sequence.",
    ],
    escalationConditions: ["No owner can validate the destination and it is external or newly registered.", "The connection repeats, transfers material volume, or coincides with configuration or authentication anomalies."],
    falsePositives: ["A vendor migrated a cloud endpoint or content-delivery address before the dependency catalog was updated.", "A planned support or diagnostic workflow introduced a short-lived external peer."],
    enrichment: ["Peer-group prevalence and 30/90-day destination history.", "Certificate, passive DNS, ASN, WHOIS, reputation, and change-ticket context."],
    detectionStrategy: "Maintain per-device and per-role destination history from independently collected flows. Emit first-seen external device-to-destination pairs, suppress known dependency changes for a bounded period, and prioritize pairs rare across the fleet or coupled to other appliance anomalies.",
    queries: [{
      title: "First-seen external device destination",
      description: "Vendor-neutral pseudocode using asset, flow-history, and external-address classifications.",
      platform: "pseudocode",
      query: `FOR each device_initiated_flow
WHERE source.asset_class = "network_infrastructure"
  AND destination.scope = "external"
  AND first_seen(source.device_id, destination.ip, lookback = 90d)
RETURN source.device_id, destination.ip, destination.port, first_seen, bytes_out, peer_group_prevalence`,
    }],
    references: [references.cisaRouters],
    relatedHunts: ["unexpected-management-interface-egress", "infrastructure-beaconing", "suspicious-infrastructure-dns"],
  },
  {
    title: "Infrastructure Beaconing",
    slug: "infrastructure-beaconing",
    family: "management-plane-c2",
    showOriginMatters: true,
    summary: "Detect regular low-volume callbacks initiated by network infrastructure to uncommon destinations.",
    hypothesis: "An infrastructure appliance is repeatedly initiating sessions to the same rare destination with unusually stable intervals, indicating automated command-and-control, an unauthorized tunnel keepalive, or compromised infrastructure serving as a relay.",
    rationale: "Interactive administration and appliance service checks usually follow change windows, operator activity, or recognizable vendor schedules. Malware and covert tunnels often trade throughput for persistence by calling the same endpoint at stable intervals. Timing alone is not proof, but stable cadence becomes powerful when the appliance is the true initiator, the peer is absent from the dependency model, the destination is rare across comparable devices, and passive fingerprints or device state also deviate.",
    expectedBehavior: ["Approved health checks, licensing, NTP, and controller traffic use documented destinations and recognizable schedules.", "Peer devices with the same role show comparable service cadence."],
    severity: "critical",
    confidence: "medium",
    planes: ["management", "data"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["HTTPS", "DNS", "WireGuard", "OpenVPN"],
    techniques: ["T1071.001 Web Protocols", "T1071.004 DNS", "T1572 Protocol Tunneling"],
    telemetry: { recommended: ["netflow-ipfix", "zeek"], optional: ["dns", "packet-capture", "configuration-diffs", "syslog"] },
    suspiciousBehavior: ["A device initiates many small sessions to one rare peer at near-constant intervals.", "The cadence continues outside maintenance windows and lacks an approved dependency.", "TLS, SSH, DNS, or UDP metadata is uncommon for the device role or peer group."],
    investigationSteps: [
      "Verify source ownership, initiator direction, network plane, and whether NAT or exporter behavior could misattribute forwarded traffic.",
      "Plot connection times and calculate interval count, median, dispersion, missed intervals, duration, and byte symmetry.",
      "Compare cadence against approved monitoring, licensing, NTP, VPN keepalive, routing, and controller schedules.",
      "Measure destination and fingerprint prevalence across devices of the same model, role, site, and software release.",
      "Enrich the destination with DNS history, certificate identity, ASN, hosting category, registration age, and threat intelligence.",
      "Pivot through Zeek connection, DNS, TLS, SSH, and tunnel metadata using shared connection identifiers and time windows.",
      "Review configuration, processes, packages, users, scheduled tasks, and boot integrity for an unexplained client or tunnel.",
      "Correlate first beacon with privileged authentication, configuration commit, exploit exposure, crash, upgrade, or telemetry gap.",
      "Capture independent packets long enough to observe multiple intervals without executing or replaying any content.",
    ],
    escalationConditions: [
      "The peer is unapproved, external, malicious, newly registered, or dedicated hosting with no documented purpose.",
      "Cadence is stable across hours or days and is absent from comparable peer devices.",
      "Passive fingerprints, packet structure, or byte patterns are incompatible with the claimed service.",
      "The first callback follows suspicious authentication, configuration change, exploit exposure, or logging suppression.",
      "Device integrity or running state reveals an unexplained process, package, account, tunnel, or persistence mechanism.",
    ],
    falsePositives: ["Health checks, controller heartbeats, VPN keepalives, NTP, telemetry exporters, and licensing agents can be highly periodic.", "Scheduled automation or monitoring from a newly deployed service may not yet be represented in the peer baseline."],
    enrichment: ["Inter-arrival statistics, byte ratios, JA4/JA3 or SSH fingerprints, DNS query sequence, and packet sizes.", "Role-based prevalence, dependency owner, maintenance context, destination ownership, and device integrity state."],
    detectionStrategy: "Group independently observed device-initiated flows by source and destination, calculate inter-arrival regularity over a sufficiently long window, and rank stable low-volume pairs by destination rarity, allowlist status, fingerprint rarity, and corroborating device changes. Exclude only a time-bounded, owner-validated service baseline.",
    queries: [
      {
        title: "Low-variance infrastructure callbacks",
        description: "Example KQL over normalized device-origin session intervals computed by the local ingestion pipeline.",
        platform: "kql",
        query: `InfrastructureSessionIntervals
| where SourceAssetType in ("firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway")
| where Initiator == "source" and ApprovedDependency == false
| summarize Sessions=count(), MedianInterval=percentile(IntervalSeconds, 50), IntervalDeviation=stdev(IntervalSeconds), BytesOut=sum(BytesSent) by SourceIp, DestinationIp, DestinationPort, bin(TimeGenerated, 24h)
| where Sessions >= 12 and IntervalDeviation <= MedianInterval * 0.15
| order by Sessions desc`,
      },
      {
        title: "Zeek connection cadence extraction",
        description: "Pseudocode over Zeek logs using standard conn.log fields before local interval analysis.",
        platform: "zeek",
        query: `zeek-cut -d ts id.orig_h id.resp_h id.resp_p proto duration orig_bytes resp_bytes < conn.log
| keep rows where id.orig_h belongs to the infrastructure address inventory
| group by id.orig_h, id.resp_h, id.resp_p, proto
| calculate ordered inter-arrival intervals, session count, byte totals, median interval, and interval deviation
| return groups with session_count >= 12 and interval_deviation <= median_interval * 0.15`,
      },
    ],
    references: [references.ghostRouter, references.cisaVoltTyphoon],
    relatedHunts: ["unexpected-management-interface-egress", "new-infrastructure-external-destination", "infrastructure-telemetry-gap"],
    behaviorComparison: {
      expected: {
        title: "Documented service cadence",
        nodes: [{ id: "device", label: "Infrastructure device" }, { id: "service", label: "Approved controller or service" }],
        edges: [{ source: "device", target: "service", label: "Known schedule and fingerprint" }],
        textAlternative: ["The device contacts an approved controller or service with a documented schedule and known protocol fingerprint."],
      },
      suspicious: {
        title: "Rare periodic callback",
        nodes: [{ id: "device", label: "Infrastructure device" }, { id: "peer", label: "Rare external peer" }],
        edges: [{ source: "device", target: "peer", label: "Stable low-volume intervals" }],
        textAlternative: ["The device repeatedly calls a rare external peer at stable low-volume intervals without an approved dependency."],
      },
    },
  },
  {
    title: "Suspicious Infrastructure DNS",
    slug: "suspicious-infrastructure-dns",
    family: "management-plane-c2",
    showOriginMatters: true,
    summary: "Surface rare, encoded, or operationally implausible DNS requests made on behalf of infrastructure devices.",
    hypothesis: "An infrastructure device is generating DNS requests with high-entropy labels, unusual record types, rare domains, or regular cadence that may carry command-and-control or exfiltration rather than normal dependency resolution.",
    rationale: "Network appliances usually resolve a compact and explainable set of vendor, controller, AAA, logging, and time dependencies. Rare domains, encoded labels, sustained NXDOMAINs, or unusual query volume can reveal a covert control channel, particularly when the resolver sees the appliance as the originating client and no recent configuration explains the names.",
    expectedBehavior: ["Devices query approved recursive resolvers for a stable set of documented dependency domains."],
    severity: "high",
    confidence: "medium",
    planes: ["management"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["DNS"],
    techniques: ["T1071.004 DNS"],
    telemetry: { recommended: ["dns", "netflow-ipfix"], optional: ["zeek", "configuration-diffs", "packet-capture"] },
    suspiciousBehavior: ["High-entropy or long subdomain labels recur from an appliance.", "Rare record types, NXDOMAIN responses, or regular query cadence have no operational explanation."],
    investigationSteps: ["Confirm the original client identity at the recursive resolver.", "Compare domains and record types with the device dependency inventory.", "Measure label length, entropy, cadence, NXDOMAIN rate, and peer prevalence.", "Enrich domains with passive DNS, registration, ASN, reputation, and certificate history.", "Correlate DNS activity with subsequent sessions, configuration changes, and authentication events."],
    escalationConditions: ["Queries contain encoded-looking changing labels to an unapproved domain.", "The domain is malicious or newly registered and resolves to a contacted endpoint."],
    falsePositives: ["Vendor telemetry, content delivery, captive checks, or certificate validation can generate uncommon names.", "A resolver migration can temporarily alter client attribution or query patterns."],
    enrichment: ["Domain age, authoritative infrastructure, passive DNS, response IPs, label entropy, and cross-device prevalence."],
    detectionStrategy: "Baseline domains and record types per infrastructure role at the recursive resolver, then prioritize rare high-entropy labels, sustained failures, unexpected dynamic-DNS providers, and regular query intervals that resolve to subsequent device-originated sessions.",
    queries: [{ title: "Rare encoded infrastructure DNS", description: "Abstract resolver analysis over attributed infrastructure clients.", platform: "pseudocode", query: `FOR each dns_query WHERE client.asset_class = "network_infrastructure"
CALCULATE domain_prevalence, label_entropy, label_length, query_cadence, nxdomain_ratio
RETURN queries WHERE approved_domain = false AND (label_entropy is high OR record_type is rare OR query_cadence is regular OR nxdomain_ratio is elevated)` }],
    references: [references.microsoftDnsHijacking, references.cisaRouters],
    relatedHunts: ["alternate-dns-resolver", "infrastructure-beaconing", "new-infrastructure-external-destination"],
  },
  {
    title: "Alternate DNS Resolver",
    slug: "alternate-dns-resolver",
    family: "management-plane-c2",
    showOriginMatters: true,
    summary: "Find appliances bypassing approved recursive resolvers or accepting an unauthorized resolver configuration.",
    hypothesis: "An infrastructure device is sending DNS directly to an unapproved resolver, indicating resolver hijacking, configuration tampering, policy bypass, or a covert channel that avoids enterprise DNS visibility.",
    rationale: "Infrastructure resolver paths should be explicit and stable. Direct DNS from an appliance to a public or otherwise unauthorized server bypasses enterprise policy and telemetry, while a changed resolver setting can redirect management connections and enable interception even when the queried domain itself appears legitimate.",
    expectedBehavior: ["Infrastructure devices query only the approved internal recursive resolver set."],
    severity: "high",
    confidence: "high",
    planes: ["management", "data"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["DNS"],
    techniques: ["T1071.004 DNS"],
    telemetry: { recommended: ["netflow-ipfix", "configuration-diffs"], optional: ["dns", "zeek", "syslog"] },
    suspiciousBehavior: ["UDP or TCP/53 leaves a device for an address outside the approved resolver set.", "Configured resolver addresses changed without an approved maintenance event."],
    investigationSteps: ["Confirm the appliance initiated DNS rather than forwarded client queries.", "Compare destination resolvers with configuration and the approved set.", "Determine when the alternate path began and which names were queried.", "Review the responsible configuration commit, account, and management source.", "Check resolved endpoints and TLS certificates for downstream redirection."],
    escalationConditions: ["The configured resolver or observed destination is actor-controlled, public, or otherwise unapproved.", "Resolver change is unauthorized or followed by altered answers and device connections."],
    falsePositives: ["An approved disaster-recovery resolver or temporary vendor diagnostic was not added to the inventory.", "Anycast, NAT, or split-horizon DNS makes the approved service appear under a different address."],
    enrichment: ["Resolver inventory, anycast ownership, configuration history, AAA identity, response comparison, and downstream connection history."],
    detectionStrategy: "Join device-originated DNS flows and resolver configuration state to an approved resolver set. Alert on both observed destinations and configured nameserver values outside that set, retaining initiator direction so transit DNS does not trigger the hunt.",
    queries: [{ title: "DNS outside the approved resolver set", description: "Vendor-neutral correlation of device-originated flows and expected resolvers.", platform: "pseudocode", query: `FOR each flow WHERE source.asset_class = "network_infrastructure" AND destination.port = 53 AND flow.initiator = source
LOOKUP approved_resolvers BY source.device_id, source.site
RETURN flow WHERE destination.ip NOT IN approved_resolvers` }],
    references: [references.microsoftDnsHijacking],
    relatedHunts: ["suspicious-infrastructure-dns", "management-acl-modified", "logging-destination-modified"],
  },
  {
    title: "Unexpected SSH Egress",
    slug: "unexpected-ssh-egress",
    family: "management-plane-c2",
    showOriginMatters: true,
    summary: "Find infrastructure appliances acting as SSH clients toward unapproved external systems.",
    hypothesis: "A network infrastructure appliance is initiating outbound SSH to an unapproved destination, indicating interactive command-and-control, port forwarding, credential reuse, or transfer of configuration and captured data.",
    rationale: "Most appliances are SSH servers for controlled administration and do not need arbitrary outbound SSH. Confirmed client direction is therefore a strong behavioral reversal, especially for Internet destinations, new SSH fingerprints, long sessions, or connections following device reconnaissance and collection commands.",
    expectedBehavior: ["Approved jump hosts initiate SSH to appliances; documented backup or automation workflows use named internal peers."],
    severity: "critical",
    confidence: "high",
    planes: ["management"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["SSH", "SCP", "SFTP"],
    techniques: ["T1021.004 SSH"],
    telemetry: { recommended: ["netflow-ipfix", "zeek"], optional: ["aaa", "cli-audit", "configuration-diffs", "packet-capture", "syslog"] },
    suspiciousBehavior: ["An appliance opens TCP/22 to an external or unapproved peer.", "The session is long-lived, transfers substantial bytes, or presents a rare SSH fingerprint."],
    investigationSteps: ["Validate source ownership and SSH client direction.", "Compare destination with backup, automation, and support inventories.", "Review Zeek SSH fingerprints, session duration, bytes, and recurrence.", "Correlate with AAA, CLI commands, configuration changes, and file creation.", "Preserve independent evidence and inspect device integrity using approved procedures."],
    escalationConditions: ["Outbound SSH reaches an unapproved Internet destination.", "The session carries significant data or follows capture, configuration export, or credential access."],
    falsePositives: ["A ticketed backup, image retrieval, or vendor-support workflow uses outbound SSH.", "A cluster peer or automation repository changed address without inventory synchronization."],
    enrichment: ["SSH client/server fingerprints, host-key history, byte direction, account evidence, peer ownership, and change context."],
    detectionStrategy: "Select TCP/22 sessions where an infrastructure address sent the opening SYN, compare peers with documented SSH client dependencies, and prioritize external destinations, new host keys, rare client fingerprints, long duration, or large outbound byte counts.",
    queries: [{ title: "Infrastructure as SSH client", description: "Abstract flow and SSH metadata correlation preserving connection initiator.", platform: "pseudocode", query: `FOR each ssh_session WHERE initiator.asset_class = "network_infrastructure"
LOOKUP approved_ssh_client_dependencies BY initiator.device_id
RETURN session WHERE responder NOT IN approved_ssh_client_dependencies
ORDER BY responder.scope = "external", bytes_from_initiator DESC, duration DESC` }],
    references: [references.cloakedCovert, references.arcaneDoor],
    relatedHunts: ["unexpected-management-interface-egress", "firewall-to-router-ssh", "packet-capture-followed-by-file-transfer"],
  },
];

export const managementPlaneC2Hunts = defineHunts(seeds);
