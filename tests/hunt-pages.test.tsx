import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import HuntRoutePage, { generateMetadata } from "@/app/hunts/[slug]/page";

function headingIndex(name: string) {
  return screen.getAllByRole("heading").findIndex((heading) => heading.textContent === name);
}

describe("shared hunt route page", () => {
  test("renders a family landing page from the validated family and hunt registries", async () => {
    render(await HuntRoutePage({ params: Promise.resolve({ slug: "management-plane-c2" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "Management-Plane C2" })).toBeInTheDocument();
    expect(screen.getByText("6 operational hunts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Unexpected Management Interface Egress/i })).toHaveAttribute(
      "href",
      "/hunts/unexpected-management-interface-egress/",
    );
  });

  test("renders every hunt field in the approved operational order", async () => {
    render(await HuntRoutePage({ params: Promise.resolve({ slug: "snmp-fan-out" }) }));

    expect(screen.getByRole("heading", { level: 1, name: "SNMP Fan-Out" })).toBeInTheDocument();
    expect(screen.getByText("Infrastructure Lateral Movement")).toBeInTheDocument();
    expect(screen.getByLabelText("Severity: critical")).toBeInTheDocument();
    expect(screen.getByText("Confidence: high")).toBeInTheDocument();
    expect(screen.getByText("Plane: management")).toBeInTheDocument();
    expect(screen.getByLabelText("Hunt scope")).toHaveTextContent("Devicesfirewallrouterswitchwireless-controllerload-balancervpn-gateway");
    expect(screen.getByLabelText("Hunt scope")).toHaveTextContent("ProtocolsSNMP");
    expect(screen.getByRole("heading", { name: "Treat infrastructure as a host" })).toBeInTheDocument();
    expect(screen.getByText(/A managed device, rather than an NMS, initiates UDP\/161/)).toBeInTheDocument();
    expect(screen.getByText(/Build a directional SNMP role model/)).toBeInTheDocument();
    expect(screen.getByText(/Reconstructs new destinations, fan-out, beacon-like timing/)).toBeInTheDocument();
    expect(screen.getByText("Managed-device SNMP fan-out")).toBeInTheDocument();
    expect(screen.getAllByText("Adapt field names and data models to your environment.")).toHaveLength(2);
    expect(screen.getByText("T1046 Network Service Discovery")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /SNMP From Unexpected Initiator/i })).toHaveAttribute(
      "href",
      "/hunts/snmp-from-unexpected-initiator/",
    );
    expect(screen.getByRole("link", { name: "NCSC: UK Internet Edge Router Devices Advisory" })).toHaveAttribute(
      "target",
      "_blank",
    );

    const orderedHeadings = [
      "Hunt hypothesis",
      "Behavior comparison",
      "Why this matters",
      "Telemetry requirements",
      "Detection strategy",
      "Example queries",
      "Investigation checklist",
      "Escalation conditions",
      "False positives and enrichment",
      "ATT&CK techniques",
      "Related hunts",
      "References",
    ].map(headingIndex);
    expect(orderedHeadings.every((index) => index >= 0)).toBe(true);
    expect(orderedHeadings).toEqual([...orderedHeadings].sort((left, right) => left - right));
  });

  test("generates distinct family and hunt metadata with Open Graph fields", async () => {
    const family = await generateMetadata({ params: Promise.resolve({ slug: "management-plane-c2" }) });
    const hunt = await generateMetadata({ params: Promise.resolve({ slug: "snmp-fan-out" }) });

    expect(family).toMatchObject({
      title: "Management-Plane C2 Hunts",
      openGraph: { title: "Management-Plane C2 Hunts", type: "website" },
    });
    expect(hunt).toMatchObject({
      title: "SNMP Fan-Out",
      openGraph: { title: "SNMP Fan-Out", type: "article" },
    });
    expect(family.description).not.toBe(hunt.description);
  });
});
