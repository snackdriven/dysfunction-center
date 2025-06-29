import React from 'react';
import { 
  CheckSquare, 
  Target, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Activity,
  Flame,
  Clock
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';

interface DashboardStatsProps {
  stats: {
    tasksCompleted: number;
    totalTasks: number;
    habitsCompleted: number;
    totalHabits: number;
    currentStreak: number;
    moodAverage: number;
    upcomingEvents: number;
    productivityScore: number;
  };
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const taskCompletionRate = stats.totalTasks > 0 
    ? Math.round((stats.tasksCompleted / stats.totalTasks) * 100)
    : 0;
    
  const habitCompletionRate = stats.totalHabits > 0 
    ? Math.round((stats.habitsCompleted / stats.totalHabits) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Today's Overview
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Activity className="h-4 w-4" />
          Live updates
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tasks Completed"
          value={`${stats.tasksCompleted}/${stats.totalTasks}`}
          description={`${taskCompletionRate}% completion rate`}
          icon={CheckSquare}
          color="red"
          trend={{
            value: taskCompletionRate - 75, // Mock comparison to average
            type: taskCompletionRate > 75 ? 'increase' : 'decrease',
            period: 'vs last week'
          }}
        />
        
        <StatCard
          title="Habits Tracked"
          value={`${stats.habitsCompleted}/${stats.totalHabits}`}
          description={`${habitCompletionRate}% completion rate`}
          icon={Target}
          color="green"
          trend={{
            value: habitCompletionRate - 80,
            type: habitCompletionRate > 80 ? 'increase' : 'decrease',
            period: 'vs last week'
          }}
        />
        
        <StatCard
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          description="Longest habit streak"
          icon={Flame}
          color="orange"
          trend={{
            value: stats.currentStreak > 7 ? 15 : -5,
            type: stats.currentStreak > 7 ? 'increase' : 'decrease',
            period: 'this month'
          }}
        />
        
        <StatCard
          title="Mood Score"
          value={`${stats.moodAverage.toFixed(1)}/5`}
          description="Average mood today"
          icon={Heart}
          color="purple"
          trend={{
            value: (stats.moodAverage - 3.5) * 10,
            type: stats.moodAverage > 3.5 ? 'increase' : stats.moodAverage < 3.5 ? 'decrease' : 'neutral',
            period: 'vs yesterday'
          }}
        />
      </div>
      
      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Productivity Score"
          value={`${stats.productivityScore}%`}
          description="Overall daily performance"
          icon={TrendingUp}
          color="blue"
          size="sm"
        />
        
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents}
          description="Events in next 7 days"
          icon={Calendar}
          color="orange"
          size="sm"
        />
        
        <StatCard
          title="Focus Time"
          value="2.5 hrs"
          description="Deep work logged today"
          icon={Clock}
          color="indigo"
          size="sm"
        />
      </div>
    </div>
  );
};