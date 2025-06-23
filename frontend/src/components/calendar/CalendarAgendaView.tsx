import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CalendarIcon, Clock, MapPin, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { CalendarEvent } from '../../services/calendar';
import { Task } from '../../services/tasks';
import { EventDetailModal } from './EventDetailModal';
import { cn } from '../../utils/cn';

interface CalendarAgendaViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  isLoading: boolean;
}

export const CalendarAgendaView: React.FC<CalendarAgendaViewProps> = ({
  currentDate,
  events,
  tasks,
  isLoading
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Group events and tasks by date
  const groupedByDate = React.useMemo(() => {
    const groups: Record<string, { events: CalendarEvent[]; tasks: Task[] }> = {};
    
    // Add events
    events.forEach(event => {
      const date = new Date(event.start_time).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = { events: [], tasks: [] };
      }
      groups[date].events.push(event);
    });
    
    // Add tasks with due dates
    tasks.forEach(task => {
      if (task.due_date) {
        const date = new Date(task.due_date).toISOString().split('T')[0];
        if (!groups[date]) {
          groups[date] = { events: [], tasks: [] };
        }
        groups[date].tasks.push(task);
      }
    });
    
    // Sort by date and return as array
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, items]) => ({
        date: new Date(date),
        ...items
      }));
  }, [events, tasks]);

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
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
          <p className="text-muted-foreground">Loading agenda...</p>
        </div>
      </div>
    );
  }

  if (groupedByDate.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
          <p className="text-muted-foreground text-center">
            Your calendar is clear for this month. Create an event to get started!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {groupedByDate.map(({ date, events: dayEvents, tasks: dayTasks }) => (
          <Card key={date.toISOString()} className={cn(
            "transition-all",
            isToday(date) && "ring-2 ring-primary/20 bg-primary/5"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <span>{formatDate(date)}</span>
                {isToday(date) && (
                  <Badge variant="default" className="text-xs">Today</Badge>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {dayEvents.length > 0 && (
                    <span>{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</span>
                  )}
                  {dayTasks.length > 0 && (
                    <span>{dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Events */}
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="mt-1">
                    <CalendarIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-blue-700 mt-1 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                          {!event.all_day && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(event.start_time)} - {formatTime(event.end_time)}
                            </div>
                          )}
                          {event.all_day && (
                            <Badge variant="secondary" className="text-xs">All Day</Badge>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Tasks */}
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    task.completed 
                      ? "bg-green-50/50 hover:bg-green-50" 
                      : isOverdue(task)
                      ? "bg-red-50/50 hover:bg-red-50"
                      : "bg-orange-50/50 hover:bg-orange-50"
                  )}
                >
                  <div className="mt-1">
                    {task.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className={cn(
                        "h-4 w-4",
                        isOverdue(task) ? "text-red-600" : "text-orange-600"
                      )} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={cn(
                          "font-medium",
                          task.completed 
                            ? "text-green-900 line-through" 
                            : isOverdue(task)
                            ? "text-red-900"
                            : "text-orange-900"
                        )}>
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className={cn(
                            "text-sm mt-1 line-clamp-2",
                            task.completed 
                              ? "text-green-700" 
                              : isOverdue(task)
                              ? "text-red-700"
                              : "text-orange-700"
                          )}>
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge 
                            variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {task.priority} priority
                          </Badge>
                          {task.completed && (
                            <Badge variant="default" className="text-xs">Completed</Badge>
                          )}
                          {isOverdue(task) && (
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 ml-3">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
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