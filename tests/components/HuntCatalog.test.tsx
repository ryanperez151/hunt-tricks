import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { HuntCatalog, HuntCatalogFallback } from "@/components/hunts/HuntCatalog";
import { HuntSchema } from "@/lib/schemas";
import { makeHunt } from "@/tests/test-utils";

const navigation = vi.hoisted(() => ({
  pathname: "/hunts/",
  replace: vi.fn(),
  search: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => navigation.search,
}));

describe("HuntCatalog", () => {
  beforeEach(() => {
    navigation.pathname = "/hunts/";
    navigation.replace.mockReset();
    navigation.search = new URLSearchParams();
  });

  test("derives options from records and writes canonical trailing-slash URL state", async () => {
    const user = userEvent.setup();
    render(<HuntCatalog hunts={[{ ...HuntSchema.parse(makeHunt()), protocols: ["SNMP"] }]} />);

    expect(screen.getByRole("option", { name: "SNMP" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "OpenVPN" })).not.toBeInTheDocument();
    expect(screen.getByText("1 hunt")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Protocol"), "SNMP");

    expect(navigation.replace).toHaveBeenCalledWith("/hunts/?protocol=SNMP", { scroll: false });
  });

  test("ignores unknown URL values and offers a reset when valid filters have no matches", async () => {
    const user = userEvent.setup();
    navigation.search = new URLSearchParams("protocol=not-real&protocol=SNMP");
    render(<HuntCatalog hunts={[HuntSchema.parse(makeHunt())]} />);

    expect(screen.getByRole("heading", { name: "No hunts match these filters" })).toBeInTheDocument();
    expect(screen.getByText("0 hunts")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset hunt filters" }));
    expect(navigation.replace).toHaveBeenCalledWith("/hunts/", { scroll: false });
  });

  test("provides a useful server-rendered catalog while the URL island hydrates", () => {
    render(<HuntCatalogFallback hunts={[HuntSchema.parse(makeHunt())]} />);

    expect(screen.getByText("Catalog controls are loading. All hunts are available below.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /test hunt/i })).toHaveAttribute("href", "/hunts/test-hunt/");
  });
});
