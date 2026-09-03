import { render, screen } from "@testing-library/react";
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
