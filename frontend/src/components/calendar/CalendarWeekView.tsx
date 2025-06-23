import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { CalendarIcon, Clock, MapPin, AlertCircle, Plus } from 'lucide-react';
import { CalendarEvent } from '../../services/calendar';
import { Task } from '../../services/tasks';
import { EventDetailModal } from './EventDetailModal';
import { cn } from '../../utils/cn';

interface CalendarWeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  isLoading: boolean;
  weeksToShow?: number;
}

export const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  currentDate,
  events,
  tasks,
  isLoading,
  weeksToShow = 1
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Generate array of weeks to display
  const weeks = React.useMemo(() => {
    const weeksArray = [];
    
    for (let w = 0; w < weeksToShow; w++) {
      const weekStart = new Date(currentDate);
      // Go to the start of the week (Sunday)
      const dayOfWeek = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - dayOfWeek + (w * 7));
      
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + d);
        weekDays.push(day);
      }
      
      weeksArray.push({
        weekStart,
        days: weekDays
      });
    }
    
    return weeksArray;
  }, [currentDate, weeksToShow]);

  // Group events and tasks by date
  const eventsByDate = React.useMemo(() => {
    const grouped: Record<string, { events: CalendarEvent[]; tasks: Task[] }> = {};
    
    weeks.forEach(week => {
      week.days.forEach(day => {
        const dateStr = day.toISOString().split('T')[0];
        grouped[dateStr] = { events: [], tasks: [] };
      });
    });
    
    events.forEach(event => {
      const eventDate = new Date(event.start_time).toISOString().split('T')[0];
      if (grouped[eventDate]) {
        grouped[eventDate].events.push(event);
      }
    });
    
    tasks.forEach(task => {
      if (task.due_date) {
        const taskDate = new Date(task.due_date).toISOString().split('T')[0];
        if (grouped[taskDate]) {
          grouped[taskDate].tasks.push(task);
        }
      }
    });
    
    return grouped;
  }, [weeks, events, tasks]);

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDayHeader = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    return {
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'short' }),
      isToday
    };
  };

  const formatWeekRange = (weekStart: Date) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${weekStart.getDate()}-${weekEnd.getDate()}`;
    } else {
      return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}`;
    }
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
      <div className="space-y-6">
        {weeks.map((week, weekIndex) => (
          <Card key={weekIndex}>
            {/* Week Header */}
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-semibold text-center">
                {formatWeekRange(week.weekStart)}
              </h3>
            </div>

            {/* Week Grid */}
            <CardContent className="p-0">
              <div className="grid grid-cols-7">
                {/* Day Headers */}
                {week.days.map((day, dayIndex) => {
                  const dayHeader = formatDayHeader(day);
                  return (
                    <div 
                      key={dayIndex} 
                      className={cn(
                        "p-3 border-r border-b text-center",
                        dayHeader.isToday && "bg-primary/10"
                      )}
                    >
                      <div className="text-xs text-muted-foreground mb-1">
                        {dayHeader.dayName}
                      </div>
                      <div className={cn(
                        "text-lg font-semibold",
                        dayHeader.isToday && "text-primary"
                      )}>
                        {dayHeader.dayNumber}
                      </div>
                      {dayHeader.isToday && (
                        <Badge variant="default" className="text-xs mt-1">Today</Badge>
                      )}
                    </div>
                  );
                })}

                {/* Day Content */}
                {week.days.map((day, dayIndex) => {
                  const dateStr = day.toISOString().split('T')[0];
                  const dayData = eventsByDate[dateStr];
                  const dayHeader = formatDayHeader(day);
                  
                  return (
                    <div 
                      key={`${weekIndex}-${dayIndex}`}
                      className={cn(
                        "min-h-[200px] p-2 border-r border-b space-y-1",
                        dayHeader.isToday && "bg-primary/5"
                      )}
                    >
                      {/* All Day Events */}
                      {dayData.events.filter(e => e.all_day).slice(0, 1).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="p-1 rounded text-xs bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                        >
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-2 w-2" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        </div>
                      ))}

                      {/* Timed Events */}
                      {dayData.events
                        .filter(e => !e.all_day)
                        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                        .slice(0, 2)
                        .map((event) => (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="p-1 rounded text-xs bg-blue-50 border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex items-center gap-1">
                              <Clock className="h-2 w-2 text-blue-600" />
                              <span className="truncate text-blue-900">{event.title}</span>
                            </div>
                            <div className="text-blue-700 text-[10px]">
                              {formatTime(event.start_time)}
                            </div>
                          </div>
                        ))}

                      {/* Tasks */}
                      {dayData.tasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "p-1 rounded text-xs border",
                            task.completed 
                              ? "bg-green-50 border-green-200 text-green-800" 
                              : isOverdue(task)
                              ? "bg-red-50 border-red-200 text-red-800"
                              : "bg-orange-50 border-orange-200 text-orange-800"
                          )}
                        >
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-2 w-2" />
                            <span className={cn(
                              "truncate",
                              task.completed && "line-through"
                            )}>
                              {task.title}
                            </span>
                          </div>
                          <div className="text-[10px] opacity-75">
                            {task.priority} priority
                          </div>
                        </div>
                      ))}

                      {/* More items indicator */}
                      {(dayData.events.length + dayData.tasks.length) > 3 && (
                        <div className="text-[10px] text-muted-foreground text-center">
                          +{(dayData.events.length + dayData.tasks.length) - 3} more
                        </div>
                      )}

                      {/* Empty state */}
                      {dayData.events.length === 0 && dayData.tasks.length === 0 && (
                        <div className="h-full flex items-center justify-center">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 opacity-30 hover:opacity-60">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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