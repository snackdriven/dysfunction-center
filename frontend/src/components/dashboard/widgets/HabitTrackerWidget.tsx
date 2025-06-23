import React from 'react';
import { DashboardWidget } from '../../layout/DashboardGrid';
import { Button } from '../../ui/Button';
import { CheckCircle, Circle, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { habitsApi, useLogHabitCompletion } from '../../../services/habits';

export const HabitTrackerWidget: React.FC = () => {
  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: habitsApi.getHabits,
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ['habit-completions', 'today'],
    queryFn: () => habitsApi.getTodayCompletions(),
  });

  const logCompletion = useLogHabitCompletion();

  const progressData = React.useMemo(() => {
    if (!habits || !todayCompletions) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = todayCompletions.filter(c => c.completed).length;
    const total = habits.length;
    
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  }, [habits, todayCompletions]);

  const handleToggleHabit = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const currentCompletion = todayCompletions?.find(c => c.habit_id === habitId);
    
    try {
      await logCompletion.mutateAsync({
        habitId,
        date: today,
        completed: !currentCompletion?.completed,
      });
    } catch (error) {
      console.error('Failed to log habit completion:', error);
    }
  };

  return (
    <DashboardWidget
      title="Habit Tracker"
      subtitle="Today's habit progress"
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
          {/* Progress Overview */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {progressData.completed}/{progressData.total}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressData.percentage}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {progressData.percentage.toFixed(0)}% completed today
            </p>
          </div>

          {/* Habit List */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Today's Habits</h4>
            {habits && habits.length > 0 ? (
              habits.slice(0, 4).map((habit) => {
                const completion = todayCompletions?.find(c => c.habit_id === habit.id);
                const isCompleted = completion?.completed || false;
                
                return (
                  <div key={habit.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card">
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className="text-muted-foreground hover:text-foreground"
                      disabled={logCompletion.isPending}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {habit.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {habit.streak_count} day streak
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {habit.target_frequency}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No habits yet. Start building good routines! 💪
              </p>
            )}
          </div>

          {/* Quick Add */}
          <Button className="w-full" variant="outline">
            + Add Habit
          </Button>
        </div>
      )}
    </DashboardWidget>
  );
};