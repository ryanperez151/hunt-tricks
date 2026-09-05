import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { describe, expect, test, vi } from "vitest";
import { Header } from "@/components/layout/Header";
import { SearchProvider } from "@/components/search/SearchProvider";
import { SearchTrigger } from "@/components/search/SearchTrigger";
import type { SearchEntry } from "@/lib/search";

vi.mock("next/link", () => ({
  default: ({ onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      data-next-link="true"
      {...props}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onClick?.(event);
      }}
    />
  ),
}));

const entries: readonly SearchEntry[] = [
  {
    id: "hunt:snmp-fan-out",
    type: "HUNT",
    title: "SNMP Fan-Out",
    description: "Find a managed device scanning unexpected SNMP peers.",
    href: "/hunts/snmp-fan-out/",
    tags: ["SNMP", "router"],
    body: "UDP 161 fan-out",
  },
  {
    id: "protocol:snmp",
    type: "PROTOCOL",
    title: "SNMP",
    description: "Expected and suspicious SNMP directionality.",
    href: "/protocols/snmp/",
    tags: ["SNMP"],
    body: "Network management system UDP 161",
  },
  {
    id: "methodology-independent-observation",
    type: "METHODOLOGY",
    title: "Require Independent Observation",
    description: "Corroborate appliance claims with upstream evidence.",
    href: "/methodology/independent-observation/",
    tags: ["telemetry"],
    body: "independent evidence",
  },
];

function SearchHarness({ showTrigger = true }: { showTrigger?: boolean }) {
  return (
    <SearchProvider entries={entries}>
      {showTrigger ? <SearchTrigger /> : <p>Trigger removed</p>}
    </SearchProvider>
  );
}

