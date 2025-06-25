import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  CalendarIcon, 
  Target, 
  CheckCircle, 
  Clock, 
  Smile,
  AlertCircle,
  Zap,
  Plus,
  ArrowRight,
  Star,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '../../stores/useAppStore';
import { integrationService } from '../../services/integration';
import { tasksApi } from '../../services/tasks';
import { habitsApi } from '../../services/habits';
import { moodApi } from '../../services/mood';
import { calendarApi } from '../../services/calendar';
import { DailyProductivityData, ProductivityInsight } from '../../../../shared/types';
import { cn } from '../../utils/cn';

export const UnifiedDashboard: React.FC = () => {
  const { selectedDate, setSelectedDate } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const today = new Date().toISOString().split('T')[0];

  // Fetch unified productivity data
  const { data: productivityData, isLoading: productivityLoading } = useQuery({
    queryKey: ['productivity-data', selectedDate],
    queryFn: () => integrationService.getDailyProductivityData(selectedDate),
  });

  // Fetch insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
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

  const { data: todayMood } = useQuery({
    queryKey: ['mood', 'today'],
    queryFn: () => moodApi.getTodayMood(),
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => calendarApi.getEvents({ 
      start: today, 
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
    }),
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Productivity Dashboard</h1>
          <p className="text-muted-foreground">
            Your unified view across tasks, habits, mood, and calendar
          </p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          />
          {selectedDate !== today && (
            <Button variant="outline" onClick={() => setSelectedDate(today)}>
              Today
            </Button>
          )}
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

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Today's Focus</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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
                      <input
                        type="checkbox"
                        checked={task.completed}
                        className="h-4 w-4 rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{task.title}</h4>
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
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
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
                    const isCompleted = false; // Placeholder - would check today's completion
                    return (
                      <div key={habit.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className={cn(
                          "w-4 h-4 rounded-full",
                          isCompleted ? "bg-green-500" : "bg-gray-300"
                        )} />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{habit.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <Zap className="h-3 w-3" />
                            Streak: 0 days
                          </div>
                        </div>
                        <Button size="sm" variant={isCompleted ? "primary" : "outline"}>
                          {isCompleted ? 'Done' : 'Mark'}
                        </Button>
                      </div>
                    );
                  })}
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Habit
                  </Button>
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
                {todayMood ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Today's Mood</span>
                      <Badge variant="outline">{todayMood.mood_score}/5</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{todayMood.energy_level}/5</div>
                        <div className="text-muted-foreground">Energy</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{todayMood.stress_level}/5</div>
                        <div className="text-muted-foreground">Stress</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{todayMood.mood_category || 'N/A'}</div>
                        <div className="text-muted-foreground">Primary</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      Update Mood
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Smile className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      How are you feeling today?
                    </p>
                    <Button>Log Mood</Button>
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
                  <Button variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed task management interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="habits">
          <Card>
            <CardHeader>
              <CardTitle>Habit Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed habit tracking interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed schedule interface will be implemented here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};