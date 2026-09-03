import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";
import { Tag } from "@/components/common/Tag";
import { CodeBlock } from "@/components/common/CodeBlock";
import { SectionHeading } from "@/components/common/SectionHeading";
import { OriginMatters } from "@/components/common/OriginMatters";
import { TelemetryRequirements } from "@/components/hunts/TelemetryRequirements";
import { InvestigationChecklist } from "@/components/hunts/InvestigationChecklist";
import { NetworkFlow } from "@/components/diagrams/NetworkFlow";
import { PlaneExplorer } from "@/components/diagrams/PlaneExplorer";
import { AttackTimeline } from "@/components/diagrams/AttackTimeline";
import { AttackPathDiagram } from "@/components/diagrams/AttackPathDiagram";

test("renders editorial labels, query guidance, and origin context", () => {
  render(<><Tag>SNMP</Tag><SectionHeading eyebrow="Telemetry">Independent evidence</SectionHeading><OriginMatters question="Was it forwarded or initiated?" /><CodeBlock raw="field = value" highlightedHtml={'<pre class="shiki">field = value</pre>' as never} /></>);

  expect(screen.getByText("SNMP")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Independent evidence" })).toBeInTheDocument();
  expect(screen.getByText("Was it forwarded or initiated?")).toBeInTheDocument();
  expect(screen.getByText("Adapt field names and data models to your environment.")).toBeInTheDocument();
});

test("lists required telemetry and copies a numbered investigation checklist", async () => {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();
  render(<><TelemetryRequirements recommended={["netflow-ipfix"]} optional={["dns"]} /><InvestigationChecklist steps={["Confirm initiator", "Validate destination"]} writeText={writeText} /></>);

  expect(screen.getByRole("heading", { name: "Recommended" })).toBeInTheDocument();
  expect(screen.getByText("NetFlow / IPFIX")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: /copy checklist/i }));
  expect(writeText).toHaveBeenCalledWith("1. Confirm initiator\n2. Validate destination");
});

test("renders real visual flow labels and text equivalents for network and attack paths", () => {
  const nodes = [{ id: "device", label: "Firewall" }, { id: "internet", label: "Internet" }] as const;
  const edges = [{ source: "device", target: "internet", label: "HTTPS" }] as const;
  render(<><NetworkFlow title="Device egress" nodes={nodes} edges={edges} textAlternative={["Firewall initiates HTTPS to Internet."]} /><AttackPathDiagram title="Pivot" nodes={nodes} edges={edges} textAlternative={["A firewall pivots to the Internet."]} /></>);

  expect(screen.getAllByText("Firewall")).toHaveLength(2);
  expect(screen.getByText("Firewall initiates HTTPS to Internet.")).toBeInTheDocument();
  expect(screen.getByText("A firewall pivots to the Internet.")).toBeInTheDocument();
});

test("keeps repeated diagram titles independently described", () => {
  const nodes = [{ id: "device", label: "Firewall" }] as const;
  render(<><NetworkFlow title="Repeated flow" nodes={nodes} edges={[]} textAlternative={["First flow."]} /><NetworkFlow title="Repeated flow" nodes={nodes} edges={[]} textAlternative={["Second flow."]} /></>);

  const [first, second] = screen.getAllByText("Repeated flow").map((caption) => caption.closest("figure"));
  expect(first).toHaveAttribute("aria-labelledby");
  expect(second).toHaveAttribute("aria-labelledby");
  expect(first?.getAttribute("aria-labelledby")).not.toBe(second?.getAttribute("aria-labelledby"));
});

test("operates plane tabs by keyboard and presents a chronological attack timeline", async () => {
  const user = userEvent.setup();
  render(<><PlaneExplorer planes={[
    { plane: "data", label: "Data plane", examples: ["Forward traffic"] },
    { plane: "management", label: "Management plane", examples: ["Admin API"] },
    { plane: "control", label: "Control plane", examples: ["BGP"] },
  ]} /><AttackTimeline items={[{ title: "Configure", detail: "Add an unapproved tunnel" }, { title: "Connect", detail: "Send traffic outside policy" }]} /></>);

  const dataTab = screen.getByRole("tab", { name: "Data plane" });
  dataTab.focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "Management plane" })).toHaveFocus();
  expect(screen.getByRole("tabpanel")).toHaveTextContent("Admin API");
  expect(screen.getByRole("list", { name: /attack timeline/i })).toHaveTextContent("Configure");
});

test("keeps multiple plane explorers independently wired", () => {
  const planes = [
    { plane: "data", label: "Data plane", examples: ["Forward traffic"] },
    { plane: "management", label: "Management plane", examples: ["Admin API"] },
    { plane: "control", label: "Control plane", examples: ["BGP"] },
  ] as const;
  render(<><PlaneExplorer planes={planes} /><PlaneExplorer planes={planes} /></>);

  const [first, second] = screen.getAllByRole("tab", { name: "Data plane" });
  expect(first.id).not.toBe(second.id);
  expect(first.getAttribute("aria-controls")).not.toBe(second.getAttribute("aria-controls"));
});
