import { defineHunts, references, type HuntSeed } from "@/data/hunts/shared";

const seeds: HuntSeed[] = [
  {
    title: "New AAA Destination",
    slug: "new-aaa-destination",
    family: "discovery-credential-access",
    summary: "Detect devices sending TACACS+ or RADIUS exchanges to an unapproved authentication service.",
    hypothesis: "An infrastructure device has begun sending TACACS+ or RADIUS traffic to a new destination, indicating unauthorized AAA reconfiguration, credential capture, rogue authorization, accounting suppression, or attacker testing of recovered credentials.",
    rationale: "AAA server sets are among the most stable device dependencies and control privileged access. Redirecting requests can expose authentication material, approve malicious sessions, or remove reliable command accounting. A new destination must be evaluated with configuration history and independent AAA records rather than accepted as a routine network change.",
    expectedBehavior: ["Devices contact only approved redundant TACACS+ or RADIUS services over documented management paths."],
    severity: "critical",
    confidence: "high",
    planes: ["management"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["TACACS+", "RADIUS"],
    techniques: ["T1556 Modify Authentication Process"],
    telemetry: { recommended: ["configuration-diffs", "aaa", "netflow-ipfix"], optional: ["cli-audit", "packet-capture", "syslog"] },
    suspiciousBehavior: ["A device sends TCP/49 or UDP/1812–1813 to a server outside its approved AAA group.", "Server order, shared secret reference, source interface, or accounting destination changes unexpectedly."],
    investigationSteps: ["Validate the destination against the authoritative AAA inventory and disaster-recovery configuration.", "Review the exact configuration diff, commit time, account, source session, and approval ticket.", "Compare flow timing with authentication attempts, rejects, accounting continuity, and administrator activity.", "Determine which devices were changed and whether the same destination appears elsewhere.", "Rotate exposed secrets and review successful access if a rogue destination received requests."],
    escalationConditions: ["The destination is unapproved or externally reachable and received live AAA requests.", "The change coincides with missing accounting, unexpected successful logins, or privileged commands."],
    falsePositives: ["A planned AAA migration, failover exercise, or new regional service preceded inventory synchronization.", "Legacy RADIUS ports or NAT make an approved service appear under an unexpected endpoint."],
    enrichment: ["AAA server group, priority, source interface, identity, response result, accounting continuity, change owner, and secret-rotation status."],
    detectionStrategy: "Continuously compare configured and observed TACACS+/RADIUS destinations with the per-device approved AAA set. Alert on new endpoints, priority changes, loss of accounting, or requests that leave the management boundary, and correlate them with the responsible administrative session.",
    queries: [{ title: "AAA destination drift", description: "Vendor-neutral comparison of configuration and device-originated AAA traffic.", platform: "pseudocode", query: `FOR each infrastructure_device
OBSERVED = unique destinations for TACACS+ TCP/49 or RADIUS UDP/1812,1813 over 24h
CONFIGURED = AAA server endpoints in current device configuration
APPROVED = authoritative_AAA_inventory(device.site, device.role)
RETURN device, (OBSERVED UNION CONFIGURED) MINUS APPROVED, configuration_commit, accounting_gap` }],
    references: [references.cloakedCovert, references.cisaVoltTyphoon],
    relatedHunts: ["snmp-fan-out", "unexpected-ldap-from-infrastructure", "logging-destination-modified"],
  },
  {
    title: "Unexpected LDAP From Infrastructure",
    slug: "unexpected-ldap-from-infrastructure",
    family: "discovery-credential-access",
    summary: "Find appliance-originated directory queries outside approved identity-service relationships.",
    hypothesis: "A network infrastructure device is querying LDAP or LDAPS with an unapproved destination, identity, object scope, or rate, indicating directory reconnaissance, group discovery, credential validation, or redirection to a rogue directory endpoint.",
    rationale: "Some appliances legitimately use directories for administrator authentication, but their servers, bind identities, and search bases should be tightly bounded. Broad searches, new directory peers, or elevated query rates can expose users, groups, and policy structure or validate credentials recovered from device configuration.",
    expectedBehavior: ["Devices query named internal directory servers with fixed bind identities and narrow search bases during authentication."],
    severity: "high",
    confidence: "medium",
    planes: ["management"],
    devices: ["firewall", "router", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["LDAP", "LDAPS"],
    techniques: ["T1087 Account Discovery", "T1069.002 Domain Groups Discovery"],
    telemetry: { recommended: ["netflow-ipfix", "configuration-diffs"], optional: ["aaa", "zeek", "packet-capture", "syslog"] },
    suspiciousBehavior: ["An appliance contacts a new LDAP/LDAPS server or uses a new bind identity.", "Searches enumerate broad user, group, computer, or policy scopes beyond authentication needs."],
    investigationSteps: ["Confirm device client direction and the directory endpoint identity.", "Compare the server, TLS certificate, bind identity, and search base with approved integration settings.", "Measure query rate, breadth, filters, result count, failures, and first-seen time where directory logs permit.", "Review configuration and AAA changes plus the administrative session that introduced them.", "Trace subsequent SSH, HTTPS, SMB, RDP, or WinRM access using discovered identities."],
    escalationConditions: ["The destination, bind identity, or search base is unapproved and queries succeed.", "Broad enumeration is followed by credential use or lateral administration."],
    falsePositives: ["A planned directory migration, failover, or group-policy redesign changes servers or search patterns.", "A health check or authentication outage creates retries and an unusual query rate."],
    enrichment: ["Directory server ownership, certificate history, bind identity, search base, result count, group sensitivity, configuration diff, and follow-on access."],
    detectionStrategy: "Join device-originated LDAP/LDAPS sessions with approved server and bind-identity policy, then use directory audit data where available to rank new endpoints, broad search filters, unusual result volume, authentication bursts, and changes not tied to an approved integration window.",
    queries: [{ title: "Infrastructure directory relationship drift", description: "Abstract network and directory-audit correlation for appliance clients.", platform: "pseudocode", query: `FOR each directory_session WHERE client.asset_class = "network_infrastructure" AND protocol IN (LDAP, LDAPS)
LOOKUP approved_directory_relationship BY client.device_id
RETURN session WHERE server NOT IN approved.servers OR bind_identity NOT IN approved.identities OR search_base NOT WITHIN approved.search_bases
ENRICH WITH query_count, result_count, configuration_change, subsequent_remote_access` }],
    references: [references.cloakedCovert],
    relatedHunts: ["new-aaa-destination", "snmp-from-unexpected-initiator", "firewall-to-router-ssh"],
  },
  {
    title: "Packet Capture Started",
    slug: "packet-capture-started",
    family: "discovery-credential-access",
    summary: "Identify packet-capture activity on an appliance outside an approved diagnostic workflow.",
    hypothesis: "A privileged user, implant, API client, or built-in diagnostic facility has started packet capture on network infrastructure without an approved troubleshooting purpose, potentially collecting credentials, sessions, or sensitive transit traffic.",
    rationale: "Packet capture is a legitimate but powerful appliance capability. On a compromised edge or transit device it can collect authentication exchanges, administrative sessions, and selected application traffic at scale. Central CLI accounting, configuration artifacts, temporary files, and independent traffic observations provide stronger evidence than the suspect device's local log alone.",
    expectedBehavior: ["Captures are scoped, time-bounded, ticketed, and performed by named operators for active diagnostics."],
    severity: "critical",
    confidence: "medium",
    planes: ["management", "control", "data"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["SSH", "HTTPS"],
    techniques: ["T1040 Network Sniffing"],
    telemetry: { recommended: ["cli-audit", "configuration-diffs", "syslog"], optional: ["aaa", "packet-capture", "netflow-ipfix"] },
    suspiciousBehavior: ["CLI, API, or configuration state starts a capture without a linked incident or change ticket.", "The filter targets authentication, management, customer, or other high-value traffic and creates an exportable file."],
    investigationSteps: ["Identify the device, account, source session, command or API call, capture filter, interface, start time, and configured duration.", "Validate the activity with the operations owner and the referenced troubleshooting ticket.", "Determine whether a capture process, buffer, or file remains active and preserve metadata before approved containment.", "Review preceding privileged access, exploit indicators, account changes, and discovery commands.", "Search for subsequent file transfer, external egress, logging changes, or deletion of capture artifacts."],
    escalationConditions: ["No owner or ticket explains the capture, or the responsible identity is suspicious.", "The filter targets credentials or sensitive transit traffic, or capture data is transferred or deleted."],
    falsePositives: ["Network operations started an emergency capture before the ticket was fully documented.", "Automated diagnostics or health tooling briefly captures packets after a fault threshold."],
    enrichment: ["Capture command/API call, interface, filter, file path, size, duration, operator identity, ticket, target traffic sensitivity, and transfer history."],
    detectionStrategy: "Centralize privileged CLI and API audit events, normalize capture-start verbs by device platform, and correlate them with AAA identity, ticketed maintenance, capture-file creation, process state, and subsequent device-originated transfers. Treat device-local capture status as supporting rather than sole evidence.",
    queries: [{ title: "Unapproved capture start", description: "Abstract correlation over normalized CLI, API, and diagnostic audit events.", platform: "pseudocode", query: `FOR each device_audit_event WHERE action_category = "packet_capture_start"
JOIN administrator_session, change_ticket, device_criticality
RETURN event WHERE approved_ticket = false OR capture_filter targets sensitive_management_or_transit_traffic
ENRICH WITH capture_interface, file_path, configured_duration, later_file_transfer` }],
    references: [references.arcaneDoor, references.mitreNetworkSniffing],
    relatedHunts: ["packet-capture-followed-by-file-transfer", "logging-destination-modified", "infrastructure-telemetry-gap"],
  },
  {
    title: "Packet Capture Followed by File Transfer",
    slug: "packet-capture-followed-by-file-transfer",
    family: "discovery-credential-access",
    summary: "Correlate appliance packet capture with a subsequent transfer of captured or diagnostic data.",
    hypothesis: "An infrastructure device starts packet capture and then transfers a capture or similarly sized diagnostic file to a new or unauthorized destination, indicating collection and possible exfiltration of credentials or sensitive transit traffic.",
    rationale: "Capture and file transfer can each be legitimate in isolation, but their ordered combination carries stronger intent. The risk rises when the capture targets management or authentication traffic, the transfer destination is new, the byte volume resembles the capture artifact, or logging is reduced before the sequence.",
    expectedBehavior: ["Ticketed diagnostics send narrowly scoped captures to approved internal case-management or support repositories."],
    severity: "critical",
    confidence: "high",
    planes: ["management", "data"],
    devices: ["firewall", "router", "switch", "wireless-controller", "load-balancer", "vpn-gateway"],
    protocols: ["SCP", "SFTP", "TFTP", "HTTPS"],
    techniques: ["T1040 Network Sniffing", "T1048 Exfiltration Over Alternative Protocol"],
    telemetry: { recommended: ["cli-audit", "netflow-ipfix", "zeek"], optional: ["configuration-diffs", "aaa", "packet-capture", "syslog"] },
    suspiciousBehavior: ["A capture start is followed by HTTPS PUT/POST content, an SFTP write/upload, a TFTP WRQ, or an outbound SCP copy from the same device.", "The upload matches the capture artifact by a populated path or hash, or by bounded size or outbound-byte tolerance, and the recipient is new, external, unapproved, or unrelated to the troubleshooting ticket."],
    investigationSteps: ["Establish a precise timeline for capture start, file creation, transfer, deletion, and operator activity.", "Validate capture scope, interface, size, hashes where available, and business purpose.", "Confirm protocol-specific upload direction from HTTPS method/body bytes, SFTP operation, TFTP opcode, or SCP copy direction rather than treating client initiation as proof of upload.", "Correlate the capture and transferred artifact by path, hash, size tolerance, or outbound bytes, then validate destination ownership and authentication.", "Compare the destination with approved backup, support, and case-management repositories.", "Review device integrity, logging continuity, prior discovery, and follow-on credential use."],
    escalationConditions: ["The destination is external or unapproved and byte volume is consistent with the capture artifact.", "No approved diagnostic ticket exists, or the sequence includes logging suppression, deletion, or later credential use."],
    falsePositives: ["A documented vendor support case requires upload of a capture to an approved portal.", "Automated diagnostics collect and send scoped traces to an internal monitoring repository."],
    enrichment: ["Capture path, hash, size, and filter; HTTPS method and request-body bytes; SFTP operation; TFTP opcode; SCP direction; destination certificate or host key; operator identity; support case; and subsequent credential activity."],
    detectionStrategy: "Correlate normalized capture-start and capture-file events with protocol-confirmed uploads inside a bounded window. Client initiation alone is insufficient: require HTTPS PUT/POST body data, an SFTP write/upload, a TFTP WRQ, or outbound SCP plus a populated matching artifact path or hash, or a bounded size or outbound-byte match. Rank new or external destinations, sensitive capture filters, unapproved identities, deletion, and independent telemetry gaps.",
    queries: [{ title: "Capture then transfer sequence", description: "Vendor-neutral sequence logic over audit, file, and network-session records.", platform: "pseudocode", query: `SEQUENCE BY device.id WITHIN 2h
  capture = device_audit_event(action_category = "packet_capture_start")
  transfer = file_transfer_event(device_id = device.id AND protocol IN (SCP, SFTP, TFTP, HTTPS))
PROTOCOL_UPLOAD =
     (transfer.protocol = HTTPS AND transfer.http.method IN ("PUT", "POST") AND transfer.http.request_body_bytes > 0)
  OR (transfer.protocol = SFTP AND transfer.sftp.operation IN ("write", "upload"))
  OR (transfer.protocol = TFTP AND transfer.tftp.opcode = "WRQ")
  OR (transfer.protocol = SCP AND transfer.scp.direction = "local-to-remote")
ARTIFACT_EVIDENCE =
     (isnotempty(transfer.source_path) AND isnotempty(capture.artifact_path) AND transfer.source_path = capture.artifact_path)
  OR (isnotempty(transfer.file_hash) AND isnotempty(capture.artifact_hash) AND transfer.file_hash = capture.artifact_hash)
  OR (transfer.file_size > 0 AND capture.file_size > 0 AND abs(transfer.file_size - capture.file_size) <= max(4096, capture.file_size * 0.05))
  OR (capture.file_size > 0 AND transfer.bytes_out >= capture.file_size * 0.95 AND transfer.bytes_out <= capture.file_size * 1.05 + 4096)
WHERE transfer.destination NOT IN approved_diagnostic_repositories AND PROTOCOL_UPLOAD AND ARTIFACT_EVIDENCE
RETURN capture.time, capture.filter, capture.artifact_path, capture.artifact_hash, capture.file_size, transfer.destination, transfer.protocol, transfer.bytes_out, responsible_identity` }],
    references: [references.arcaneDoor, references.mitreNetworkSniffing],
    relatedHunts: ["packet-capture-started", "unexpected-ssh-egress", "unexpected-gre-tunnel"],
  },
];

export const discoveryCredentialAccessHunts = defineHunts(seeds);
