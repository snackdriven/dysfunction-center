import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { TaskCard } from './TaskCard';
import { Task } from '../../services/tasks';
import { DragEndEvent, DndContext, DragOverlay, DragStartEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';

interface TaskKanbanViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number, updates: Partial<Task>) => void;
  onTaskCreate: (status?: string, date?: Date) => void;
}

const COLUMN_CONFIG = [
  { id: 'todo', title: 'To Do', status: 'todo' as const },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress' as const },
  { id: 'completed', title: 'Completed', status: 'completed' as const },
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onTaskUpdate,
  onTaskCreate,
}) => {
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const tasksByStatus = React.useMemo(() => {
    return COLUMN_CONFIG.reduce((acc, column) => {
      acc[column.status] = tasks.filter(task => {
        if (column.status === 'completed') {
          return task.completed;
        }
        return !task.completed && task.status === column.status;
      });
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id.toString() === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveTask(null);
      return;
    }

    const taskId = parseInt(active.id as string);
    const newStatus = over.id as string;
    
    const updates: Partial<Task> = {
      status: newStatus as Task['status'],
      completed: newStatus === 'completed',
    };

    onTaskUpdate(taskId, updates);
    setActiveTask(null);
  };

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCorners}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {COLUMN_CONFIG.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasksByStatus[column.status] || []}
            onTaskCreate={() => onTaskCreate(column.status)}
          />
        ))}
      </div>
      
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 opacity-80">
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

interface KanbanColumnProps {
  column: typeof COLUMN_CONFIG[0];
  tasks: Task[];
  onTaskCreate: () => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, tasks, onTaskCreate }) => {
  return (
    <Card className="flex flex-col h-full min-h-[600px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{column.title}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onTaskCreate}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 pt-0">
        <SortableContext items={tasks.map(t => t.id.toString())}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <SortableTaskCard key={task.id} task={task} />
            ))}
          </div>
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
            <p className="text-sm">No tasks yet</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTaskCreate}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface SortableTaskCardProps {
  task: Task;
}

const SortableTaskCard: React.FC<SortableTaskCardProps> = ({ task }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard task={task} />
    </div>
  );
};
