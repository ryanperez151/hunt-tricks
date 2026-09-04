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

function intersects(first: Box, second: Box) {
  return first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y;
}

function quadraticPoint(values: number[], t: number): Point {
  const [startX, startY, controlX, controlY, endX, endY] = values;
  return {
    x: (1 - t) ** 2 * startX + 2 * (1 - t) * t * controlX + t ** 2 * endX,
    y: (1 - t) ** 2 * startY + 2 * (1 - t) * t * controlY + t ** 2 * endY,
  };
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
  expect(svg).toHaveAttribute("width", String(width));
  expect(width).toBeGreaterThan(1_000);
  expect(height).toBeGreaterThan(180);
  expect(Array.from(screen.getAllByTestId("flow-node-label")).find((label) => label.textContent?.includes("Discover trusted"))?.querySelectorAll("tspan").length).toBeGreaterThan(1);
  expect(Array.from(screen.getAllByTestId("flow-edge-label")).find((label) => label.textContent?.includes("inspect routes"))?.querySelectorAll("tspan").length).toBeGreaterThan(1);
});

test("clears the actual intermediate SNMP peer with the branching curve and its label", () => {
  const snmp = protocols.find((protocol) => protocol.slug === "snmp")!;
  const { container } = render(<NetworkFlow {...snmp.suspiciousFlow} />);
  const intermediate = container.querySelector<SVGRectElement>("[data-node-id='peer-a']")!;
  const intermediateBox = { x: Number(intermediate.getAttribute("x")), y: Number(intermediate.getAttribute("y")), width: Number(intermediate.getAttribute("width")), height: Number(intermediate.getAttribute("height")) };
  const path = screen.getAllByTestId("flow-edge")[1] as unknown as SVGPathElement;
  const values = (path.getAttribute("d")?.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const label = screen.getAllByTestId("flow-edge-label")[1] as unknown as SVGTextElement;
  const lines = Array.from(label.querySelectorAll("tspan")).map((line) => line.textContent?.length ?? 0);
  const labelBox = {
    x: Number(label.getAttribute("x")) - Math.max(...lines) * 3.5,
    y: Number(label.getAttribute("y")) - 11,
    width: Math.max(...lines) * 7,
    height: Math.max(1, lines.length) * 18,
  };

  expect([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].every((t) => {
    const point = quadraticPoint(values, t);
    return point.x < intermediateBox.x || point.x > intermediateBox.x + intermediateBox.width || point.y < intermediateBox.y || point.y > intermediateBox.y + intermediateBox.height;
  })).toBe(true);
  expect(intersects(labelBox, intermediateBox)).toBe(false);
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
