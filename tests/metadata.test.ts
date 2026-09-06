import { afterEach, describe, expect, test, vi } from "vitest";
import { createPageMetadata, getPublicUrl } from "@/lib/metadata";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public metadata URLs", () => {
  test("builds canonical and filename-qualified Open Graph URLs from the deterministic fallback origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");

    const metadata = createPageMetadata({
      title: "SNMP Fan-Out",
      description: "Hunt SNMP fan-out.",
      path: "/hunts/snmp-fan-out/",
      type: "article",
    });

    expect(metadata).toMatchObject({
      alternates: {
        canonical: "https://hunt-tricks.example/hunts/snmp-fan-out/",
      },
      openGraph: {
        title: "SNMP Fan-Out",
        description: "Hunt SNMP fan-out.",
        type: "article",
        url: "https://hunt-tricks.example/hunts/snmp-fan-out/",
        images: [{
          url: "https://hunt-tricks.example/opengraph-image.png",
          width: 1200,
          height: 630,
        }],
      },
    });
  });

  test("normalizes trailing slashes and includes the configured base path exactly once", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://docs.example.test/field-guide/");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/field-guide/");

    expect(getPublicUrl("/research")).toBe("https://docs.example.test/field-guide/research/");
    expect(getPublicUrl("/about/")).toBe("https://docs.example.test/field-guide/about/");
    expect(getPublicUrl("/opengraph-image.png"))
      .toBe("https://docs.example.test/field-guide/opengraph-image.png");
  });

  test("appends a configured base path when the site URL contains only an origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://docs.example.test");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "field-guide");

    expect(getPublicUrl("/")).toBe("https://docs.example.test/field-guide/");
    expect(getPublicUrl("/protocols/snmp/")).toBe("https://docs.example.test/field-guide/protocols/snmp/");
  });

  test.each([
    ["/", "https://docs.example.test/hunts/"],
    ["/hunts/", "https://docs.example.test/hunts/hunts/"],
    ["/hunts/snmp-fan-out/", "https://docs.example.test/hunts/hunts/snmp-fan-out/"],
  ])("preserves app-relative route %s when its segment matches the deployment path", (path, canonical) => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://docs.example.test/hunts");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/hunts");

    expect(createPageMetadata({ title: "Guide", description: "Guide page", path })).toMatchObject({
      alternates: { canonical },
      openGraph: { url: canonical },
    });
  });

  test.each([
    {
      name: "parent prefix ending in the configured segment",
      siteUrl: "https://docs.example.test/docs/guide/",
      basePath: "/guide",
      expected: "https://docs.example.test/docs/guide/research/",
    },
    {
      name: "exact configured segment",
      siteUrl: "https://docs.example.test/guide/",
      basePath: "/guide",
      expected: "https://docs.example.test/guide/research/",
    },
    {
      name: "parent path without the configured segment",
      siteUrl: "https://docs.example.test/docs/",
      basePath: "/guide",
      expected: "https://docs.example.test/docs/guide/research/",
    },
    {
      name: "near-match suffix that is not the configured segment",
      siteUrl: "https://docs.example.test/docs/my-guide/",
      basePath: "/guide",
      expected: "https://docs.example.test/docs/my-guide/guide/research/",
    },
  ])("adds the base path exactly once for $name", ({ siteUrl, basePath, expected }) => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", basePath);

    expect(getPublicUrl("/research/")).toBe(expected);
  });
});
