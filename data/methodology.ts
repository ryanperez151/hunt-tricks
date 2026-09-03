export type MethodologyEntry = {
  id: string;
  title: string;
  summary: string;
  searchTerms: readonly string[];
  route: `/methodology/${string}`;
};

export const methodologyEntries: readonly MethodologyEntry[] = [
  {
    id: "methodology-baselining",
    title: "Baseline Expected Infrastructure Communication",
    summary: "Build a dependency inventory and allow matrix that make unexpected initiators, destinations, protocols, and timing reviewable.",
    searchTerms: ["baseline", "dependency inventory", "allow matrix", "expected direction"],
    route: "/methodology/baselining",
  },
  {
    id: "methodology-rarity",
    title: "Reason About Infrastructure Rarity",
    summary: "Prioritize behavior by combining rarity, privilege, origin, destination, protocol, timing, and corroborating sequence without pretending the factors form a universal score.",
    searchTerms: ["rarity", "hunt score", "first seen", "fan-out", "sequence"],
    route: "/methodology/rarity",
  },
  {
    id: "methodology-independent-observation",
    title: "Require Independent Observation",
    summary: "Corroborate a potentially compromised appliance with upstream flow, passive network, identity, configuration, and external log evidence.",
    searchTerms: ["independent telemetry", "corroboration", "NetFlow", "TAP", "SPAN", "Zeek"],
    route: "/methodology/independent-observation",
  },
];
