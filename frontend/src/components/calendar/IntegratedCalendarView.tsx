import React, { useState, useEffect } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Dialog, DialogContent } from '../ui/Dialog';
import { 
  CalendarIcon, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Target, 
  Smile,
  Plus,
  Zap,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { CalendarEvent } from '../../services/calendar';
import { Task } from '../../services/tasks';
import { Habit } from '../../services/habits';
import { MoodEntry } from '../../services/mood';
import { integrationService } from '../../services/integration';
import { useAppStore } from '../../stores/useAppStore';
import { CalendarDataOverlay } from '../../../../shared/types';
import { cn } from '../../utils/cn';

interface IntegratedCalendarViewProps {
  currentDate: Date;
  viewType: 'month' | 'week' | 'day';
  events: CalendarEvent[];
  tasks: Task[];
  habits: Habit[];
  moodEntries: MoodEntry[];
  isLoading: boolean;
}

type Priority = 'low' | 'medium' | 'high';

interface CalendarDayData {
  date: Date;
  dateString: string; // ISO string format for CalendarDataOverlay compatibility
  task_deadlines: Array<{
    id: number;
    title: string;
    priority: Priority;
    completed: boolean;
  }>;
  habit_completions: Array<{
    id: number;
    name: string;
    completed: boolean;
    streak_count: number;
  }>;
  mood_score?: number;
  mood_color?: string;
  events: Array<{
    id: number;
    title: string;
    start_time: string;
    end_time?: string;
  }>;
  isCurrentMonth: boolean;
  isToday: boolean;
  productivityScore?: number;
}

export const IntegratedCalendarView: React.FC<IntegratedCalendarViewProps> = ({
  currentDate,
  viewType,
  events,
  tasks,
  habits,
  moodEntries,
  isLoading
}) => {
  const [selectedDay, setSelectedDay] = useState<CalendarDayData | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const { selectedDate, setSelectedDate } = useAppStore();

  // Generate calendar days with integrated data
  const calendarDays = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    const today = new Date();

    const days: CalendarDayData[] = [];

    // Add previous month days
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push(createDayData(date, false, false));
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      days.push(createDayData(date, true, isToday));
    }

    // Add next month days to complete grid
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const date = new Date(year, month + 1, i);
      days.push(createDayData(date, false, false));
    }

    return days;
  }, [currentDate, events, tasks, habits, moodEntries]);

  function createDayData(date: Date, isCurrentMonth: boolean, isToday: boolean): CalendarDayData {
    const dateStr = date.toISOString().split('T')[0];
    
    // Filter data for this day
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    const dayTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });

    const dayHabits = habits.filter(habit => {
      // For now, we'll assume all habits are potentially relevant for the day
      // In a real implementation, this would check habit completion data
      return true;
    });

    const dayMood = moodEntries.find(mood => {
      const moodDate = new Date(mood.entry_date).toISOString().split('T')[0];
      return moodDate === dateStr;
    });

    // Calculate productivity score
    const totalTasks = dayTasks.length;
    const completedTasks = dayTasks.filter(t => t.completed).length;
    const totalHabits = habits.length; // All active habits for the day
    const completedHabits = 0; // Placeholder - would be calculated from completion data

    const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 40 : 20;
    const habitScore = totalHabits > 0 ? (completedHabits / totalHabits) * 30 : 15;
    const moodScore = dayMood ? (dayMood.mood_score / 5) * 20 : 10;
    const eventScore = dayEvents.length > 0 ? 10 : 5;

    const productivityScore = Math.round(taskScore + habitScore + moodScore + eventScore);

    return {
      date: date,
      dateString: dateStr,
      task_deadlines: dayTasks.map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        completed: task.completed
      })),
      habit_completions: dayHabits.slice(0, 3).map(habit => ({
        id: habit.id,
        name: habit.name,
        completed: false, // Placeholder - would be calculated from completion data
        streak_count: 0 // Placeholder - would be from habit data
      })),
      mood_score: dayMood?.mood_score,
      mood_color: getMoodColor(dayMood?.mood_score),
      events: dayEvents.map(event => ({
        id: event.id,
        title: event.title,
        start_time: event.start_datetime,
        end_time: event.end_datetime
      })),
      isCurrentMonth,
      isToday,
      productivityScore
    };
  }

  function getMoodColor(moodScore?: number): string | undefined {
    if (!moodScore) return undefined;
    if (moodScore >= 4.5) return '#10b981'; // green
    if (moodScore >= 3.5) return '#f59e0b'; // yellow
    if (moodScore >= 2.5) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  const handleDayClick = (dayData: CalendarDayData) => {
    setSelectedDay(dayData);
    setSelectedDate(dayData.dateString);
  };

  const handleTaskDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDayDrop = async (dayData: CalendarDayData, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTask) return;

    try {
      // Schedule task on calendar
      const startTime = `${dayData.date}T09:00:00`;
      await integrationService.scheduleTaskOnCalendar(
        draggedTask.id, 
        startTime, 
        60 // Default duration in minutes
      );
      
      // Update local state or refetch data
      setDraggedTask(null);
    } catch (error) {
      console.error('Failed to schedule task:', error);
    }
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading integrated calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card rounded-lg border">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center font-medium text-muted-foreground border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                'min-h-[140px] p-2 border-r border-b last:border-r-0 cursor-pointer relative',
                !day.isCurrentMonth && 'bg-muted/20',
                day.isToday && day.isCurrentMonth && 'bg-primary/5',
                day.mood_color && 'border-l-4',
                'hover:bg-muted/10 transition-colors'
              )}
              style={day.mood_color ? { borderLeftColor: day.mood_color } : {}}
              onClick={() => handleDayClick(day)}
              onDrop={(e) => handleDayDrop(day, e)}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* Day Number and Productivity Score */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  'text-sm font-medium',
                  !day.isCurrentMonth && 'text-muted-foreground',
                  day.isToday && day.isCurrentMonth && 'text-primary font-bold'
                )}>
                  {day.date.getDate()}
                </span>
                
                {/* Productivity Score Indicator */}
                {day.productivityScore !== undefined && day.isCurrentMonth && (
                  <div 
                    className={cn(
                      "w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-bold",
                      day.productivityScore >= 80 ? "bg-green-500" :
                      day.productivityScore >= 60 ? "bg-blue-500" :
                      day.productivityScore >= 40 ? "bg-yellow-500" :
                      "bg-red-500"
                    )}
                    title={`Productivity Score: ${day.productivityScore}%`}
                  >
                    {Math.round(day.productivityScore / 10)}
                  </div>
                )}
              </div>

              {/* Mood Indicator */}
              {day.mood_score && (
                <div className="flex items-center gap-1 mb-1">
                  <Smile 
                    className="h-3 w-3" 
                    style={{ color: day.mood_color }} 
                  />
                  <span className="text-xs font-medium">{day.mood_score.toFixed(1)}</span>
                </div>
              )}

              {/* Events */}
              <div className="space-y-1">
                {day.events.slice(0, 1).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                  >
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-2 w-2" />
                      <span>{event.title}</span>
                    </div>
                  </div>
                ))}

                {/* Tasks */}
                {day.task_deadlines.slice(0, 1).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "text-xs p-1 rounded truncate",
                      task.completed 
                        ? "bg-green-100 text-green-800" 
                        : task.priority === 'high'
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
                    )}
                    draggable
                    onDragStart={() => handleTaskDragStart(tasks.find(t => t.id === task.id)!)}
                  >
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-2 w-2" />
                      <span>{task.title}</span>
                    </div>
                  </div>
                ))}

                {/* Habits Indicator */}
                {day.habit_completions.length > 0 && (
                  <div className="flex items-center gap-1">
                    {day.habit_completions.slice(0, 3).map((habit, idx) => (
                      <div
                        key={habit.id}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          habit.completed ? "bg-green-500" : "bg-gray-300"
                        )}
                        title={habit.name}
                      />
                    ))}
                    {day.habit_completions.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{day.habit_completions.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Show count if more items */}
                {(day.events.length + day.task_deadlines.length) > 2 && (
                  <div className="text-[10px] text-muted-foreground text-center">
                    +{(day.events.length + day.task_deadlines.length) - 2} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
          <DialogContent className="max-w-2xl">
            <div className="space-y-6">
              {/* Day Header */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {selectedDay.date.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  <div className="flex items-center gap-2">
                    {selectedDay.productivityScore !== undefined && (
                      <Badge variant={
                        selectedDay.productivityScore >= 80 ? "default" :
                        selectedDay.productivityScore >= 60 ? "secondary" :
                        "outline"
                      }>
                        {selectedDay.productivityScore}% Productive
                      </Badge>
                    )}
                    {selectedDay.mood_score && (
                      <Badge variant="outline" style={{ borderColor: selectedDay.mood_color }}>
                        <Smile className="h-3 w-3 mr-1" style={{ color: selectedDay.mood_color }} />
                        Mood: {selectedDay.mood_score.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Events Section */}
              {selectedDay.events.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Events ({selectedDay.events.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDay.events.map((event) => (
                      <Card key={event.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium">{event.title}</h5>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {formatTime(event.start_time)} - {formatTime(event.end_time || '')}
                            </div>
                          </div>
                          <Badge variant="secondary">Event</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Section */}
              {selectedDay.task_deadlines.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Tasks ({selectedDay.task_deadlines.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDay.task_deadlines.map((task) => (
                      <Card key={task.id} className="p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className={cn(
                              "font-medium",
                              task.completed && "line-through text-muted-foreground"
                            )}>
                              {task.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={
                                task.priority === 'high' ? 'destructive' :
                                task.priority === 'medium' ? 'secondary' :
                                'outline'
                              }>
                                {task.priority}
                              </Badge>
                              {task.completed && <Badge variant="default">Completed</Badge>}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Schedule
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Habits Section */}
              {selectedDay.habit_completions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Habits ({selectedDay.habit_completions.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDay.habit_completions.map((habit) => (
                      <Card key={habit.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-4 h-4 rounded-full",
                              habit.completed ? "bg-green-500" : "bg-gray-300"
                            )} />
                            <div>
                              <h5 className="font-medium">{habit.name}</h5>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Zap className="h-3 w-3" />
                                Streak: {habit.streak_count} days
                              </div>
                            </div>
                          </div>                          <Button 
                            size="sm" 
                            variant={habit.completed ? "primary" : "outline"}
                          >
                            {habit.completed ? 'Completed' : 'Mark Done'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {selectedDay.events.length === 0 && 
               selectedDay.task_deadlines.length === 0 && 
               selectedDay.habit_completions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-6xl mb-4">📅</div>
                  <h4 className="text-lg font-medium mb-2">Nothing scheduled</h4>
                  <p className="text-sm mb-4">
                    This day has no events, tasks, or habit tracking data.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Event
                    </Button>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Task
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};