import { defineHunts, references, type HuntSeed } from "@/data/hunts/shared";

const seeds: HuntSeed[] = [
  {
    title: "Firewall-to-Router SSH",
    slug: "firewall-to-router-ssh",
    family: "infrastructure-lateral-movement",
    showOriginMatters: true,
    summary: "Detect a firewall using SSH as a client to administer or pivot into a router.",
    hypothesis: "A firewall is initiating SSH to a router outside an explicitly documented automation, clustering, or support dependency, indicating device-to-device lateral movement using trusted infrastructure reachability and potentially valid credentials.",
    rationale: "A firewall commonly permits or inspects SSH but rarely needs to become an interactive SSH client for a router. The distinction between forwarding a session and originating it is essential: an opening SYN from a firewall-owned address, corroborated by passive SSH metadata and absent from the dependency inventory, represents a role reversal. Attackers value this path because appliance addresses are trusted, endpoint controls are sparse, and recovered network-administration credentials may work across device tiers.",
    expectedBehavior: ["A hardened jump host or automation controller initiates SSH to each device management address.", "Firewalls forward authorized administrator sessions but do not originate them toward routers."],
    severity: "critical",
    confidence: "high",
    planes: ["management"],
    devices: ["firewall", "router"],
    protocols: ["SSH"],
    techniques: ["T1021.004 SSH"],
    telemetry: { recommended: ["netflow-ipfix", "zeek", "aaa"], optional: ["cli-audit", "configuration-diffs", "packet-capture", "syslog"] },
    suspiciousBehavior: ["A firewall-owned address sends the opening TCP/22 SYN to a router management address.", "AAA or router logs show the firewall as the SSH source without a matching approved workflow.", "The account, client fingerprint, time, target set, or commands differ from established automation."],
    investigationSteps: [
      "Prove initiator direction from TCP flags, flow direction, or packet evidence and exclude a merely forwarded administrator session.",
      "Resolve the firewall source address to chassis, virtual context, interface, VRF, HA member, and management or data plane.",
      "Resolve the target to router role, site, criticality, management address, software release, and owning team.",
      "Compare the device pair, port, account, schedule, and purpose with the approved dependency and automation inventory.",
      "Review centralized AAA authentication, authorization, and command accounting on both devices around the session.",
      "Inspect Zeek SSH client, server, host-key, and negotiation fingerprints against prior approved sessions.",
      "Determine whether the firewall contacted additional routers or services before or after the SSH session.",
      "Diff firewall and router configurations, accounts, keys, packages, processes, and boot state against trusted baselines.",
      "Preserve independent flow and packet evidence before containment changes alter the path or volatile state.",
    ],
    escalationConditions: [
      "No approved firewall-to-router SSH dependency or change window explains the connection.",
      "The login succeeds with a privileged, shared, dormant, or recently changed account or key.",
      "The firewall fans out to multiple routers or the router initiates further device-to-device sessions.",
      "Commands access credentials, configuration, packet capture, users, routes, ACLs, logging, or tunnels.",
      "The SSH fingerprint, device integrity, or configuration differs from the known-good baseline.",
    ],
    falsePositives: ["A documented firewall orchestration feature, HA workflow, or configuration backup legitimately uses SSH to a router.", "A jump-host session is source-NATed through the firewall and loses the original client address.", "A controlled incident-response or vendor-support session uses the firewall as a temporary jump point."],
    enrichment: ["Dependency inventory, NAT policy, HA ownership, route/VRF context, AAA account and command records, and change tickets.", "SSH fingerprints, host-key history, credential age, peer-group prevalence, target criticality, and subsequent connection graph."],
    detectionStrategy: "Correlate independently observed opening TCP/22 handshakes from firewall-owned addresses to router management addresses with asset roles, NAT policy, and approved dependencies. Require actual client direction, then rank successful AAA, privileged commands, new fingerprints, target fan-out, off-hours timing, and follow-on sessions.",
    queries: [
      {
        title: "Firewall-originated router SSH",
        description: "Example KQL over normalized session and asset inventories with explicit initiator classification.",
        platform: "kql",
        query: `NetworkSession
| where IpProtocol == "TCP" and DestinationPort == 22 and Initiator == "source"
| where SourceAssetType == "firewall" and DestinationAssetType == "router"
| where ApprovedDependency == false
| summarize Sessions=count(), FirstSeen=min(TimeGenerated), LastSeen=max(TimeGenerated), BytesOut=sum(BytesSent), Targets=make_set(DestinationIp) by SourceDeviceId, SourceIp, UserIdentity
| order by Sessions desc`,
      },
      {
        title: "Zeek firewall-to-router SSH sessions",
        description: "Pseudocode over Zeek logs correlating conn.log and ssh.log using standard connection UIDs plus local asset-role inventories.",
        platform: "zeek",
        query: `from conn.log where proto == "tcp" and id.resp_p == 22
join ssh.log on uid
where id.orig_h is in firewall_addresses and id.resp_h is in router_management_addresses
where pair(id.orig_h, id.resp_h) is not in approved_device_ssh_dependencies
return ts, uid, id.orig_h, id.resp_h, duration, orig_bytes, resp_bytes, client, server, host_key`,
      },
    ],
    references: [references.cloakedCovert, references.cisaRouters],
    relatedHunts: ["router-to-router-ssh", "unexpected-ssh-egress", "device-to-device-https-administration"],
    behaviorComparison: {
      expected: {
        title: "Administration through a control point",
        nodes: [{ id: "jump", label: "Approved jump host" }, { id: "firewall", label: "Firewall" }, { id: "router", label: "Router" }],
        edges: [{ source: "jump", target: "firewall", label: "Administers firewall" }, { source: "jump", target: "router", label: "Administers router" }],
        textAlternative: ["An approved jump host independently initiates SSH to the firewall and router; the firewall does not administer the router."],
      },
      suspicious: {
        title: "Device-to-device SSH pivot",
        nodes: [{ id: "firewall", label: "Compromised firewall" }, { id: "router", label: "Router" }],
        edges: [{ source: "firewall", target: "router", label: "Initiates unapproved SSH" }],
        textAlternative: ["A compromised firewall acts as an SSH client and initiates an unapproved administrative session to a router."],
      },
    },
  },
  {
    title: "Router-to-Router SSH",
    slug: "router-to-router-ssh",
    family: "infrastructure-lateral-movement",
    showOriginMatters: true,
    summary: "Find routers originating SSH sessions to peer routers outside approved operational dependencies.",
    hypothesis: "A router is acting as an SSH client toward another router without an approved automation or support purpose, indicating credential reuse, trusted-path pivoting, or expansion from one compromised network device to another.",
    rationale: "Routers exchange control-plane protocols with configured neighbors, but interactive SSH administration should originate from controlled management systems. Router-to-router SSH bypasses that expected operator path and can let an actor traverse trusted addressing, reuse local credentials, and compromise multiple forwarding points with little endpoint visibility.",
    expectedBehavior: ["Jump hosts and automation controllers initiate router administration; router peers exchange only configured control-plane protocols."],
    severity: "critical",
    confidence: "high",
    planes: ["management"],
    devices: ["router"],
    protocols: ["SSH"],
    techniques: ["T1021.004 SSH"],
    telemetry: { recommended: ["netflow-ipfix", "aaa"], optional: ["zeek", "cli-audit", "configuration-diffs", "syslog"] },
    suspiciousBehavior: ["A router-owned address initiates TCP/22 to a peer router.", "The connection succeeds or fans out without a documented controller workflow."],
    investigationSteps: ["Confirm client direction and both endpoint asset roles.", "Check the device pair against automation and operational dependency inventories.", "Review centralized AAA identity, authorization, and command accounting.", "Compare timing with change windows and operator access.", "Inspect source and target configurations, keys, accounts, and subsequent session graph."],
    escalationConditions: ["The router pair has no approved SSH dependency and authentication succeeds.", "The source fans out, uses a privileged credential, or executes discovery or persistence commands."],
    falsePositives: ["A documented router orchestration, route-server maintenance, or backup workflow uses device-originated SSH.", "Source NAT or terminal-server architecture obscures the actual administrative initiator."],
    enrichment: ["Router roles, adjacency, management VRFs, SSH fingerprints, AAA commands, account age, and change records."],
    detectionStrategy: "Select opening TCP/22 handshakes between router-owned management addresses, remove explicit controller and support dependencies, and prioritize successful authentication, new device pairs, fan-out, privileged commands, or a connection graph that continues to other appliances.",
    queries: [{ title: "Unapproved router peer SSH", description: "Vendor-neutral SSH-session correlation using local asset and dependency inventories.", platform: "pseudocode", query: `FOR each tcp_session WHERE destination.port = 22 AND initiator.asset_type = "router" AND responder.asset_type = "router"
LOOKUP approved_ssh_dependencies BY initiator.device_id
RETURN session WHERE responder.device_id NOT IN approved_ssh_dependencies
ENRICH WITH aaa_result, account, command_count, ssh_fingerprint, target_fan_out` }],
    references: [references.cisaRouters, references.cloakedCovert],
    relatedHunts: ["firewall-to-router-ssh", "snmp-fan-out", "management-acl-modified"],
  },
  {
    title: "Device-to-Device HTTPS Administration",
    slug: "device-to-device-https-administration",
    family: "infrastructure-lateral-movement",
    showOriginMatters: true,
    summary: "Detect one infrastructure appliance making unapproved administrative HTTPS or API calls to another.",
    hypothesis: "An infrastructure device is initiating HTTPS to a peer management interface outside an approved controller relationship, indicating lateral movement, unauthorized API discovery, configuration change, or credential reuse between trusted appliances.",
    rationale: "HTTPS is common enough to blend into management networks, yet peer appliances generally do not administer each other unless a specific controller, cluster, or orchestration relationship exists. Combining TLS client direction, management endpoint identity, API paths where visible, and configuration changes can separate a device pivot from ordinary encrypted transit traffic.",
    expectedBehavior: ["Approved controllers and administrators call device HTTPS APIs from named management systems."],
    severity: "high",
    confidence: "medium",
    planes: ["management"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["HTTPS", "RESTCONF"],
    techniques: ["T1021 Remote Services"],
    telemetry: { recommended: ["netflow-ipfix", "zeek"], optional: ["aaa", "configuration-diffs", "packet-capture", "syslog"] },
    suspiciousBehavior: ["A device-owned address opens TLS to another device management address without a controller dependency.", "A new client certificate, TLS fingerprint, API identity, or write operation appears."],
    investigationSteps: ["Confirm initiator direction and distinguish device management HTTPS from forwarded user traffic.", "Validate any cluster, controller, health-check, or orchestration relationship.", "Inspect TLS client and server fingerprints, certificates, SNI, duration, and byte direction.", "Review API authentication and authorization logs where independently retained.", "Diff target configuration and trace follow-on connections from both devices."],
    escalationConditions: ["No approved peer-management relationship exists and the target configuration changes.", "Authentication succeeds with a rare identity or the source contacts multiple management interfaces."],
    falsePositives: ["Clustering, controller discovery, certificate enrollment, monitoring, or an approved API integration creates peer HTTPS.", "A reverse proxy or source NAT assigns an appliance address to controller traffic."],
    enrichment: ["TLS fingerprints and certificates, API identity, HTTP method or path when available, dependency owner, and target configuration diff."],
    detectionStrategy: "Identify TLS sessions initiated by an infrastructure address to a peer's management interface, join to explicit cluster and controller dependencies, then rank first-seen pairs, rare client fingerprints, successful API identities, fan-out, and target-side configuration changes.",
    queries: [{ title: "Peer appliance management HTTPS", description: "Abstract TLS-session analysis with management-interface and dependency enrichment.", platform: "pseudocode", query: `FOR each tls_session WHERE initiator.asset_class = "network_infrastructure" AND responder.interface_role = "management"
LOOKUP approved_controller_relationships BY initiator.device_id, responder.device_id
RETURN session WHERE approved_relationship = false
ENRICH WITH client_fingerprint, server_certificate, api_identity, target_configuration_change` }],
    references: [references.cisaRouters, references.arcaneDoor],
    relatedHunts: ["firewall-to-router-ssh", "unexpected-management-interface-egress", "management-acl-modified"],
  },
  {
    title: "SNMP Fan-Out",
    slug: "snmp-fan-out",
    family: "infrastructure-lateral-movement",
    showOriginMatters: true,
    summary: "Find a managed appliance reversing its role and polling many peers over SNMP.",
    hypothesis: "A router, firewall, switch, controller, load balancer, or VPN gateway is originating UDP/161 queries to multiple internal devices, indicating infrastructure discovery, credential validation, topology collection, or automated expansion from a compromised appliance.",
    rationale: "In the expected SNMP relationship, a small set of network-management systems polls managed devices on UDP/161, while devices send traps or informs to collectors on UDP/162. A router or firewall suddenly originating UDP/161 to many peers reverses that role. Even if community strings or SNMPv3 credentials are legitimate, independently observed fan-out can reveal an actor enumerating interfaces, routes, device identity, and configuration across infrastructure that often lacks endpoint telemetry.",
    expectedBehavior: ["Approved NMS addresses poll managed devices on UDP/161.", "Managed devices send event-driven traps or informs only to approved collectors on UDP/162."],
    severity: "critical",
    confidence: "high",
    planes: ["management"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["SNMP"],
    techniques: ["T1046 Network Service Discovery", "T1018 Remote System Discovery"],
    telemetry: { recommended: ["netflow-ipfix", "packet-capture"], optional: ["zeek", "aaa", "cli-audit", "configuration-diffs", "syslog"] },
    suspiciousBehavior: ["A managed device, rather than an NMS, initiates UDP/161 to multiple peers.", "The target count, rate, object scope, or community/security identity is new for the source role.", "Polling is followed by SSH, HTTPS, configuration export, or other lateral activity."],
    investigationSteps: [
      "Confirm the source address belongs to the appliance and that UDP/161 packets are queries, not misclassified traps or forwarded traffic.",
      "Count unique targets, sites, subnets, device roles, request rates, retries, and the duration of the fan-out window.",
      "Compare the source with the approved NMS inventory, monitoring proxies, discovery scanners, and temporary migration tooling.",
      "Inspect packet evidence for SNMP version, operation type, requested object identifiers, error responses, and security identity without exposing secrets.",
      "Determine whether target selection follows a subnet sweep, neighbor table, route, or device inventory accessible from the source.",
      "Review AAA, CLI audit, and configuration commits for SNMP commands, scripts, credential changes, or new scheduled activity.",
      "Pivot from responsive targets to subsequent SSH, HTTPS, TFTP, or other device-to-device sessions from the same source.",
      "Compare running configuration, packages, processes, accounts, and boot integrity with a trusted image or peer baseline.",
      "Preserve independent flows and a narrowly scoped packet sample under the organization's credential-handling policy.",
    ],
    escalationConditions: [
      "The source is not an approved NMS, discovery scanner, or monitoring proxy and polls multiple peers.",
      "Requests use write operations, broad or sensitive object identifiers, legacy credentials, or a newly observed security identity.",
      "Fan-out is followed by successful administration, configuration transfer, credential use, or further lateral movement.",
      "The polling pattern began after suspicious access, device exploitation, account change, or telemetry suppression.",
      "Device integrity or configuration review identifies an unauthorized script, process, account, key, or monitoring definition.",
    ],
    falsePositives: ["A newly deployed monitoring proxy, discovery appliance, topology mapper, or migration test legitimately polls many devices.", "A device hosts an embedded controller or stacked management role that is documented but absent from the asset model.", "Exporter direction or asymmetric observation mistakes NMS traffic forwarded through the device for traffic originated by it."],
    enrichment: ["NMS and scanner inventory, device role, target criticality, subnet sequence, SNMP version, operation, object identifiers, and response status.", "AAA identity, CLI commands, config commits, peer-group baseline, follow-on connection graph, and credential rotation history."],
    detectionStrategy: "Build a directional SNMP role model from independent flow or packet telemetry. Aggregate UDP/161 queries by true initiator in short and daily windows, exclude named NMS and discovery systems, and rank infrastructure sources by new target count, subnet spread, sensitive object scope, write operations, and follow-on administration traffic.",
    queries: [
      {
        title: "Managed-device SNMP fan-out",
        description: "Example Splunk aggregation over locally normalized flow fields and asset roles.",
        platform: "splunk",
        query: `index=network dest_port=161 transport=udp
| lookup network_assets ip AS src_ip OUTPUT asset_type AS src_type device_id AS src_device
| where src_type IN ("firewall", "router", "switch", "wireless_controller", "load_balancer", "vpn_gateway")
| lookup approved_snmp_initiators device_id AS src_device OUTPUT is_approved_nms
| where isnull(is_approved_nms)
| stats dc(dest_ip) AS target_count values(dest_ip) AS targets count earliest(_time) AS first_seen latest(_time) AS last_seen by src_device src_ip
| where target_count >= 5
| sort - target_count`,
      },
      {
        title: "SNMP role reversal and fan-out",
        description: "Vendor-neutral packet or flow logic that distinguishes UDP/161 requests from UDP/162 notifications.",
        platform: "pseudocode",
        query: `FOR each snmp_request WHERE destination.port = 161 AND initiator.asset_class = "network_infrastructure"
EXCLUDE initiator.device_id IN approved_nms_and_discovery_sources
GROUP BY initiator.device_id OVER 15m
CALCULATE unique_targets, unique_subnets, request_count, operation_types, requested_object_identifiers
RETURN groups WHERE unique_targets >= local_fan_out_threshold OR operation_types CONTAINS "write"`,
      },
    ],
    references: [references.ncscEdgeRouters, references.cloakedCovert],
    relatedHunts: ["snmp-from-unexpected-initiator", "router-to-router-ssh", "new-aaa-destination"],
    behaviorComparison: {
      expected: {
        title: "Expected SNMP roles",
        nodes: [{ id: "nms", label: "Approved NMS" }, { id: "device", label: "Managed device" }],
        edges: [{ source: "nms", target: "device", label: "Polls UDP/161" }, { source: "device", target: "nms", label: "Traps UDP/162" }],
        textAlternative: ["The approved NMS polls the managed device on UDP/161, and the device sends event-driven notifications to the NMS on UDP/162."],
      },
      suspicious: {
        title: "Managed device reverses role",
        nodes: [{ id: "device", label: "Compromised device" }, { id: "peers", label: "Multiple infrastructure peers" }],
        edges: [{ source: "device", target: "peers", label: "Fans out queries on UDP/161" }],
        textAlternative: ["A compromised managed device reverses its normal role and sends SNMP queries on UDP/161 to multiple infrastructure peers."],
      },
    },
  },
  {
    title: "SNMP From Unexpected Initiator",
    slug: "snmp-from-unexpected-initiator",
    family: "infrastructure-lateral-movement",
    showOriginMatters: true,
    summary: "Detect SNMP requests from a source not authorized to poll the target device.",
    hypothesis: "An internal host or infrastructure device outside the approved network-management set is initiating SNMP requests to managed devices, indicating topology discovery, credential testing, unauthorized monitoring, or preparation for lateral movement.",
    rationale: "SNMP trust should be defined by initiator, target, version, security identity, operation, and object scope. A request from an unexpected source can expose detailed topology and configuration even when it touches only one device, and write-capable access can alter device state with little interactive evidence.",
    expectedBehavior: ["Only named NMS and discovery systems poll each managed device using approved versions and security identities."],
    severity: "high",
    confidence: "high",
    planes: ["management"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["SNMP"],
    techniques: ["T1046 Network Service Discovery", "T1018 Remote System Discovery"],
    telemetry: { recommended: ["netflow-ipfix", "packet-capture"], optional: ["zeek", "syslog", "configuration-diffs"] },
    suspiciousBehavior: ["UDP/161 request traffic originates outside approved NMS addresses.", "The request uses sensitive objects, a new identity, or write operations."],
    investigationSteps: ["Validate the initiator and distinguish requests from UDP/162 notifications.", "Compare source, target, version, identity, operation, and object scope with SNMP policy.", "Determine whether the source contacted additional devices or management services.", "Review source ownership, vulnerability, authentication, and recent changes.", "Rotate exposed credentials and preserve packet evidence when unauthorized access is confirmed."],
    escalationConditions: ["The initiator is unapproved and receives successful responses from a sensitive device.", "Requests attempt writes, access sensitive objects, or precede device administration."],
    falsePositives: ["A monitoring migration, vendor diagnostic, or approved discovery scan uses a source missing from policy.", "A collector proxy or NAT gateway changes the apparent polling address."],
    enrichment: ["SNMP version, security identity, operation, object identifiers, response codes, source owner, and target criticality."],
    detectionStrategy: "Compare observed UDP/161 request initiators with per-device SNMP policy, then prioritize successful responses, legacy versions, sensitive object identifiers, write operations, new source-target pairs, and movement from the same source to other management services.",
    queries: [{ title: "SNMP outside approved initiators", description: "Abstract request-level comparison with the authorized NMS policy.", platform: "pseudocode", query: `FOR each snmp_request WHERE destination.port = 161
LOOKUP approved_snmp_policy BY target.device_id
RETURN request WHERE source.ip NOT IN approved_snmp_policy.initiators
   OR snmp.version NOT IN approved_snmp_policy.versions
   OR snmp.security_identity NOT IN approved_snmp_policy.identities
   OR snmp.operation NOT IN approved_snmp_policy.operations` }],
    references: [references.ncscEdgeRouters],
    relatedHunts: ["snmp-fan-out", "new-aaa-destination", "firewall-to-router-ssh"],
  },
];

export const infrastructureLateralMovementHunts = defineHunts(seeds);
