import { useId } from "react";
import type { DiagramNode, DirectedEdge } from "@/lib/schemas";

type NetworkFlowProps = {
  title: string;
  nodes: readonly DiagramNode[];
  edges: readonly DirectedEdge[];
  textAlternative: readonly string[];
};

type PositionedNode = DiagramNode & { x: number; y: number; width: number; height: number; lines: string[] };

const NODE_MIN_WIDTH = 156;
const NODE_MAX_WIDTH = 230;
const NODE_GAP = 120;
const LINE_HEIGHT = 18;
const LANE_STEP = 120;

function wrapText(value: string, maxCharacters = 22) {
  const lines: string[] = [];
  let line = "";
  for (const word of value.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length <= maxCharacters) line = candidate;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [value];
}

function normalizeGraph(title: string, nodes: readonly DiagramNode[], edges: readonly DirectedEdge[]) {
  const nodeById = new Map<string, DiagramNode>();
  nodes.forEach((node) => {
    if (nodeById.has(node.id)) throw new Error(`Invalid network flow "${title}": duplicate node ID "${node.id}".`);
    nodeById.set(node.id, node);
  });
  edges.forEach((edge) => {
    if (!nodeById.has(edge.source)) throw new Error(`Invalid network flow "${title}": unknown edge source "${edge.source}".`);
    if (!nodeById.has(edge.target)) throw new Error(`Invalid network flow "${title}": unknown edge target "${edge.target}".`);
  });
  return { nodes: [...nodeById.values()], edges: [...edges], nodeById };
}

function edgeSentence(edge: DirectedEdge, nodeById: ReadonlyMap<string, DiagramNode>) {
  return `${nodeById.get(edge.source)?.label ?? edge.source} ${edge.label} to ${nodeById.get(edge.target)?.label ?? edge.target}.`;
}

function renderLines(lines: readonly string[], x: number) {
  return lines.map((line, index) => <tspan key={`${index}-${line}`} x={x} dy={index ? LINE_HEIGHT : 0}>{line}</tspan>);
}

