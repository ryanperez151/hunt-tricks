import { render, screen } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { describe, expect, test, vi } from "vitest";

vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a data-next-link="true" {...props} />,
}));
vi.mock("next/navigation", () => ({
  notFound: () => { throw new Error("NEXT_NOT_FOUND"); },
}));

import ProtocolsPage from "@/app/protocols/page";
import ProtocolDetailPage, { dynamicParams, generateStaticParams } from "@/app/protocols/[slug]/page";
import TelemetryPage from "@/app/telemetry/page";
import { telemetrySources } from "@/lib/content";

describe("Task 8 route pages", () => {
  test("renders all 24 protocols as framework links with deterministic trailing slashes", () => {
    render(<ProtocolsPage />);

    expect(screen.getByRole("heading", { level: 1, name: /protocol behavior catalog/i })).toBeInTheDocument();
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(24);
    expect(links.every((link) => link.getAttribute("data-next-link") === "true")).toBe(true);
    expect(links.every((link) => /^\/protocols\/[a-z0-9-]+\/$/.test(link.getAttribute("href") ?? ""))).toBe(true);
  });

  test("renders every protocol behavior dimension, both diagram equivalents, and related hunts", async () => {
    render(await ProtocolDetailPage({ params: Promise.resolve({ slug: "snmp" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "SNMP" })).toBeInTheDocument();
    for (const heading of ["Definition", "Infrastructure use", "Expected direction", "Suspicious behavior", "Attacker abuse", "Related hunts"]) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }
    expect(screen.getByText(/management protocol for reading device state/i)).toBeInTheDocument();
    expect(screen.getByText(/NMS initiates queries to the router on UDP\/161/i)).toBeInTheDocument();
    expect(screen.getByText(/router originates UDP\/161 queries to several unexpected peers/i)).toBeInTheDocument();
    expect(screen.getByText("Expected SNMP flow")).toBeInTheDocument();
    expect(screen.getByText("Suspicious SNMP flow")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /SNMP Fan-Out/i })).toHaveAttribute("href", "/hunts/snmp-fan-out/");
    expect(screen.getByRole("link", { name: /SNMP Fan-Out/i })).toHaveAttribute("data-next-link", "true");
  });

  test("states accurately when a protocol has no related hunts", async () => {
    render(await ProtocolDetailPage({ params: Promise.resolve({ slug: "bgp" }) }));
    expect(screen.getByRole("heading", { name: "Related hunts" })).toBeInTheDocument();
    expect(screen.getByText("No launch hunts are currently linked to this protocol.")).toBeInTheDocument();
  });

  test("disables dynamic parameters and rejects an unknown protocol", async () => {
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toHaveLength(24);
    await expect(ProtocolDetailPage({ params: Promise.resolve({ slug: "not-real" }) })).rejects.toThrow("NEXT_NOT_FOUND");
  });

  test("renders the telemetry explorer around the semantic matrix", () => {
    render(<TelemetryPage />);
    expect(screen.getByRole("heading", { level: 1, name: /independent telemetry coverage/i })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: /telemetry coverage/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(telemetrySources.length);
  });
});
