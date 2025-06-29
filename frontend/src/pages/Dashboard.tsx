import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UnifiedDashboard } from '../components/dashboard/UnifiedDashboard';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';
import { CountdownWidget } from '../components/dashboard/widgets/CountdownWidget';
import { DashboardErrorBoundary } from '../components/common/DashboardErrorBoundary';
import { useQuery } from '@tanstack/react-query';
import { integrationService } from '../services/integration';
import { tasksApi } from '../services/tasks';
import { habitsApi } from '../services/habits';
import { moodApi } from '../services/mood';
import { calendarApi } from '../services/calendar';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  // Fetch dashboard data
  const { data: productivityData, isLoading: isProductivityLoading, error: productivityError } = useQuery({
    queryKey: ['productivity-data', today],
    queryFn: () => integrationService.getDailyProductivityData(today),
    retry: 1, // Only retry once
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: todayTasks, isLoading: isTasksLoading } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => tasksApi.getTasks({ completed: false }),
  });

  const { data: todayHabits, isLoading: isHabitsLoading } = useQuery({
    queryKey: ['habits', 'today'],
    queryFn: () => habitsApi.getHabits(),
  });

  const { data: todayMoods, isLoading: isMoodsLoading } = useQuery({
    queryKey: ['mood', 'today'],
    queryFn: () => moodApi.getTodayMoods(),
  });

  const { data: upcomingEvents, isLoading: isEventsLoading } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => calendarApi.getEvents({ 
      start: today, 
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    }),
  });

  // Calculate stats with proper null checks and fallbacks
  const stats = {
    tasksCompleted: (productivityData && 'tasks' in productivityData && productivityData.tasks?.completed) || 
                   (todayTasks ? todayTasks.filter(task => task.completed).length : 0),
    totalTasks: (productivityData && 'tasks' in productivityData && productivityData.tasks?.total) || (todayTasks?.length || 0),
    habitsCompleted: (productivityData && 'habits' in productivityData && productivityData.habits?.completed) || 0,
    totalHabits: (productivityData && 'habits' in productivityData && productivityData.habits?.total) || (todayHabits?.length || 0),
    currentStreak: 5, // This would come from habit analytics
    moodAverage: todayMoods?.length ? 
      todayMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / todayMoods.length : 3,
    upcomingEvents: upcomingEvents?.length || 0,
    productivityScore: (productivityData && 'productivity_score' in productivityData && productivityData.productivity_score) || 
                      (productivityError ? 0 : 75) // Default score if no data
  };

  // Quick action handlers
  const handleAddTask = () => navigate('/tasks');
  const handleAddHabit = () => navigate('/habits');
  const handleLogMood = () => navigate('/mood');
  const handleAddEvent = () => navigate('/calendar');
  const handleWriteJournal = () => navigate('/journal');

  // Show loading state only if ALL essential data is loading (first render)
  const isInitialLoading = isTasksLoading && isHabitsLoading && isMoodsLoading;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-96 animate-fade-in">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome header */}
        <div className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your personal productivity center. Track habits, manage tasks, and maintain balance.
          </p>
        </div>

        {/* Stats overview */}
        <DashboardStats stats={stats} />

        {/* Quick actions */}
        <DashboardQuickActions
          onAddTask={handleAddTask}
          onAddHabit={handleAddHabit}
          onLogMood={handleLogMood}
          onAddEvent={handleAddEvent}
          onWriteJournal={handleWriteJournal}
          pendingTasksCount={todayTasks?.length}
          todayHabitsCount={todayHabits?.length}
        />

        {/* Countdown widget and unified dashboard in a grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Event Countdown
            </h2>
            <CountdownWidget />
          </div>
          
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Today's Activities
            </h2>
            <UnifiedDashboard />
          </div>
        </div>
      </div>
    </DashboardErrorBoundary>
  );
};