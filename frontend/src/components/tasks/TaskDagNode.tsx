import { memo } from 'react';
import { Handle, Position, type Node } from '@xyflow/react';
import type { TaskWithAttemptStatus, TaskStatus } from 'shared/types';
import { cn } from '@/lib/utils';
import { statusBoardColors, statusLabels } from '@/utils/statusLabels';

export interface TaskNodeData extends Record<string, unknown> {
  task: TaskWithAttemptStatus;
  onViewDetails: (task: TaskWithAttemptStatus) => void;
  isSelected: boolean;
}

export type TaskNode = Node<TaskNodeData, 'taskNode'>;

interface TaskDagNodeProps {
  data: TaskNodeData;
}

function TaskDagNodeComponent({ data }: TaskDagNodeProps) {
  const { task, onViewDetails, isSelected } = data;

  const handleClick = () => {
    onViewDetails(task);
  };

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-lg border-2 bg-card shadow-sm cursor-pointer transition-all hover:shadow-md min-w-[250px]',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        getBorderColor(task.status)
      )}
      onClick={handleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-muted-foreground/50"
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              getStatusBadgeColor(task.status)
            )}
          >
            {statusLabels[task.status]}
          </span>
          {task.has_in_progress_attempt && (
            <span className="text-xs text-blue-500 font-medium animate-pulse">
              実行中
            </span>
          )}
        </div>

        <h3 className="text-sm font-medium line-clamp-2" title={task.title}>
          {task.title}
        </h3>

        {task.description && (
          <p
            className="text-xs text-muted-foreground line-clamp-1"
            title={task.description}
          >
            {task.description}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-muted-foreground/50"
      />
    </div>
  );
}

function getBorderColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    todo: 'border-slate-300',
    inprogress: 'border-blue-400',
    inreview: 'border-purple-400',
    done: 'border-green-400',
    cancelled: 'border-gray-400',
  };
  return colors[status] || 'border-slate-300';
}

function getStatusBadgeColor(status: TaskStatus): string {
  const color = statusBoardColors[status];
  return `bg-${color}/10 text-${color}`;
}

export const TaskDagNode = memo(TaskDagNodeComponent);
