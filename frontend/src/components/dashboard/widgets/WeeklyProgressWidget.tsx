import React from 'react';
import { DashboardWidget } from '../../layout/DashboardGrid';
import { Button } from '../../ui/Button';
import { TrendingUp, CheckSquare, Target } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../../../services/tasks';
import { habitsApi } from '../../../services/habits';
import { moodApi } from '../../../services/mood';

export const WeeklyProgressWidget: React.FC = () => {
  const startOfWeek = React.useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day;
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  }, []);

  const endOfWeek = React.useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + 6;
    return new Date(now.setDate(diff)).toISOString().split('T')[0];
  }, []);

  const { data: weekTasks } = useQuery({
    queryKey: ['tasks', 'week', startOfWeek, endOfWeek],
    queryFn: () => tasksApi.getTasks({ 
      start_date: startOfWeek, 
      end_date: endOfWeek 
    }),
  });

  const { data: habits } = useQuery({
    queryKey: ['habits'],
    queryFn: habitsApi.getHabits,
  });

  const { data: weekMoods } = useQuery({
    queryKey: ['mood', 'week', startOfWeek, endOfWeek],
    queryFn: () => moodApi.getMoodEntries({ 
      start_date: startOfWeek, 
      end_date: endOfWeek 
    }),
  });

  const weeklyStats = React.useMemo(() => {
    const tasksCompleted = weekTasks && Array.isArray(weekTasks) 
      ? weekTasks.filter(t => t.completed).length 
      : 0;
    const totalTasks = weekTasks && Array.isArray(weekTasks) 
      ? weekTasks.length 
      : 0;
    const taskCompletionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0;

    const averageHabitCompletion = habits && Array.isArray(habits) && habits.length > 0 
      ? habits.reduce((sum, habit) => sum + (habit.completion_rate || 0), 0) / habits.length 
      : 0;
    
    const averageMood = weekMoods && Array.isArray(weekMoods) && weekMoods.length > 0 
      ? weekMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / weekMoods.length 
      : 0;

    return {
      tasksCompleted,
      totalTasks,
      taskCompletionRate,
      averageHabitCompletion,
      averageMood,
      moodEntries: weekMoods && Array.isArray(weekMoods) ? weekMoods.length : 0,
    };
  }, [weekTasks, habits, weekMoods]);

  return (
    <DashboardWidget
      title="Weekly Progress"
      subtitle="Your productivity overview this week"
      action={
        <Button size="sm" variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Progress Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Tasks</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{weeklyStats.tasksCompleted}/{weeklyStats.totalTasks}</span>
                <span className="text-muted-foreground">{weeklyStats.taskCompletionRate.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${weeklyStats.taskCompletionRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Habits</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Average</span>
                <span className="text-muted-foreground">{weeklyStats.averageHabitCompletion.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${weeklyStats.averageHabitCompletion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mood Overview */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">😊</span>
            <span className="text-sm font-medium">Mood Tracking</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{weeklyStats.moodEntries} entries this week</span>
            <span className="text-muted-foreground">
              Avg: {weeklyStats.averageMood.toFixed(1)}/5
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${(weeklyStats.averageMood / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="pt-3 border-t text-center">
          <div className="text-2xl font-bold text-primary">
            {Math.round((weeklyStats.taskCompletionRate + weeklyStats.averageHabitCompletion + (weeklyStats.averageMood / 5 * 100)) / 3)}%
          </div>
          <p className="text-sm text-muted-foreground">Overall weekly score</p>
        </div>
      </div>
    </DashboardWidget>
  );
};