export const HUNT_FAMILIES = [
  "management-plane-c2",
  "infrastructure-lateral-movement",
  "discovery-credential-access",
  "traffic-manipulation",
] as const;

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
] as const;
