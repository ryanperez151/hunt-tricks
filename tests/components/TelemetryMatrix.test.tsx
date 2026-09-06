import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { TelemetryMatrix } from "@/components/telemetry/TelemetryMatrix";
import { telemetrySources } from "@/lib/content";

describe("TelemetryMatrix", () => {
  test("renders a semantic matrix with visible word-based coverage", () => {
    render(<TelemetryMatrix sources={telemetrySources} />);

    const table = screen.getByRole("table", { name: /telemetry coverage/i });
    expect(within(table).getByRole("columnheader", { name: "C2" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "Lateral movement" })).toBeInTheDocument();
    expect(within(table).getAllByText(/^(Low|Medium|High)$/)).toHaveLength(telemetrySources.length * 4);
  });

  test("expands an adjacent, resolvable detail region with collection guidance", async () => {
    const user = userEvent.setup();
    render(<TelemetryMatrix sources={telemetrySources} />);

    const trigger = screen.getByRole("button", { name: "NetFlow/IPFIX" });
    expect(screen.getAllByRole("row")).toHaveLength(telemetrySources.length + 1);
    const regionId = trigger.getAttribute("aria-controls");
    expect(regionId).toBeTruthy();
    const region = document.getElementById(regionId!);
    expect(region).toHaveAttribute("hidden");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("row")).toHaveLength(telemetrySources.length + 2);
    expect(region).not.toHaveAttribute("hidden");
    expect(region).toHaveAttribute("role", "region");
    expect(region).toHaveAccessibleName(/NetFlow\/IPFIX collection and investigation guidance/i);
    expect(within(region!).getByRole("heading", { name: "Collection guidance" })).toBeVisible();
    expect(within(region!).getByText(/Export ingress and egress records/)).toBeVisible();
    expect(screen.getByLabelText("NetFlow/IPFIX C2 coverage: high")).toBeVisible();
    expect(region?.parentElement?.parentElement?.previousElementSibling).toContainElement(trigger);
  });

  test("keeps IDs and disclosure state independent across component instances", async () => {
    const user = userEvent.setup();
    render(<><TelemetryMatrix sources={telemetrySources.slice(0, 1)} /><TelemetryMatrix sources={telemetrySources.slice(0, 1)} /></>);

    const triggers = screen.getAllByRole("button", { name: "NetFlow/IPFIX" });
    const regionIds = triggers.map((trigger) => trigger.getAttribute("aria-controls"));
    expect(new Set(regionIds)).toHaveLength(2);
    expect(regionIds.every((id) => id && document.getElementById(id))).toBe(true);

    await user.click(triggers[0]);
    expect(triggers[0]).toHaveAttribute("aria-expanded", "true");
    expect(triggers[1]).toHaveAttribute("aria-expanded", "false");
  });
});
