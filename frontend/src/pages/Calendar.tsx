import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { CalendarMonthView } from '../components/calendar/CalendarMonthView';
import { CalendarAgendaView } from '../components/calendar/CalendarAgendaView';
import { CalendarWeekView } from '../components/calendar/CalendarWeekView';
import { CalendarDayView } from '../components/calendar/CalendarDayView';
import { EventForm } from '../components/calendar/EventForm';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Plus, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { calendarApi } from '../services/calendar';
import { tasksApi } from '../services/tasks';

export const Calendar: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState<'3day' | 'week' | '2week' | 'month' | 'agenda'>('month');

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

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
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
          <DialogContent className="max-w-md">
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

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Today
          </Button>
        </div>

        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as '3day' | 'week' | '2week' | 'month' | 'agenda')} defaultValue="month">
          <TabsList>
            <TabsTrigger value="3day" className="flex items-center gap-2">
              3 Days
            </TabsTrigger>
            <TabsTrigger value="week" className="flex items-center gap-2">
              Week
            </TabsTrigger>
            <TabsTrigger value="2week" className="flex items-center gap-2">
              2 Weeks
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Month
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Calendar Views */}
      <div className="min-h-[600px]">
        {activeView === '3day' && (
          <CalendarDayView 
            currentDate={currentDate}
            events={events || []}
            tasks={tasks || []}
            isLoading={isLoading}
            daysToShow={3}
          />
        )}
        {activeView === 'week' && (
          <CalendarWeekView 
            currentDate={currentDate}
            events={events || []}
            tasks={tasks || []}
            isLoading={isLoading}
            weeksToShow={1}
          />
        )}
        {activeView === '2week' && (
          <CalendarWeekView 
            currentDate={currentDate}
            events={events || []}
            tasks={tasks || []}
            isLoading={isLoading}
            weeksToShow={2}
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
  );
};