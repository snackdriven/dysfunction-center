import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, Target, Plus, ExternalLink, Zap } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '../../services/tasks';
import { habitsApi } from '../../services/habits';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { calculateHabitStreak, DASHBOARD_CONSTANTS } from '../../utils/dashboardHelpers';

/**
 * Focused view of today's essential tasks and habits
 * Reduces cognitive load by showing only actionable items for today
 */
export const TodayFocus: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  // Fetch today's priority data
  const { data: todayTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'today-focus'],
    queryFn: () => tasksApi.getTasks({ 
      due_before: today, 
      completed: false,
      limit: DASHBOARD_CONSTANTS.WIDGET_ITEMS_LIMIT + 2 // Slightly more for today focus
    }),
  });

  const { data: todayHabits, isLoading: habitsLoading } = useQuery({
    queryKey: ['habits', 'today-focus'],
    queryFn: () => habitsApi.getHabits(),
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ['habit-completions', 'today'],
    queryFn: () => habitsApi.getTodayCompletions(),
  });

  // Mutations for quick actions
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => 
      tasksApi.updateTask({ id, completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const logHabitCompletionMutation = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: number; completed: boolean }) => 
      habitsApi.logCompletion(habitId, { 
        date: today, 
        completed,
        value: completed ? 1 : 0 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-completions'] });
    },
  });

  /**
   * Quick task completion toggle
   */
  const handleTaskToggle = (taskId: number, completed: boolean) => {
    updateTaskMutation.mutate({ id: taskId, completed: !completed });
  };

  /**
   * Quick habit completion toggle
   */
  const handleHabitToggle = (habitId: number) => {
    const completion = todayCompletions?.find(c => c.habit_id === habitId);
    const isCompleted = completion?.completed || false;
    logHabitCompletionMutation.mutate({ habitId, completed: !isCompleted });
  };

  /**
   * Check if habit is completed today
   */
  const isHabitCompleted = (habitId: number) => {
    return todayCompletions?.find(c => c.habit_id === habitId)?.completed || false;
  };

  /**
   * Get habit streak count safely - using imported utility
   */
  const getHabitStreak = calculateHabitStreak;

  /**
   * Get semantic priority styling
   */
  const getPrioritySemantics = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return { variant: 'destructive' as const, color: 'text-red-700' };
      case 'medium':
        return { variant: 'secondary' as const, color: 'text-amber-700' };
      default:
        return { variant: 'outline' as const, color: 'text-gray-700' };
    }
  };

  if (tasksLoading || habitsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 bg-muted animate-pulse rounded" />
              {Array.from({ length: 3 }, (_, j) => (
                <div key={j} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Today's Focus</h2>
              <p className="text-sm text-muted-foreground">
                {todayTasks?.length || 0} tasks • {todayHabits?.length || 0} habits
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Priority Tasks
              </CardTitle>
              <Badge variant="outline">
                {todayTasks?.filter(t => !t.completed).length || 0} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayTasks?.slice(0, DASHBOARD_CONSTANTS.RECENT_ITEMS_DISPLAY).map((task) => {
                const prioritySemantics = getPrioritySemantics(task.priority);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleTaskToggle(task.id, task.completed)}
                      className="h-4 w-4 rounded border cursor-pointer"
                      disabled={updateTaskMutation.isPending}
                      aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-medium truncate",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={prioritySemantics.variant} className="text-xs">
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!todayTasks || todayTasks.length === 0) && (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-muted-foreground">All caught up! No urgent tasks today.</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/tasks')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/tasks')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Habits */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Habits
              </CardTitle>
              <Badge variant="outline">
                {todayHabits?.filter(h => isHabitCompleted(h.id)).length || 0} / {todayHabits?.length || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayHabits?.slice(0, DASHBOARD_CONSTANTS.RECENT_ITEMS_DISPLAY).map((habit) => {
                const isCompleted = isHabitCompleted(habit.id);
                const streak = getHabitStreak(habit);
                
                return (
                  <div key={habit.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={cn(
                      "w-4 h-4 rounded-full transition-colors",
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    )} />
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-medium truncate",
                        isCompleted && "text-green-700"
                      )}>
                        {habit.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>Streak: {streak} days</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant={isCompleted ? "default" : "outline"}
                      onClick={() => handleHabitToggle(habit.id)}
                      disabled={logHabitCompletionMutation.isPending}
                      aria-label={`${isCompleted ? 'Unmark' : 'Mark'} ${habit.name} as completed`}
                    >
                      {logHabitCompletionMutation.isPending ? 
                        <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" /> :
                        (isCompleted ? 'Done' : 'Mark')
                      }
                    </Button>
                  </div>
                );
              })}
              
              {(!todayHabits || todayHabits.length === 0) && (
                <div className="text-center py-6">
                  <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">No habits set up yet.</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => navigate('/habits')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Habit
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/habits')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};