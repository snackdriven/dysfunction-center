import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/Select';
import { Clock, Calendar, MapPin, Timer, Play, Pause, AlertCircle } from 'lucide-react';
import { calendarApi } from '../../../services/calendar';
import { cn } from '../../../utils/cn';

interface CountdownWidgetProps {
  className?: string;
}

interface CountdownEvent {
  id: number;
  title: string;
  start_datetime: string;
  end_datetime?: string;
  location?: string;
  is_all_day: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOverdue: boolean;
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({ className }) => {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(true);
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  // Fetch upcoming events for the next 30 days
  const today = new Date();
  const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const { data: upcomingEvents } = useQuery({
    queryKey: ['events', 'upcoming-30-days'],
    queryFn: () => calendarApi.getEvents({ 
      start: today.toISOString().split('T')[0], 
      end: endDate.toISOString().split('T')[0]
    }),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const selectedEvent = selectedEventId 
    ? upcomingEvents?.find(event => event.id === selectedEventId)
    : null;

  // Calculate time remaining
  const calculateTimeRemaining = (targetDate: string): TimeRemaining => {
    const now = new Date().getTime();
    const target = new Date(targetDate).getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isOverdue: true };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isOverdue: false };
  };

  // Update countdown every second
  useEffect(() => {
    if (!selectedEvent || !isRunning) return;

    const updateCountdown = () => {
      const remaining = calculateTimeRemaining(selectedEvent.start_datetime);
      setTimeRemaining(remaining);
    };

    updateCountdown(); // Initial calculation
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [selectedEvent, isRunning]);

  // Auto-select the next upcoming event if none selected
  useEffect(() => {
    if (!selectedEventId && upcomingEvents && upcomingEvents.length > 0) {
      const nextEvent = upcomingEvents
        .filter(event => new Date(event.start_datetime) > new Date())
        .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())[0];
      
      if (nextEvent) {
        setSelectedEventId(nextEvent.id);
      }
    }
  }, [upcomingEvents, selectedEventId]);

  const formatTimeUnit = (value: number, unit: string) => {
    const paddedValue = value.toString().padStart(2, '0');
    return (
      <div className="text-center">
        <div className={cn(
          "text-3xl font-bold leading-none",
          timeRemaining?.isOverdue ? 'text-red-600' : 'text-primary'
        )}>
          {paddedValue}
        </div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
          {unit}
        </div>
      </div>
    );
  };

  const getUrgencyColor = () => {
    if (!timeRemaining || timeRemaining.isOverdue) return 'border-red-500 bg-red-50';
    
    const totalMinutes = timeRemaining.days * 24 * 60 + timeRemaining.hours * 60 + timeRemaining.minutes;
    
    if (totalMinutes <= 60) return 'border-red-500 bg-red-50'; // Less than 1 hour
    if (totalMinutes <= 24 * 60) return 'border-orange-500 bg-orange-50'; // Less than 1 day
    if (totalMinutes <= 7 * 24 * 60) return 'border-yellow-500 bg-yellow-50'; // Less than 1 week
    return 'border-blue-500 bg-blue-50'; // More than 1 week
  };

  const formatEventTime = (dateTime: string, isAllDay: boolean) => {
    if (isAllDay) return 'All Day';
    
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      <Card className={cn(
        "transition-all duration-300 border-l-4",
        getUrgencyColor(),
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Event Countdown
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRunning(!isRunning)}
                className="p-1 h-8 w-8"
              >
                {isRunning ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSelectDialog(true)}
                className="p-1 h-8 w-8"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedEvent && timeRemaining ? (
            <div className="space-y-4">
              {/* Event Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg truncate" title={selectedEvent.title}>
                  {selectedEvent.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatEventTime(selectedEvent.start_datetime, selectedEvent.is_all_day)}</span>
                  {selectedEvent.location && (
                    <>
                      <MapPin className="h-4 w-4 ml-2" />
                      <span className="truncate">{selectedEvent.location}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Countdown Display */}
              {timeRemaining.isOverdue ? (
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500" />
                  <div className="text-xl font-bold text-red-600">Event Started!</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    This event has already begun
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4 py-4">
                  {formatTimeUnit(timeRemaining.days, 'Days')}
                  {formatTimeUnit(timeRemaining.hours, 'Hours')}
                  {formatTimeUnit(timeRemaining.minutes, 'Min')}
                  {formatTimeUnit(timeRemaining.seconds, 'Sec')}
                </div>
              )}

              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge 
                  variant={timeRemaining.isOverdue ? 'destructive' : 'secondary'}
                  className="px-3 py-1"
                >
                  {timeRemaining.isOverdue ? 'Overdue' : 
                   timeRemaining.days === 0 && timeRemaining.hours === 0 ? 'Less than 1 hour' :
                   timeRemaining.days === 0 ? 'Today' :
                   timeRemaining.days === 1 ? 'Tomorrow' :
                   `In ${timeRemaining.days} days`}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <div className="text-lg font-medium mb-2">No Event Selected</div>
              <div className="text-sm text-muted-foreground mb-4">
                Choose an upcoming event to track
              </div>
              <Button 
                onClick={() => setShowSelectDialog(true)}
                variant="outline"
              >
                Select Event
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Selection Dialog */}
      <Dialog open={showSelectDialog} onOpenChange={setShowSelectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Event to Track</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={selectedEventId?.toString() || ''}
              onValueChange={(value) => {
                setSelectedEventId(value ? parseInt(value) : null);
                setShowSelectDialog(false);
              }}
            >
              <SelectTrigger>
                <SelectValue 
                  placeholder="Choose an upcoming event"
                />
              </SelectTrigger>
              <SelectContent>
                {upcomingEvents
                  ?.filter(event => new Date(event.start_datetime) > new Date())
                  .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
                  .map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-sm">{event.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatEventTime(event.start_datetime, event.is_all_day)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {upcomingEvents?.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">No upcoming events found</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};