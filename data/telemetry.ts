import { TelemetrySchema, type Telemetry } from "@/lib/schemas";
import { expandedTelemetry } from "@/data/telemetry-expanded";

const telemetrySeeds: Telemetry[] = [
  {
    id: "telemetry-netflow-ipfix", key: "netflow-ipfix", name: "NetFlow/IPFIX",
    summary: "Connection metadata independent of application and device audit logs, useful for proving who initiated a conversation and how it changed over time.",
    collectionGuidance: "Export ingress and egress records from upstream or neighboring devices to an off-device collector; preserve interfaces, direction, byte and packet counts, timestamps, TCP flags, and NAT fields where available.",
    investigationContribution: "Reconstructs new destinations, fan-out, beacon-like timing, tunnel volume, and device-originated versus transit behavior.",
    limitations: "Usually lacks payload and authenticated identity; sampling, exporter clock drift, NAT, and ambiguous interface semantics can hide short sessions or reverse directionality.",
    coverage: { c2: "high", lateralMovement: "high", discovery: "medium", manipulation: "medium" },
  },
  {
    id: "telemetry-dns", key: "dns", name: "DNS",
    summary: "Resolver and authoritative query evidence that links infrastructure clients to names, record types, answers, and resolver choices.",
    collectionGuidance: "Centralize recursive-resolver logs and, where lawful, observe DNS at network boundaries; record client, question, type, response, answer, result code, and resolver path.",
    investigationContribution: "Identifies alternate resolvers, rare domains, algorithmic names, DNS tunneling indicators, and name-to-address context for later connections.",
    limitations: "Direct IP connections, cached answers, encrypted DNS, shared resolvers, and retention gaps can break attribution to the originating appliance.",
    coverage: { c2: "high", lateralMovement: "low", discovery: "medium", manipulation: "high" },
  },
  {
    id: "telemetry-aaa", key: "aaa", name: "AAA",
    summary: "Authentication, authorization, and accounting records for device administration and network access.",
    collectionGuidance: "Retain TACACS+, RADIUS, identity-provider, VPN, and jump-host records outside the managed device, including source, account, result, privilege, command accounting, and session identifiers.",
    investigationContribution: "Ties configuration or CLI activity to identities, reveals new AAA destinations and failed access patterns, and separates human from service-account activity.",
    limitations: "Shared accounts, local fallback users, missing command accounting, compromised AAA systems, and clock skew can weaken attribution.",
    coverage: { c2: "low", lateralMovement: "high", discovery: "medium", manipulation: "high" },
  },
  {
    id: "telemetry-configuration-diffs", key: "configuration-diffs", name: "Configuration Diffs",
    summary: "Versioned evidence of additions, removals, and modifications to device configuration.",
    collectionGuidance: "Pull signed or timestamped snapshots from a central configuration manager and compare canonicalized versions; protect history from device administrators and retain change-ticket linkage.",
    investigationContribution: "Exposes new users, resolvers, routes, ACLs, tunnels, capture filters, logging targets, and persistence mechanisms.",
    limitations: "Running state, memory-only implants, transient commands, and changes reverted between collection intervals may not appear in a configuration snapshot.",
    coverage: { c2: "medium", lateralMovement: "medium", discovery: "low", manipulation: "high" },
  },
  {
    id: "telemetry-cli-audit", key: "cli-audit", name: "CLI Audit",
    summary: "Command histories and administrative session records showing how an appliance was interrogated or changed.",
    collectionGuidance: "Export command accounting and terminal-session metadata to a remote immutable destination; capture account, source, privilege, command, result, and device time.",
    investigationContribution: "Reveals packet captures, configuration exports, route or ACL changes, new accounts, tunnel creation, and discovery commands.",
    limitations: "Attackers with sufficient privilege may bypass, clear, or tamper with local history; API, shell, or malware actions may not traverse the audited CLI.",
    coverage: { c2: "low", lateralMovement: "medium", discovery: "high", manipulation: "high" },
  },
  {
    id: "telemetry-zeek", key: "zeek", name: "Zeek",
    summary: "Protocol-aware network observations that enrich connections with DNS, TLS, SSH, tunnel, and file-transfer metadata.",
    collectionGuidance: "Place sensors on TAP/SPAN or packet-broker feeds where management and egress paths are visible; retain connection UIDs and protocol logs with synchronized clocks.",
    investigationContribution: "Correlates unusual services, TLS and SSH fingerprints, DNS behavior, transferred files, tunnel use, and connection sequences independent of the appliance.",
    limitations: "Visibility depends on sensor placement and packet fidelity; encryption limits content, asymmetric routing breaks protocol analysis, and high-volume links may drop packets.",
    coverage: { c2: "high", lateralMovement: "high", discovery: "high", manipulation: "medium" },
  },
  {
    id: "telemetry-packet-capture", key: "packet-capture", name: "Packet Capture",
    summary: "Full or filtered packets providing the highest-fidelity view of headers, sessions, and unencrypted application content.",
    collectionGuidance: "Capture from independent TAP/SPAN or packet-broker infrastructure using scoped filters and approved retention; preserve capture point, timestamps, interface, and chain of custody.",
    investigationContribution: "Validates direction, protocol conformance, encapsulation, retransmission, payload indicators, and whether a device altered or duplicated transit traffic.",
    limitations: "Collection is expensive and sensitive, encryption obscures content, retention is short, and a capture taken on the suspect device is not independent evidence.",
    coverage: { c2: "high", lateralMovement: "high", discovery: "high", manipulation: "high" },
  },
  {
    id: "telemetry-syslog", key: "syslog", name: "Syslog",
    summary: "Centralized operational and security events emitted by infrastructure devices and adjacent controls.",
    collectionGuidance: "Send logs over a protected management path to redundant external collectors; preserve facility, severity, hostname, source address, original timestamp, receipt time, and parser version.",
    investigationContribution: "Surfaces interface, routing, VPN, authentication, configuration, logging, and process events that explain or bracket network anomalies.",
    limitations: "The appliance controls what it emits; severity filters, parser loss, transport loss, clock drift, or actor suppression can produce deceptive gaps.",
    coverage: { c2: "medium", lateralMovement: "medium", discovery: "low", manipulation: "high" },
  },
];

export { expandedTelemetry };

export const telemetrySources = TelemetrySchema.array().parse([
  ...telemetrySeeds,
  ...expandedTelemetry,
]);
