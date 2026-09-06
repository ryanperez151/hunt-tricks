import { defineHunts, type HuntSeed } from "@/data/hunts/shared";
import type { Reference } from "@/lib/schemas";

export { defineHunts as defineExpandedHunts };
export type { HuntSeed as ExpandedHuntSeed };

export const expandedReferences = {
  midnight: { title: "Microsoft: Midnight Blizzard responder guidance", url: "https://www.microsoft.com/en-us/security/blog/2024/01/25/midnight-blizzard-guidance-for-responders-on-nation-state-attack/" },
  token: { title: "Microsoft: Token theft response guidance", url: "https://www.microsoft.com/en-us/security/blog/2022/11/16/token-tactics-how-to-prevent-detect-and-respond-to-cloud-token-theft/" },
  aitm: { title: "Microsoft: Multi-stage AiTM and BEC campaign", url: "https://www.microsoft.com/en-us/security/blog/2023/06/08/detecting-and-mitigating-a-multi-stage-aitm-phishing-and-bec-campaign/" },
  snowflake: { title: "Mandiant: UNC5537 Snowflake data theft", url: "https://cloud.google.com/blog/topics/threat-intelligence/unc5537-snowflake-data-theft-extortion" },
  xz: { title: "Red Hat: Response to the XZ security incident", url: "https://www.redhat.com/en/blog/understanding-red-hats-response-xz-security-incident" },
  tjActions: { title: "StepSecurity: tj-actions/changed-files compromise", url: "https://www.stepsecurity.io/blog/harden-runner-detection-tj-actions-changed-files-action-is-compromised" },
  awsKey: { title: "AWS: Responding to an exposed access key", url: "https://aws.amazon.com/blogs/security/what-to-do-if-you-inadvertently-expose-an-aws-access-key/" },
  voltTyphoon: { title: "Microsoft: Volt Typhoon living-off-the-land activity", url: "https://www.microsoft.com/en-us/security/blog/2023/05/24/volt-typhoon-targets-us-critical-infrastructure-with-living-off-the-land-techniques/" },
  kubernetesAudit: { title: "Kubernetes: Auditing", url: "https://kubernetes.io/docs/tasks/debug/debug-cluster/audit/" },
  cisaTriton: { title: "CISA, FBI, and DOE: Energy-sector actor TTPs", url: "https://www.ic3.gov/CSA/2022/220325-2.pdf" },
  injection: { title: "Greshake et al.: Indirect prompt injection", url: "https://arxiv.org/abs/2302.12173" },
  aiEspionage: { title: "Anthropic: AI-orchestrated espionage report", url: "https://www.anthropic.com/news/disrupting-AI-espionage" },
  reward: { title: "Anthropic: Reward-tampering experiments", url: "https://www.anthropic.com/research/reward-tampering" },
  nist: { title: "NIST: Adversarial machine-learning taxonomy", url: "https://www.nist.gov/publications/adversarial-machine-learning-taxonomy-and-terminology-attacks-and-mitigations-0" },
} as const satisfies Record<string, Reference>;

export const noInfrastructureContext = {
  showOriginMatters: false,
  planes: [],
  devices: [],
  protocols: [],
};
