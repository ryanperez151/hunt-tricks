import { huntFamilies, type HuntFamily } from "@/data/families";
import { getHuntBySlug, getHuntsByFamily, hunts, type Hunt } from "@/lib/content";

export type HuntRoute =
  | Readonly<{ kind: "family"; family: HuntFamily; hunts: readonly Hunt[] }>
  | Readonly<{ kind: "hunt"; hunt: Hunt }>;

export type HuntRouteMetadata = Readonly<{
  title: string;
  description: string;
}>;

export function getHuntStaticParams(): readonly Readonly<{ slug: string }>[] {
  return Object.freeze([
    ...huntFamilies.map((family) => Object.freeze({ slug: family.id })),
    ...hunts.map((hunt) => Object.freeze({ slug: hunt.slug })),
  ]);
}

export function resolveHuntRoute(slug: string): HuntRoute | undefined {
  const family = huntFamilies.find((candidate) => candidate.id === slug);
  if (family) {
    return Object.freeze({ kind: "family", family, hunts: getHuntsByFamily(family.id) });
  }

  const hunt = getHuntBySlug(slug);
  return hunt ? Object.freeze({ kind: "hunt", hunt }) : undefined;
}

export function getHuntRouteMetadata(slug: string): HuntRouteMetadata | undefined {
  const route = resolveHuntRoute(slug);
  if (!route) return undefined;

  return route.kind === "family"
    ? Object.freeze({
        title: `${route.family.label} Hunts`,
        description: `${route.family.objective} Browse ${route.hunts.length} operational hunts in this family.`,
      })
    : Object.freeze({
        title: route.hunt.title,
        description: route.hunt.summary,
      });
}
