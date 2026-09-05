import type { MetadataRoute } from "next";
import { getPublicUrl } from "@/lib/metadata";

export const dynamic = "force-static";

export function buildRobotsPolicy(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: getPublicUrl("/sitemap.xml"),
  };
}

export default function robots(): MetadataRoute.Robots {
  return buildRobotsPolicy();
}
