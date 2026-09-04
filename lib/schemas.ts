import { z } from "zod";
import {
  CONFIDENCE_LEVELS,
  DEVICES,
  HUNT_FAMILIES,
  PLANES,
  PROTOCOL_NAMES,
  QUERY_PLATFORMS,
  SEVERITIES,
  TELEMETRY_KEYS,
} from "@/lib/taxonomy";

const NonEmptyString = z.string().trim().min(1);
const HttpUrlSchema = z.url().refine((url) => /^https?:\/\//i.test(url), {
  message: "URL must use HTTP(S)",
});

export const DiagramNodeSchema = z.object({
  id: NonEmptyString,
  label: NonEmptyString,
});

export const DirectedEdgeSchema = z.object({
  source: NonEmptyString,
  target: NonEmptyString,
  label: NonEmptyString,
});

export const FlowDefinitionSchema = z.object({
  title: NonEmptyString,
  nodes: z.array(DiagramNodeSchema).min(1),
  edges: z.array(DirectedEdgeSchema),
  textAlternative: z.array(NonEmptyString).min(1),
});

export const BehaviorComparisonSchema = z.object({
  expected: FlowDefinitionSchema,
  suspicious: FlowDefinitionSchema,
});

export const HuntQuerySchema = z.object({
  title: NonEmptyString,
  description: NonEmptyString,
  platform: z.enum(QUERY_PLATFORMS),
  query: NonEmptyString,
});

export const ReferenceSchema = z.object({
  title: NonEmptyString,
  url: HttpUrlSchema,
});

export const HuntTelemetrySchema = z
  .object({
    recommended: z.array(z.enum(TELEMETRY_KEYS)).min(1),
    optional: z.array(z.enum(TELEMETRY_KEYS)),
  })
  .superRefine(({ recommended, optional }, context) => {
    const firstOccurrences = new Map<string, string>();
    for (const [group, keys] of [["recommended", recommended], ["optional", optional]] as const) {
      keys.forEach((key, index) => {
        const firstOccurrence = firstOccurrences.get(key);
        if (firstOccurrence) {
          context.addIssue({
            code: "custom",
            path: [group, index],
            message: `Duplicate telemetry key: ${key}; first used at ${firstOccurrence}`,
          });
          return;
        }
        firstOccurrences.set(key, `${group}.${index}`);
      });
    }
  });

export const HuntSchema = z.object({
  id: NonEmptyString,
  title: NonEmptyString,
  slug: NonEmptyString,
  family: z.enum(HUNT_FAMILIES),
  summary: NonEmptyString,
  hypothesis: NonEmptyString,
  rationale: NonEmptyString,
  showOriginMatters: z.boolean(),
  expectedBehavior: z.array(NonEmptyString).optional(),
  severity: z.enum(SEVERITIES),
  confidence: z.enum(CONFIDENCE_LEVELS),
  planes: z.array(z.enum(PLANES)).min(1),
  devices: z.array(z.enum(DEVICES)).min(1),
  protocols: z.array(z.enum(PROTOCOL_NAMES)),
  techniques: z.array(NonEmptyString),
  telemetry: HuntTelemetrySchema,
  suspiciousBehavior: z.array(NonEmptyString).min(1),
  investigationSteps: z.array(NonEmptyString).min(1),
  escalationConditions: z.array(NonEmptyString),
  falsePositives: z.array(NonEmptyString),
  enrichment: z.array(NonEmptyString),
  detectionStrategy: NonEmptyString,
  queries: z.array(HuntQuerySchema).min(1),
  references: z.array(ReferenceSchema).min(1),
  relatedHunts: z.array(NonEmptyString),
  behaviorComparison: BehaviorComparisonSchema.optional(),
});

export const ProtocolSchema = z.object({
  id: NonEmptyString,
  slug: NonEmptyString,
  name: z.enum(PROTOCOL_NAMES),
  category: NonEmptyString,
  portOrEncapsulation: NonEmptyString,
  definition: NonEmptyString,
  infrastructureUses: z.array(NonEmptyString).min(1),
  expectedDirection: NonEmptyString,
  suspiciousPatterns: z.array(NonEmptyString).min(1),
  attackerAbuse: z.array(NonEmptyString).min(1),
  normalFlow: FlowDefinitionSchema,
  suspiciousFlow: FlowDefinitionSchema,
  relatedHunts: z.array(NonEmptyString),
});

const CoverageSchema = z.enum(CONFIDENCE_LEVELS);

export const TelemetrySchema = z.object({
  id: NonEmptyString,
  key: z.enum(TELEMETRY_KEYS),
  name: NonEmptyString,
  summary: NonEmptyString,
  collectionGuidance: NonEmptyString,
  investigationContribution: NonEmptyString,
  limitations: NonEmptyString,
  coverage: z.object({
    c2: CoverageSchema,
    lateralMovement: CoverageSchema,
    discovery: CoverageSchema,
    manipulation: CoverageSchema,
  }),
});

export const ResearchSchema = z.object({
  id: NonEmptyString,
  title: NonEmptyString,
  organization: NonEmptyString,
  publishedAt: z.string().date(),
  threatActor: NonEmptyString.optional(),
  affectedTechnology: z.array(NonEmptyString).min(1),
  relevantBehaviors: z.array(NonEmptyString).min(1),
  relatedHunts: z.array(NonEmptyString),
  sourceUrl: HttpUrlSchema,
  summary: NonEmptyString,
});

export const AttackPathSchema = z.object({
  id: NonEmptyString,
  slug: NonEmptyString,
  title: NonEmptyString,
  summary: NonEmptyString,
  nodes: z.array(DiagramNodeSchema).min(1),
  edges: z.array(DirectedEdgeSchema).min(1),
  textAlternative: z.array(NonEmptyString).min(1),
  relatedHunts: z.array(NonEmptyString),
});

export type DiagramNode = z.infer<typeof DiagramNodeSchema>;
export type DirectedEdge = z.infer<typeof DirectedEdgeSchema>;
export type FlowDefinition = z.infer<typeof FlowDefinitionSchema>;
export type BehaviorComparison = z.infer<typeof BehaviorComparisonSchema>;
export type HuntQuery = z.infer<typeof HuntQuerySchema>;
export type Reference = z.infer<typeof ReferenceSchema>;
export type HuntTelemetry = z.infer<typeof HuntTelemetrySchema>;
export type Hunt = z.infer<typeof HuntSchema>;
export type Protocol = z.infer<typeof ProtocolSchema>;
export type Telemetry = z.infer<typeof TelemetrySchema>;
export type Research = z.infer<typeof ResearchSchema>;
export type AttackPath = z.infer<typeof AttackPathSchema>;
