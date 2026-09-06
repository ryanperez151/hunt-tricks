import type { MetadataRoute } from "next";
import { methodologyEntries } from "@/data/methodology";
import { huntFamilies } from "@/data/families";
import { hunts, protocols } from "@/lib/content";
import { getPublicUrl } from "@/lib/metadata";

export const dynamic = "force-static";

export const publicStaticRoutes = Object.freeze([
  "/",
  "/hunts/",
  "/attack-paths/",
  "/telemetry/",
  "/protocols/",
  "/queries/",
  "/research/",
  ...methodologyEntries.map(({ route }) => `${route}/`),
  "/about/",
  ...huntFamilies.map(({ id }) => `/hunts/${id}/`),
  ...hunts.map(({ slug }) => `/hunts/${slug}/`),
  ...protocols.map(({ slug }) => `/protocols/${slug}/`),
]);

export function buildSitemapEntries(): MetadataRoute.Sitemap {
  return publicStaticRoutes.map((route) => ({ url: getPublicUrl(route) }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
