import ReactFlow, {
  Background,
  Controls,
  useReactFlow,
  type NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { AtlasGraph as AtlasGraphModel } from "@github-atlas/graph";
import { toReactFlowEdges } from "../lib/to-reactflow-edges";
import { toReactFlowNodes } from "../lib/to-reactflow-nodes";
import { buildPositions } from "../lib/positions";

export type AtlasGraphProps = {
  graph: AtlasGraphModel;
  selectedId: string | null;
  onSelect: Dispatch<SetStateAction<string | null>>;
};

export function AtlasGraph({ graph, selectedId, onSelect }: AtlasGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { fitView } = useReactFlow();
  const didFitRef = useRef(false);

  // Prefer hover highlight over selection highlight
  const activeId = hoveredId ?? selectedId;
  const positions = useMemo(() => buildPositions(graph.nodes), [graph.nodes]);
  const rfEdges = useMemo(
    () => toReactFlowEdges(graph.edges, activeId),
    [graph.edges, activeId],
  );

  const rfNodes = useMemo(
    () =>
      toReactFlowNodes({
        items: graph.nodes,
        edges: graph.edges,
        positions,
        selectedId,
        activeId,
      }),
    [graph.nodes, graph.edges, selectedId, activeId, positions],
  );

  useEffect(() => {
    didFitRef.current = false;
  }, [graph]); // or graph.nodes/graph.edges if new objects each time

  useEffect(() => {
    if (didFitRef.current) return;
    didFitRef.current = true;
    fitView({ padding: 0.2 });
  }, [fitView, rfNodes.length, rfEdges.length]); // cheap trigger

  const onNodeClick = useCallback<NodeMouseHandler>(
    (_, node) => onSelect((prev) => (prev === node.id ? null : node.id)),
    [onSelect],
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onPaneClick={() => onSelect(null)}
        onNodeClick={onNodeClick}
        // onNodeMouseEnter={(_, node) => setHoveredId(node.id)}
        // onNodeMouseLeave={() => setHoveredId(null)}
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
