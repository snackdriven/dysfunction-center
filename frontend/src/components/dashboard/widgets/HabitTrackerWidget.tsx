import React from 'react';
import { cn } from '../../../utils/cn';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
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

export const HabitTrackerWidget: React.FC = () => {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Habit Tracker</CardTitle>
            <p className="text-sm text-gray-600">Build consistency, one day at a time</p>
          </div>
          <Button size="sm" variant="outline">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress Overview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Today's Progress</span>
                <span className="text-sm text-gray-600">
                  {habitSummary.completed}/{habitSummary.total}
                </span>
              </div>
              <Progress 
                value={habitSummary.total > 0 ? (habitSummary.completed / habitSummary.total) * 100 : 0} 
                className="h-2" 
              />
            </div>

            {/* Simple Stats Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>Completed: {habitSummary.completed}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-600" />
                <span>Streak: {habitSummary.longestStreak}</span>
              </div>

            {/* Habit List */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-600 text-sm">Today's Habits</h4>
              
              {habits && Array.isArray(habits) && habits.length > 0 ? (
                <div className="space-y-2">
                  {habits.slice(0, 4).map((habit) => {
                    const isCompleted = todayCompletions?.some((comp: any) => comp.habit_id === habit.id) || false;
                    return (
                      <HabitItem
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
                <div className="text-center py-4 text-gray-600">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No habits to track</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Add Your First Habit
                  </Button>
                </div>
              )}
            </div>

            {/* Achievement Badge */}
            {habitSummary.completed === habitSummary.total && habitSummary.total > 0 && (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
                <Award className="h-4 w-4" />
                <span className="text-sm font-medium">All habits completed today! 🎉</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface HabitItemProps {
  habit: any;
  isCompleted: boolean;
  onToggle: (id: number, isCompleted: boolean) => void;
  isUpdating: boolean;
}

const HabitItem: React.FC<HabitItemProps> = ({
  habit,
  isCompleted,
  onToggle,
  isUpdating
}) => {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors',
      isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'
    )}>
      <button
        onClick={() => onToggle(habit.id, isCompleted)}
        className={cn(
          'rounded-full border-2 transition-all w-5 h-5 flex items-center justify-center',
          isCompleted 
            ? 'bg-green-600 border-green-600 text-white' 
            : 'border-gray-400 hover:border-green-600'
        )}
        disabled={isUpdating}
        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isCompleted && <Check className="h-3 w-3" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium truncate text-sm',
          isCompleted && 'text-green-800'
        )}>
          {habit.name}
        </p>
        
        <div className="flex items-center gap-2 mt-1">
          {habit.current_streak > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Flame className="h-3 w-3 text-orange-600" />
              <span>{habit.current_streak} day streak</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
