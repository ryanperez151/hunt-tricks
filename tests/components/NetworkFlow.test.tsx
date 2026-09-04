import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { NetworkFlow } from "@/components/diagrams/NetworkFlow";
import { attackPaths } from "@/data/attack-paths";
import { protocols } from "@/data/protocols";

type Point = { x: number; y: number };
type Box = Point & { width: number; height: number };

function pathEndpoints(path: SVGPathElement): [Point, Point] {
  const values = (path.getAttribute("d")?.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  return [{ x: values[0], y: values[1] }, { x: values.at(-2)!, y: values.at(-1)! }];
}

function isOnBoundary(point: Point, box: Box) {
  const right = box.x + box.width;
  const bottom = box.y + box.height;
  const inHorizontalRange = point.x >= box.x && point.x <= right;
  const inVerticalRange = point.y >= box.y && point.y <= bottom;
  return (inVerticalRange && (point.x === box.x || point.x === right)) || (inHorizontalRange && (point.y === box.y || point.y === bottom));
}

test("draws bidirectional and branching SNMP edges on distinct curved boundary-to-boundary lanes", () => {
  const snmp = protocols.find((protocol) => protocol.slug === "snmp")!;
  render(<><NetworkFlow {...snmp.normalFlow} /><NetworkFlow {...snmp.suspiciousFlow} /></>);

  const paths = screen.getAllByTestId("flow-edge").map((path) => path as unknown as SVGPathElement);
  expect(paths).toHaveLength(4);
  expect(new Set(paths.map((path) => path.getAttribute("d"))).size).toBe(4);
  paths.forEach((path) => expect(path).toHaveAttribute("marker-end", expect.stringContaining("arrow")));
  expect(paths.slice(0, 2).every((path) => path.getAttribute("d")?.includes("Q"))).toBe(true);

  paths.forEach((path) => {
    const rectangles = new Map(Array.from(path.closest("figure")!.querySelectorAll<SVGRectElement>("[data-node-id]")).map((rect) => [rect.dataset.nodeId!, {
      x: Number(rect.getAttribute("x")), y: Number(rect.getAttribute("y")), width: Number(rect.getAttribute("width")), height: Number(rect.getAttribute("height")),
    }]));
    const [start, end] = pathEndpoints(path);
    expect(isOnBoundary(start, rectangles.get(path.dataset.source!)!)).toBe(true);
    expect(isOnBoundary(end, rectangles.get(path.dataset.target!)!)).toBe(true);
  });
});

test("sizes and wraps the actual long attack-path labels without losing route geometry", () => {
  const pivot = attackPaths.find((path) => path.slug === "infrastructure-pivot")!;
  const { container } = render(<NetworkFlow title={pivot.title} nodes={pivot.nodes} edges={pivot.edges} textAlternative={pivot.textAlternative} />);

  const svg = container.querySelector("svg")!;
  const [, , width, height] = svg.getAttribute("viewBox")!.split(" ").map(Number);
  expect(width).toBeGreaterThan(1_000);
  expect(height).toBeGreaterThan(180);
  expect(Array.from(screen.getAllByTestId("flow-node-label")).find((label) => label.textContent?.includes("Discover trusted"))?.querySelectorAll("tspan").length).toBeGreaterThan(1);
  expect(Array.from(screen.getAllByTestId("flow-edge-label")).find((label) => label.textContent?.includes("inspect routes"))?.querySelectorAll("tspan").length).toBeGreaterThan(1);
});

test("routes a non-adjacent connection above intermediate nodes instead of through them", () => {
  const { container } = render(<NetworkFlow title="Skip a node" nodes={[{ id: "a", label: "Source" }, { id: "b", label: "Intermediate" }, { id: "c", label: "Target" }]} edges={[{ source: "a", target: "c", label: "Crosses the topology" }]} textAlternative={[]} />);
  const path = screen.getByTestId("flow-edge") as unknown as SVGPathElement;
  const values = (path.getAttribute("d")?.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const intermediate = container.querySelector<SVGRectElement>("[data-node-id='b']")!;

  expect(values[3]).toBeLessThan(Number(intermediate.getAttribute("y")));
  expect(values[4]).not.toBe(values[1]);
});

test("derives accessible graph output from nodes and edges, including node-only graphs", () => {
  render(<NetworkFlow title="Standalone device" nodes={[{ id: "firewall", label: "Firewall" }]} edges={[]} textAlternative={[]} />);

  expect(screen.getByRole("list", { name: "Nodes in Standalone device" })).toHaveTextContent("Firewall");
  expect(screen.getByText("Firewall has no directed connections in this flow.")).toBeInTheDocument();
});

test("omits an empty graph and explains that no flow is available", () => {
  render(<NetworkFlow title="Empty flow" nodes={[]} edges={[]} textAlternative={[]} />);

  expect(screen.getByRole("status")).toHaveTextContent("No flow is available for Empty flow.");
  expect(screen.queryByText("Empty flow")).not.toBeInTheDocument();
});

test("rejects duplicate node IDs and unknown edge endpoints before rendering", () => {
  expect(() => render(<NetworkFlow title="Bad graph" nodes={[{ id: "device", label: "Firewall" }, { id: "device", label: "Router" }]} edges={[]} textAlternative={[]} />)).toThrow(/Bad graph.*duplicate node ID.*device/i);
  expect(() => render(<NetworkFlow title="Bad edge" nodes={[{ id: "device", label: "Firewall" }]} edges={[{ source: "device", target: "missing", label: "HTTPS" }]} textAlternative={[]} />)).toThrow(/Bad edge.*unknown edge target.*missing/i);
});
