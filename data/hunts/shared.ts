import { HuntSchema, type Hunt, type Reference } from "@/lib/schemas";

export type HuntSeed = Omit<Hunt, "id">;

export const references = {
  cisaRouters: {
    title: "CISA AA25-239A: Countering compromise of networks worldwide",
    url: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa25-239a",
  },
  arcaneDoor: {
    title: "Cisco Talos: ArcaneDoor",
    url: "https://blog.talosintelligence.com/arcanedoor-new-espionage-focused-campaign-found-targeting-perimeter-network-devices/",
  },
  ghostRouter: {
    title: "Mandiant: Ghost in the Router",
    url: "https://cloud.google.com/blog/topics/threat-intelligence/china-nexus-espionage-targets-juniper-routers",
  },
  cloakedCovert: {
    title: "Mandiant: Cloaked and Covert",
    url: "https://cloud.google.com/blog/topics/threat-intelligence/uncovering-unc3886-espionage-operations",
  },
  ncscEdgeRouters: {
    title: "NCSC: UK Internet Edge Router Devices Advisory",
    url: "https://www.ncsc.gov.uk/information/uk-internet-edge-router-devices-advisory",
  },
  microsoftDnsHijacking: {
    title: "Microsoft: SOHO router compromise and DNS hijacking",
    url: "https://www.microsoft.com/en-us/security/blog/2026/04/07/soho-router-compromise-leads-to-dns-hijacking-and-adversary-in-the-middle-attacks/",
  },
  cisaVoltTyphoon: {
    title: "CISA AA24-038A: PRC actors in critical infrastructure",
    url: "https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-038a",
  },
  mitreNetworkSniffing: {
    title: "MITRE ATT&CK T1040: Network Sniffing",
    url: "https://attack.mitre.org/techniques/T1040/",
  },
  mitreProtocolTunneling: {
    title: "MITRE ATT&CK T1572: Protocol Tunneling",
    url: "https://attack.mitre.org/techniques/T1572/",
  },
} as const satisfies Record<string, Reference>;

export function deepFreeze<T>(value: T): Readonly<T> {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      deepFreeze(nested);
    }
    Object.freeze(value);
  }
  return value;
}

export function defineHunts(seeds: readonly HuntSeed[]): readonly Hunt[] {
  const records = HuntSchema.array().parse(seeds.map((seed) => ({
    id: `hunt-${seed.slug}`,
    ...seed,
  })));
  return deepFreeze(records) as readonly Hunt[];
}
