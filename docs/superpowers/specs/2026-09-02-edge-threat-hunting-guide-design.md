# Hunt the Infrastructure — MVP Design

**Date:** 2026-09-02
**Status:** Approved
**Product subtitle:** Threat Hunting Beyond the Endpoint

## Purpose

Build a polished, public field guide for threat hunters investigating traditionally under-observed enterprise network infrastructure. The guide centers one distinction: traffic forwarded by an appliance is not the same as traffic initiated by that appliance.

Every major page should help answer at least one of these questions:

- Why is this device initiating this connection?
- Should this protocol exist between these systems?
- Has this device ever behaved this way before?
- Is this appliance acting as a client, scanner, proxy, packet sniffer, or tunnel endpoint when it normally should not?
- Can independent telemetry validate behavior reported by a potentially compromised device?

The initial release is a content-driven, fully static application. It has no database, authentication, CMS, API backend, user account system, or third-party security-platform integration.

## Audience and outcome

The primary audience is a desktop-based SOC analyst or threat hunter. The site should help that analyst move quickly from a behavioral question to:

1. A concrete hunt hypothesis.
2. The expected and suspicious communication patterns.
3. Required independent telemetry.
4. Vendor-neutral detection logic.
5. Adaptable platform-specific example queries.
6. A triage and escalation workflow.
7. Related protocols, hunts, attack paths, and research.

The tone is a technical field manual: concise, evidence-oriented, and operational rather than promotional.

## Architecture

Use Next.js with the App Router, React, TypeScript, and Tailwind CSS. Configure Next.js with `output: "export"`, generate all dynamic route parameters at build time, and avoid runtime server features. The generated output must be hostable on Vercel, Cloudflare Pages, or GitHub Pages without an application server.

Use structured TypeScript registries for hunts, protocols, telemetry, research metadata, methodology metadata, attack paths, navigation, and shared vocabularies. Use MDX only where longer research or methodology prose benefits from rich document authoring. Zod validates every record before it reaches page code.

Static server components render primary content. Client components are limited to interactions that require browser state:

- URL-backed hunt filtering.
- Client-side global search and the `Ctrl/Cmd + K` command palette.
- Query and checklist copy actions.
- Plane toggles and expandable explanatory rows.
- Mobile navigation.

There are no API routes. Search indexes a normalized projection of the validated registries and executes in the browser. The query library aggregates query definitions from hunts rather than maintaining a second source of query content.

## Route map

The primary navigation is:

- `/` — home and core concept introduction.
- `/hunts` — searchable and filterable hunt catalog.
- `/hunts/[slug]` — statically generated family landing page or operational hunt detail.
- `/attack-paths` — four representative infrastructure attack chains.
- `/telemetry` — telemetry coverage matrix and source explanations.
- `/protocols` — protocol catalog.
- `/protocols/[slug]` — statically generated protocol behavior detail.
- `/queries` — query catalog aggregated from hunts.
- `/research` — infrastructure-compromise research library.
- `/methodology/baselining` — expected communication modeling.
- `/methodology/rarity` — conceptual Infrastructure Hunt Score.
- `/methodology/independent-observation` — independent evidence principle.
- `/about` — project purpose, limitations, and contribution direction.

Unknown static routes render a branded not-found page.

The four family URLs remain exactly `/hunts/management-plane-c2`, `/hunts/infrastructure-lateral-movement`, `/hunts/discovery-credential-access`, and `/hunts/traffic-manipulation`. Because those URLs occupy the same segment as hunt slugs, a single static `[slug]` route generates both kinds of parameter and resolves family slugs before hunt slugs. Schema validation prevents a hunt slug from colliding with a family slug.

## Visual system

The default and only MVP theme is dark. The palette uses a near-black navy page background, slightly lighter panels, restrained cyan/teal for primary interaction, amber for caution, and red only for high-risk conditions. Sans-serif type carries navigation and prose; monospace type carries protocols, addresses, telemetry fields, and detection logic.

The visual language resembles security engineering documentation and a calm SOC console. It excludes cyberpunk decoration, animated terminal effects, matrix imagery, excessive glow, and ornamental neon.

Layout targets 1440px desktop first, then 1024px laptop, 768px tablet, and 390px mobile. Content remains readable and all tables, code blocks, diagrams, and card grids adapt or scroll without clipping.

## Application shell

The shared shell contains:

