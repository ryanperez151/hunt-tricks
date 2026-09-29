import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vitest";
import { Header } from "@/components/layout/Header";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
beforeEach(() => { route.pathname = "/"; });

test.each([
  ["/hunts/", "Hunts", "page"],
  ["/hunts/snmp-fan-out/", "Hunts", "location"],
  ["/protocols/snmp/", "Protocols", "location"],
  ["/methodology/rarity/", "Methodology", "location"],
])("identifies the current section on %s in desktop and mobile navigation", async (pathname, label, current) => {
  route.pathname = pathname;
  const user = userEvent.setup();
  render(<Header />);
  const desktop = screen.getByRole("navigation", { name: "Primary" });
  expect(within(desktop).getByRole("link", { name: label })).toHaveAttribute("aria-current", current);
  expect(desktop.querySelectorAll("[aria-current]")).toHaveLength(1);

  await user.click(screen.getByRole("button", { name: /open navigation/i }));
  const mobile = screen.getByRole("navigation", { name: "Mobile navigation" });
  expect(within(mobile).getByRole("link", { name: label })).toHaveAttribute("aria-current", current);
  expect(mobile.querySelectorAll("[aria-current]")).toHaveLength(1);
});

test("updates current navigation after a route change without matching partial section names", () => {
  route.pathname = "/queries/";
  const { rerender } = render(<Header />);
  expect(screen.getByRole("link", { name: "Queries" })).toHaveAttribute("aria-current", "page");
  route.pathname = "/queries-archive/";
  rerender(<Header />);
  expect(screen.getByRole("navigation", { name: "Primary" }).querySelector("[aria-current]")).toBeNull();
});

test("exposes primary navigation and an operable mobile menu", async () => {
  const user = userEvent.setup();
  render(<Header />);
  expect(screen.getByRole("link", { name: /hunt-tricks/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /open navigation/i }));
  expect(screen.getByRole("dialog", { name: /navigation/i })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog", { name: /navigation/i })).not.toBeInTheDocument();
});

test("contains mobile navigation focus and restores it to its trigger", async () => {
  const user = userEvent.setup();
  render(<Header />);
  const trigger = screen.getByRole("button", { name: /open navigation/i });

  await user.click(trigger);
  const dialog = screen.getByRole("dialog", { name: /navigation/i });
  const closeButton = within(dialog).getByRole("button", { name: /close navigation/i });
  const lastNavigationLink = within(dialog).getByRole("link", { name: "About" });

  expect(closeButton).toHaveFocus();
  await user.keyboard("{Shift>}{Tab}{/Shift}");
  expect(lastNavigationLink).toHaveFocus();
  await user.keyboard("{Tab}");
  expect(closeButton).toHaveFocus();

  await user.click(closeButton);
  expect(trigger).toHaveFocus();
});

test("locks background scrolling while the mobile menu is open", async () => {
  const user = userEvent.setup();
  document.body.style.overflow = "";
  render(<Header />);
  const trigger = screen.getByRole("button", { name: /open navigation/i });

  await user.click(trigger);
  expect(document.body.style.overflow).toBe("hidden");

  await user.keyboard("{Escape}");
  expect(document.body.style.overflow).toBe("");
});
