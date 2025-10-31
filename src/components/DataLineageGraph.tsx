import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Database, Library } from "lucide-react";

interface DataLineageGraphProps {
  data: {
    nodes: any[];
    edges: any[];
  };
}

export const DataLineageGraph = ({ data }: DataLineageGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    if (!data.nodes || !data.edges) return;

    // Transform data to ReactFlow format
    const flowNodes: Node[] = data.nodes.map((node, index) => {
      const nodeType = node.type?.toLowerCase();
      const Icon = nodeType === "library" ? Library : Database;
      const label = node.label || node.name || node.id;
      
      return {
        id: node.id || String(index),
        position: node.position || { x: Math.random() * 500, y: Math.random() * 500 },
        data: { 
          label: (
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span>{label}</span>
            </div>
          ),
          ...node 
        },
        style: {
          background: "hsl(var(--card))",
          border: "2px solid hsl(var(--primary))",
          borderRadius: "12px",
          padding: "16px",
          fontSize: "14px",
          fontWeight: "500",
          color: "hsl(var(--card-foreground))",
          boxShadow: "var(--shadow-card)",
          minWidth: "150px",
        },
      };
    });

    const flowEdges: Edge[] = data.edges.map((edge, index) => ({
      id: edge.id || `edge-${index}`,
      source: edge.source || edge.from,
      target: edge.target || edge.to,
      animated: true,
      style: { stroke: "hsl(var(--primary))", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "hsl(var(--primary))",
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [data, setNodes, setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data);
  }, []);

  return (
    <>
      <div className="w-full h-[calc(100vh-12rem)] bg-card rounded-lg shadow-[var(--shadow-card)] overflow-hidden border border-border">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls className="bg-card border-border" />
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={16} 
            size={1}
            color="hsl(var(--muted-foreground) / 0.2)"
          />
        </ReactFlow>
      </div>

      <Dialog open={!!selectedNode} onOpenChange={() => setSelectedNode(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedNode?.label || selectedNode?.name || "Node Details"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {selectedNode && Object.entries(selectedNode).map(([key, value]) => {
              if (key === "label") return null;
              return (
                <div key={key} className="border-b border-border pb-3">
                  <p className="text-sm font-semibold text-muted-foreground uppercase mb-1">
                    {key}
                  </p>
                  <p className="text-foreground">
                    {typeof value === "object" ? JSON.stringify(value, null, 2) : String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