- A sticky header with product identity and desktop navigation.
- An accessible mobile menu.
- A prominent global search trigger with keyboard shortcut hint.
- A bounded reading width for prose and a wider workspace width for catalogs and matrices.
- A footer with purpose, safety/adaptation note, and route links.

All actionable elements have visible focus states. Navigation identifies the current section. External research links use safe link attributes.

## Homepage

The homepage opens with “Hunt the Infrastructure” and the supplied supporting copy. Its “Explore Hunts” action leads to `/hunts`; “Start With the Management Plane” leads to `/hunts/management-plane-c2`.

The hero network visualization shows Internet, firewall, router, core, servers, and endpoints. It distinguishes ordinary transit traffic from connections initiated by the firewall or router. A nearby `OriginMatters` callout asks whether an observed flow was forwarded by or initiated from the firewall.

Subsequent homepage sections:

1. “Stop Treating the Firewall as Just a Sensor,” with Privileged, Persistent, Under-Instrumented, and Trusted characteristics.
2. A three-plane explorer that toggles Data, Management, and Control examples.
3. Four hunt-family entry cards.
4. Featured flagship hunts.
5. The independent observation equation: device telemetry plus independent telemetry equals higher confidence.
6. A concise next-step path into baselining and the hunt catalog.

## Content contracts

### Hunt

A hunt record contains:

- Identity: `id`, `title`, `slug`, and `family`.
- Explanation: `summary`, `hypothesis`, `rationale`, and optional `expectedBehavior`.
- Classification: `severity`, `confidence`, `planes`, `devices`, `protocols`, `techniques`, and `telemetry`.
- Operational content: `suspiciousBehavior`, `investigationSteps`, `escalationConditions`, `falsePositives`, and `enrichment`.
- Detection content: a vendor-neutral `detectionStrategy` followed by one or more queries.
- Evidence graph: `references` and `relatedHunts`.
- Optional structured behavior-comparison and timeline data for richer visuals.

Severity is `low | medium | high | critical`; confidence is `low | medium | high`; plane is `management | control | data`. Hunt families are `management-plane-c2`, `infrastructure-lateral-movement`, `discovery-credential-access`, and `traffic-manipulation`.

Query platforms in the MVP are `splunk`, `kql`, `zeek`, and `pseudocode`. Every rendered query displays: “Adapt field names and data models to your environment.”

### Protocol

A protocol record contains identity, display name, category, ports or encapsulation identifier, plain-language description, legitimate infrastructure uses, expected directionality, suspicious patterns, attacker abuse cases, structured normal and suspicious flow diagrams, and related hunt slugs.

### Telemetry

A telemetry record contains identity, display name, summary, collection guidance, contribution to investigations, limitations, and coverage ratings for C2, lateral movement, discovery, and manipulation.

### Research

A research record contains title, organization, publication date, optional threat actor, affected technology, relevant behaviors, related hunt slugs, source URL, and a concise infrastructure-hunting summary. Entries must be directly relevant to infrastructure compromise rather than generic threat news.

### Methodology and attack paths

Methodology metadata supplies title, summary, search terms, and route. Attack paths contain ordered nodes and labeled transitions plus a textual interpretation and related hunts.

## Validation

Zod schemas validate hunt, query, protocol, telemetry, research, and attack-path records. A registry integrity function additionally enforces:

- Unique IDs and slugs.
- No hunt slug collision with a family slug.
- Valid related-hunt references.
- Valid protocol references using the supported protocol registry.
- Valid telemetry references using the supported telemetry registry.
- Valid absolute HTTP(S) reference URLs.
- A non-empty hunt hypothesis.
- At least one investigation step.
- At least one query on each flagship hunt.
- Valid protocol-to-hunt references.
- Valid research-to-hunt references.

Validation runs in unit tests and is imported by the production build so malformed content fails the build visibly.

## Hunt catalog

The `/hunts` page shows one compact, clickable `HuntCard` per record. Each card presents title, family, severity, summary or short hypothesis, protocols, telemetry, and device categories without relying solely on color.

Filters cover family, device, protocol, plane, severity, and telemetry. Active filters are encoded in query parameters so filtered catalog URLs can be copied or revisited. Multiple categories combine with AND semantics across categories and OR semantics within a category. A clear-all action and explicit no-results state are provided.

The catalog initially includes these 20 hunts:

