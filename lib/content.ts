import { z } from "zod";
import { HUNT_FAMILIES } from "@/lib/taxonomy";
import {
  AttackPathSchema,
  HuntSchema,
  ProtocolSchema,
  ResearchSchema,
  TelemetrySchema,
  type AttackPath,
  type Hunt,
  type Protocol,
  type Research,
  type Telemetry,
} from "@/lib/schemas";

export const ContentRegistriesSchema = z.object({
  hunts: z.array(HuntSchema),
  protocols: z.array(ProtocolSchema),
  telemetry: z.array(TelemetrySchema),
  research: z.array(ResearchSchema),
  attackPaths: z.array(AttackPathSchema),
});

export const ContentRegistriesInputSchema = z.object({
  hunts: z.array(z.unknown()),
  protocols: z.array(z.unknown()),
  telemetry: z.array(z.unknown()),
  research: z.array(z.unknown()),
  attackPaths: z.array(z.unknown()),
});

export type ContentRegistries = z.infer<typeof ContentRegistriesSchema>;
export type ContentRegistriesInput = z.infer<typeof ContentRegistriesInputSchema>;

export class ContentIntegrityError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Content integrity validation failed: ${issues.join("; ")}`);
    this.name = "ContentIntegrityError";
    this.issues = issues;
  }
}

function describeRecord(record: Record<string, unknown>, fallback: string) {
  return String(record.slug ?? record.id ?? fallback);
}

function valueAtPath(value: unknown, path: readonly PropertyKey[]) {
  let current = value;
  for (const segment of path) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<PropertyKey, unknown>)[segment];
  }
  return current;
}

function serializeInvalidValue(value: unknown) {
  try {
    const serialized = JSON.stringify(value);
    return serialized ?? String(value);
  } catch {
    return "[unserializable value]";
  }
}

function collectParsed<T>(
  schema: z.ZodType<T>,
  kind: string,
  records: readonly unknown[],
  issues: string[],
): T[] {
  const parsed: T[] = [];

  records.forEach((record, index) => {
    const result = schema.safeParse(record);
    if (result.success) {
      parsed.push(result.data);
      return;
    }

    const descriptor = record && typeof record === "object"
      ? describeRecord(record as Record<string, unknown>, `${kind}[${index}]`)
      : `${kind}[${index}]`;
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "record";
      const invalidValue = serializeInvalidValue(valueAtPath(record, issue.path));
      issues.push(`${kind} ${descriptor} field ${field}: ${issue.message}; received ${invalidValue}`);
    }
  });

  return parsed;
}

function collectDuplicates(
  kind: string,
  records: readonly Record<string, unknown>[],
  field: "id" | "slug",
  issues: string[],
) {
  const seen = new Set<string>();
  for (const record of records) {
    const value = record[field];
    if (typeof value !== "string") continue;
    if (seen.has(value)) {
      issues.push(`duplicate ${kind} ${field}: ${value}`);
    } else {
      seen.add(value);
    }
  }
}

function collectRelatedHuntErrors(
  kind: string,
  records: readonly { id: string; slug?: string; relatedHunts: string[] }[],
  huntSlugs: ReadonlySet<string>,
  issues: string[],
) {
  for (const record of records) {
    const descriptor = record.slug ?? record.id;
    for (const relatedHunt of record.relatedHunts) {
      if (!huntSlugs.has(relatedHunt)) {
        issues.push(`${kind} ${descriptor} field relatedHunts: ${relatedHunt}`);
      }
    }
  }
}

export function validateContentRegistries(registries: ContentRegistriesInput): void {
  const issues: string[] = [];
  const hunts = collectParsed(HuntSchema, "hunt", registries.hunts, issues);
  const protocols = collectParsed(ProtocolSchema, "protocol", registries.protocols, issues);
  const telemetry = collectParsed(TelemetrySchema, "telemetry", registries.telemetry, issues);
  const research = collectParsed(ResearchSchema, "research", registries.research, issues);
  const attackPaths = collectParsed(AttackPathSchema, "attack path", registries.attackPaths, issues);

  const collections: Array<[string, readonly Record<string, unknown>[], boolean]> = [
    ["hunt", hunts, true],
    ["protocol", protocols, true],
    ["telemetry", telemetry, false],
    ["research", research, false],
    ["attack path", attackPaths, true],
  ];
  for (const [kind, records, hasSlug] of collections) {
    collectDuplicates(kind, records, "id", issues);
    if (hasSlug) collectDuplicates(kind, records, "slug", issues);
  }

  const huntSlugs = new Set(hunts.map((hunt) => hunt.slug));
  const protocolNames = new Set(protocols.map((protocol) => protocol.name));
  const telemetryKeys = new Set(telemetry.map((source) => source.key));

  for (const hunt of hunts) {
    if (HUNT_FAMILIES.includes(hunt.slug as (typeof HUNT_FAMILIES)[number])) {
      issues.push(`hunt ${hunt.slug} field slug: collides with family slug ${hunt.slug}`);
    }
    for (const protocol of hunt.protocols) {
      if (!protocolNames.has(protocol)) {
        issues.push(`hunt ${hunt.slug} field protocols: unknown protocol ${protocol}`);
      }
    }
    for (const telemetryKey of [...hunt.telemetry.recommended, ...hunt.telemetry.optional]) {
      if (!telemetryKeys.has(telemetryKey)) {
        issues.push(`hunt ${hunt.slug} field telemetry: unknown telemetry ${telemetryKey}`);
      }
    }
  }

  collectRelatedHuntErrors("hunt", hunts, huntSlugs, issues);
  collectRelatedHuntErrors("protocol", protocols, huntSlugs, issues);
  collectRelatedHuntErrors("research", research, huntSlugs, issues);
  collectRelatedHuntErrors("attack path", attackPaths, huntSlugs, issues);

  if (issues.length > 0) throw new ContentIntegrityError(issues);
}

export type { AttackPath, Hunt, Protocol, Research, Telemetry };
