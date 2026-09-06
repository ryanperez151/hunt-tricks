export const homeContent = {
  eyebrow: "hunt-tricks / defensive field guide",
  title: "Hunt the behavior. Follow the change.",
  heroCopy: "A research-backed field guide to suspicious behavior across identities, systems, and AI. Start with a scope, examine the sequence, then test the hypothesis.",
  originQuestion: "Was this traffic forwarded BY the appliance, or initiated FROM it?",
  heroNetwork: {
    nodes: ["Internet", "Firewall", "Router", "Core", "Servers", "Endpoints"],
    flows: [
      { kind: "transit", label: "Ordinary transit", path: "Endpoints → Core → Router → Firewall → Internet" },
      { kind: "origin", label: "Device-originated", path: "Firewall or Router → Internet" },
    ],
  },
  actions: {
    primary: { label: "Explore Hunts", href: "/hunts" },
    secondary: { label: "Start With the Management Plane", href: "/hunts/management-plane-c2" },
  },
  originTransitExamples: [
    { kind: "transit", label: "Ordinary transit", example: "A user endpoint requests an Internet service and the firewall forwards the flow." },
    { kind: "origin", label: "Device-originated", example: "The firewall management address initiates a new HTTPS or SSH session to the Internet." },
  ],
  applianceCharacteristics: [
    { title: "Privileged", description: "Controls routes, policy, identity integrations, and visibility across trust boundaries." },
    { title: "Persistent", description: "Runs continuously at stable network positions where long-lived access has outsized reach." },
    { title: "Under-Instrumented", description: "Often lacks endpoint agents and exposes only vendor-specific logs or short local histories." },
    { title: "Trusted", description: "Receives broad access and operational exceptions that can make malicious device-originated traffic look routine." },
  ],
  planeExamples: [
    { plane: "data", label: "Data plane", examples: ["Forward user and server traffic", "Apply packet filters, NAT, and load-balancing decisions"] },
    { plane: "management", label: "Management plane", examples: ["SSH, HTTPS, NETCONF, RESTCONF, AAA, logging, and software updates"] },
    { plane: "control", label: "Control plane", examples: ["BGP and OSPF adjacencies", "Route, neighbor, and tunnel-state exchange"] },
  ],
  independentObservation: {
    title: "Do not let a device be the sole witness to its own compromise.",
    terms: ["Device telemetry", "Independent telemetry", "Higher confidence"],
    equation: "Device telemetry + independent telemetry = higher confidence",
    nextStep: "Model expected dependencies, then hunt for new origin, direction, destination, protocol, timing, and sequence.",
  },
} as const;
