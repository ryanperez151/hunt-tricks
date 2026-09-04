import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import HomePage from "@/app/page";

describe("HomePage", () => {
  test("teaches origin versus transit and exposes every approved home section", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "Hunt the Infrastructure" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Hunts" })).toHaveAttribute("href", "/hunts");
    expect(screen.getByRole("link", { name: "Start With the Management Plane" })).toHaveAttribute("href", "/hunts/management-plane-c2");
    for (const node of ["Internet", "Firewall", "Router", "Core", "Servers", "Endpoints"]) {
      expect(screen.getByText(node)).toBeInTheDocument();
    }
    expect(screen.getByText("Ordinary transit")).toBeInTheDocument();
    expect(screen.getByText("Device-originated")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Stop Treating the Firewall as Just a Sensor" })).toBeInTheDocument();
    for (const characteristic of ["Privileged", "Persistent", "Under-Instrumented", "Trusted"]) {
      expect(screen.getByRole("heading", { name: characteristic })).toBeInTheDocument();
    }
    expect(screen.getByRole("heading", { name: "Infrastructure planes" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Four ways to hunt infrastructure" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /hunts/i })).toHaveLength(5);
    expect(screen.getByRole("heading", { name: "Flagship hunts" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "SNMP Fan-Out" })).toBeInTheDocument();
    expect(screen.getByText("Device telemetry + independent telemetry = higher confidence")).toBeInTheDocument();
  });
});
