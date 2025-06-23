import React from 'react';
import { DashboardWidget } from '../../layout/DashboardGrid';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Calendar, Clock, MapPin, LinkIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { calendarApi } from '../../../services/calendar';

export const UpcomingEventsWidget: React.FC = () => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: upcomingEvents, isLoading } = useQuery({
    queryKey: ['calendar', 'upcoming', today.toISOString().split('T')[0], nextWeek.toISOString().split('T')[0]],
    queryFn: () => calendarApi.getEvents({
      start: today.toISOString(),
      end: nextWeek.toISOString(),
    }),
  });

  const sortedEvents = React.useMemo(() => {    if (!upcomingEvents || !Array.isArray(upcomingEvents)) return [];
    return upcomingEvents
      .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
      .slice(0, 5); // Show only next 5 events
  }, [upcomingEvents]);

  const formatEventTime = (startTime: string, endTime: string, allDay: boolean) => {
    if (allDay) return 'All day';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatEventDate = (startTime: string) => {
    const date = new Date(startTime);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <DashboardWidget
      title="Upcoming Events"
      subtitle="Your schedule for the next 7 days"
      action={
        <Button size="sm" variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          View Calendar
        </Button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <div key={event.id} className="p-3 rounded-lg border bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatEventDate(event.start_datetime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatEventTime(event.start_datetime, event.end_datetime, event.is_all_day)}
                      </div>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                  </div>                  <div className="flex flex-col gap-1 ml-2">
                    {event.task_id && (
                      <Badge variant="secondary" className="text-xs">
                        <LinkIcon className="h-2 w-2 mr-1" />
                        Task
                      </Badge>
                    )}
                    {false && (
                      <Badge variant="outline" className="text-xs">
                        {/* event.reminder_minutes */}m
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No upcoming events in the next 7 days
              </p>
              <Button size="sm" variant="outline" className="mt-3">
                + Add Event
              </Button>
            </div>
          )}

          {sortedEvents.length > 0 && (
            <div className="pt-3 border-t">
              <Button className="w-full" variant="outline" size="sm">
                View All Events
              </Button>
            </div>
          )}
        </div>
      )}
    </DashboardWidget>
  );
};