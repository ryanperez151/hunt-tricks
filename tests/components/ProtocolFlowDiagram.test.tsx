import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { ProtocolFlowDiagram } from "@/components/diagrams/ProtocolFlowDiagram";

const nodes = [
  { id: "nms", label: "NMS" },
  { id: "router", label: "Router" },
] as const;

const edges = [
  { source: "nms", target: "router", label: "initiates UDP/161" },
] as const;

test("renders protocol flow nodes and an accessible direction statement", () => {
  render(<ProtocolFlowDiagram title="Normal SNMP" nodes={nodes} edges={edges} />);

  expect(screen.getByText("NMS")).toBeInTheDocument();
  expect(screen.getByText("NMS initiates UDP/161 to Router.")).toBeInTheDocument();
});
