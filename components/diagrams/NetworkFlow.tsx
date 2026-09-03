import { useId } from "react";
import type { DiagramNode, DirectedEdge } from "@/lib/schemas";

type NetworkFlowProps = {
  title: string;
  nodes: readonly DiagramNode[];
  edges: readonly DirectedEdge[];
  textAlternative: readonly string[];
};

function edgeSentence(edge: DirectedEdge, nodes: readonly DiagramNode[]) {
  const source = nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
  const target = nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
  return `${source} ${edge.label} to ${target}.`;
}

export function NetworkFlow({ title, nodes, edges, textAlternative }: NetworkFlowProps) {
  const instanceId = useId().replaceAll(":", "");
  const width = Math.max(nodes.length * 190, 380);
  const nodePosition = (index: number) => ({ x: 30 + index * ((width - 160) / Math.max(nodes.length - 1, 1)), y: 52 });
  const positions = new Map(nodes.map((node, index) => [node.id, nodePosition(index)]));
  const descriptionId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${instanceId}-description`;

  return (
    <figure className="network-flow" aria-labelledby={`${descriptionId}-title`}>
      <figcaption id={`${descriptionId}-title`}>{title}</figcaption>
      <div className="network-flow__canvas" aria-hidden="true">
        <svg viewBox={`0 0 ${width} 150`} role="img">
          <defs><marker id={`${descriptionId}-arrow`} markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4"><path d="M0,0 L8,4 L0,8 Z" /></marker></defs>
          {edges.map((edge) => {
            const source = positions.get(edge.source);
            const target = positions.get(edge.target);
            if (!source || !target) return null;
            const x1 = source.x + 60;
            const x2 = target.x + 60;
            return <g key={`${edge.source}-${edge.target}-${edge.label}`}><line x1={x1} x2={x2} y1="77" y2="77" markerEnd={`url(#${descriptionId}-arrow)`} /><text x={(x1 + x2) / 2} y="40" textAnchor="middle">{edge.label}</text></g>;
          })}
          {nodes.map((node, index) => { const position = nodePosition(index); return <g key={node.id}><rect x={position.x} y={position.y} width="120" height="50" rx="5" /><text x={position.x + 60} y={position.y + 30} textAnchor="middle">{node.label}</text></g>; })}
        </svg>
      </div>
      <p className="network-flow__summary" id={descriptionId}>{textAlternative.length ? textAlternative.join(" ") : edges.map((edge) => edgeSentence(edge, nodes)).join(" ")}</p>
    </figure>
  );
}
