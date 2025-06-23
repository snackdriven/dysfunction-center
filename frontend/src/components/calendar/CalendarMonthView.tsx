import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent } from '../ui/Dialog';
import { CalendarIcon, Clock, AlertCircle, MapPin } from 'lucide-react';
import { CalendarEvent } from '../../services/calendar';
import { Task } from '../../services/tasks';
import { EventDetailModal } from './EventDetailModal';
import { cn } from '../../utils/cn';

interface CalendarMonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  isLoading: boolean;
}

export const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({
  currentDate,
  events,
  tasks,
  isLoading
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and how many days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = React.useMemo(() => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        events: [],
        tasks: [],
      });
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
        const dayEvents = events && Array.isArray(events) ? events.filter(event => {
        const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
        return eventDate === dateStr;
      }) : [];
      
      const dayTasks = tasks && Array.isArray(tasks) ? tasks.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date).toISOString().split('T')[0];
        return taskDate === dateStr;
      }) : [];
      
      days.push({
        date,
        isCurrentMonth: true,
        events: dayEvents,
        tasks: dayTasks,
      });
    }
    
    // Add empty cells to complete the grid (42 cells = 6 weeks)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        events: [],
        tasks: [],
      });
    }
    
    return days;
  }, [year, month, events, tasks, firstDayOfWeek, daysInMonth]);

  const today = new Date();
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
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
          <p className="text-muted-foreground">Loading calendar...</p>
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
                'min-h-[120px] p-2 border-r border-b last:border-r-0',
                !day.isCurrentMonth && 'bg-muted/20',
                isToday(day.date) && day.isCurrentMonth && 'bg-primary/5'
              )}
              onClick={() => setSelectedDate(day.date)}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  'text-sm font-medium',
                  !day.isCurrentMonth && 'text-muted-foreground',
                  isToday(day.date) && day.isCurrentMonth && 'text-primary font-bold'
                )}>
                  {day.date.getDate()}
                </span>
                {(day.events.length > 0 || day.tasks.length > 0) && (
                  <div className="flex items-center gap-1">
                    {day.events.length > 0 && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    {day.tasks.length > 0 && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </div>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {day.events.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(event);
                    }}
                    className="w-full text-left p-1 rounded text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      <span className="truncate">{event.title}</span>
                    </div>                    {!event.is_all_day && (
                      <div className="text-blue-600 text-[10px]">
                        {formatTime(event.start_datetime)}
                      </div>
                    )}
                  </button>
                ))}

                {/* Tasks with due dates */}
                {day.tasks.slice(0, 2).map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "w-full text-left p-1 rounded text-xs transition-colors",
                      task.completed 
                        ? "bg-green-100 text-green-800" 
                        : task.priority === 'high'
                        ? "bg-red-100 text-red-800"
                        : "bg-orange-100 text-orange-800"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {task.completed ? (
                        <div className="w-2 h-2 bg-green-600 rounded-full" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      <span className="truncate">{task.title}</span>
                    </div>
                    <div className="text-[10px] opacity-75">
                      Due: {task.priority} priority
                    </div>
                  </div>
                ))}

                {/* Show "+X more" if there are more items */}
                {(day.events.length + day.tasks.length) > 4 && (
                  <div className="text-[10px] text-muted-foreground text-center">
                    +{(day.events.length + day.tasks.length) - 4} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* Day Detail Modal (for when clicking on a day) */}
      {selectedDate && (
        <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
          <DialogContent className="max-w-md">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>

              <div className="space-y-3">                {/* Events for this day */}
                {(events && Array.isArray(events) ? events.filter(event => {
                  const eventDate = new Date(event.start_datetime).toDateString();
                  return eventDate === selectedDate.toDateString();
                }) : []).map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {!event.is_all_day && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                          </div>
                        )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary">Event</Badge>
                    </div>
                  </div>
                ))}

                {/* Tasks for this day */}
                {(tasks && Array.isArray(tasks) ? tasks.filter(task => {
                  if (!task.due_date) return false;
                  const taskDate = new Date(task.due_date).toDateString();
                  return taskDate === selectedDate.toDateString();
                }) : []).map((task) => (
                  <div key={task.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                            {task.priority}
                          </Badge>
                          {task.completed && (
                            <Badge variant="default">Completed</Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline">Task</Badge>
                    </div>
                  </div>
                ))}                {/* No events message */}
                {(events && Array.isArray(events) ? events.filter(event => {
                  const eventDate = new Date(event.start_datetime).toDateString();
                  return eventDate === selectedDate.toDateString();
                }) : []).length === 0 &&
                (tasks && Array.isArray(tasks) ? tasks.filter(task => {
                  if (!task.due_date) return false;
                  const taskDate = new Date(task.due_date).toDateString();
                  return taskDate === selectedDate.toDateString();
                }) : []).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No events or tasks scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};