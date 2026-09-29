import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { QueryLibrary, QueryLibraryFallback, type QueryDisplayRecord } from "@/components/queries/QueryLibrary";
import type { TrustedHighlightedQueryHtml } from "@/lib/highlight";
import QueriesPage from "@/app/queries/page";
import { hunts } from "@/lib/content";
import { buildSearchIndex } from "@/lib/search-index";

vi.mock("server-only", () => ({}));

vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a data-next-link="true" {...props} />,
}));

const navigation = vi.hoisted(() => ({
  pathname: "/queries/",
  push: vi.fn(),
  replace: vi.fn(),
  search: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
  useSearchParams: () => navigation.search,
}));

function highlighted(label: string) {
  return `<pre class="shiki"><code><span>${label}</span></code></pre>` as TrustedHighlightedQueryHtml;
}

const queries: readonly QueryDisplayRecord[] = [
  {
    id: "management-egress:splunk:0",
    title: "Unexpected management egress",
    description: "Find unapproved management-plane destinations.",
    detectionStrategy: "Compare device-origin traffic with approved management dependencies.",
    platform: "splunk",
    query: "RAW SPLUNK A",
    highlightedHtml: highlighted("HIGHLIGHT SPLUNK A"),
    huntSlug: "unexpected-management-interface-egress",
    huntTitle: "Unexpected Management Interface Egress",
    family: "management-plane-c2",
    devices: ["firewall"],
    protocols: ["SSH"],
    telemetry: ["netflow-ipfix"],
    techniques: ["T1071"],
  },
  {
    id: "snmp-fan-out:zeek:0",
    title: "Managed-device SNMP fan-out",
    description: "Find routers querying several unexpected SNMP peers.",
    detectionStrategy: "Compare request initiators and peer breadth with the authorized NMS baseline.",
    platform: "zeek",
    query: "RAW ZEEK B",
    highlightedHtml: highlighted("HIGHLIGHT ZEEK B"),
    huntSlug: "snmp-fan-out",
    huntTitle: "SNMP Fan-Out",
    family: "discovery-credential-access",
    devices: ["router"],
    protocols: ["SNMP"],
    telemetry: ["zeek"],
    techniques: ["T1046"],
  },
  {
    id: "snmp-fan-out:kql:1",
    title: "SNMP fan-out by source",
    description: "Group distinct SNMP destinations by device.",
    detectionStrategy: "Compare request initiators and peer breadth with the authorized NMS baseline.",
    platform: "kql",
    query: "RAW KQL C",
    highlightedHtml: highlighted("HIGHLIGHT KQL C"),
    huntSlug: "snmp-fan-out",
    huntTitle: "SNMP Fan-Out",
    family: "discovery-credential-access",
    devices: ["firewall"],
    protocols: ["SNMP"],
    telemetry: ["netflow-ipfix"],
    techniques: ["T1046"],
  },
];