1. Unexpected Management Interface Egress.
2. New Infrastructure External Destination.
3. Infrastructure Beaconing.
4. Suspicious Infrastructure DNS.
5. Alternate DNS Resolver.
6. Unexpected SSH Egress.
7. Firewall-to-Router SSH.
8. Router-to-Router SSH.
9. Device-to-Device HTTPS Administration.
10. SNMP Fan-Out.
11. SNMP From Unexpected Initiator.
12. New AAA Destination.
13. Unexpected LDAP From Infrastructure.
14. Packet Capture Started.
15. Packet Capture Followed by File Transfer.
16. Unexpected GRE Tunnel.
17. New IPsec Tunnel.
18. Logging Destination Modified.
19. Infrastructure Telemetry Gap.
20. Management ACL Modified.

## Hunt detail

Every hunt detail page follows the same operational order:

1. Header with family, severity, confidence, and plane.
2. Hunt hypothesis.
3. `OriginMatters` callout where relevant.
4. Expected-versus-suspicious `BehaviorComparison`.
5. “Why this matters” rationale.
6. Required telemetry split into recommended and optional sources with explanations.
7. Vendor-neutral detection strategy.
8. Platform query blocks with copy controls and adaptation warning.
9. Triage checklist with optional checklist copy action.
10. Escalation conditions.
11. False positives and enrichment.
12. Optional attack timeline.
13. ATT&CK techniques where mappings are defensible.
14. Related hunts and references.

The five flagship hunts set the depth standard:

- Unexpected Management Interface Egress.
- Infrastructure Beaconing.
- Device-to-Device SSH, represented in the seed catalog by the firewall-to-router and router-to-router SSH cases and a shared generic detail model.
- SNMP Fan-Out.
- Unexpected GRE Tunnel.

These include multiple queries where the telemetry supports them, complete triage and escalation guidance, and structured diagrams. The other fifteen hunts remain actionable: each has valid classification, detection logic, investigation steps, likely false positives, enrichment guidance, and at least one relevant query or pseudocode strategy.

## Protocol explorer

The catalog seeds SSH, HTTPS, SNMP, TACACS+, RADIUS, LDAP, LDAPS, NETCONF, RESTCONF, SCP, SFTP, TFTP, DNS, NTP, BGP, OSPF, GRE, IPsec, VXLAN, SMB, RDP, WinRM, WireGuard, and OpenVPN.

Each detail page answers what the protocol is, why infrastructure uses it, expected direction, unusual behavior, attacker abuse, and which hunts use it. `ProtocolFlowDiagram` consumes structured nodes and directed connections. It displays both a visual flow and an accessible textual equivalent.

## Query library

The query library flattens `hunt.queries` into searchable records retaining hunt, family, device, protocol, telemetry, and technique metadata. Filters cover platform and those hunt dimensions. Query text is never executed. Copy controls report success or failure through an accessible live region.

The supplied Splunk “Unexpected Infrastructure Egress” query is included in the corresponding flagship hunt, unchanged except for surrounding explanatory metadata.

## Telemetry and methodology

The telemetry matrix has clickable or keyboard-expandable rows for NetFlow/IPFIX, DNS, AAA, configuration diffs, CLI audit, Zeek, packet capture, and syslog. Each row shows C2, lateral movement, discovery, and manipulation coverage using both words and visual strength indicators.

The baselining page defines the expected dependency inventory and presents an Infrastructure Communication Allow Matrix. The rarity page explains the conceptual Infrastructure Hunt Score without implementing numerical scoring. The independent-observation page emphasizes that an appliance cannot be the sole source of evidence about itself and lists upstream NetFlow, TAP/SPAN, Zeek, DNS, AAA, central configuration management, external syslog, and neighboring-firewall telemetry.

## Attack paths and timeline

`NetworkFlow`, `ProtocolFlowDiagram`, and `AttackTimeline` are lightweight React/CSS/SVG components with no graph-library dependency. Their inputs are structured node and edge objects, and their visual output scales horizontally or stacks on narrow viewports.

The attack-path catalog includes Infrastructure Pivot, Credential Collection, Covert Tunnel, and Telemetry Suppression. Each path has an adjacent ordered-text representation. Hunt timelines teach that isolated anomalies can be benign while sequences reveal intent.

## Search

Global search indexes hunts, protocols, queries, research, and methodology. Each normalized entry contains type, title, description, route, tags, and searchable body text. Search results label their object type as HUNT, PROTOCOL, QUERY, RESEARCH, or METHODOLOGY.

The command palette opens from a header control or `Ctrl/Cmd + K`, traps focus while open, closes with Escape, and restores focus to its trigger. Results update locally as the user types. An explicit empty state appears when nothing matches.

