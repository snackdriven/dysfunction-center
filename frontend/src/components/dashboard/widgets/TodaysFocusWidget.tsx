import React from 'react';
import { DashboardWidget } from '../../layout/DashboardGrid';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi, useUpdateTask } from '../../../services/tasks';

export const TodaysFocusWidget: React.FC = () => {
  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => tasksApi.getTodaysTasks(),
  });

  const updateTask = useUpdateTask();

  const taskSummary = React.useMemo(() => {
    if (!tasks) return { total: 0, completed: 0, overdue: 0, inProgress: 0 };
    
    const now = new Date();
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      overdue: tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < now).length,
      inProgress: tasks.filter(t => !t.completed && t.status === 'in_progress').length,
    };
  }, [tasks]);

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
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

  return (
    <DashboardWidget
      title="Today's Focus"
      subtitle="Your priority tasks for today"
      action={
        <Button size="sm" variant="outline">
          View All
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
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{taskSummary.completed} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span>{taskSummary.total - taskSummary.completed} remaining</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>{taskSummary.overdue} overdue</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span>{taskSummary.inProgress} in progress</span>
            </div>
          </div>

          {/* Top Tasks */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Priority Tasks</h4>
            {tasks && tasks.length > 0 ? (
              tasks.slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                  <button
                    onClick={() => handleToggleComplete(task.id, task.completed)}
                    className="text-muted-foreground hover:text-foreground"
                    disabled={updateTask.isPending}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                    {task.priority}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No tasks for today. Great job! 🎉
              </p>
            )}
          </div>

          {/* Quick Add */}
          <Button className="w-full" variant="outline">
            + Add Task
          </Button>
        </div>
      )}
    </DashboardWidget>
  );
};