describe("QueryLibrary", () => {
  beforeEach(() => {
    navigation.pathname = "/queries/";
    navigation.push.mockReset();
    navigation.replace.mockReset();
    navigation.search = new URLSearchParams();
  });

  test("renders each owning hunt strategy verbatim before its query through the page projection", async () => {
    render(await QueriesPage());
    const cards = screen.getAllByTestId("query-card");
    const expected = hunts.flatMap((hunt) => hunt.queries.map(() => hunt.detectionStrategy));
    expect(cards).toHaveLength(expected.length);

    cards.forEach((card, index) => {
      const strategy = within(card).getByRole("heading", { name: "Detection strategy" }).parentElement!;
      expect(within(strategy).getByText(expected[index]!, { exact: true }).textContent).toBe(expected[index]);
      const code = card.querySelector("pre")!;
      expect(code).not.toBeNull();
      expect(strategy.compareDocumentPosition(code) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  test("resolves every query search destination to the matching rendered card", async () => {
    render(await QueriesPage());
    const entries = buildSearchIndex().filter((entry) => entry.type === "QUERY");

    for (const entry of entries) {
      const fragment = new URL(entry.href, "https://example.test").hash.slice(1);
      const card = document.getElementById(decodeURIComponent(fragment));
      expect(card, entry.title).not.toBeNull();
      expect(within(card!).getByRole("heading", { name: entry.title })).toBeInTheDocument();
    }
  });

  test("filters by platform without duplicating or mismatching highlighted and copied query content", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);
    const { rerender } = render(<QueryLibrary queries={queries} />);

    await user.selectOptions(screen.getByLabelText("Platform"), "zeek");
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/?platform=zeek", { scroll: false });

    navigation.search = new URLSearchParams("platform=zeek");
    rerender(<QueryLibrary queries={queries} />);

    const cards = screen.getAllByTestId("query-card");
    expect(cards).toHaveLength(1);
    expect(within(cards[0]!).getByText("ZEEK")).toBeInTheDocument();
    expect(within(cards[0]!).getByText("HIGHLIGHT ZEEK B")).toBeInTheDocument();
    expect(screen.queryByText("HIGHLIGHT SPLUNK A")).not.toBeInTheDocument();

    await user.click(within(cards[0]!).getByRole("button", { name: "Copy query" }));
    expect(writeText).toHaveBeenCalledWith("RAW ZEEK B");
    writeText.mockRestore();
  });

  test("offers every dimension and applies OR within categories plus AND across populated categories", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<QueryLibrary queries={queries} />);

    for (const label of ["Platform", "Family", "Protocol", "Device", "Telemetry", "Technique"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }

    await user.selectOptions(screen.getByLabelText("Platform"), "splunk");
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/?platform=splunk", { scroll: false });

    navigation.search = new URLSearchParams("platform=splunk");
    rerender(<QueryLibrary queries={queries} />);

    // The select is controlled purely by URL state, so selecting a set of options in one
    // gesture only takes effect once the DOM reflects the value already pushed for the first
    // one (React resets an uncommitted controlled <select>'s selection between change events
    // that don't themselves update its `value`). Re-selecting the full ["splunk", "zeek"] set
    // against the now-current "platform=splunk" render is what actually produces a combined push.
    await user.selectOptions(screen.getByLabelText("Platform"), ["splunk", "zeek"]);
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/?platform=splunk&platform=zeek", { scroll: false });

    navigation.search = new URLSearchParams("platform=splunk&platform=zeek");
    rerender(<QueryLibrary queries={queries} />);

    await user.selectOptions(screen.getByLabelText("Protocol"), "SNMP");
    expect(navigation.push).toHaveBeenLastCalledWith(
      "/queries/?platform=splunk&platform=zeek&protocol=SNMP",
      { scroll: false },
    );

    navigation.search = new URLSearchParams("platform=splunk&platform=zeek&protocol=SNMP");
    rerender(<QueryLibrary queries={queries} />);

    expect(screen.getByText("1 query")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Managed-device SNMP fan-out" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Unexpected management egress" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "SNMP fan-out by source" })).not.toBeInTheDocument();
  });

  test("shows active filter chips, supports individual removal and clears all filters", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<QueryLibrary queries={queries} />);

    await user.selectOptions(screen.getByLabelText("Technique"), "T1046");
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/?technique=T1046", { scroll: false });

    navigation.search = new URLSearchParams("technique=T1046");
    rerender(<QueryLibrary queries={queries} />);
    expect(screen.getByText("2 queries")).toBeInTheDocument();
    expect(screen.getByText("Active filters")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Remove technique T1046 filter" }));
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/", { scroll: false });

    navigation.search = new URLSearchParams();
    rerender(<QueryLibrary queries={queries} />);
    expect(screen.getByText("3 queries")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Device"), "firewall");
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/?device=firewall", { scroll: false });

    navigation.search = new URLSearchParams("device=firewall");
    rerender(<QueryLibrary queries={queries} />);

    await user.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/", { scroll: false });

    navigation.search = new URLSearchParams();
    rerender(<QueryLibrary queries={queries} />);
    expect(screen.getByText("3 queries")).toBeInTheDocument();
    expect(screen.queryByText("Active filters")).not.toBeInTheDocument();
  });

  test("describes multi-selection in terms every input mode can follow", () => {
    render(<QueryLibrary queries={queries} />);

    const guidance = document.getElementById("query-filter-guidance")!;
    expect(screen.getByLabelText("Platform")).toHaveAttribute("aria-describedby", "query-filter-guidance");
    expect(guidance).toHaveTextContent(
      "Select one or more values. With a keyboard or mouse, hold Control or Command while selecting. On a touch screen, tap each value.",
    );
  });

  test("provides a resettable empty state and preserves inherited hunt context", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<QueryLibrary queries={queries} />);

    const firstCard = screen.getAllByTestId("query-card")[0]!;
    expect(within(firstCard).getByRole("link", { name: "Unexpected Management Interface Egress" }))
      .toHaveAttribute("href", "/hunts/unexpected-management-interface-egress/");
    expect(within(firstCard).getByText("Find unapproved management-plane destinations.")).toBeInTheDocument();
    expect(within(firstCard).getByText("Adapt field names and data models to your environment.")).toBeInTheDocument();
    expect(within(firstCard).getByText("firewall")).toBeInTheDocument();
    expect(within(firstCard).getByText("SSH")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Platform"), "splunk");
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/?platform=splunk", { scroll: false });

    navigation.search = new URLSearchParams("platform=splunk");
    rerender(<QueryLibrary queries={queries} />);

    await user.selectOptions(screen.getByLabelText("Protocol"), "SNMP");
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/?platform=splunk&protocol=SNMP", { scroll: false });

    navigation.search = new URLSearchParams("platform=splunk&protocol=SNMP");
    rerender(<QueryLibrary queries={queries} />);
    expect(screen.getByRole("heading", { name: "No queries match these filters" })).toBeInTheDocument();
    expect(screen.getByText("0 queries")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset query filters" }));
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/", { scroll: false });

    navigation.search = new URLSearchParams();
    rerender(<QueryLibrary queries={queries} />);
    expect(screen.getByText("3 queries")).toBeInTheDocument();
  });

  test("names a removal chip with the same label the user can see", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<QueryLibrary queries={queries} />);

    await user.selectOptions(screen.getByLabelText("Telemetry"), "netflow-ipfix");
    expect(navigation.push).toHaveBeenLastCalledWith("/queries/?telemetry=netflow-ipfix", { scroll: false });

    navigation.search = new URLSearchParams("telemetry=netflow-ipfix");
    rerender(<QueryLibrary queries={queries} />);

    const chip = screen.getByRole("button", { name: "Remove telemetry NetFlow / IPFIX filter" });
    expect(chip).toHaveTextContent("NetFlow / IPFIX");
  });

  test("omits metadata rows the source hunt does not populate", () => {
    const bare: QueryDisplayRecord = {
      ...queries[0]!,
      id: "identity-hunt:kql:0",
      title: "Identity-only query",
      devices: [],
      protocols: [],
      telemetry: [],
      techniques: [],
    };
    render(<QueryLibrary queries={[bare]} />);

    const card = screen.getByTestId("query-card");
    expect(within(card).getByText("Family")).toBeInTheDocument();
    expect(within(card).queryByText("Devices")).not.toBeInTheDocument();
    expect(within(card).queryByText("Protocols")).not.toBeInTheDocument();
    expect(within(card).queryByText("Telemetry")).not.toBeInTheDocument();
  });

  test("writes filter selections to the URL and renders the URL's filters on Back", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<QueryLibrary queries={queries} />);

    await user.selectOptions(screen.getByLabelText("Platform"), "zeek");
    expect(navigation.push).toHaveBeenCalledWith("/queries/?platform=zeek", { scroll: false });

    navigation.search = new URLSearchParams("platform=zeek");
    rerender(<QueryLibrary queries={queries} />);
    expect(screen.getByText("1 query")).toBeInTheDocument();

    navigation.search = new URLSearchParams();
    rerender(<QueryLibrary queries={queries} />);
    expect(screen.getByText("3 queries")).toBeInTheDocument();
  });

  test("provides a useful server-rendered library while the URL island hydrates", () => {
    render(<QueryLibraryFallback queries={queries} />);

    expect(screen.getByText("Library controls are loading. All queries are available below.")).toBeInTheDocument();
    expect(screen.getAllByTestId("query-card")).toHaveLength(queries.length);
    for (const query of queries) {
      expect(screen.getByRole("heading", { name: query.title })).toBeInTheDocument();
    }
  });
});
