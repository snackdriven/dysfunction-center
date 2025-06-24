import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Skeleton } from '../../ui/skeleton';
import { 
  CheckCircle2, 
  Calendar,
  Heart,
  TrendingUp,
  Target,
  Award,
  Activity,
  BookOpen
} from 'lucide-react';
import { tasksApi } from '../../../services/tasks';
import { habitsApi } from '../../../services/habits';
import { moodApi } from '../../../services/mood';
import { calendarApi } from '../../../services/calendar';
import { journalApi } from '../../../services/journal';

interface QuickStats {
  tasksCompleted: number;
  totalTasks: number;
  habitsCompleted: number;
  totalHabits: number;
  moodAverage: number;
  streakCount: number;
  upcomingEvents: number;
  journalEntries: number;
}

interface StatItem {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

export const QuickStatsWidget: React.FC = () => {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

      // Fetch all data in parallel
      const [tasksData, habitsData, moodData, eventsData, journalData] = await Promise.all([
        tasksApi.getTasks({}).catch(() => []),
        habitsApi.getHabits().catch(() => []),
        moodApi.getMoodEntries({ 
          start_date: startOfDay.toISOString(), 
          end_date: endOfDay.toISOString() 
        }).catch(() => []),
        calendarApi.getEvents({ 
          start: startOfDay.toISOString(), 
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
        }).catch(() => []),
        journalApi.getJournalEntries({ limit: 100 }).catch(() => [])
      ]);

      // Calculate today's tasks
      const todayTasks = tasksData.filter((task: any) => {
        const taskDate = new Date(task.created_at);
        return taskDate >= startOfDay && taskDate <= endOfDay;
      });
      const completedTasks = todayTasks.filter((task: any) => task.status === 'completed');

      // Calculate today's habits
      const todayHabits = habitsData.length;
      const completedHabits = habitsData.filter((habit: any) => {
        // Check if habit was completed today (this would need to be tracked in habit completions)
        return habit.current_streak > 0; // Simplified logic
      }).length;

      // Calculate mood average
      const moodAverage = Array.isArray(moodData) && moodData.length > 0 
        ? (moodData as any[]).reduce((sum: number, entry: any) => sum + (entry.mood_score || 0), 0) / moodData.length 
        : 0;

      // Calculate streak (simplified - would need more complex logic)
      const streakCount = Array.isArray(habitsData) 
        ? Math.max(...(habitsData as any[]).map((h: any) => h.current_streak || 0), 0)
        : 0;

      // Count upcoming events
      const upcomingEvents = eventsData.length;

      // Count journal entries this week
      const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentEntries = Array.isArray(journalData) 
        ? journalData.filter((entry: any) => new Date(entry.created_at) >= weekStart).length
        : 0;

      setStats({
        tasksCompleted: completedTasks.length,
        totalTasks: todayTasks.length,
        habitsCompleted: completedHabits,
        totalHabits: todayHabits,
        moodAverage,
        streakCount,
        upcomingEvents,
        journalEntries: recentEntries
      });
    } catch (err) {
      setError('Failed to load stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    );
  }

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100) 
    : 0;

  const habitCompletionRate = stats.totalHabits > 0 
    ? Math.round((stats.habitsCompleted / stats.totalHabits) * 100) 
    : 0;

  const statItems: StatItem[] = [
    {
      label: 'Tasks Done',
      value: `${stats.tasksCompleted}/${stats.totalTasks}`,
      change: `${completionRate}%`,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: completionRate >= 80 ? 'text-green-600' : completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      label: 'Habits',
      value: `${stats.habitsCompleted}/${stats.totalHabits}`,
      change: `${habitCompletionRate}%`,
      icon: <Target className="h-4 w-4" />,
      color: habitCompletionRate >= 80 ? 'text-green-600' : habitCompletionRate >= 50 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      label: 'Mood',
      value: stats.moodAverage.toFixed(1),
      change: stats.moodAverage >= 4 ? 'Great' : stats.moodAverage >= 3 ? 'Good' : 'Needs attention',
      icon: <Heart className="h-4 w-4" />,
      color: stats.moodAverage >= 4 ? 'text-green-600' : stats.moodAverage >= 3 ? 'text-yellow-600' : 'text-red-600'
    },
    {
      label: 'Best Streak',
      value: stats.streakCount.toString(),
      change: 'days',
      icon: <Award className="h-4 w-4" />,
      color: stats.streakCount >= 7 ? 'text-green-600' : stats.streakCount >= 3 ? 'text-yellow-600' : 'text-gray-600'
    },
    {
      label: 'Events',
      value: stats.upcomingEvents.toString(),
      change: 'upcoming',
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      label: 'Journal',
      value: stats.journalEntries.toString(),
      change: 'this week',
      icon: <BookOpen className="h-4 w-4" />,
      color: 'text-purple-600'
    },
    {
      label: 'Activity',
      value: (stats.tasksCompleted + stats.habitsCompleted + stats.journalEntries).toString(),
      change: 'actions today',
      icon: <Activity className="h-4 w-4" />,
      color: 'text-indigo-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Quick Stats
          <Badge variant="secondary" className="ml-auto">
            Today
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className={item.color}>{item.icon}</span>
                {item.label}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold">{item.value}</span>
                {item.change && (
                  <span className="text-xs text-muted-foreground">
                    {item.change}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
