import { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { AlignVerticalJustifyCenter } from 'lucide-react';
import type { TaskWithAttemptStatus, TaskDependency } from 'shared/types';
import { TaskDagNode, type TaskNodeData, type TaskNode } from './TaskDagNode';
import { getLayoutedElements } from '@/lib/dagLayout';
import { tasksApi } from '@/lib/api';
import { useMutation } from '@tanstack/react-query';

const nodeTypes: NodeTypes = {
  taskNode: TaskDagNode,
};

interface TaskDagViewProps {
  tasks: TaskWithAttemptStatus[];
  dependencies: TaskDependency[];
  onViewTaskDetails: (task: TaskWithAttemptStatus) => void;
  selectedTaskId?: string;
}

export function TaskDagView({
  tasks,
  dependencies,
  onViewTaskDetails,
  selectedTaskId,
}: TaskDagViewProps) {
  const [isLayouting, setIsLayouting] = useState(false);

  // Convert tasks and dependencies to React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: TaskNode[] = tasks.map((task) => ({
      id: task.id,
      type: 'taskNode' as const,
      position: {
        x: task.dag_position_x ?? 0,
        y: task.dag_position_y ?? 0,
      },
      data: {
        task,
        onViewDetails: onViewTaskDetails,
        isSelected: task.id === selectedTaskId,
      },
    }));

    const edges: Edge[] = dependencies.map((dep) => ({
      id: dep.id,
      source: dep.depends_on_task_id,
      target: dep.task_id,
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    }));

    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks, dependencies, onViewTaskDetails, selectedTaskId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when tasks or selection changes
  useEffect(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const task = tasks.find((t) => t.id === node.id);
        if (!task) return node;
        const nodeData = node.data as TaskNodeData;
        return {
          ...node,
          data: {
            ...nodeData,
            task,
            isSelected: task.id === selectedTaskId,
          },
        };
      })
    );
  }, [tasks, selectedTaskId, setNodes]);

  // Update edges when dependencies change
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Mutation for saving node positions
  const savePositionMutation = useMutation({
    mutationFn: async ({
      taskId,
      x,
      y,
    }: {
      taskId: string;
      x: number;
      y: number;
    }) => {
      await tasksApi.update(taskId, {
        title: null,
        description: null,
        status: null,
        parent_workspace_id: null,
        image_ids: null,
        dag_position_x: x,
        dag_position_y: y,
      });
    },
  });

  // Handle node drag end - save position to backend
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      savePositionMutation.mutate({
        taskId: node.id,
        x: node.position.x,
        y: node.position.y,
      });
    },
    [savePositionMutation]
  );

  // Auto-layout using dagre
  const onAutoLayout = useCallback(() => {
    setIsLayouting(true);

    const layoutedNodes = getLayoutedElements(nodes, edges, {
      direction: 'TB',
      nodeSpacing: 80,
      rankSpacing: 120,
    }) as TaskNode[];

    // Apply layout with animation
    setNodes(layoutedNodes);

    // Save all positions to backend
    Promise.all(
      layoutedNodes.map((node) =>
        savePositionMutation.mutateAsync({
          taskId: node.id,
          x: node.position.x,
          y: node.position.y,
        })
      )
    ).finally(() => {
      setIsLayouting(false);
    });
  }, [nodes, edges, setNodes, savePositionMutation]);

  // Auto-layout on initial render if no positions are set
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (hasInitialized) return;
    const hasNoPositions = tasks.every(
      (t) => t.dag_position_x === null && t.dag_position_y === null
    );
    if (hasNoPositions && tasks.length > 0) {
      setHasInitialized(true);
      // Use setTimeout to ensure React Flow is fully initialized
      const timer = setTimeout(() => {
        onAutoLayout();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [tasks, onAutoLayout, hasInitialized]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="!bg-muted/50"
        />

        <Panel position="top-right" className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAutoLayout}
            disabled={isLayouting}
            className="flex items-center gap-2"
          >
            <AlignVerticalJustifyCenter className="h-4 w-4" />
            {isLayouting ? '整列中...' : '自動整列'}
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
