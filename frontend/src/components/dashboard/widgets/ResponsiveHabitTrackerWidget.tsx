import React from 'react';
import { cn } from '../../../utils/cn';
import { ResponsiveDashboardWidget } from '../../layout/ResponsiveDashboardGrid';
import { ResponsiveCard, ResponsiveCardStats } from '../../ui/ResponsiveCard';
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';
import { 
  Check, 
  X, 
  Target, 
  Flame, 
  Calendar,
  TrendingUp,
  Award,
  RotateCcw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitsApi } from '../../../services/habits';

export const ResponsiveHabitTrackerWidget: React.FC = () => {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits', 'today'],
    queryFn: () => habitsApi.getHabits(),
  });

  const { data: todayCompletions } = useQuery({
    queryKey: ['habit-completions', today],
    queryFn: () => habitsApi.getTodayCompletions(),
  });

  const markCompletion = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: number; completed: boolean }) =>
      habitsApi.logCompletion(habitId, {
        date: today,
        completed,
        completion_timestamp: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-completions', today] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    }
  });

  const habitSummary = React.useMemo(() => {
    if (!habits || !Array.isArray(habits)) return { total: 0, completed: 0, streak: 0, weekProgress: 0 };
    
    const completedToday = todayCompletions || [];
    const completed = habits.filter(habit => 
      completedToday.some((comp: any) => comp.habit_id === habit.id)
    ).length;

    // Calculate average streak
    const avgStreak = habits.reduce((acc, habit) => acc + (habit.current_streak || 0), 0) / habits.length;
    
    // Calculate week progress (mock for now)
    const weekProgress = completed > 0 ? (completed / habits.length) * 100 : 0;

    return {
      total: habits.length,
      completed,
      streak: Math.round(avgStreak),
      weekProgress: Math.round(weekProgress)
    };
  }, [habits, todayCompletions]);

  const handleToggleHabit = async (habitId: number, isCompleted: boolean) => {
    try {
      await markCompletion.mutateAsync({
        habitId,
        completed: !isCompleted
      });
    } catch (error) {
      console.error('Failed to update habit:', error);
    }
  };

  const stats = [
    {
      label: 'Completed',
      value: habitSummary.completed,
      icon: <Check className="h-4 w-4 text-green-600" />,
      trend: 'up' as const
    },
    {
      label: 'Remaining',
      value: habitSummary.total - habitSummary.completed,
      icon: <Target className="h-4 w-4 text-muted-foreground" />
    },
    {
      label: 'Avg Streak',
      value: habitSummary.streak,
      icon: <Flame className="h-4 w-4 text-orange-600" />
    },
    {
      label: 'Week Rate',
      value: `${habitSummary.weekProgress}%`,
      icon: <TrendingUp className="h-4 w-4 text-blue-600" />
    }
  ];

  return (
    <ResponsiveDashboardWidget
      title="Habit Tracker"
      subtitle="Build consistency, one day at a time"
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
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="progress-section">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Today's Progress</span>
              <span className="text-sm text-muted-foreground">
                {habitSummary.completed}/{habitSummary.total}
              </span>
            </div>
            <Progress 
              value={habitSummary.total > 0 ? (habitSummary.completed / habitSummary.total) * 100 : 0} 
              className="h-2" 
            />
          </div>

          {/* Responsive Stats */}
          <div className="hidden @container/widget-[min-width:_320px]:block">
            <ResponsiveCardStats stats={stats} />
          </div>

          {/* Compact Stats for Small Widgets */}
          <div className="@container/widget-[min-width:_320px]:hidden">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-600" />
                <span>{habitSummary.completed}</span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-600" />
                <span>{habitSummary.streak}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-blue-600" />
                <span>{habitSummary.weekProgress}%</span>
              </div>
            </div>
          </div>

          {/* Habit List */}
          <div className="habit-list space-y-2">
            <h4 className={cn(
              'font-medium text-muted-foreground',
              'text-xs @container/widget-[min-width:_250px]:text-sm',
              'hidden @container/widget-[min-width:_280px]:block'
            )}>
              Today's Habits
            </h4>
            
            {habits && Array.isArray(habits) && habits.length > 0 ? (
              <div className="space-y-2">
                {habits.slice(0, 4).map((habit) => {
                  const isCompleted = todayCompletions?.some((comp: any) => comp.habit_id === habit.id) || false;
                  return (
                    <ResponsiveHabitItem
                      key={habit.id}
                      habit={habit}
                      isCompleted={isCompleted}
                      onToggle={handleToggleHabit}
                      isUpdating={markCompletion.isPending}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No habits to track</p>
                <Button size="sm" variant="outline" className="mt-2">
                  <span className="hidden @container/widget-[min-width:_250px]:inline">Add Your First Habit</span>
                  <span className="@container/widget-[min-width:_250px]:hidden">Add Habit</span>
                </Button>
              </div>
            )}
          </div>

          {/* Achievement Badge - Only show on larger widgets */}
          {habitSummary.completed === habitSummary.total && habitSummary.total > 0 && (
            <div className={cn(
              'achievement-badge',
              'hidden @container/widget-[min-width:_350px]:flex',
              'items-center justify-center gap-2 p-3',
              'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
              'rounded-lg text-green-800 dark:text-green-400'
            )}>
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">All habits completed today! 🎉</span>
            </div>
          )}
        </div>
      )}
    </ResponsiveDashboardWidget>
  );
};

interface ResponsiveHabitItemProps {
  habit: any;
  isCompleted: boolean;
  onToggle: (id: number, isCompleted: boolean) => void;
  isUpdating: boolean;
}

const ResponsiveHabitItem: React.FC<ResponsiveHabitItemProps> = ({
  habit,
  isCompleted,
  onToggle,
  isUpdating
}) => {
  return (
    <div className={cn(
      'habit-item',
      'flex items-center gap-3 p-2 rounded-lg border',
      'hover:bg-accent/50 transition-colors',
      isCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-card',
      // Responsive padding
      '@container/widget-[min-width:_300px]:p-3'
    )}>
      <button
        onClick={() => onToggle(habit.id, isCompleted)}
        className={cn(
          'habit-toggle',
          'rounded-full border-2 transition-all',
          'min-w-[20px] min-h-[20px] flex items-center justify-center',
          'touch-target-44',
          isCompleted 
            ? 'bg-green-600 border-green-600 text-white' 
            : 'border-muted-foreground hover:border-primary'
        )}
        disabled={isUpdating}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isCompleted && <Check className="h-3 w-3" />}
      </button>
      
      <div className="habit-content flex-1 min-w-0">
        <p className={cn(
          'habit-name',
          'font-medium truncate',
          'text-xs @container/widget-[min-width:_250px]:text-sm',
          isCompleted && 'text-green-800 dark:text-green-400'
        )}>
          {habit.name}
        </p>
        
        <div className={cn(
          'habit-meta flex items-center gap-2 mt-1',
          'hidden @container/widget-[min-width:_300px]:flex'
        )}>
          {habit.current_streak > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3 w-3 text-orange-600" />
              <span>{habit.current_streak} day streak</span>
            </div>
          )}
          {habit.frequency && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{habit.frequency}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Quick Action - Only show on larger widgets */}
      <div className={cn(
        'habit-action',
        'hidden @container/widget-[min-width:_380px]:block'
      )}>
        {isCompleted ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggle(habit.id, isCompleted)}
            disabled={isUpdating}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground">
            {habit.target_frequency && `${habit.target_frequency}x`}
          </div>
        )}
      </div>
    </div>
  );
};
