import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { Header } from "@/components/layout/Header";

test("exposes primary navigation and an operable mobile menu", async () => {
  const user = userEvent.setup();
  render(<Header />);
  expect(screen.getByRole("link", { name: /hunt the infrastructure/i })).toHaveAttribute("href", "/");
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
