export type MethodologyEntry = {
  id: string;
  title: string;
  summary: string;
  searchTerms: readonly string[];
  route: `/methodology/${string}`;
};

export const methodologyEntries: readonly MethodologyEntry[] = [
  {"id": "methodology-behavior", "title": "Hunt behavior in context", "summary": "Establish roles, reconstruct sequences, and test alternative explanations.", "searchTerms": ["role deviation", "baseline", "new relationships", "trust boundary"], "route": "/methodology/behavior"},
  {"id": "methodology-velocity", "title": "Reason about velocity", "summary": "Compare temporal windows and linked stages without turning speed into AI attribution.", "searchTerms": ["acceleration", "fan-out", "low-and-slow", "ingest delay", "stage latency"], "route": "/methodology/velocity"},
  {"id": "methodology-ai-autonomy", "title": "Investigate AI and autonomy", "summary": "Separate automation, adaptation, corroborated AI involvement, and malicious intent.", "searchTerms": ["reward hacking", "evaluator manipulation", "agent traces", "defender assistance", "prompt injection"], "route": "/methodology/ai-autonomy"},

  {
    id: "methodology-baselining",
    title: "Baseline Expected Infrastructure Communication",
    summary: "Build a dependency inventory and allow matrix that make unexpected initiators, destinations, protocols, and timing reviewable.",
    searchTerms: ["baseline", "dependency inventory", "allow matrix", "expected direction"],
    route: "/methodology/baselining",
  },
  {
    id: "methodology-rarity",
    title: "Reason About Infrastructure Rarity",
    summary: "Prioritize behavior by combining rarity, privilege, origin, destination, protocol, timing, and corroborating sequence without pretending the factors form a universal score.",
    searchTerms: ["rarity", "hunt score", "first seen", "fan-out", "sequence"],
    route: "/methodology/rarity",
  },
  {
    id: "methodology-independent-observation",
    title: "Require Independent Observation",
    summary: "Corroborate a potentially compromised appliance with upstream flow, passive network, identity, configuration, and external log evidence.",
    searchTerms: ["independent telemetry", "corroboration", "NetFlow", "TAP", "SPAN", "Zeek"],
    route: "/methodology/independent-observation",
  },
];

