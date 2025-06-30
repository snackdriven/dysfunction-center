import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { CalendarMonthView } from '../components/calendar/CalendarMonthView';
import { CalendarWeekView } from '../components/calendar/CalendarWeekView';
import { CalendarDayView } from '../components/calendar/CalendarDayView';
import { Calendar3DayView } from '../components/calendar/Calendar3DayView';
import { Calendar2WeekView } from '../components/calendar/Calendar2WeekView';
import { CalendarAgendaView } from '../components/calendar/CalendarAgendaView';
import { CalendarViewSelector, CalendarViewType } from '../components/calendar/CalendarViewSelector';
import { EventForm } from '../components/calendar/EventForm';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Card, CardContent } from '../components/ui/Card';
import { Plus, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { calendarApi } from '../services/calendar';
import { tasksApi } from '../services/tasks';
import { habitsApi } from '../services/habits';
import { moodApi } from '../services/mood';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

export const Calendar: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<CalendarViewType>('week');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const { data: events, isLoading } = useQuery({
    queryKey: ['calendar', 'events', currentYear, currentMonth],
    queryFn: () => calendarApi.getMonthEvents(currentYear, currentMonth),
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', 'calendar'],
    queryFn: () => tasksApi.getTasks({ has_due_date: true }),
  });

  const { data: habits } = useQuery({
    queryKey: ['habits', 'calendar'],
    queryFn: habitsApi.getHabits,
  });

  const { data: moodEntries } = useQuery({
    queryKey: ['mood', 'calendar', currentYear, currentMonth],
    queryFn: () => moodApi.getMoodEntries({
      start_date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
      end_date: new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0]
    }),
  });

  // Calculate summary stats
  const summaryStats = React.useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const monthTasks = (tasks || []).filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= startOfMonth && dueDate <= endOfMonth;
    });

    const monthEvents = (events || []).filter(event => {
      const eventDate = new Date(event.start_datetime);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });

    const overdueTasks = monthTasks.filter(task => {
      const dueDate = new Date(task.due_date!);
      return dueDate < today && !task.completed;
    });

    const todayTasks = monthTasks.filter(task => {
      const dueDate = new Date(task.due_date!);
      return dueDate.toDateString() === today.toDateString();
    });

    const completedTasks = monthTasks.filter(task => task.completed);

    return {
      totalEvents: monthEvents.length,
      totalTasks: monthTasks.length,
      overdueTasks: overdueTasks.length,
      todayTasks: todayTasks.length,
      completedTasks: completedTasks.length,
      upcomingEvents: monthEvents.filter(event => new Date(event.start_datetime) > today).length,
    };
  }, [tasks, events, currentYear, currentMonth]);

  // const navigateMonth = (direction: 'prev' | 'next') => { // Commented out as unused
  //   setCurrentDate(prev => {
  //     const newDate = new Date(prev);
  //     if (direction === 'prev') {
  //       newDate.setMonth(prev.getMonth() - 1);
  //     } else {
  //       newDate.setMonth(prev.getMonth() + 1);
  //     }
  //     return newDate;
  //   });
  // };

  // const goToToday = () => { // Commented out as unused
  //   setCurrentDate(new Date());
  // };

  // const monthNames = [ // Commented out as unused
  //   'January', 'February', 'March', 'April', 'May', 'June',
  //   'July', 'August', 'September', 'October', 'November', 'December'
  // ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">
            Manage your events and track important deadlines
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <EventForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Events</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{summaryStats.totalEvents}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Tasks Due</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{summaryStats.totalTasks}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Due Today</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{summaryStats.todayTasks}</p>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{summaryStats.overdueTasks}</p>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{summaryStats.completedTasks}</p>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Upcoming</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{summaryStats.upcomingEvents}</p>
            <p className="text-xs text-muted-foreground">Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation and View Selector */}
      <CalendarViewSelector
        currentView={activeView}
        onViewChange={setActiveView}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      {/* Calendar Views */}
      <div className="min-h-[600px]">
        {activeView === 'day' && (
          <CalendarDayView 
            currentDate={currentDate}
            events={events || []}
            tasks={tasks || []}
            isLoading={isLoading}
          />
        )}
        {activeView === '3day' && (
          <Calendar3DayView 
            currentDate={currentDate}
            events={events || []}
            tasks={tasks || []}
            habits={habits || []}
            moodEntries={moodEntries || []}
          />
        )}
        {activeView === 'week' && (
          <CalendarWeekView 
            currentDate={currentDate}
            events={events || []}
            tasks={tasks || []}
            isLoading={isLoading}
          />
        )}
        {activeView === '2week' && (
          <Calendar2WeekView 
            currentDate={currentDate}
            events={events || []}
            tasks={tasks || []}
            habits={habits || []}
            moodEntries={moodEntries || []}
          />
        )}
        {activeView === 'month' && (
          <CalendarMonthView 
            currentDate={currentDate}
            events={events || []}
            tasks={tasks || []}
            isLoading={isLoading}
          />
        )}
        {activeView === 'agenda' && (
          <CalendarAgendaView 
            currentDate={currentDate}
            events={events || []}
            tasks={tasks || []}
            isLoading={isLoading}
          />
        )}
      </div>
      </div>
    </ErrorBoundary>
  );
};