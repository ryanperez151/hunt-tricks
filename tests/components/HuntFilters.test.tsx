import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { HuntFilters, type HuntFilterOptions } from "@/components/hunts/HuntFilters";
import { emptyHuntFilters, type HuntFilters as HuntFilterState } from "@/lib/filters";

const filterOptions: HuntFilterOptions = {
  families: ["management-plane-c2", "traffic-manipulation"],
  devices: ["firewall", "router"],
  protocols: ["SSH", "SNMP"],
  planes: ["management", "data"],
  severities: ["high", "critical"],
  telemetry: ["netflow-ipfix", "packet-capture"],
  scopes: ["identity", "network-edge"],
  behaviors: ["credential-use", "role-deviation"],
  temporalPatterns: ["burst", "low-and-slow"],
  aiRoles: ["attacker", "defender"],
};

describe("HuntFilters", () => {
  test("updates one category without discarding the other canonical filter state", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const filters: HuntFilterState = {
      ...emptyHuntFilters,
      severities: ["critical"],
    };
    render(<HuntFilters filters={filters} options={filterOptions} onChange={onChange} />);

    await user.click(screen.getByText("Infrastructure and advanced filters"));
    await user.selectOptions(screen.getByLabelText("Protocol"), "SNMP");

    expect(onChange).toHaveBeenCalledWith({
      ...emptyHuntFilters,
      protocols: ["SNMP"],
      severities: ["critical"],
    });
  });

  test("exposes every filter dimension and clears all active filters", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const filters: HuntFilterState = {
      ...emptyHuntFilters,
      families: ["management-plane-c2"],
      devices: ["router"],
      protocols: ["SNMP"],
      planes: ["management"],
      severities: ["critical"],
      telemetry: ["netflow-ipfix"],
    };
    render(<HuntFilters filters={filters} options={filterOptions} onChange={onChange} />);

    for (const label of [
      "Family", "Device", "Protocol", "Plane", "Severity", "Telemetry", "Scope", "Behavior", "Temporal pattern", "AI role",
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("Active filters")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(onChange).toHaveBeenLastCalledWith(emptyHuntFilters);
  });

  test("removes an individual active filter without changing the others", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const filters: HuntFilterState = {
      ...emptyHuntFilters,
      protocols: ["SNMP"],
      severities: ["high"],
    };
    render(<HuntFilters filters={filters} options={filterOptions} onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Remove protocol SNMP filter" }));

    expect(onChange).toHaveBeenCalledWith({
      ...emptyHuntFilters,
      severities: ["high"],
    });
  });

  test("names a removal chip with the same label the user can see", () => {
    const filters: HuntFilterState = { ...emptyHuntFilters, families: ["management-plane-c2"] };
    render(<HuntFilters filters={filters} options={filterOptions} onChange={vi.fn()} />);

    const chip = screen.getByRole("button", { name: "Remove family Management-Plane C2 filter" });
    expect(chip).toHaveTextContent("Management-Plane C2");
  });

  test("describes multi-selection in terms every input mode can follow", () => {
    render(<HuntFilters filters={emptyHuntFilters} options={filterOptions} onChange={vi.fn()} />);

    const guidance = document.getElementById("hunt-filter-guidance")!;
    expect(screen.getByLabelText("Scope")).toHaveAttribute("aria-describedby", "hunt-filter-guidance");
    expect(guidance).toHaveTextContent(
      "Select one or more values. With a keyboard or mouse, hold Control or Command while selecting. On a touch screen, tap each value.",
    );
  });
});
