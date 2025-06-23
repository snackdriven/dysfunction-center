import React from 'react';
import { TaskCard } from './TaskCard';
import { Task } from '../../services/tasks';
import { AlertCircle, Loader2 } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  error: any;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>Failed to load tasks. Please try again.</span>
      </div>
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

  const groupedTasks = React.useMemo(() => {
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
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <TaskGroup title="Overdue" tasks={groupedTasks.overdue} variant="error" />
      <TaskGroup title="Due Today" tasks={groupedTasks.today} />
      <TaskGroup title="Upcoming" tasks={groupedTasks.upcoming} />
      <TaskGroup title="No Due Date" tasks={groupedTasks.noDate} />
      <TaskGroup title="Completed" tasks={groupedTasks.completed} variant="success" />
    </div>
  );
};