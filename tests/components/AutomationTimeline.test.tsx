import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import { AutomationTimeline } from "@/components/diagrams/AutomationTimeline";

test("switches synthetic scenarios while preserving ordered evidence and attribution limits", async () => {
  const user = userEvent.setup();
  render(<AutomationTimeline />);
  expect(screen.getByRole("button", { name: "Fixed script" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("list", { name: "Scenario steps" }).tagName).toBe("OL");
  await user.click(screen.getByRole("button", { name: "Adaptive automation" }));
  expect(screen.getByRole("button", { name: "Adaptive automation" })).toHaveAttribute("aria-pressed", "true");
  expect(within(screen.getByRole("list", { name: "Scenario steps" })).getAllByRole("listitem")[3]).toHaveTextContent("Select another tool using configured rules");
  await user.click(screen.getByRole("button", { name: "Autonomous agent" }));
  expect(screen.getByRole("button", { name: "Fixed script" })).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByText(/model, run, and tool provenance/i)).toBeInTheDocument();
  expect(screen.getByText(/Speed alone does not identify AI involvement/)).toBeInTheDocument();
});
