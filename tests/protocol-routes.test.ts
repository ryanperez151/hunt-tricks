import { describe, expect, test } from "vitest";
import { protocols } from "@/lib/content";
import {
  getProtocolHref,
  getProtocolRouteMetadata,
  getProtocolStaticParams,
  resolveProtocolRoute,
} from "@/lib/protocol-routes";

describe("protocol routes", () => {
  test("generates exactly one deterministic static route for every protocol", () => {
    const params = getProtocolStaticParams();

    expect(params).toEqual(protocols.map(({ slug }) => ({ slug })));
    expect(params).toHaveLength(24);
    expect(new Set(params.map(({ slug }) => slug)).size).toBe(24);
    expect(params).toContainEqual({ slug: "snmp" });
  });

  test("resolves only exact protocol slugs and emits slash-terminated internal hrefs", () => {
    expect(resolveProtocolRoute("snmp")).toMatchObject({ slug: "snmp", name: "SNMP" });
    expect(getProtocolHref("snmp")).toBe("/protocols/snmp/");

    for (const slug of ["", "SNMP", "snmp/", " snmp", "not-real"]) {
      expect(resolveProtocolRoute(slug), slug).toBeUndefined();
      expect(getProtocolRouteMetadata(slug), slug).toBeUndefined();
      expect(getProtocolHref(slug), slug).toBeUndefined();
    }
  });

  test("derives unique, substantive metadata for all 24 protocol details", () => {
    const metadata = getProtocolStaticParams().map(({ slug }) => getProtocolRouteMetadata(slug));

    expect(metadata.every((item) => item && item.title.length > 3 && item.description.length > 40)).toBe(true);
    expect(new Set(metadata.map((item) => item?.title)).size).toBe(24);
    expect(new Set(metadata.map((item) => item?.description)).size).toBe(24);
    expect(getProtocolRouteMetadata("snmp")).toEqual({
      title: "SNMP Protocol Behavior",
      description: protocols.find(({ slug }) => slug === "snmp")?.definition,
    });
  });
});
