import { AttackPathSchema, type AttackPath } from "@/lib/schemas";

const attackPathSeeds: AttackPath[] = [
  {
    id: "attack-path-infrastructure-pivot",
    slug: "infrastructure-pivot",
    title: "Infrastructure Pivot",
    summary: "An actor converts control of an Internet-facing appliance into trusted reachability toward management systems and internal services.",
    nodes: [
      { id: "external-access", label: "Compromise exposed appliance" },
      { id: "device-session", label: "Establish device command access" },
      { id: "internal-discovery", label: "Discover trusted internal paths" },
      { id: "lateral-session", label: "Initiate internal administration session" },
    ],
    edges: [
      { source: "external-access", target: "device-session", label: "exploit or valid credential" },
      { source: "device-session", target: "internal-discovery", label: "inspect routes, neighbors, and configuration" },
      { source: "internal-discovery", target: "lateral-session", label: "originate SSH, HTTPS, SMB, RDP, or WinRM" },
    ],
    textAlternative: [
      "First, the actor compromises an exposed infrastructure appliance.",
      "Next, the actor establishes command access and inventories routes, neighbors, and trusted management paths.",
      "Finally, the appliance initiates an administrative session to an internal target, making the pivot appear to originate from trusted infrastructure.",
    ],
    relatedHunts: ["firewall-to-router-ssh", "router-to-router-ssh", "device-to-device-https-administration"],
  },
  {
    id: "attack-path-credential-collection",
    slug: "credential-collection",
    title: "Credential Collection",
    summary: "Packet capture, directory or SNMP discovery, and configuration export expose credentials that expand the actor's access.",
    nodes: [
      { id: "device-control", label: "Control network appliance" },
      { id: "collect", label: "Capture traffic or enumerate services" },
      { id: "export", label: "Export capture or configuration" },
      { id: "reuse", label: "Reuse recovered credentials" },
    ],
    edges: [
      { source: "device-control", target: "collect", label: "start capture, LDAP/SNMP discovery, or config read" },
      { source: "collect", target: "export", label: "transfer with SCP, SFTP, TFTP, or HTTPS" },
      { source: "export", target: "reuse", label: "extract secrets and authenticate" },
    ],
    textAlternative: [
      "The actor uses privileged appliance access to capture transit traffic, query infrastructure services, or read configuration.",
      "Collected material is transferred to another system using an available file-transfer or web channel.",
      "Recovered credentials are then reused against AAA, management, VPN, or neighboring infrastructure services.",
    ],
    relatedHunts: ["unexpected-ldap-from-infrastructure", "packet-capture-started", "packet-capture-followed-by-file-transfer"],
  },
  {
    id: "attack-path-covert-tunnel",
    slug: "covert-tunnel",
    title: "Covert Tunnel",
    summary: "An unauthorized encapsulation or VPN path bypasses expected inspection and carries selected internal or transit traffic to an external endpoint.",
    nodes: [
      { id: "change", label: "Create tunnel or overlay state" },
      { id: "route", label: "Select traffic with route or ACL" },
      { id: "encapsulate", label: "Encapsulate selected traffic" },
      { id: "external", label: "Deliver to actor endpoint" },
    ],
    edges: [
      { source: "change", target: "route", label: "bind GRE, IPsec, WireGuard, OpenVPN, or VXLAN" },
      { source: "route", target: "encapsulate", label: "redirect matching flows" },
      { source: "encapsulate", target: "external", label: "cross boundary outside normal service path" },
    ],
    textAlternative: [
      "The actor creates unauthorized tunnel or overlay state on an appliance.",
      "A route, ACL, or policy selects traffic that the device normally forwards elsewhere.",
      "The device encapsulates that traffic and sends it to an actor-controlled endpoint, bypassing the expected inspection path.",
    ],
    relatedHunts: ["unexpected-gre-tunnel", "new-ipsec-tunnel", "management-acl-modified"],
  },
  {
    id: "attack-path-telemetry-suppression",
    slug: "telemetry-suppression",
    title: "Telemetry Suppression",
    summary: "An actor reduces or redirects device-reported evidence, then operates during the resulting blind spot while independent sensors record inconsistencies.",
    nodes: [
      { id: "privilege", label: "Obtain privileged device access" },
      { id: "disable", label: "Disable or redirect telemetry" },
      { id: "operate", label: "Perform follow-on activity" },
      { id: "gap", label: "Create conflicting evidence or silence" },
    ],
    edges: [
      { source: "privilege", target: "disable", label: "alter syslog, flow export, audit, or time settings" },
      { source: "disable", target: "operate", label: "use reduced visibility" },
      { source: "operate", target: "gap", label: "device records diverge from independent telemetry" },
    ],
    textAlternative: [
      "After gaining privileged access, the actor changes logging, flow export, command accounting, or time synchronization.",
      "The actor then conducts discovery, lateral movement, or tunneling while device-local evidence is missing or redirected.",
      "Upstream flow, passive sensors, AAA, configuration history, or neighboring controls reveal a telemetry gap or contradiction.",
    ],
    relatedHunts: ["logging-destination-modified", "infrastructure-telemetry-gap"],
  },
];

export const attackPaths = AttackPathSchema.array().parse(attackPathSeeds);
