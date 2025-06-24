import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Award, 
  BarChart3, 
  Activity,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Lightbulb,
  Filter,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { habitsApi } from '../../services/habits';

export const HabitAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | 'all'>('30days');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: habits } = useQuery({
    queryKey: ['habits'],
    queryFn: habitsApi.getHabits,
  });

  // const { data: analytics } = useQuery({
  //   queryKey: ['habits', 'analytics'],
  //   queryFn: () => habitsApi.getAnalytics(),
  // });

  // Enhanced analytics calculations
  const habitStats = React.useMemo(() => {
    if (!habits || !Array.isArray(habits)) return null;

    const filteredHabits = selectedCategory === 'all' 
      ? habits 
      : habits.filter(h => h.category === selectedCategory);
    
    const activeHabits = filteredHabits.filter(h => h.active);
    const completionRates = activeHabits.map(h => h.completion_rate).filter((rate): rate is number => rate !== undefined);
    
    const avgCompletionRate = completionRates.length > 0
      ? completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length
      : 0;

    const bestHabit = activeHabits.length > 0 
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

    // Consistency Score (based on completion rate distribution)
    const consistencyScore = completionRates.length > 0 
      ? Math.round(100 - (completionRates.reduce((sum, rate) => sum + Math.abs(rate - avgCompletionRate), 0) / completionRates.length))
      : 0;

    // Performance categorization
    const excellentHabits = activeHabits.filter(h => (h.completion_rate || 0) >= 80);
    const goodHabits = activeHabits.filter(h => (h.completion_rate || 0) >= 60 && (h.completion_rate || 0) < 80);
    const strugglingHabits = activeHabits.filter(h => (h.completion_rate || 0) < 60);

    // Momentum score (recent streaks vs historical)
    const momentumScore = activeHabits.length > 0
      ? Math.round((activeHabits.filter(h => (h.current_streak || 0) >= 3).length / activeHabits.length) * 100)
      : 0;

    return {
      totalHabits: filteredHabits.length,
      activeHabits: activeHabits.length,
      avgCompletionRate,
      bestHabit,
      longestStreak,
      totalStreakDays,
      consistencyScore,
      excellentHabits: excellentHabits.length,
      goodHabits: goodHabits.length,
      strugglingHabits: strugglingHabits.length,
      momentumScore,
      filteredHabits: activeHabits,
    };
  }, [habits, selectedCategory]);

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

  // Generate insights
  const insights = React.useMemo(() => {
    if (!habitStats || !habits) return [];

    const generatedInsights = [];

    // Consistency insights
    if (habitStats.consistencyScore >= 80) {
      generatedInsights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Excellent Consistency',
        message: `Your habits show ${habitStats.consistencyScore}% consistency. Keep up the great work!`,
      });
    } else if (habitStats.consistencyScore < 60) {
      generatedInsights.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'Improve Consistency',
        message: `Focus on building more consistent routines. Your consistency score is ${habitStats.consistencyScore}%.`,
      });
    }

    // Momentum insights
    if (habitStats.momentumScore >= 70) {
      generatedInsights.push({
        type: 'success',
        icon: Zap,
        title: 'Strong Momentum',
        message: `${habitStats.momentumScore}% of your habits have active streaks. You're on fire!`,
      });
    } else if (habitStats.momentumScore < 30) {
      generatedInsights.push({
        type: 'tip',
        icon: Lightbulb,
        title: 'Build Momentum',
        message: 'Try focusing on 2-3 core habits to build stronger streaks.',
      });
    }

    // Performance distribution insights
    if (habitStats.strugglingHabits > habitStats.excellentHabits) {
      generatedInsights.push({
        type: 'warning',
        icon: TrendingDown,
        title: 'Focus Needed',
        message: `You have ${habitStats.strugglingHabits} habits that need attention. Consider simplifying or adjusting targets.`,
      });
    }

    // Category performance insights
    const categories = Array.from(new Set(habits.map(h => h.category)));
    const categoryPerformance = categories.map(cat => {
      const catHabits = habits.filter(h => h.category === cat && h.active);
      const avgRate = catHabits.reduce((sum, h) => sum + (h.completion_rate || 0), 0) / catHabits.length;
      return { category: cat, avgRate, count: catHabits.length };
    });

    const bestCategory = categoryPerformance.reduce((best, current) => 
      current.avgRate > best.avgRate ? current : best, categoryPerformance[0]);
    
    if (bestCategory && bestCategory.avgRate >= 70) {
      generatedInsights.push({
        type: 'success',
        icon: Target,
        title: 'Category Champion',
        message: `Your ${bestCategory.category} habits are performing exceptionally well at ${bestCategory.avgRate.toFixed(0)}%.`,
      });
    }

    return generatedInsights.slice(0, 4); // Limit to 4 insights
  }, [habitStats, habits]);

  const categories = React.useMemo(() => {
    if (!habits) return ['all'];
    return ['all', ...Array.from(new Set(habits.map(h => h.category)))];
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
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Consistency Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{habitStats.consistencyScore}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Habit regularity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Momentum Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">{habitStats.momentumScore}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active streaks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{habitStats.avgCompletionRate.toFixed(0)}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{habitStats.excellentHabits}</div>
              <div className="text-sm text-muted-foreground">Excellent (80%+)</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${habitStats.activeHabits > 0 ? (habitStats.excellentHabits / habitStats.activeHabits) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{habitStats.goodHabits}</div>
              <div className="text-sm text-muted-foreground">Good (60-79%)</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full transition-all"
                  style={{ width: `${habitStats.activeHabits > 0 ? (habitStats.goodHabits / habitStats.activeHabits) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{habitStats.strugglingHabits}</div>
              <div className="text-sm text-muted-foreground">Needs Work (<60%)</div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${habitStats.activeHabits > 0 ? (habitStats.strugglingHabits / habitStats.activeHabits) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => {
                const IconComponent = insight.icon;
                const colorClasses = {
                  success: 'text-green-600 bg-green-50 border-green-200',
                  warning: 'text-orange-600 bg-orange-50 border-orange-200',
                  tip: 'text-blue-600 bg-blue-50 border-blue-200',
                };
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${colorClasses[insight.type as keyof typeof colorClasses]}`}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="h-5 w-5 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-xs mt-1 opacity-90">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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