import React from 'react';
import { cn } from '../../../utils/cn';
import { ResponsiveDashboardWidget } from '../../layout/ResponsiveDashboardGrid';
import { ResponsiveCard, ResponsiveCardContent, ResponsiveCardStats } from '../../ui/ResponsiveCard';
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';
import { CheckCircle, Circle, Clock, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi, useUpdateTask } from '../../../services/tasks';

export const ResponsiveTodaysFocusWidget: React.FC = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => tasksApi.getTodaysTasks(),
  });

  const updateTask = useUpdateTask();
  
  const taskSummary = React.useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return { total: 0, completed: 0, overdue: 0, inProgress: 0 };
    
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      overdue: tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < now).length,
      inProgress: tasks.filter(t => !t.completed && t.status === 'in_progress').length,
    };
  }, [tasks]);

  const completionRate = taskSummary.total > 0 ? (taskSummary.completed / taskSummary.total) * 100 : 0;

  const handleToggleComplete = async (taskId: number, completed: boolean) => {
    try {
      await updateTask.mutateAsync({
        id: taskId,
        completed: !completed,
        status: !completed ? 'completed' : 'pending'
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const stats = [
    {
      label: 'Completed',
      value: taskSummary.completed,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      trend: 'up' as const
    },
    {
      label: 'Remaining',
      value: taskSummary.total - taskSummary.completed,
      icon: <Circle className="h-4 w-4 text-muted-foreground" />
    },
    {
      label: 'In Progress',
      value: taskSummary.inProgress,
      icon: <Clock className="h-4 w-4 text-orange-600" />
    },
    {
      label: 'Completion',
      value: `${Math.round(completionRate)}%`,
      icon: <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  ];

  return (
    <ResponsiveDashboardWidget
      title="Today's Focus"
      subtitle="Your priority tasks for today"
      size="large"
      action={
        <Button size="sm" variant="outline">
          <span className="hidden @container/widget-[min-width:_200px]:inline">View All</span>
          <span className="@container/widget-[min-width:_200px]:hidden">All</span>
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="progress-section">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Daily Progress</span>
              <span className="text-sm text-muted-foreground">
                {taskSummary.completed}/{taskSummary.total}
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {/* Responsive Stats */}
          <div className="hidden @container/widget-[min-width:_300px]:block">
            <ResponsiveCardStats stats={stats} />
          </div>

          {/* Compact Stats for Small Widgets */}
          <div className="@container/widget-[min-width:_300px]:hidden">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>{taskSummary.completed}</span>
              </div>
              <div className="flex items-center gap-1">
                <Circle className="h-3 w-3 text-muted-foreground" />
                <span>{taskSummary.total - taskSummary.completed}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-600" />
                <span>{taskSummary.inProgress}</span>
              </div>
            </div>
          </div>

          {/* Task List - Responsive Layout */}
          <div className="task-list space-y-2">
            <h4 className={cn(
              'font-medium text-muted-foreground',
              'text-xs @container/widget-[min-width:_250px]:text-sm',
              'hidden @container/widget-[min-width:_280px]:block'
            )}>
              Priority Tasks
            </h4>
            
            {tasks && Array.isArray(tasks) && tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.slice(0, 3).map((task) => (
                  <ResponsiveTaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={handleToggleComplete}
                    isUpdating={updateTask.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks for today</p>
              </div>
            )}
          </div>
        </div>
      )}
    </ResponsiveDashboardWidget>
  );
};

interface ResponsiveTaskItemProps {
  task: any;
  onToggleComplete: (id: number, completed: boolean) => void;
  isUpdating: boolean;
}

const ResponsiveTaskItem: React.FC<ResponsiveTaskItemProps> = ({
  task,
  onToggleComplete,
  isUpdating
}) => {
  return (
    <div className={cn(
      'task-item',
      'flex items-center gap-3 p-2 rounded-lg border bg-card',
      'hover:bg-accent/50 transition-colors',
      // Responsive padding
      '@container/widget-[min-width:_300px]:p-3'
    )}>
      <button
        onClick={() => onToggleComplete(task.id, task.completed)}
        className={cn(
          'task-toggle',
          'text-muted-foreground hover:text-foreground',
          'min-w-[16px] min-h-[16px]',
          'touch-target-44 flex items-center justify-center'
        )}
        disabled={isUpdating}
        aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {task.completed ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>
      
      <div className="task-content flex-1 min-w-0">
        <p className={cn(
          'task-title',
          'font-medium truncate',
          'text-xs @container/widget-[min-width:_250px]:text-sm',
          task.completed && 'line-through text-muted-foreground'
        )}>
          {task.title}
        </p>
        
        {task.due_date && (
          <p className={cn(
            'task-due-date',
            'text-xs text-muted-foreground',
            'hidden @container/widget-[min-width:_300px]:block',
            new Date(task.due_date) < new Date() && !task.completed && 'text-destructive'
          )}>
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
      </div>
      
      {task.priority && (
        <div className={cn(
          'task-priority',
          'hidden @container/widget-[min-width:_350px]:block'
        )}>
          <span className={cn(
            'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium',
            task.priority === 'high' && 'bg-destructive/10 text-destructive',
            task.priority === 'medium' && 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            task.priority === 'low' && 'bg-secondary text-secondary-foreground'
          )}>
            {task.priority}
          </span>
        </div>
      )}
    </div>
  );
};
