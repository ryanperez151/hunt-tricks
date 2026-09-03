import { describe, expect, test } from "vitest";
import { hunts } from "@/lib/content";
import { aggregateQueries } from "@/lib/queries";

describe("query aggregation", () => {
  test("derives query records from hunts with stable IDs and inherited context", () => {
    const records = aggregateQueries(hunts);
    const managementEgress = records.find((item) => item.huntSlug === "unexpected-management-interface-egress");

    expect(records).toHaveLength(hunts.reduce((sum, hunt) => sum + hunt.queries.length, 0));
    expect(managementEgress).toMatchObject({
      id: "unexpected-management-interface-egress:splunk:0",
      huntSlug: "unexpected-management-interface-egress",
      huntTitle: "Unexpected Management Interface Egress",
      family: "management-plane-c2",
      platform: "splunk",
      protocols: expect.arrayContaining(["SSH", "HTTPS"]),
      telemetry: expect.arrayContaining(["netflow-ipfix", "zeek"]),
    });
  });

  test("does not mutate or expose mutable query content", () => {
    const records = aggregateQueries(hunts);
    const record = records[0]!;

    expect(Object.isFrozen(records)).toBe(true);
    expect(Object.isFrozen(record)).toBe(true);
    expect(record.query).toBe(hunts[0]!.queries[0]!.query);
    expect(record.protocols).not.toBe(hunts[0]!.protocols);
    expect(Object.isFrozen(record.protocols)).toBe(true);
  });
});
