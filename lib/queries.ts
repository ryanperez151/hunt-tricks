import type { Hunt, HuntQuery } from "@/lib/schemas";

export type AggregatedQuery = Readonly<{
  id: string;
  title: HuntQuery["title"];
  description: HuntQuery["description"];
  detectionStrategy: Hunt["detectionStrategy"];
  platform: HuntQuery["platform"];
  query: HuntQuery["query"];
  huntId: Hunt["id"];
  huntSlug: Hunt["slug"];
  huntTitle: Hunt["title"];
  family: Hunt["family"];
  severity: Hunt["severity"];
  planes: readonly Hunt["planes"][number][];
  devices: readonly Hunt["devices"][number][];
  protocols: readonly Hunt["protocols"][number][];
  techniques: readonly Hunt["techniques"][number][];
  telemetry: readonly (Hunt["telemetry"]["recommended"][number] | Hunt["telemetry"]["optional"][number])[];
}>;

function freezeValues<T>(values: readonly T[]): readonly T[] {
  return Object.freeze([...values]);
}

export function aggregateQueries(hunts: readonly Hunt[]): readonly AggregatedQuery[] {
  const records = hunts.flatMap((hunt) => hunt.queries.map((query, index) => Object.freeze({
    id: `${hunt.slug}:${query.platform}:${index}`,
    title: query.title,
    description: query.description,
    detectionStrategy: hunt.detectionStrategy,
    platform: query.platform,
    query: query.query,
    huntId: hunt.id,
    huntSlug: hunt.slug,
    huntTitle: hunt.title,
    family: hunt.family,
    severity: hunt.severity,
    planes: freezeValues(hunt.planes),
    devices: freezeValues(hunt.devices),
    protocols: freezeValues(hunt.protocols),
    techniques: freezeValues(hunt.techniques),
    telemetry: freezeValues([...hunt.telemetry.recommended, ...hunt.telemetry.optional]),
  } satisfies AggregatedQuery)));

  return Object.freeze(records);
}
