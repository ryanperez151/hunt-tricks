import { afterEach, describe, expect, test, vi } from "vitest";
import { createElement } from "react";
import { render, screen, within } from "@testing-library/react";
import { huntFamilies } from "@/data/families";
import { attackPaths, hunts, protocols, researchEntries } from "@/lib/content";
import { buildRobotsPolicy } from "@/app/robots";
import { buildSitemapEntries } from "@/app/sitemap";
import AboutPage from "@/app/about/page";
import AttackPathsPage from "@/app/attack-paths/page";
import ResearchPage from "@/app/research/page";

afterEach(() => {
  vi.unstubAllEnvs();
});

const fixedRoutes = [
  "/",
  "/hunts/",
  "/attack-paths/",
  "/telemetry/",
  "/protocols/",
  "/queries/",
  "/research/",
  "/methodology/behavior/",
  "/methodology/velocity/",
  "/methodology/ai-autonomy/",
  "/methodology/baselining/",
  "/methodology/rarity/",
  "/methodology/independent-observation/",
  "/about/",
] as const;

describe("static route discovery", () => {
  test("sitemap contains exactly every public page backed by the static registries", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://hunt-the-infrastructure.example");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "");

    const paths = buildSitemapEntries().map((entry) => new URL(entry.url).pathname);
    const expected = [
      ...fixedRoutes,
      ...huntFamilies.map(({ id }) => `/hunts/${id}/`),
      ...hunts.map(({ slug }) => `/hunts/${slug}/`),
      ...protocols.map(({ slug }) => `/protocols/${slug}/`),
    ];

    expect(paths).toEqual(expected);
    expect(paths).toHaveLength(expected.length);
    expect(new Set(paths).size).toBe(expected.length);
    expect(paths).toContain("/hunts/snmp-fan-out/");
    expect(paths).toContain("/protocols/snmp/");
    expect(paths.some((path) => path.startsWith("/research/") && path !== "/research/")).toBe(false);
  });

  test("sitemap and robots use the same base-path-aware public URL policy", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://docs.example.test/guide/");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/guide");

    const entries = buildSitemapEntries();
    const robots = buildRobotsPolicy();

    expect(entries[0]?.url).toBe("https://docs.example.test/guide/");
    expect(entries.find(({ url }) => url.endsWith("/research/"))?.url).toBe("https://docs.example.test/guide/research/");
    expect(robots).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://docs.example.test/guide/sitemap.xml",
    });
  });

  test("keeps every sitemap route distinct when the deployment path is also a catalog route", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://docs.example.test/hunts");
    vi.stubEnv("NEXT_PUBLIC_BASE_PATH", "/hunts");

    const urls = buildSitemapEntries().map(({ url }) => url);
    expect(urls).toHaveLength(fixedRoutes.length + huntFamilies.length + hunts.length + protocols.length);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain("https://docs.example.test/hunts/");
    expect(urls).toContain("https://docs.example.test/hunts/hunts/");
    expect(urls).toContain("https://docs.example.test/hunts/hunts/snmp-fan-out/");
  });
});

describe("informational routes", () => {
  test("renders every attack path with its ordered interpretation and registry-backed related hunts", () => {
    render(createElement(AttackPathsPage));

    for (const attackPath of attackPaths) {
      const heading = screen.getByRole("heading", { name: attackPath.title, level: 2 });
      const article = heading.closest("article");
      expect(article).not.toBeNull();
      expect(within(article!).getByText(attackPath.summary)).toBeInTheDocument();
      expect(within(article!).getByRole("list", { name: `${attackPath.title} ordered path` }).children)
        .toHaveLength(attackPath.textAlternative.length);
      expect(attackPath.relatedHunts.length).toBeGreaterThan(0);
      expect(within(article!).getAllByRole("link", { name: /hunt:/i })).toHaveLength(attackPath.relatedHunts.length);
    }
  });

  test("renders grouped research cards with safe sources and related hunt links", () => {
    render(createElement(ResearchPage));

    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(researchEntries.length);
    for (const entry of researchEntries) {
      const card = cards.find((candidate) => candidate.id === entry.id)!;
      expect(card).toBeDefined();
      expect(within(card).getByRole("heading", { name: entry.title, level: 3 })).toBeInTheDocument();
      const source = within(card!).getByRole("link", { name: `Read ${entry.organization} primary source` });
      expect(within(card!).getByText(entry.publishedAt)).toHaveAttribute("datetime", entry.publishedAt);
      expect(within(card!).getByText(entry.affectedTechnology[0])).toBeInTheDocument();
      expect(within(card!).getByText(entry.relevantBehaviors[0])).toBeInTheDocument();
      expect(within(card!).queryAllByRole("link", { name: /hunt:/i })).toHaveLength(entry.relatedHunts.length);
      expect(source).toHaveAttribute("href", entry.sourceUrl);
      expect(source).toHaveAttribute("target", "_blank");
      expect(source).toHaveAttribute("rel", expect.stringMatching(/noopener/));
      expect(source).toHaveAttribute("rel", expect.stringMatching(/noreferrer/));
    }
  });

  test("states the guide boundaries without implying a live contribution service", () => {
    render(createElement(AboutPage));

    expect(screen.getByRole("heading", { name: "Origin is not transit", level: 2 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Adapt every query", level: 2 })).toBeInTheDocument();
    expect(screen.getByText(/does not accept submissions or run a contribution backend/i)).toBeInTheDocument();
  });
});
