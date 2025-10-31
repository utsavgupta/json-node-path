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
  Position,
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

    // Calculate node levels for left-to-right layout
    const nodeMap = new Map(data.nodes.map((node, idx) => [node.id || String(idx), node]));
    const levels = new Map<string, number>();
    const inDegree = new Map<string, number>();
    
    // Initialize in-degree
    data.nodes.forEach((node, idx) => {
      const id = node.id || String(idx);
      inDegree.set(id, 0);
      levels.set(id, 0);
    });
    
    // Calculate in-degree
    data.edges.forEach(edge => {
      const target = edge.target || edge.to;
      inDegree.set(target, (inDegree.get(target) || 0) + 1);
    });
    
    // BFS to assign levels (depth from sources)
    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentLevel = levels.get(current) || 0;
      
      data.edges.forEach(edge => {
        const source = edge.source || edge.from;
        const target = edge.target || edge.to;
        
        if (source === current) {
          const newLevel = currentLevel + 1;
          levels.set(target, Math.max(levels.get(target) || 0, newLevel));
          
          const degree = inDegree.get(target)! - 1;
          inDegree.set(target, degree);
          
          if (degree === 0) queue.push(target);
        }
      });
    }
    
    // Group nodes by level
    const nodesByLevel = new Map<number, string[]>();
    levels.forEach((level, id) => {
      if (!nodesByLevel.has(level)) nodesByLevel.set(level, []);
      nodesByLevel.get(level)!.push(id);
    });

    // Transform data to ReactFlow format with left-to-right positioning
    const flowNodes: Node[] = data.nodes.map((node, index) => {
      const nodeId = node.id || String(index);
      const level = levels.get(nodeId) || 0;
      const nodesAtLevel = nodesByLevel.get(level) || [];
      const indexInLevel = nodesAtLevel.indexOf(nodeId);
      
      const nodeType = node.type?.toLowerCase();
      const Icon = nodeType === "library" ? Library : Database;
      const label = node.label || node.name || node.id;
      
      return {
        id: nodeId,
        position: node.position || { 
          x: level * 300, 
          y: indexInLevel * 150 
        },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
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
              {selectedNode?.name || selectedNode?.id || "Node Details"}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-foreground whitespace-pre-wrap">
              {selectedNode?.description || "No description available"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