describe("global search dialog", () => {
  test("opens by keyboard, searches, closes with Escape, and restores the exact invoker", async () => {
    const user = userEvent.setup();
    render(
      <SearchProvider entries={entries}>
        <button type="button">Keyboard invoker</button>
        <SearchTrigger />
      </SearchProvider>,
    );
    const invoker = screen.getByRole("button", { name: "Keyboard invoker" });
    invoker.focus();

    await user.keyboard("{Control>}k{/Control}");
    const input = screen.getByRole("combobox", { name: "Search guide" });
    expect(input).toHaveFocus();
    await user.type(input, "SNMP");
    expect(screen.getByRole("option", { name: /HUNT SNMP Fan-Out/ })).toHaveTextContent("HUNT");

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Search the field guide" })).not.toBeInTheDocument();
    expect(invoker).toHaveFocus();
  });

  test("uses a resolvable combobox/listbox relationship and wraps active options with arrow keys", async () => {
    const user = userEvent.setup();
    render(<SearchHarness />);
    await user.click(screen.getByRole("button", { name: "Search guide" }));

    const input = screen.getByRole("combobox", { name: "Search guide" });
    const listbox = screen.getByRole("listbox", { name: "Search results" });
    const options = within(listbox).getAllByRole("option");
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(input).toHaveAttribute("aria-controls", listbox.id);
    expect(input).toHaveAttribute("aria-activedescendant", options[0]!.id);
    expect(new Set(options.map((option) => option.id)).size).toBe(options.length);

    await user.keyboard("{ArrowUp}");
    expect(input).toHaveAttribute("aria-activedescendant", options.at(-1)!.id);
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant", options[0]!.id);
  });

  test("activates the selected base-path-safe framework link with Enter and closes before navigation", async () => {
    const user = userEvent.setup();
    render(<SearchHarness />);
    await user.click(screen.getByRole("button", { name: "Search guide" }));

    const option = screen.getByRole("option", { name: /HUNT SNMP Fan-Out/ });
    expect(option).toHaveAttribute("data-next-link", "true");
    expect(option).toHaveAttribute("href", "/hunts/snmp-fan-out/");
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("dialog", { name: "Search the field guide" })).not.toBeInTheDocument();
  });

  test("ignores editable origins, repeat presses, and conflicting shortcut modifiers", () => {
    render(
      <SearchProvider entries={entries}>
        <textarea aria-label="Notes" />
        <div contentEditable role="textbox" tabIndex={0}>Editable notes</div>
        <button type="button">Plain invoker</button>
        <SearchTrigger />
      </SearchProvider>,
    );

    fireEvent.keyDown(screen.getByLabelText("Notes"), { key: "k", ctrlKey: true });
    fireEvent.keyDown(screen.getByRole("textbox", { name: "" }), { key: "k", metaKey: true });
    const invoker = screen.getByRole("button", { name: "Plain invoker" });
    fireEvent.keyDown(invoker, { key: "k", ctrlKey: true, shiftKey: true });
    fireEvent.keyDown(invoker, { key: "k", ctrlKey: true, altKey: true });
    fireEvent.keyDown(invoker, { key: "k", ctrlKey: true, metaKey: true });
    fireEvent.keyDown(invoker, { key: "k", ctrlKey: true, repeat: true });
    expect(screen.queryByRole("dialog", { name: "Search the field guide" })).not.toBeInTheDocument();

    invoker.focus();
    fireEvent.keyDown(invoker, { key: "K", metaKey: true });
    expect(screen.getByRole("dialog", { name: "Search the field guide" })).toBeInTheDocument();
  });

  test("traps Tab, hides and inerts only the background, and restores prior page state", async () => {
    const user = userEvent.setup();
    document.body.style.overflow = "clip";
    const { container } = render(<SearchHarness />);
    container.setAttribute("aria-hidden", "false");
    await user.click(screen.getByRole("button", { name: "Search guide" }));

    const dialog = screen.getByRole("dialog", { name: "Search the field guide" });
    const portalRoot = dialog.parentElement!;
    const close = within(dialog).getByRole("button", { name: "Close search" });
    const lastOption = within(dialog).getAllByRole("option").at(-1)!;
    expect(document.body.style.overflow).toBe("hidden");
    expect(container).toHaveAttribute("inert");
    expect(container).toHaveAttribute("aria-hidden", "true");
    expect(portalRoot).not.toHaveAttribute("inert");
    expect(portalRoot).not.toHaveAttribute("aria-hidden");

    close.focus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(lastOption).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(close).toHaveFocus();
    await user.click(close);

    expect(document.body.style.overflow).toBe("clip");
    expect(container).not.toHaveAttribute("inert");
    expect(container).toHaveAttribute("aria-hidden", "false");
    document.body.style.overflow = "";
  });

  test("closes from the backdrop and explicit close control and reports no results", async () => {
    const user = userEvent.setup();
    render(<SearchHarness />);
    const trigger = screen.getByRole("button", { name: "Search guide" });
    await user.click(trigger);
    await user.type(screen.getByRole("combobox", { name: "Search guide" }), "no-match-anywhere");
    expect(screen.getByRole("status")).toHaveTextContent("No guide entries match your search.");

    const dialog = screen.getByRole("dialog", { name: "Search the field guide" });
    fireEvent.mouseDown(dialog.parentElement!);
    expect(screen.queryByRole("dialog", { name: "Search the field guide" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Close search" }));
    expect(trigger).toHaveFocus();
  });

  test("handles an invoker unmount during the open dialog and cleans up modal effects", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SearchHarness />);
    await user.click(screen.getByRole("button", { name: "Search guide" }));
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<SearchHarness showTrigger={false} />);
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Search the field guide" })).not.toBeInTheDocument();
    expect(screen.getByText("Trigger removed")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  test("does not open search over the mobile navigation modal", async () => {
    const user = userEvent.setup();
    render(<SearchProvider entries={entries}><Header /></SearchProvider>);

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("dialog", { name: "Navigation" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.queryByRole("dialog", { name: "Search the field guide" })).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Navigation" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close navigation" }));
    await user.click(screen.getByRole("button", { name: "Search guide" }));
    expect(screen.getByRole("dialog", { name: "Search the field guide" })).toBeInTheDocument();
  });

  test("removes the global keyboard listener when the provider unmounts", () => {
    const { unmount } = render(<SearchHarness />);
    unmount();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.queryByRole("dialog", { name: "Search the field guide" })).not.toBeInTheDocument();
  });
});
