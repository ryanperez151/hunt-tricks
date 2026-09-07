import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { SeverityBadge } from "@/components/common/SeverityBadge";

test("renders severity as text with an accessible label", () => {
  render(<SeverityBadge severity="critical" />);

  expect(screen.getByText("CRITICAL")).toHaveAccessibleName("Severity: critical");
});

test("exposes the severity badge with a role that permits an accessible name", () => {
  render(<SeverityBadge severity="critical" />);
  expect(screen.getByRole("img", { name: "Severity: critical" })).toBeInTheDocument();
});
