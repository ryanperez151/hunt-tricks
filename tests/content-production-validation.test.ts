import { expect, test } from "vitest";
import { attackPaths, hunts, protocols, researchEntries, telemetrySources } from "@/lib/content";

test("loads every validated production content registry", () => {
  expect({
    hunts: hunts.length,
    protocols: protocols.length,
    telemetry: telemetrySources.length,
    research: researchEntries.length,
    attackPaths: attackPaths.length,
  }).toEqual({
    hunts: 20,
    protocols: 24,
    telemetry: 8,
    research: 7,
    attackPaths: 4,
  });
});
