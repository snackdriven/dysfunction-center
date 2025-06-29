import React from 'react';
import { Plus, CheckSquare, Target, Heart, Calendar, BookOpen, Zap } from 'lucide-react';
import { QuickActionCard } from '../ui/QuickActionCard';

interface DashboardQuickActionsProps {
  onAddTask: () => void;
  onAddHabit: () => void;
  onLogMood: () => void;
  onAddEvent: () => void;
  onWriteJournal: () => void;
  pendingTasksCount?: number;
  todayHabitsCount?: number;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
  onAddTask,
  onAddHabit,
  onLogMood,
  onAddEvent,
  onWriteJournal,
  pendingTasksCount,
  todayHabitsCount
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Zap className="h-4 w-4" />
          Fast access to common tasks
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          title="Add Task"
          description="Create a new task or reminder"
          icon={CheckSquare}
          onClick={onAddTask}
          color="red"
          badge={pendingTasksCount}
        />
        
        <QuickActionCard
          title="Track Habit"
          description="Log progress on daily habits"
          icon={Target}
          onClick={onAddHabit}
          color="green"
          badge={todayHabitsCount}
        />
        
        <QuickActionCard
          title="Log Mood"
          description="Record how you're feeling"
          icon={Heart}
          onClick={onLogMood}
          color="purple"
        />
        
        <QuickActionCard
          title="Schedule Event"
          description="Add to your calendar"
          icon={Calendar}
          onClick={onAddEvent}
          color="orange"
        />
        
        <QuickActionCard
          title="Write Journal"
          description="Capture your thoughts"
          icon={BookOpen}
          onClick={onWriteJournal}
          color="indigo"
        />
        
        <QuickActionCard
          title="Quick Entry"
          description="Add anything quickly"
          icon={Plus}
          onClick={() => {
            // This could open a modal with tabs for different entry types
            onAddTask();
          }}
          color="blue"
        />
      </div>
    </div>
  );
};