export const methodologySections: Record<string, readonly { title: string; paragraphs: readonly string[]; sourceIds: readonly string[] }[]> = {
  "behavior": [
    {
      "title": "Begin with a role, not an alert",
      "paragraphs": [
        "Establish the entity’s role, permissions, normal dependencies, and expected results. Compare it with itself over equivalent workload periods and with genuinely comparable peers. Novelty creates a question, not a verdict.",
        "Reconstruct actor → action → target → result → next action. Link identities and sessions with evidence; a shared IP does not establish a shared actor. Document alternative explanations and seek a second observation point."
      ],
      "sourceIds": ["research-nist-logs-2006"]
    },
    {
      "title": "Familiar tools still need context",
      "paragraphs": [
        "Microsoft’s 2023 Volt Typhoon reporting describes valid accounts and native tools. The editorial lesson is to evaluate permissions, targets, and downstream actions even when the executable is familiar. This is an investigation approach, not proof that a native-tool action is malicious."
      ],
      "sourceIds": [
        "research-volt-typhoon-2023"
      ]
    },
    {
      "title": "Separate observation from interpretation",
      "paragraphs": [
        "Paxson’s 1998 Bro paper separates network events from the policy that interprets them. Independent network observation remains useful; that historical architecture does not validate any present-day threshold or query."
      ],
      "sourceIds": [
        "research-bro-1998"
      ]
    },
    {
      "title": "Disconfirm the hypothesis",
      "paragraphs": [
        "Define expectation: record the permitted actor, target, action, and workload cadence.",
        "Identify deviation: specify exactly which role, relationship, privilege, or result changed.",
        "Reconstruct consequences: join the sequence using session and event evidence, preserving uncertainty.",
        "Disconfirm the hypothesis: check maintenance, migrations, approved orchestration, and an independent outcome before escalating."
      ],
      "sourceIds": []
    }
  ],
  "velocity": [
    {
      "title": "Measure change, not just count",
      "paragraphs": [
        "Rate is events per defined time. Acceleration is change in rate across comparable windows. Fan-out is distinct targets per actor or session. Stage latency is elapsed event time between linked steps. Periodicity is repeated timing with an explicit tolerance. Low-and-slow activity may be weak in a short window yet accumulate over a longer one.",
        "Compare sequences, branching, concurrency, and the time between consequential stages against comparable workloads. A five-minute view and a 24-hour view are illustrative analyst choices, not validated maliciousness cutoffs or a universal score. Normalize by successful workload units where possible. A percentage rate change from a zero baseline is undefined: show absolute counts instead."
      ],
      "sourceIds": []
    },
    {
      "title": "Keep event time and ingest time separate",
      "paragraphs": [
        "Account for clock skew, retries, batching, delayed ingestion, retention, scheduled workloads, scanners, and approved orchestration. Deduplicate stable event IDs only when their semantics justify it. Preserve both timestamps; arrival order can differ from action order.",
        "These logging and stream-processing foundations do not validate threat thresholds. State uncertainty for concurrent events instead of inventing a precise sequence. A rapid transition is meaningful only when actor linkage, timestamps, and telemetry coverage support it."
      ],
      "sourceIds": ["research-dataflow-2015", "research-nist-logs-2006"]
    },
    {
      "title": "Old lesson, current question",
      "paragraphs": [
        "CAIDA’s 2003 Slammer analysis documents rapid propagation by non-AI software. Its enduring lesson here is attribution caution: speed does not establish AI involvement. It does not validate a modern hunt threshold."
      ],
      "sourceIds": [
        "research-slammer-2003"
      ]
    }
  ],
  "ai-autonomy": [
    {
      "title": "Ask separate questions",
      "paragraphs": [
        "Was the activity automated? Did it adapt to results? Is AI involvement corroborated? These are separate findings, not a ladder: conventional adaptive automation and human-directed tooling can also branch after a failure. Malicious intent is a fourth question requiring permissions, target, and outcome context.",
        "Agent loops can shorten discovery-to-tool-choice and cross-system transitions. Discovery requests, tool failures, retries, session reuse, intermediate artifacts, and output checks are candidate observations, not claims about their prevalence or an AI fingerprint."
      ],
      "sourceIds": []
    },
    {
      "title": "Visibility is conditional",
      "paragraphs": [
        "Permissions, architecture, task, instructions, logging coverage, and operational choices determine the trail. Quiet execution or missing telemetry can leave sparse traces; absence of noise does not exclude autonomy.",
        "Stronger corroboration comes from authorized agent run IDs joined to model gateway requests, orchestration records, tool-call IDs, identity audit, and independent target events. Validate provenance, tenant, permission scope, and the actual downstream result. Model API use can be benign. Missing traces mean unknown, not no AI."
      ],
      "sourceIds": []
    },
    {
      "title": "A provider-reported incident",
      "paragraphs": [
        "Anthropic’s November 13, 2025 report describes chained tool use and incorrect success reports in a provider-observed campaign. The AI attribution rests on the provider’s investigation and visibility; the visible action pattern or request speed alone cannot reproduce that attribution."
      ],
      "sourceIds": [
        "research-ai-espionage-2025"
      ]
    },
    {
      "title": "Reward hacking means gaming the criterion",
      "paragraphs": [
        "Reward hacking exploits a reward, evaluator, or success criterion instead of fulfilling the intended objective. Rapid lateral movement or persistent pursuit of an attacker’s goal is not, by itself, reward hacking. Inference-time agents are not necessarily learning online.",
        "Anthropic’s 2024 reward-tampering study and the 2025 reward-hacking paper report controlled training or evaluation results. They do not establish prevalence in real intrusions.",
        "Investigate evaluator or test changes, forged outcome artifacts, monitoring-input manipulation, and claimed success unsupported by independent evidence. Compare versions, review authority, and target outcomes. Ordinary bugs, legitimate test maintenance, human fraud, and non-AI automation can overlap."
      ],
      "sourceIds": [
        "research-reward-2024",
        "research-reward-2025"
      ]
    },
    {
      "title": "AI as defender assistance",
      "paragraphs": [
        "Use AI to draft hypotheses, adapt queries, enrich context, and summarize cited evidence. Analysts verify actual fields, coverage, permissions, and outcomes; generated text is not evidence. Keep approval at real operational boundaries. This guide executes nothing.",
        "The 2024 Microsoft IT-administrator randomized trials support bounded task assistance in their studied setting, not general autonomous SOC reliability."
      ],
      "sourceIds": [
        "research-copilot-2024"
      ]
    },
    {
      "title": "AI as an attack surface",
      "paragraphs": [
        "Indirect prompt-injection research in 2023 experimentally demonstrated retrieved content crossing an instruction boundary in studied applications. Investigate the provenance of retrieved material and downstream tool actions, especially authorization changes and data exposure.",
        "NIST’s 2025 taxonomy categorizes poisoning, evasion, privacy, and abuse. It provides a vocabulary for investigation and mitigation, not occurrence frequencies."
      ],
      "sourceIds": [
        "research-injection-2023",
        "research-nist-2025"
      ]
    }
  ]
};
