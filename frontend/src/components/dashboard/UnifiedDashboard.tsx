import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { 
  CalendarIcon, 
  Target, 
  Clock, 
  Smile,
  AlertCircle,
  Zap,
  Plus,
  ArrowRight,
  Star,
  BarChart3,
  ExternalLink,
  MapPin
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../stores/useAppStore';
import { integrationService } from '../../services/integration';
import { tasksApi } from '../../services/tasks';
import { habitsApi } from '../../services/habits';
import { moodApi } from '../../services/mood';
import { calendarApi } from '../../services/calendar';
import { TaskForm } from '../tasks/TaskForm';
import { HabitForm } from '../habits/HabitForm';
import { MoodEntryForm } from '../mood/MoodEntryForm';
import { cn } from '../../utils/cn';
import { preferencesService } from '../../services/preferences';
import { CurrentTimeDisplay } from '../ui/CurrentTimeDisplay';
import { useTimeDisplayPreferences } from '../../hooks/useTimeDisplayPreferences';
import { CountdownWidget } from './widgets/CountdownWidget';

export const UnifiedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { selectedDate, setSelectedDate } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  // Fetch unified productivity data
  const { data: productivityData, isLoading: productivityLoading } = useQuery({
    queryKey: ['productivity-data', selectedDate],
    queryFn: () => integrationService.getDailyProductivityData(selectedDate),
  });

  // Fetch insights
  const { data: insights } = useQuery({
    queryKey: ['productivity-insights'],
    queryFn: () => integrationService.getInsights(7),
  });

  // Fetch individual domain data for quick actions
  const { data: todayTasks } = useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: () => tasksApi.getTasks({ due_before: today, completed: false }),
  });

  const { data: todayHabits } = useQuery({
    queryKey: ['habits', 'today'],
    queryFn: () => habitsApi.getHabits(),
  });

  const { data: todayMoods } = useQuery({
    queryKey: ['mood', 'today'],
    queryFn: () => moodApi.getTodayMoods(),
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => calendarApi.getEvents({ 
      start: today, 
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    }),
  });

  // Fetch today's habit completions
  const { data: todayCompletions } = useQuery({
    queryKey: ['habit-completions', 'today'],
    queryFn: () => habitsApi.getTodayCompletions(),
  });

  // Mutations for task operations
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) => 
      tasksApi.updateTask({ id, completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['productivity-data'] });
    },
  });

  // Mutations for habit operations
  const logHabitCompletionMutation = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: number; completed: boolean }) => 
      habitsApi.logCompletion(habitId, { 
        date: today, 
        completed,
        value: completed ? 1 : 0 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-completions'] });
      queryClient.invalidateQueries({ queryKey: ['productivity-data'] });
    },
  });

  // Helper functions for actions
  const handleAddTask = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('handleAddTask called - opening task modal');
    setIsTaskModalOpen(true);
  };

  const handleAddHabit = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('handleAddHabit called - opening habit modal');
    setIsHabitModalOpen(true);
  };

  const handleLogMood = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    console.log('handleLogMood called - opening mood modal');
    setIsMoodModalOpen(true);
  };

  // Modal success handlers
  const handleTaskSuccess = () => {
    setIsTaskModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['productivity-data'] });
  };

  const handleHabitSuccess = () => {
    setIsHabitModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['habits'] });
    queryClient.invalidateQueries({ queryKey: ['productivity-data'] });
  };

  const handleMoodSuccess = () => {
    setIsMoodModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['mood'] });
    queryClient.invalidateQueries({ queryKey: ['productivity-data'] });
  };

  // Helper functions
  const handleTaskToggle = (taskId: number, completed: boolean) => {
    updateTaskMutation.mutate({ id: taskId, completed: !completed });
  };

  const handleHabitToggle = (habitId: number) => {
    const completion = todayCompletions?.find(c => c.habit_id === habitId);
    const isCompleted = completion?.completed || false;
    logHabitCompletionMutation.mutate({ habitId, completed: !isCompleted });
  };

  const isHabitCompleted = (habitId: number) => {
    return todayCompletions?.find(c => c.habit_id === habitId)?.completed || false;
  };

  const getHabitStreak = (habit: any) => {
    return habit.current_streak || habit.streak_count || 0;
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Fetch user preferences for avatar and display name
  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => preferencesService.getAllPreferences(),
  });
  const displayName = preferences?.preferences?.display_name || '';
  const avatarUrl = preferences?.preferences?.avatar_url || '';

  // Fetch time display preferences
  const { data: timeDisplayData } = useTimeDisplayPreferences();

  if (productivityLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading productivity dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Date Selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {displayName ? `Welcome, ${displayName}!` : 'Productivity Dashboard'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
            Your unified view across tasks, habits, mood, and calendar
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <CurrentTimeDisplay 
            format={timeDisplayData?.time_display ? {
              timeFormat: timeDisplayData.time_display.time_format,
              dateFormat: timeDisplayData.time_display.date_format,
              showSeconds: timeDisplayData.time_display.show_seconds,
              showDate: timeDisplayData.time_display.show_date,
              showTimeZone: timeDisplayData.time_display.show_timezone,
            } : undefined}
            size="md"
            className="text-muted-foreground"
          />
          <span className="text-sm sm:text-lg font-semibold">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Overall Productivity Score */}
      {productivityData && (
        <Card className={cn(
          "border-l-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30",
          (productivityData?.productivity_score || 0) >= 80 ? "border-green-500" :
          (productivityData?.productivity_score || 0) >= 60 ? "border-blue-500" :
          (productivityData?.productivity_score || 0) >= 40 ? "border-yellow-500" : "border-red-500"
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Daily Productivity Score
              </CardTitle>
              <Badge 
                variant="outline" 
                className={cn(
                  "font-semibold",
                  (productivityData?.productivity_score || 0) >= 80 ? "border-green-500 text-green-700 bg-green-50" :
                  (productivityData?.productivity_score || 0) >= 60 ? "border-blue-500 text-blue-700 bg-blue-50" :
                  (productivityData?.productivity_score || 0) >= 40 ? "border-yellow-500 text-yellow-700 bg-yellow-50" : 
                  "border-red-500 text-red-700 bg-red-50"
                )}
              >
                {productivityData?.productivity_score || 0}/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress 
                value={productivityData?.productivity_score || 0} 
                className={cn(
                  "h-3",
                  (productivityData?.productivity_score || 0) >= 80 ? "bg-green-100" :
                  (productivityData?.productivity_score || 0) >= 60 ? "bg-blue-100" :
                  (productivityData?.productivity_score || 0) >= 40 ? "bg-yellow-100" : "bg-red-100"
                )}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="font-semibold text-lg text-blue-700 dark:text-blue-300">
                    {productivityData?.tasks?.completed || 0}/{productivityData?.tasks?.total || 0}
                  </div>
                  <div className="text-blue-600 dark:text-blue-400">Tasks</div>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="font-semibold text-lg text-green-700 dark:text-green-300">
                    {productivityData?.habits?.completed || 0}/{productivityData?.habits?.total || 0}
                  </div>
                  <div className="text-green-600 dark:text-green-400">Habits</div>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="font-semibold text-lg text-purple-700 dark:text-purple-300">
                    {productivityData?.mood?.score ? productivityData.mood.score.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-purple-600 dark:text-purple-400">Mood</div>
                </div>
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="font-semibold text-lg text-orange-700 dark:text-orange-300">
                    {Math.round((productivityData?.events?.duration_minutes || 0) / 60)}h
                  </div>
                  <div className="text-orange-600 dark:text-orange-400">Scheduled</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Row: Insights and Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Insights */}
        {insights && insights.length > 0 && (
          <Card className="lg:col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-indigo-200 dark:border-indigo-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                <Star className="h-5 w-5 text-yellow-500" />
                AI Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className={cn(
                    "p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm",
                    insight.type === 'positive' ? 'bg-green-50 dark:bg-green-950/30 border-green-500' :
                    insight.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500' :
                    'bg-blue-50 dark:bg-blue-950/30 border-blue-500'
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200">{insight.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {insight.description}
                        </p>
                        {insight.action_items.length > 0 && (
                          <ul className="mt-2 text-sm space-y-1">
                            {insight.action_items.slice(0, 2).map((action, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                                <ArrowRight className="h-3 w-3 mt-0.5 text-slate-500" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Badge 
                        variant={insight.priority === 'high' ? 'destructive' : 'secondary'}
                        className="ml-2"
                      >
                        {insight.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Countdown Widget */}
        <CountdownWidget className="lg:col-span-1" />
      </div>

      {/* Overview Content */}
      <div className="space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Priority Tasks */}
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Priority Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayTasks?.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900 rounded-lg hover:bg-red-25 dark:hover:bg-red-950/20 hover:shadow-md transition-all duration-200">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id, task.completed)}
                        className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        disabled={updateTaskMutation.isPending}
                      />
                      {updateTaskMutation.isPending && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-2 w-2 animate-spin rounded-full border border-red-600 border-t-transparent" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-medium truncate text-slate-800 dark:text-slate-200",
                        task.completed && "line-through text-slate-500 dark:text-slate-400"
                      )}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                          className={cn(
                            task.priority === 'high' ? 'bg-red-100 text-red-800 border-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                            'bg-gray-100 text-gray-800 border-gray-300'
                          )}
                        >
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                            Due: {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      console.log('Add Task button clicked');
                      handleAddTask(e);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => {
                      console.log('View All Tasks button clicked');
                      navigate('/tasks');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Habits */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <Target className="h-5 w-5 text-green-600" />
                Today's Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayHabits?.slice(0, 4).map((habit) => {
                  const isCompleted = isHabitCompleted(habit.id);
                  return (
                    <div key={habit.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-green-100 dark:border-green-900 rounded-lg hover:bg-green-25 dark:hover:bg-green-950/20 hover:shadow-md transition-all duration-200">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 transition-all duration-200",
                        isCompleted 
                          ? "bg-green-500 border-green-500 shadow-md" 
                          : "bg-gray-100 dark:bg-gray-700 border-green-300 dark:border-green-600"
                      )} />
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-medium truncate text-slate-800 dark:text-slate-200",
                          isCompleted && "text-green-700 dark:text-green-300"
                        )}>
                          {habit.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-green-600 dark:text-green-400">
                          <Zap className="h-3 w-3" />
                          Streak: {getHabitStreak(habit)} days
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={isCompleted ? "primary" : "outline"}
                        onClick={() => handleHabitToggle(habit.id)}
                        disabled={logHabitCompletionMutation.isPending}
                        className={cn(
                          isCompleted 
                            ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                            : "border-green-300 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
                        )}
                      >
                        {logHabitCompletionMutation.isPending ? 
                          <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" /> :
                          (isCompleted ? 'Done' : 'Mark')
                        }
                      </Button>
                    </div>
                  );
                })}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      console.log('Add Habit button clicked');
                      handleAddHabit(e);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Habit
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => {
                      console.log('View All Habits button clicked');
                      navigate('/habits');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mood Check-in */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                <Smile className="h-5 w-5 text-purple-600" />
                Mood Check-in
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayMoods && todayMoods.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Today's Moods ({todayMoods.length})</span>
                    {todayMoods.length > 0 && (
                      <Badge variant="outline">
                        Avg: {(todayMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / todayMoods.length).toFixed(1)}/5
                      </Badge>
                    )}
                  </div>
                  
                  {/* Display latest mood details */}
                  {todayMoods.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">
                          {todayMoods[todayMoods.length - 1].energy_level || 'N/A'}/5
                        </div>
                        <div className="text-muted-foreground">Energy</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">
                          {todayMoods[todayMoods.length - 1].stress_level || 'N/A'}/5
                        </div>
                        <div className="text-muted-foreground">Stress</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">
                          {todayMoods[todayMoods.length - 1].mood_category || 'N/A'}
                        </div>
                        <div className="text-muted-foreground">Latest</div>
                      </div>
                    </div>
                  )}

                  {/* Display recent moods as a timeline */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Recent entries:</div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {todayMoods.slice(-5).map((mood, index) => (
                        <div 
                          key={mood.id} 
                          className="flex-shrink-0 p-2 border rounded-lg min-w-[80px] text-center"
                        >
                          <div className="text-lg font-semibold">
                            {mood.mood_score}/5
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(mood.created_at).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsMoodModalOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Entry
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="flex-1"
                      onClick={() => navigate('/mood')}
                    >
                      View History
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Smile className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    How are you feeling today?
                  </p>
                  <Button onClick={(e) => {
                    console.log('Log Mood button clicked');
                    handleLogMood(e);
                  }}>
                    Log Mood
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <CalendarIcon className="h-5 w-5 text-orange-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents?.slice(0, 4).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border border-orange-100 dark:border-orange-900 rounded-lg hover:bg-orange-25 dark:hover:bg-orange-950/20 hover:shadow-md transition-all duration-200">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-slate-800 dark:text-slate-200">{event.title}</h4>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        {event.is_all_day ? 'All Day' : formatTime(event.start_datetime)}
                        {event.location && (
                          <span className="text-slate-600 dark:text-slate-400">
                            {' • '}
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/calendar')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Dialogs */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSuccess={handleTaskSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isHabitModalOpen} onOpenChange={setIsHabitModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Habit</DialogTitle>
          </DialogHeader>
          <HabitForm onSuccess={handleHabitSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={isMoodModalOpen} onOpenChange={setIsMoodModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Mood Entry</DialogTitle>
          </DialogHeader>
          <MoodEntryForm onSuccess={handleMoodSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
};