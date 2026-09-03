export function makeHunt() {
  return {
    id: "hunt-test",
    title: "Test Hunt",
    slug: "test-hunt",
    family: "management-plane-c2",
    summary: "A concise test hunt summary.",
    hypothesis: "The device is initiating unexpected management traffic.",
    rationale: "Unexpected management-plane traffic can indicate a compromised device or a configuration change that requires investigation.",
    severity: "high",
    confidence: "medium",
    planes: ["management"],
    devices: ["router"],
    protocols: ["SSH"],
    techniques: ["T1071"],
    telemetry: {
      recommended: ["netflow-ipfix"],
      optional: ["dns"],
    },
    suspiciousBehavior: ["A router initiates SSH to an unapproved destination."],
    investigationSteps: ["Confirm the destination is not an approved management peer."],
    escalationConditions: ["Escalate when the destination is unapproved."],
    falsePositives: ["A newly approved management service can produce this pattern."],
    enrichment: ["Check AAA records for the initiating account."],
    detectionStrategy: "Compare management-plane egress to the approved peer inventory.",
    queries: [
      {
        title: "Unexpected management egress",
        description: "Find management-plane egress outside approved peers.",
        platform: "pseudocode",
        query: "source.device_type = network_infrastructure",
      },
    ],
    references: [
      {
        title: "Reference",
        url: "https://example.com/reference",
      },
    ],
    relatedHunts: [],
    behaviorComparison: {
      expected: {
        title: "Expected management flow",
        nodes: [
          { id: "router", label: "Router" },
          { id: "nms", label: "NMS" },
        ],
        edges: [{ source: "router", target: "nms", label: "SSH administration" }],
        textAlternative: ["Router connects to the approved NMS over SSH."],
      },
      suspicious: {
        title: "Suspicious management flow",
        nodes: [
          { id: "router", label: "Router" },
          { id: "external", label: "External host" },
        ],
        edges: [{ source: "router", target: "external", label: "Unexpected SSH" }],
        textAlternative: ["Router connects to an unapproved external host over SSH."],
      },
    },
  };
}
