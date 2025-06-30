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
  ExternalLink
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '../../stores/appStore';
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
    queryFn: () => integrationService.getDailyProductivityData(selectedDate.toISOString().split('T')[0]),
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
    <div className="space-y-6">
      {/* Header with Date Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {displayName ? `Welcome, ${displayName}!` : 'Productivity Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            Your unified view across tasks, habits, mood, and calendar
          </p>
        </div>
        <div className="flex items-center gap-4">
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
          <span className="text-lg font-semibold">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Overall Productivity Score */}
      {productivityData && (
        <Card className={cn(
          "border-l-4",
          getScoreBgColor(productivityData.productivity_score)
        )} style={{ borderLeftColor: getScoreColor(productivityData.productivity_score).replace('text-', '') }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Productivity Score
              </CardTitle>
              <Badge variant="outline" className={getScoreColor(productivityData.productivity_score)}>
                {productivityData.productivity_score}/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={productivityData.productivity_score} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {productivityData.tasks.completed}/{productivityData.tasks.total}
                  </div>
                  <div className="text-muted-foreground">Tasks</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {productivityData.habits.completed}/{productivityData.habits.total}
                  </div>
                  <div className="text-muted-foreground">Habits</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {productivityData.mood.score ? productivityData.mood.score.toFixed(1) : 'N/A'}
                  </div>
                  <div className="text-muted-foreground">Mood</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg">
                    {Math.round(productivityData.events.duration_minutes / 60)}h
                  </div>
                  <div className="text-muted-foreground">Scheduled</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              AI Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className={cn(
                  "p-3 rounded-lg border-l-4",
                  insight.type === 'positive' ? 'bg-green-50 border-green-500' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                )}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {insight.description}
                      </p>
                      {insight.action_items.length > 0 && (
                        <ul className="mt-2 text-sm space-y-1">
                          {insight.action_items.slice(0, 2).map((action, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <ArrowRight className="h-3 w-3 mt-0.5 text-muted-foreground" />
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Badge variant={insight.priority === 'high' ? 'destructive' : 'secondary'}>
                      {insight.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Content */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Priority Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Priority Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayTasks?.slice(0, 4).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id, task.completed)}
                        className="h-4 w-4 rounded border cursor-pointer"
                        disabled={updateTaskMutation.isPending}
                      />
                      {updateTaskMutation.isPending && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-2 w-2 animate-spin rounded-full border border-primary border-t-transparent" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-medium truncate",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <span className="text-xs text-muted-foreground">
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Today's Habits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todayHabits?.slice(0, 4).map((habit) => {
                  const isCompleted = isHabitCompleted(habit.id);
                  return (
                    <div key={habit.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className={cn(
                        "w-4 h-4 rounded-full",
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      )} />
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          "font-medium truncate",
                          isCompleted && "text-green-700"
                        )}>
                          {habit.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Zap className="h-3 w-3" />
                          Streak: {getHabitStreak(habit)} days
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant={isCompleted ? "primary" : "outline"}
                        onClick={() => handleHabitToggle(habit.id)}
                        disabled={logHabitCompletionMutation.isPending}
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5" />
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
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents?.slice(0, 4).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{event.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        {event.is_all_day ? 'All Day' : formatTime(event.start_datetime)}
                        {event.location && ` • ${event.location}`}
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