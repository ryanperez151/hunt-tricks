import { afterEach, describe, expect, test, vi } from "vitest";
import { createPageMetadata, getPublicUrl } from "@/lib/metadata";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("public metadata URLs", () => {
  test("builds canonical and Open Graph URLs from the deterministic fallback origin", () => {
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
        canonical: "https://hunt-the-infrastructure.example/hunts/snmp-fan-out/",
      },
      openGraph: {
        title: "SNMP Fan-Out",
        description: "Hunt SNMP fan-out.",
        type: "article",
        url: "https://hunt-the-infrastructure.example/hunts/snmp-fan-out/",
        images: [{
          url: "https://hunt-the-infrastructure.example/opengraph-image",
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
    expect(getPublicUrl("/field-guide/about/")).toBe("https://docs.example.test/field-guide/about/");
    expect(getPublicUrl("/opengraph-image", { trailingSlash: false }))
      .toBe("https://docs.example.test/field-guide/opengraph-image");
  });

  test("appends a configured base path when the site URL contains only an origin", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://docs.example.test");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "field-guide");

    expect(getPublicUrl("/")).toBe("https://docs.example.test/field-guide/");
    expect(getPublicUrl("/protocols/snmp/")).toBe("https://docs.example.test/field-guide/protocols/snmp/");
  });
});