## Research library

The launch library contains a small curated set of primary, infrastructure-relevant reports from organizations such as CISA, Cisco Talos, Google Threat Intelligence/Mandiant, Microsoft, NSA, NCSC, and vendor security response teams. Every entry links observed behaviors to one or more hunts. Content is summarized rather than copied, and URLs are treated as inert data.

## Accessibility and responsive behavior

The application uses semantic landmarks, heading order, labeled form controls, keyboard-operable menus and dialogs, high-contrast text, visible focus styles, and `prefers-reduced-motion` support. Color reinforces but never solely communicates family, severity, coverage, selection, or risk.

Diagrams include textual equivalents or meaningful accessible labels. Wide matrices and code blocks scroll within their containers. Catalog cards stack and filter controls collapse appropriately at 768px and 390px widths. Touch targets remain usable on mobile.

## Error and empty states

- Invalid source content throws a descriptive build-time validation error naming the record and field.
- Unknown slugs resolve to the static not-found page.
- Empty filter and search results explain why nothing is displayed and offer a reset action.
- Clipboard failure preserves the content and presents a non-blocking manual-copy message.
- Unsupported or absent optional content sections are omitted without leaving empty headings.

## Metadata and static hosting

Every detail page generates a unique title, description, canonical URL, and Open Graph metadata. The site provides a sitemap, `robots.txt`, application icons, and a static social sharing asset suitable for every export target. The canonical site origin is configured in one metadata constant so hosts can override it at build time.

Static-host path behavior is verified against the exported output. No feature depends on server-side redirects, cookies, request headers, or runtime image optimization.

## Testing

Testing follows red-green-refactor for behavioral code.

### Unit tests

- Zod schema acceptance and rejection.
- Registry uniqueness and reference integrity.
- Hunt and protocol lookup.
- Hunt filter AND/OR semantics and URL serialization.
- Search normalization, ranking, and object-type labels.
- Query aggregation from hunt records.
- Related-hunt resolution.
- Severity presentation mapping.

### Component tests

- Hunt card content and accessible link.
- Hunt filter control behavior and reset.
- Code copy success and failure states.
- Behavior comparison labels and text alternatives.
- Protocol flow diagram nodes, connections, and accessible equivalent.
- Search dialog keyboard behavior.

### Playwright journeys

- Home to hunt catalog.
- Filter hunts by protocol.
- Open a hunt and copy a query.
- Navigate to a related hunt.
- Search for “SNMP” and open a result.
- Open and close mobile navigation.
- Verify core pages at 1440px and 390px without horizontal page overflow.

### Release verification

The release gate runs content validation, unit/component tests, linting, TypeScript checks, Playwright critical journeys, and `next build`. The exported artifact must be present and navigable without a backend.

## Delivery slices

Implementation is divided into independently testable slices:

1. Toolchain, static shell, design tokens, and navigation.
2. Schemas, registries, validation, and foundational tests.
3. Twenty-hunt dataset and four hunt families.
4. Hunt catalog, URL filters, and cards.
5. Hunt detail template and five flagship hunts.
6. Reusable diagrams and timelines.
7. Protocol catalog and detail routes.
8. Telemetry and methodology pages.
9. Aggregated query library.
10. Global search.
11. Attack paths and research library.
12. Accessibility, responsive behavior, metadata, and export polish.
13. Full verification and review.

Each slice must preserve a working production build. The repository uses focused files rather than a single content or component monolith.

## Explicitly deferred work

The MVP does not include vendor-specific packs, an ATT&CK explorer, detection-as-code exports, community submission workflows, artifact export, a baseline generator, live SIEM integrations, authentication, accounts, or a CMS. These remain future roadmap items even if related extension points are apparent during implementation.

## Definition of done

The MVP is complete when:

- The homepage communicates origin versus transit and the infrastructure-as-host model.
- Four hunt families and all 20 required hunts are indexed.
- Five flagship hunts contain full operational content.
- Hunt filters and global search work with accessible empty/reset states.
- Protocol, telemetry, query, methodology, attack-path, research, and about routes exist.
- Reusable behavior, protocol-flow, network-flow, and timeline visuals work responsively.
- Content schemas and cross-reference integrity fail invalid builds.
- Accessibility and mobile requirements are covered by automated and manual verification.
- Unit/component tests and critical Playwright journeys pass.
- The production static export succeeds without a database or runtime backend.
