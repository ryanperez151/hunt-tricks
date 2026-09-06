import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import HomePage from "@/app/page";
import { SCOPES } from "@/lib/taxonomy";
import { displayLabel } from "@/lib/display-labels";
test("starts with populated scopes and preserves the infrastructure hunt journey", () => {
 render(<HomePage />);
 expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Hunt the behavior.");
 expect(screen.getByRole("link", { name: "Explore Hunts" })).toHaveAttribute("href", "/hunts");
 for (const scope of SCOPES) expect(screen.getByRole("link", { name: `Browse ${displayLabel(scope)} hunts` })).toHaveAttribute("href", `/hunts?scope=${scope}`);
 expect(screen.getByText(/Speed alone does not identify AI involvement/)).toBeInTheDocument();
 expect(screen.getByRole("heading", { name: "SNMP Fan-Out" })).toBeInTheDocument();
 expect(screen.getByRole("link", { name: /Infrastructure is a host/ })).toHaveAttribute("href", "/about#infrastructure");
});
