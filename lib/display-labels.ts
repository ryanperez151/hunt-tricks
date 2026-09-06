export const displayLabels: Record<string, string> = {
  endpoints: "Endpoints", identity: "Identity", cloud: "Cloud control planes", saas: "SaaS", email: "Email",
  "network-edge": "Network & edge", containers: "Containers & orchestration", cicd: "CI/CD", "supply-chain": "Software supply chains", "data-stores": "Data stores", "ot-iot": "OT / IoT", "ai-systems": "AI systems",
  defender: "Defender assistance", attacker: "Attacker capability", target: "AI attack surface",
  "stage-transition": "Stage-transition latency", "trust-boundary": "Trust-boundary crossing", "adaptive-sequence": "Adaptive action sequence",
  "incident-report": "Incident report", experiment: "Controlled experiment", framework: "Framework guidance", "historical-research": "Historical research",
};
export function displayLabel(value: string) { return displayLabels[value] ?? value.replaceAll("-", " "); }
