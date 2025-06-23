import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { CalendarMonthView } from '../components/calendar/CalendarMonthView';
import { CalendarAgendaView } from '../components/calendar/CalendarAgendaView';
import { CalendarWeekView } from '../components/calendar/CalendarWeekView';
import { CalendarDayView } from '../components/calendar/CalendarDayView';
import { EventForm } from '../components/calendar/EventForm';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { Plus, Calendar as CalendarIcon, List, ChevronLeft, ChevronRight } from 'lucide-react';
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