import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { CalendarIcon, Clock, MapPin, AlertCircle, Plus } from 'lucide-react';
import { CalendarEvent } from '../../services/calendar';
import { Task } from '../../services/tasks';
import { EventDetailModal } from './EventDetailModal';
import { cn } from '../../utils/cn';

interface CalendarDayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  isLoading: boolean;
  daysToShow?: number;
}

export const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  currentDate,
  events,
  tasks,
  isLoading,
  daysToShow = 3
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Generate array of days to display
  const days = React.useMemo(() => {
    const daysArray = [];
    const startDate = new Date(currentDate);
    
    // For 3-day view, center around current date
    if (daysToShow === 3) {
      startDate.setDate(currentDate.getDate() - 1);
    }
    
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      daysArray.push(date);
    }
    
    return daysArray;
  }, [currentDate, daysToShow]);

  // Group events and tasks by date
  const eventsByDate = React.useMemo(() => {
    const grouped: Record<string, { events: CalendarEvent[]; tasks: Task[] }> = {};
    
    days.forEach(day => {
      const dateStr = day.toISOString().split('T')[0];
      grouped[dateStr] = { events: [], tasks: [] };
    });
      if (events && Array.isArray(events)) {
      events.forEach(event => {
        const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
        if (grouped[eventDate]) {
          grouped[eventDate].events.push(event);
        }
      });
    }
    
    if (tasks && Array.isArray(tasks)) {
      tasks.forEach(task => {
        if (task.due_date) {
          const taskDate = new Date(task.due_date).toISOString().split('T')[0];
          if (grouped[taskDate]) {
            grouped[taskDate].tasks.push(task);
          }
        }
      });
    }
    
    return grouped;
  }, [days, events, tasks]);

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDayHeader = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday,
      isTomorrow,
      label: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : null
    };
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.completed) return false;
    return new Date(task.due_date) < new Date();
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
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${daysToShow}, 1fr)` }}>
        {days.map((day) => {
          const dateStr = day.toISOString().split('T')[0];
          const dayData = eventsByDate[dateStr];
          const dayHeader = formatDayHeader(day);
          
          return (
            <Card key={dateStr} className={cn(
              "min-h-[500px]",
              dayHeader.isToday && "ring-2 ring-primary/20 bg-primary/5"
            )}>
              {/* Day Header */}
              <div className={cn(
                "p-4 border-b text-center",
                dayHeader.isToday && "bg-primary/10"
              )}>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {dayHeader.dayName}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <span className={cn(
                      "text-2xl font-bold",
                      dayHeader.isToday && "text-primary"
                    )}>
                      {dayHeader.dayNumber}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {dayHeader.monthName}
                    </span>
                  </div>
                  {dayHeader.label && (
                    <Badge variant={dayHeader.isToday ? "default" : "secondary"} className="text-xs">
                      {dayHeader.label}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Day Content */}
              <CardContent className="p-4 space-y-3">                {/* All Day Events */}
                {dayData.events.filter(e => e.is_all_day).map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="p-2 rounded-lg bg-blue-100 text-blue-900 cursor-pointer hover:bg-blue-200 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3 w-3" />
                      <span className="text-sm font-medium truncate">{event.title}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs mt-1">All Day</Badge>
                  </div>
                ))}                {/* Timed Events */}
                {dayData.events
                  .filter(e => !e.is_all_day)
                  .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
                  .map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="p-2 rounded-lg border bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-3 w-3 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900 truncate">
                              {event.title}
                            </span>
                          </div>                          <div className="flex items-center gap-1 mt-1 text-xs text-blue-700">
                            <Clock className="h-3 w-3" />
                            {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Tasks */}
                {dayData.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-2 rounded-lg border transition-colors",
                      task.completed 
                        ? "bg-green-50 border-green-200" 
                        : isOverdue(task)
                        ? "bg-red-50 border-red-200"
                        : "bg-orange-50 border-orange-200"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className={cn(
                        "h-3 w-3 mt-0.5",
                        task.completed 
                          ? "text-green-600" 
                          : isOverdue(task)
                          ? "text-red-600"
                          : "text-orange-600"
                      )} />
                      <div className="flex-1 min-w-0">
                        <span className={cn(
                          "text-sm font-medium",
                          task.completed 
                            ? "text-green-900 line-through" 
                            : isOverdue(task)
                            ? "text-red-900"
                            : "text-orange-900"
                        )}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {task.priority}
                          </Badge>
                          {task.completed && (
                            <Badge variant="default" className="text-xs">Done</Badge>
                          )}
                          {isOverdue(task) && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {dayData.events.length === 0 && dayData.tasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-sm">No events or tasks</p>
                    <Button size="sm" variant="ghost" className="mt-2">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
};