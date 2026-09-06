import type { HUNT_FAMILIES } from "@/lib/taxonomy";

export type HuntFamily = {
  id: (typeof HUNT_FAMILIES)[number];
  label: string;
  objective: string;
};

export const huntFamilies: readonly HuntFamily[] = [
  {
    id: "management-plane-c2",
    label: "Management-Plane C2",
    objective: "Find appliances behaving like command-and-control clients through management interfaces, services, or device-originated egress.",
  },
  {
    id: "infrastructure-lateral-movement",
    label: "Infrastructure Lateral Movement",
    objective: "Detect trusted network devices reaching peers and internal systems in roles or directions absent from the approved dependency model.",
  },
  {
    id: "discovery-credential-access",
    label: "Discovery & Credential Access",
    objective: "Identify device-driven scanning, directory and SNMP enumeration, packet capture, and collection of configurations or credentials.",
  },
  {
    id: "traffic-manipulation",
    label: "Traffic Manipulation",
    objective: "Expose unauthorized routes, ACLs, resolvers, tunnels, and telemetry changes that redirect, copy, suppress, or conceal traffic.",
  },
  {
    id: "cross-domain",
    label: "Cross-Domain",
    objective: "Follow related behavior across identity, endpoint, cloud, SaaS, email, build, network, and data boundaries.",
  },
  {
    id: "ai-agent-abuse",
    label: "AI & Agent Abuse",
    objective: "Investigate misuse of AI applications, agent permissions, tools, data, evaluations, and observable action sequences.",
  },
];
