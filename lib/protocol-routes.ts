import { getProtocolBySlug, protocols, type Protocol } from "@/lib/content";

export type ProtocolRouteMetadata = Readonly<{
  title: string;
  description: string;
}>;

export function getProtocolStaticParams(): readonly Readonly<{ slug: string }>[] {
  return Object.freeze(protocols.map(({ slug }) => Object.freeze({ slug })));
}

export function resolveProtocolRoute(slug: string): Protocol | undefined {
  return getProtocolBySlug(slug);
}

export function getProtocolRouteMetadata(slug: string): ProtocolRouteMetadata | undefined {
  const protocol = resolveProtocolRoute(slug);
  return protocol
    ? Object.freeze({
        title: `${protocol.name} Protocol Behavior`,
        description: protocol.definition,
      })
    : undefined;
}

export function getProtocolHref(slug: string): `/protocols/${string}/` | undefined {
  return resolveProtocolRoute(slug) ? `/protocols/${slug}/` : undefined;
}
