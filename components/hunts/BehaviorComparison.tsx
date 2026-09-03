import type { DiagramNode, DirectedEdge, FlowDefinition } from "@/lib/schemas";
import { ProtocolFlowDiagram } from "@/components/diagrams/ProtocolFlowDiagram";

type ReadonlyFlowDefinition = Omit<FlowDefinition, "nodes" | "edges" | "textAlternative"> & {
  nodes: readonly DiagramNode[];
  edges: readonly DirectedEdge[];
  textAlternative: readonly string[];
};

export function BehaviorComparison({ expected, suspicious }: { expected: ReadonlyFlowDefinition; suspicious: ReadonlyFlowDefinition }) {
  return (
    <section aria-labelledby="behavior-comparison-title" className="behavior-comparison">
      <h2 id="behavior-comparison-title" className="sr-only">Behavior comparison</h2>
      <div className="behavior-comparison__flow"><h3>Expected</h3><ProtocolFlowDiagram {...expected} /></div>
      <div className="behavior-comparison__flow behavior-comparison__flow--suspicious"><h3>Suspicious</h3><ProtocolFlowDiagram {...suspicious} /></div>
    </section>
  );
}
