import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { HuntCatalog, HuntCatalogFallback } from "@/components/hunts/HuntCatalog";
import { HuntSchema } from "@/lib/schemas";
import { makeHunt } from "@/tests/test-utils";

const navigation = vi.hoisted(() => ({
  pathname: "/hunts/",
  push: vi.fn(),
  replace: vi.fn(),
  search: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push, replace: navigation.replace }),
  useSearchParams: () => navigation.search,
}));

vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

describe("HuntCatalog", () => {
  beforeEach(() => {
    navigation.pathname = "/hunts/";
    navigation.push.mockReset();
    navigation.replace.mockReset();
    navigation.search = new URLSearchParams();
  });

  test("derives options from records and writes canonical trailing-slash URL state", async () => {
    const user = userEvent.setup();
    render(<HuntCatalog hunts={[{ ...HuntSchema.parse(makeHunt()), protocols: ["SNMP"] }]} />);

    expect(screen.getByRole("option", { name: "SNMP" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "OpenVPN" })).not.toBeInTheDocument();
    expect(screen.getByText("1 hunt")).toBeInTheDocument();

    await user.click(screen.getByText("Infrastructure and advanced filters"));
    await user.selectOptions(screen.getByLabelText("Protocol"), "SNMP");

    expect(navigation.push).toHaveBeenCalledWith("/hunts/?protocol=SNMP", { scroll: false });
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  test("canonicalizes a dirty initial URL with replace, then records reset in history with push", async () => {
    const user = userEvent.setup();
    navigation.pathname = "/hunts";
    navigation.search = new URLSearchParams("unrelated=x&severity=critical&protocol=SNMP&severity=high&protocol=SNMP&protocol=not-real");
    render(<HuntCatalog hunts={[HuntSchema.parse(makeHunt())]} />);

    expect(screen.getByRole("heading", { name: "No hunts match these filters" })).toBeInTheDocument();
    expect(screen.getByText("0 hunts")).toBeInTheDocument();
    expect(navigation.replace).toHaveBeenCalledWith(
      "/hunts/?protocol=SNMP&severity=high&severity=critical",
      { scroll: false },
    );
    expect(navigation.push).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Reset hunt filters" }));
    expect(navigation.push).toHaveBeenCalledWith("/hunts/", { scroll: false });
  });

  test("renders newly supplied search params after Back or Forward navigation", () => {
    const snmpHunt = HuntSchema.parse({ ...makeHunt(), id: "hunt-snmp", slug: "snmp-hunt", title: "SNMP Hunt", protocols: ["SNMP"] });
    const sshHunt = HuntSchema.parse({ ...makeHunt(), id: "hunt-ssh", slug: "ssh-hunt", title: "SSH Hunt", protocols: ["SSH"] });
    navigation.search = new URLSearchParams("protocol=SNMP");
    const { rerender } = render(<HuntCatalog hunts={[snmpHunt, sshHunt]} />);

    expect(screen.getByRole("link", { name: "SNMP Hunt" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "SSH Hunt" })).not.toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();

    navigation.search = new URLSearchParams("protocol=SSH");
    rerender(<HuntCatalog hunts={[snmpHunt, sshHunt]} />);

    expect(screen.getByRole("link", { name: "SSH Hunt" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "SNMP Hunt" })).not.toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  test("provides a useful server-rendered catalog while the URL island hydrates", () => {
    render(<HuntCatalogFallback hunts={[HuntSchema.parse(makeHunt())]} />);

    expect(screen.getByText("Catalog controls are loading. All hunts are available below.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /test hunt/i })).toHaveAttribute("href", "/hunts/test-hunt/");
  });
});
