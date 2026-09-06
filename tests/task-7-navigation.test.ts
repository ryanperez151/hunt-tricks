import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const scopedNavigationFiles = [
  "components/hunts/HuntCard.tsx",
  "app/page.tsx",
  "app/hunts/[slug]/page.tsx",
] as const;

describe("Task 7 internal navigation contract", () => {
  test("uses framework links for internal routes and keeps explicit routes slash-terminated", () => {
    const sources = scopedNavigationFiles.map((file) => [file, readFileSync(file, "utf8")] as const);
    const internalRawAnchor = /<a\b[^>]*\bhref=\{?["'`]\//g;
    const explicitInternalHref = /\bhref=\{?(["'`])(\/[^"'`]*?)\1\}?/g;

    for (const [file, source] of sources) {
      expect(source.match(internalRawAnchor) ?? [], file).toHaveLength(0);
      const explicitInternalRoutes = [...source.matchAll(explicitInternalHref)];
      expect(explicitInternalRoutes.length, file).toBeGreaterThan(0);
      for (const match of explicitInternalRoutes) {
        expect(match[2].split(/[?#]/)[0], `${file}: ${match[2]}`).toMatch(/\/$/);
      }
    }

    expect(sources[0][1].match(/<a\b/g) ?? [], scopedNavigationFiles[0]).toHaveLength(0);
    expect(sources[1][1].match(/<a\b/g) ?? [], scopedNavigationFiles[1]).toHaveLength(0);
    expect(sources[2][1].match(/<a\b/g) ?? [], scopedNavigationFiles[2]).toHaveLength(1);
    expect(sources[2][1]).toContain("<a href={reference.url}");
  });
});
