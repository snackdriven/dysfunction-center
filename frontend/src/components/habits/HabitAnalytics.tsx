import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { TrendingUp, Target, Calendar, Award, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '../../services/habits';

export const HabitAnalytics: React.FC = () => {
  const { data: habits } = useQuery({
    queryKey: ['habits'],
    queryFn: habitsApi.getHabits,
  });

  // const { data: analytics } = useQuery({
  //   queryKey: ['habits', 'analytics'],
  //   queryFn: () => habitsApi.getAnalytics(),
  // });

  const habitStats = React.useMemo(() => {    if (!habits || !Array.isArray(habits)) return null;

    const activeHabits = habits.filter(h => h.active);    const completionRates = activeHabits.map(h => h.completion_rate).filter((rate): rate is number => rate !== undefined);
    const avgCompletionRate = completionRates.length > 0
      ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
      : 0;const bestHabit = activeHabits.length > 0 
      ? activeHabits.reduce((best, current) =>
          (current.completion_rate || 0) > (best?.completion_rate || 0) ? current : best,
          activeHabits[0]
        )
      : null;

    const longestStreak = activeHabits.length > 0
      ? activeHabits.reduce((longest, current) =>
          (current.current_streak || 0) > (longest?.current_streak || 0) ? current : longest,
          activeHabits[0]
        )
      : null;

    const totalStreakDays = activeHabits.reduce((sum, habit) => sum + (habit.current_streak || 0), 0);

    return {
      totalHabits: habits.length,
      activeHabits: activeHabits.length,
      avgCompletionRate,
      bestHabit,
      longestStreak,
      totalStreakDays,
    };
  }, [habits]);

  const categoryStats = React.useMemo(() => {
    if (!habits) return [];

    const categories = habits.reduce((acc, habit) => {
      const category = habit.category;
      if (!acc[category]) {
        acc[category] = { count: 0, totalCompletion: 0, totalStreak: 0 };
      }      acc[category].count++;
      acc[category].totalCompletion += habit.completion_rate || 0;
      acc[category].totalStreak += habit.current_streak || 0;
      return acc;
    }, {} as Record<string, { count: number; totalCompletion: number; totalStreak: number }>);

    return Object.entries(categories).map(([category, stats]) => ({
      category,
      count: stats.count,
      avgCompletion: stats.totalCompletion / stats.count,
      totalStreak: stats.totalStreak,
    })).sort((a, b) => b.avgCompletion - a.avgCompletion);
  }, [habits]);

  if (!habitStats) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No habit data available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">{habitStats.totalHabits}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {habitStats.activeHabits} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{habitStats.avgCompletionRate.toFixed(0)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all habits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Longest Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">{habitStats.longestStreak?.streak_count || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {habitStats.longestStreak?.name || 'No streaks yet'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Streak Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{habitStats.totalStreakDays}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cumulative days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best Performing Habit */}
      {habitStats.bestHabit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Best Performing Habit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{habitStats.bestHabit.name}</h4>
                <p className="text-sm text-muted-foreground">{habitStats.bestHabit.description}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{habitStats.bestHabit.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {habitStats.bestHabit.streak_count} day streak
                  </span>
                </div>
              </div>                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {(habitStats.bestHabit.completion_rate || 0).toFixed(0)}%
                  </div>
                  <p className="text-sm text-muted-foreground">completion rate</p>
                </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{stat.category}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {stat.count} habit{stat.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {stat.avgCompletion.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">avg completion</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {stat.totalStreak}
                    </div>
                    <div className="text-xs text-muted-foreground">total streak</div>
                  </div>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${stat.avgCompletion}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Habit List with Performance */}
      <Card>
        <CardHeader>
          <CardTitle>All Habits Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {habits?.map((habit) => (
              <div key={habit.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${habit.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <h4 className="font-medium">{habit.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{habit.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {habit.target_frequency}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{habit.streak_count}</div>
                    <div className="text-xs text-muted-foreground">streak</div>
                  </div>                  <div className="text-center">
                    <div className="text-sm font-medium">{(habit.completion_rate || 0).toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">rate</div>
                  </div>
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (habit.completion_rate || 0) >= 80 ? 'bg-green-500' :
                        (habit.completion_rate || 0) >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${habit.completion_rate || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};