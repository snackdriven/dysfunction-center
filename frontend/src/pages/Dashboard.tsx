import React from 'react';
import { DashboardGrid } from '../components/layout/DashboardGrid';
import { TodaysFocusWidget } from '../components/dashboard/widgets/TodaysFocusWidget';
import { HabitTrackerWidget } from '../components/dashboard/widgets/HabitTrackerWidget';
import { MoodCheckinWidget } from '../components/dashboard/widgets/MoodCheckinWidget';
import { WeeklyProgressWidget } from '../components/dashboard/widgets/WeeklyProgressWidget';
import { UpcomingEventsWidget } from '../components/dashboard/widgets/UpcomingEventsWidget';
import { QuickActionsWidget } from '../components/dashboard/widgets/QuickActionsWidget';
import { QuickStatsWidget } from '../components/dashboard/widgets/QuickStatsWidget';

export const Dashboard: React.FC = () => {
  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? 'Good morning' :
    currentHour < 17 ? 'Good afternoon' :
    'Good evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}! 👋
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <QuickActionsWidget />
      </div>

      {/* Stats Overview */}
      <QuickStatsWidget />

      {/* Main Dashboard Grid */}
      <DashboardGrid columns={3}>
        <TodaysFocusWidget />
        <HabitTrackerWidget />
        <MoodCheckinWidget />
      </DashboardGrid>

      {/* Secondary Widgets */}
      <DashboardGrid columns={2}>
        <WeeklyProgressWidget />
        <UpcomingEventsWidget />
      </DashboardGrid>
    </div>
  );
};