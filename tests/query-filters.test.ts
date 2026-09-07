import { describe, expect, test } from "vitest";
import {
  emptyQueryFilters,
  parseQueryFilters,
  serializeQueryFilters,
  type QueryFilterOptions,
} from "@/lib/query-filters";

const options: QueryFilterOptions = {
  platforms: ["splunk", "kql", "zeek"],
  families: ["management-plane-c2", "discovery-credential-access"],
  protocols: ["SSH", "SNMP"],
  devices: ["firewall", "router"],
  telemetry: ["netflow-ipfix", "zeek"],
  techniques: ["T1046", "T1071"],
};

describe("query filters", () => {
  test("keeps only values the current option set offers, in option order", () => {
    const filters = parseQueryFilters(new URLSearchParams("platform=zeek&platform=splunk&platform=not-real"), options);

    expect(filters.platforms).toEqual(["splunk", "zeek"]);
    expect(filters.families).toEqual([]);
  });

  test("round-trips through a canonical, deduplicated query string", () => {
    const filters = parseQueryFilters(
      new URLSearchParams("technique=T1046&protocol=SNMP&technique=T1046&family=management-plane-c2"),
      options,
    );

    expect(serializeQueryFilters(filters, options).toString())
      .toBe("family=management-plane-c2&protocol=SNMP&technique=T1046");
    expect(parseQueryFilters(serializeQueryFilters(filters, options), options)).toEqual(filters);
  });

  test("serializes the empty filter set to an empty query string", () => {
    expect(serializeQueryFilters(emptyQueryFilters, options).toString()).toBe("");
  });
});
