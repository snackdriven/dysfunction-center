import React from 'react';
import { DashboardWidget } from '../../layout/DashboardGrid';
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';
import { TrendingUp, CheckSquare, Target, Heart, Trophy, TrendingDown } from 'lucide-react';
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
      <div className="space-y-6">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Tasks Completed</span>
              </div>
              <span className="text-sm font-medium">{weeklyStats.tasksCompleted}/{weeklyStats.totalTasks}</span>
            </div>
            <Progress value={weeklyStats.taskCompletionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {weeklyStats.taskCompletionRate.toFixed(0)}% completion rate
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Habit Consistency</span>
              </div>
              <span className="text-sm font-medium">{weeklyStats.averageHabitCompletion.toFixed(0)}%</span>
            </div>
            <Progress value={weeklyStats.averageHabitCompletion} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Average across all habits
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium">Mood Tracking</span>
              </div>
              <span className="text-sm font-medium">{weeklyStats.averageMood.toFixed(1)}/5</span>
            </div>
            <Progress value={(weeklyStats.averageMood / 5) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {weeklyStats.moodEntries} mood entries this week
            </p>
          </div>
        </div>

        {/* Productivity Insights */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Weekly Insights</h4>
          <div className="space-y-2">
            {weeklyStats.taskCompletionRate >= 80 && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-lg">
                <Trophy className="h-4 w-4" />
                <span className="text-xs">Excellent task completion rate!</span>
              </div>
            )}
            {weeklyStats.averageHabitCompletion >= 70 && (
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 p-2 rounded-lg">
                <Target className="h-4 w-4" />
                <span className="text-xs">Great habit consistency!</span>
              </div>
            )}
            {weeklyStats.averageMood >= 4 && (
              <div className="flex items-center gap-2 text-pink-700 bg-pink-50 p-2 rounded-lg">
                <Heart className="h-4 w-4" />
                <span className="text-xs">Your mood has been great!</span>
              </div>
            )}
            {weeklyStats.taskCompletionRate < 50 && (
              <div className="flex items-center gap-2 text-orange-700 bg-orange-50 p-2 rounded-lg">
                <TrendingDown className="h-4 w-4" />
                <span className="text-xs">Consider breaking tasks into smaller steps</span>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Summary Score */}
        <div className="pt-4 border-t text-center">
          <div className="text-2xl font-bold text-primary">
            {Math.round((weeklyStats.taskCompletionRate + weeklyStats.averageHabitCompletion + (weeklyStats.averageMood / 5 * 100)) / 3)}%
          </div>
          <p className="text-sm text-muted-foreground">Overall weekly score</p>
        </div>
      </div>
    </DashboardWidget>
  );
};