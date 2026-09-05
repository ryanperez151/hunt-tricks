import type { Metadata } from "next";

export const DEFAULT_SITE_URL = "https://hunt-the-infrastructure.example";
export const SITE_NAME = "Hunt the Infrastructure";
export const SITE_DESCRIPTION = "Threat hunting beyond the endpoint.";

type PageMetadataInput = Readonly<{
  title: string;
  description: string;
  path: string;
  type?: "article" | "website";
}>;

function normalizePathname(value: string): string {
  const segments = value.trim().split("/").filter(Boolean);
  return segments.length ? `/${segments.join("/")}` : "";
}

function configuredBasePath(): string {
  return normalizePathname(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
}

function deploymentBase(): URL {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  const siteUrl = new URL(configuredUrl);
  if (siteUrl.protocol !== "https:" && siteUrl.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.");
  }

  const sitePath = normalizePathname(siteUrl.pathname);
  const basePath = configuredBasePath();
  const deploymentPath = !basePath || sitePath === basePath
    ? sitePath || basePath
    : `${sitePath}${basePath}`;

  return new URL(`${deploymentPath || ""}/`, siteUrl.origin);
}

function normalizePublicPath(value: string, trailingSlash = true): string {
  const pathname = normalizePathname(value);
  if (!pathname) return "/";
  return !trailingSlash || /\.[a-z0-9]+$/i.test(pathname) ? pathname : `${pathname}/`;
}

export function getPublicUrl(path: string, options: Readonly<{ trailingSlash?: boolean }> = {}): string {
  const base = deploymentBase();
  const deploymentPath = normalizePathname(base.pathname);
  const publicPath = normalizePublicPath(path, options.trailingSlash);
  const routeAlreadyIncludesBase = deploymentPath && (
    publicPath === `${deploymentPath}/` || publicPath.startsWith(`${deploymentPath}/`)
  );
  const relativePath = routeAlreadyIncludesBase
    ? publicPath.slice(deploymentPath.length).replace(/^\//, "")
    : publicPath.replace(/^\//, "");

  return new URL(relativePath, base).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  type = "website",
}: PageMetadataInput): Metadata {
  const canonical = getPublicUrl(path);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type,
      url: canonical,
      siteName: SITE_NAME,
      images: [{
        url: getPublicUrl("/opengraph-image", { trailingSlash: false }),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_DESCRIPTION}`,
      }],
    },
  };
}
