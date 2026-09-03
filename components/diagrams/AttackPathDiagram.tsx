import type { DiagramNode, DirectedEdge } from "@/lib/schemas";
import { NetworkFlow } from "@/components/diagrams/NetworkFlow";

export function AttackPathDiagram({ title, nodes, edges, textAlternative }: { title: string; nodes: readonly DiagramNode[]; edges: readonly DirectedEdge[]; textAlternative: readonly string[] }) {
  return <NetworkFlow title={title} nodes={nodes} edges={edges} textAlternative={textAlternative} />;
}
