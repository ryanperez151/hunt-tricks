export const HUNT_FAMILIES = [
  "management-plane-c2",
  "infrastructure-lateral-movement",
  "discovery-credential-access",
  "traffic-manipulation",
  "cross-domain",
  "ai-agent-abuse",
] as const;

export const SCOPES = [
  "endpoints",
  "identity",
  "cloud",
  "saas",
  "email",
  "network-edge",
  "containers",
  "cicd",
  "supply-chain",
  "data-stores",
  "ot-iot",
  "ai-systems",
] as const;

export const BEHAVIORS = [
  "role-deviation",
  "new-relationships",
  "privilege-change",
  "discovery",
  "credential-use",
  "persistence",
  "data-movement",
  "trust-boundary",
  "evidence-tampering",
  "adaptive-sequence",
] as const;

export const TEMPORAL_PATTERNS = [
  "burst",
  "acceleration",
  "periodicity",
  "fan-out",
  "dwell-time",
  "stage-transition",
  "low-and-slow",
] as const;

export const AI_ROLES = ["defender", "attacker", "target"] as const;

export const SEVERITIES = ["low", "medium", "high", "critical"] as const;
export const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
export const PLANES = ["management", "control", "data"] as const;
export const QUERY_PLATFORMS = ["splunk", "kql", "zeek", "pseudocode"] as const;

export const DEVICES = [
  "firewall",
  "router",
  "switch",
  "wireless-controller",
  "load-balancer",
  "vpn-gateway",
] as const;

export const PROTOCOL_NAMES = [
  "SSH",
  "HTTPS",
  "SNMP",
  "TACACS+",
  "RADIUS",
  "LDAP",
  "LDAPS",
  "NETCONF",
  "RESTCONF",
  "SCP",
  "SFTP",
  "TFTP",
  "DNS",
  "NTP",
  "BGP",
  "OSPF",
  "GRE",
  "IPsec",
  "VXLAN",
  "SMB",
  "RDP",
  "WinRM",
  "WireGuard",
  "OpenVPN",
] as const;

export const TELEMETRY_KEYS = [
  "netflow-ipfix",
  "dns",
  "aaa",
  "configuration-diffs",
  "cli-audit",
  "zeek",
  "packet-capture",
  "syslog",
  "endpoint-events",
  "identity-audit",
  "cloud-audit",
  "saas-audit",
  "email-audit",
  "kubernetes-audit",
  "build-audit",
  "data-audit",
  "ot-passive",
  "agent-traces",
] as const;
