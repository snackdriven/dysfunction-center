import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { CalendarIcon, Clock, MapPin, Bell, Repeat, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';
import { CalendarEvent, useDeleteEvent } from '../../services/calendar';
import { EventForm } from './EventForm';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../../services/tasks';

interface EventDetailModalProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const deleteEvent = useDeleteEvent();
  const { data: linkedTask } = useQuery({
    queryKey: ['task', event.task_id],
    queryFn: () => event.task_id ? tasksApi.getTask(event.task_id) : null,
    enabled: !!event.task_id,
  });

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };
  const formatDuration = () => {
    if (event.is_all_day) return 'All day';

    const start = new Date(event.start_datetime);
    const end = new Date(event.end_datetime);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const getReminderText = (minutes?: number) => {
    if (!minutes) return 'No reminder';
    if (minutes === 0) return 'At event time';
    if (minutes < 60) return `${minutes} minutes before`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours before`;
    return `${Math.floor(minutes / 1440)} days before`;
  };

  const getRecurrenceText = (pattern?: string) => {
    if (!pattern) return 'Does not repeat';
    return pattern.charAt(0).toUpperCase() + pattern.slice(1);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        await deleteEvent.mutateAsync(event.id);
        onClose();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
    }
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    onClose();
  };

  if (isEditing) {
    return (
      <Dialog open={isOpen} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="max-w-md">
          <EventForm 
            event={event}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>
    );
  }
  const startDateTime = formatDateTime(event.start_datetime);
  const endDateTime = event.is_all_day ? null : formatDateTime(event.end_datetime);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">{event.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">Event</Badge>                {event.is_all_day && (
                  <Badge variant="outline">All Day</Badge>
                )}
                {event.recurrence_rule && (
                  <Badge variant="outline">Recurring</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          {event.description && (
            <div>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}

          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{startDateTime.date}</p>                {!event.is_all_day && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>
                      {startDateTime.time}
                      {endDateTime && ` - ${endDateTime.time}`}
                      <span className="ml-2">({formatDuration()})</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{event.location}</p>
                </div>
              </div>
            )}            {/* Reminder - TODO: Add to backend schema */}
            {false && (
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Reminder</p>
                  <p className="text-sm text-muted-foreground">
                    {/* getReminderText(event.reminder_minutes) */}
                  </p>
                </div>
              </div>
            )}

            {/* Recurrence - TODO: Add to backend schema */}
            {event.recurrence_rule && (
              <div className="flex items-start gap-3">
                <Repeat className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Repeats</p>
                  <p className="text-sm text-muted-foreground">
                    {/* getRecurrenceText(event.recurrence_rule) */}
                    {event.recurrence_rule}
                  </p>
                </div>
              </div>
            )}

            {/* Linked Task */}
            {linkedTask && (
              <div className="flex items-start gap-3">
                <LinkIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Linked Task</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">{linkedTask.title}</p>
                    <Badge 
                      variant={linkedTask.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {linkedTask.priority}
                    </Badge>
                    {linkedTask.completed && (
                      <Badge variant="default" className="text-xs">Completed</Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Event Metadata */}
            <div className="pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                Created: {new Date(event.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};