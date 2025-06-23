import React from 'react';
import { HabitCard } from './HabitCard';
import { Habit, HabitCompletion } from '../../services/habits';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorState } from '../common/ErrorState';

interface HabitGridProps {
  habits: Habit[];
  completions: HabitCompletion[];
  isLoading: boolean;
  error?: any;
  onRetry?: () => void;
}

export const HabitGrid: React.FC<HabitGridProps> = ({ habits, completions, isLoading, error, onRetry }) => {
  if (isLoading) {
    return <LoadingSpinner size="lg" text="Loading habits..." className="py-12" />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={onRetry}
        title="Failed to load habits"
        description="Unable to fetch your habits. Please check your connection and try again."
      />
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold mb-2">No habits found</h3>
        <p className="text-muted-foreground mb-4">
          Create your first habit to start building positive routines!
        </p>
      </div>
    );
  }

  const activeHabits = habits.filter(habit => habit.is_active);
  const inactiveHabits = habits.filter(habit => !habit.is_active);

  return (
    <div className="space-y-8">
      {/* Active Habits */}
      {activeHabits.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">
            Active Habits ({activeHabits.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeHabits.map((habit) => {
              const todayCompletion = completions.find(c => c.habit_id === habit.id);
              return (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  completion={todayCompletion} 
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Inactive Habits */}
      {inactiveHabits.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-muted-foreground">
            Inactive Habits ({inactiveHabits.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inactiveHabits.map((habit) => {
              const todayCompletion = completions.find(c => c.habit_id === habit.id);
              return (
                <HabitCard 
                  key={habit.id} 
                  habit={habit} 
                  completion={todayCompletion} 
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};