export function NetworkFlow({ title, nodes, edges, textAlternative }: NetworkFlowProps) {
  const instanceId = useId().replaceAll(":", "");
  const graph = normalizeGraph(title, nodes, edges);
  if (!graph.nodes.length) return <p className="network-flow__empty" role="status">No flow is available for {title}.</p>;

  const nodeMeasurements = graph.nodes.map((node) => {
    const lines = wrapText(node.label);
    const longestLine = Math.max(...lines.map((line) => line.length));
    return { ...node, lines, width: Math.min(NODE_MAX_WIDTH, Math.max(NODE_MIN_WIDTH, longestLine * 8.5 + 36)), height: lines.length * LINE_HEIGHT + 32 };
  });
  const edgeLabelLines = graph.edges.map((edge) => wrapText(edge.label));
  const nodeGap = Math.max(NODE_GAP, ...edgeLabelLines.map((lines) => Math.max(...lines.map((line) => line.length)) * 7 + 32));
  const maxNodeHeight = Math.max(...nodeMeasurements.map((node) => node.height));
  const centerLane = (graph.edges.length - 1) / 2;
  const laneOffsets = graph.edges.map((edge, index) => {
    const sourceIndex = graph.nodes.findIndex((node) => node.id === edge.source);
    const targetIndex = graph.nodes.findIndex((node) => node.id === edge.target);
    const ordinalLane = (index - centerLane) * LANE_STEP;
    if (Math.abs(sourceIndex - targetIndex) <= 1) return ordinalLane;
    const direction = Math.sign(ordinalLane) || (sourceIndex < targetIndex ? -1 : 1);
    return ordinalLane + direction * (maxNodeHeight + 72);
  });
  const maxLane = Math.max(...laneOffsets.map((offset) => Math.abs(offset)), 0);
  const topPadding = maxLane + 52;
  const centerY = topPadding + maxNodeHeight / 2;
  const layout = nodeMeasurements.reduce<{ cursor: number; nodes: PositionedNode[] }>((current, node) => ({
    cursor: current.cursor + node.width + nodeGap,
    nodes: [...current.nodes, { ...node, x: current.cursor, y: centerY - node.height / 2 }],
  }), { cursor: 40, nodes: [] });
  const positionedNodes = layout.nodes;
  const positionedById = new Map(positionedNodes.map((node) => [node.id, node]));
  const width = layout.cursor - nodeGap + 40;
  const height = topPadding + maxNodeHeight + maxLane + 72;
  const descriptionId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${instanceId}-description`;
  const graphSentences = graph.edges.map((edge) => edgeSentence(edge, graph.nodeById));
  const summary = textAlternative.length ? textAlternative.join(" ") : graphSentences.length ? graphSentences.join(" ") : `${graph.nodes[0].label} has no directed connections in this flow.`;

  return (
    <figure className="network-flow" aria-labelledby={`${descriptionId}-title`}>
      <figcaption id={`${descriptionId}-title`}>{title}</figcaption>
      <div className="network-flow__canvas" aria-hidden="true">
        <svg height={height} style={{ height, width }} viewBox={`0 0 ${width} ${height}`} width={width} role="img">
          <defs><marker id={`${descriptionId}-arrow`} markerHeight="9" markerWidth="9" orient="auto" refX="8" refY="4.5"><path d="M0,0 L9,4.5 L0,9 Z" /></marker></defs>
          {graph.edges.map((edge, index) => {
            const source = positionedById.get(edge.source)!;
            const target = positionedById.get(edge.target)!;
            const direction = target.x >= source.x ? 1 : -1;
            const start = { x: source.x + (direction > 0 ? source.width : 0), y: centerY };
            const end = { x: target.x + (direction > 0 ? 0 : target.width), y: centerY };
            const control = { x: (start.x + end.x) / 2, y: centerY + laneOffsets[index] };
            return <path className="flow-edge" d={`M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`} data-source={edge.source} data-target={edge.target} data-testid="flow-edge" key={`${edge.source}-${edge.target}-${edge.label}-${index}`} markerEnd={`url(#${descriptionId}-arrow)`} />;
          })}
          {positionedNodes.map((node) => <g key={node.id}><rect data-node-id={node.id} data-testid="flow-node" height={node.height} rx="5" width={node.width} x={node.x} y={node.y} /><text className="flow-node-label" data-testid="flow-node-label" textAnchor="middle" x={node.x + node.width / 2} y={node.y + (node.height - (node.lines.length - 1) * LINE_HEIGHT) / 2 + 5}>{renderLines(node.lines, node.x + node.width / 2)}</text></g>)}
          {graph.edges.map((edge, index) => {
            const source = positionedById.get(edge.source)!;
            const target = positionedById.get(edge.target)!;
            const direction = target.x >= source.x ? 1 : -1;
            const start = { x: source.x + (direction > 0 ? source.width : 0), y: centerY };
            const end = { x: target.x + (direction > 0 ? 0 : target.width), y: centerY };
            const control = { x: (start.x + end.x) / 2, y: centerY + laneOffsets[index] };
            const label = { x: (start.x + 2 * control.x + end.x) / 4, y: (start.y + 2 * control.y + end.y) / 4 - 10 };
            return <text className="flow-edge-label" data-testid="flow-edge-label" key={`label-${edge.source}-${edge.target}-${edge.label}-${index}`} textAnchor="middle" x={label.x} y={label.y}>{renderLines(edgeLabelLines[index], label.x)}</text>;
          })}
        </svg>
      </div>
      <ul aria-label={`Nodes in ${title}`} className="sr-only">{graph.nodes.map((node) => <li key={node.id}>{node.label}</li>)}</ul>
      {graph.edges.length ? <ol aria-label={`Directed connections in ${title}`} className="sr-only">{graphSentences.map((sentence) => <li key={sentence}>{sentence}</li>)}</ol> : null}
      <p className="network-flow__summary" id={descriptionId}>{summary}</p>
    </figure>
  );
}
