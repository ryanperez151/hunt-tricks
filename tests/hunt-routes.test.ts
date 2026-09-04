import { describe, expect, test } from "vitest";
import { huntFamilies } from "@/data/families";
import { hunts } from "@/lib/content";
import {
  getHuntRouteMetadata,
  getHuntStaticParams,
  resolveHuntRoute,
} from "@/lib/hunt-routes";

describe("shared family and hunt routes", () => {
  test("generates exactly four families followed by twenty hunts without collisions", () => {
    const params = getHuntStaticParams();
    const expected = [
      ...huntFamilies.map((family) => ({ slug: family.id })),
      ...hunts.map((hunt) => ({ slug: hunt.slug })),
    ];

    expect(params).toEqual(expected);
    expect(params).toHaveLength(24);
    expect(new Set(params.map(({ slug }) => slug)).size).toBe(24);
  });

  test("resolves a family before a hunt and rejects non-canonical or unknown segments", () => {
    expect(resolveHuntRoute("management-plane-c2")).toMatchObject({
      kind: "family",
      family: { id: "management-plane-c2" },
    });
    expect(resolveHuntRoute("snmp-fan-out")).toMatchObject({
      kind: "hunt",
      hunt: { slug: "snmp-fan-out" },
    });
    for (const slug of ["", "SNMP-fan-out", "snmp-fan-out/", "not-real", " management-plane-c2"]) {
      expect(resolveHuntRoute(slug), slug).toBeUndefined();
      expect(getHuntRouteMetadata(slug), slug).toBeUndefined();
    }
  });

  test("derives distinct titles and descriptions for every static route", () => {
    const metadata = getHuntStaticParams().map(({ slug }) => getHuntRouteMetadata(slug));

    expect(metadata.every((item) => item && item.title.length > 10 && item.description.length > 40)).toBe(true);
    expect(new Set(metadata.map((item) => item?.title)).size).toBe(24);
    expect(new Set(metadata.map((item) => item?.description)).size).toBe(24);
    expect(getHuntRouteMetadata("management-plane-c2")?.title).toBe("Management-Plane C2 Hunts");
    expect(getHuntRouteMetadata("snmp-fan-out")?.title).toBe("SNMP Fan-Out");
  });
});
