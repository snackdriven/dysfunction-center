import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { BulkTaskOperations } from './BulkTaskOperations';
import { Task } from '../../services/tasks';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorState } from '../common/ErrorState';
import { Button } from '../ui/Button';
import { CheckSquare, Square } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: any;
  onRetry?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, isLoading, error, onRetry }) => {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  const handleSelectionChange = (taskId: number, selected: boolean) => {
    if (selected) {
      setSelectedTaskIds(prev => [...prev, taskId]);
    } else {
      setSelectedTaskIds(prev => prev.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = () => {
    const allTaskIds = tasks.map(task => task.id);
    setSelectedTaskIds(allTaskIds);
  };

  const handleClearSelection = () => {
    setSelectedTaskIds([]);
    setSelectionMode(false);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedTaskIds([]);
    }
  };
  const groupedTasks = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) {
      return {
        overdue: [],
        today: [],
        upcoming: [],
        completed: [],
        noDate: [],
      };
    }

    const groups = {
      overdue: tasks.filter(task => 
        !task.completed && 
        task.due_date && 
        new Date(task.due_date) < new Date()
      ),
      today: tasks.filter(task => {
        if (!task.due_date || task.completed) return false;
        const today = new Date().toDateString();
        return new Date(task.due_date).toDateString() === today;
      }),
      upcoming: tasks.filter(task => 
        !task.completed && 
        task.due_date && 
        new Date(task.due_date) > new Date() &&
        new Date(task.due_date).toDateString() !== new Date().toDateString()
      ),
      completed: tasks.filter(task => task.completed),
      noDate: tasks.filter(task => !task.due_date && !task.completed),
    };

    return groups;
  }, [tasks]);

  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading tasks..." className="py-12" />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={onRetry}
        title="Failed to load tasks"
        description="Unable to fetch your tasks. Please check your connection and try again."
      />
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first task to get started with productivity tracking!
        </p>
      </div>
    );
  }

  const TaskGroup: React.FC<{ title: string; tasks: Task[]; variant?: 'default' | 'error' | 'success' }> = ({ 
    title, 
    tasks, 
    variant = 'default' 
  }) => {
    if (tasks.length === 0) return null;

    const titleClasses = {
      default: 'text-foreground',
      error: 'text-red-600',
      success: 'text-green-600',
    };

    return (
      <div className="space-y-3">
        <h3 className={`font-semibold ${titleClasses[variant]}`}>
          {title} ({tasks.length})
        </h3>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task}
              selectionMode={selectionMode}
              isSelected={selectedTaskIds.includes(task.id)}
              onSelectionChange={handleSelectionChange}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8">
        {/* Selection Toolbar */}
        {tasks.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={selectionMode ? "primary" : "outline"}
                onClick={toggleSelectionMode}
              >
                {selectionMode ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
                {selectionMode ? 'Exit Selection' : 'Select Tasks'}
              </Button>
              
              {selectionMode && (
                <Button size="sm" variant="outline" onClick={handleSelectAll}>
                  Select All
                </Button>
              )}
            </div>
            
            {selectionMode && selectedTaskIds.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedTaskIds.length} of {tasks.length} tasks selected
              </div>
            )}
          </div>
        )}

        <TaskGroup title="Overdue" tasks={groupedTasks.overdue} variant="error" />
        <TaskGroup title="Due Today" tasks={groupedTasks.today} />
        <TaskGroup title="Upcoming" tasks={groupedTasks.upcoming} />
        <TaskGroup title="No Due Date" tasks={groupedTasks.noDate} />
        <TaskGroup title="Completed" tasks={groupedTasks.completed} variant="success" />
      </div>

      {/* Bulk Operations */}
      {selectionMode && (
        <BulkTaskOperations
          selectedTaskIds={selectedTaskIds}
          tasks={tasks}
          onClearSelection={handleClearSelection}
          onSelectionChange={setSelectedTaskIds}
        />
      )}
    </>
  );
};