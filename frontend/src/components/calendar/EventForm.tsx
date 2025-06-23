import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { DialogHeader, DialogTitle } from '../ui/Dialog';
import { CalendarEvent, useCreateEvent, useUpdateEvent } from '../../services/calendar';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../../services/tasks';

interface EventFormProps {
  event?: CalendarEvent;
  onSuccess?: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ event, onSuccess }) => {  const [formData, setFormData] = React.useState({
    title: event?.title || '',
    description: event?.description || '',
    start_time: event?.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
    end_time: event?.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
    all_day: event?.is_all_day || false,
    location: event?.location || '',
    color: event?.color || '',
    recurrence_rule: event?.recurrence_rule || '',
    task_id: event?.task_id?.toString() || '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();

  const { data: tasks } = useQuery({
    queryKey: ['tasks', 'for-calendar'],
    queryFn: () => tasksApi.getTasks({ completed: false }),
  });

  const isEditing = !!event;
  const isLoading = createEvent.isPending || updateEvent.isPending;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.all_day && !formData.end_time) {
      newErrors.end_time = 'End time is required for timed events';
    }

    if (formData.start_time && formData.end_time && 
        new Date(formData.start_time) >= new Date(formData.end_time)) {
      newErrors.end_time = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        start_datetime: formData.start_time,
        end_datetime: formData.all_day ? formData.start_time : formData.end_time,
        is_all_day: formData.all_day,
        location: formData.location.trim() || undefined,
        color: formData.color || undefined,
        recurrence_rule: formData.recurrence_rule || undefined,
        task_id: formData.task_id ? parseInt(formData.task_id) : undefined,
      };

      if (isEditing) {
        await updateEvent.mutateAsync({
          id: event.id,
          ...eventData,
        });
      } else {
        await createEvent.mutateAsync(eventData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to save event:', error);
      setErrors({ submit: 'Failed to save event. Please try again.' });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAllDayChange = (allDay: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      all_day: allDay,
      // Clear end time if switching to all day
      end_time: allDay ? '' : prev.end_time
    }));
  };

  // Auto-set end time to 1 hour after start time if not set
  const handleStartTimeChange = (startTime: string) => {
    handleInputChange('start_time', startTime);
    
    if (!formData.end_time && !formData.all_day && startTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
      handleInputChange('end_time', endDate.toISOString().slice(0, 16));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Event' : 'Create New Event'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <Input
            label="Title"
            placeholder="Enter event title..."
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={errors.title}
            required
          />
        </div>

        {/* Description */}
        <div>
          <Textarea
            label="Description"
            placeholder="Add event description (optional)..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={2}
          />
        </div>

        {/* All Day Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="all_day"
            checked={formData.all_day}
            onChange={(e) => handleAllDayChange(e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="all_day" className="text-sm font-medium">
            All day event
          </label>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Start"
              type={formData.all_day ? "date" : "datetime-local"}
              value={formData.all_day ? formData.start_time.split('T')[0] : formData.start_time}
              onChange={(e) => {
                const value = formData.all_day ? `${e.target.value}T00:00` : e.target.value;
                handleStartTimeChange(value);
              }}
              error={errors.start_time}
              required
            />
          </div>

          {!formData.all_day && (
            <div>
              <Input
                label="End"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                error={errors.end_time}
                required
              />
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <Input
            label="Location"
            placeholder="Add location (optional)..."
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
          />
        </div>

        {/* Reminder and Recurrence */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Reminder</label>
            <Select              value={formData.color}
              onValueChange={(value) => handleInputChange('color', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No reminder</SelectItem>
                <SelectItem value="0">At event time</SelectItem>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Repeat</label>
            <Select              value={formData.recurrence_rule}
              onValueChange={(value) => handleInputChange('recurrence_rule', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="No repeat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Link to Task */}
        {tasks && tasks.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Link to Task (optional)</label>
            <Select              value={formData.task_id}
              onValueChange={(value) => handleInputChange('task_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a task to link" />
              </SelectTrigger>
              <SelectContent>                <SelectItem value="">No linked task</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id.toString()}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {errors.submit}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onSuccess}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? 'Update Event' : 'Create Event'
          )}
        </Button>
      </div>
    </form>
  );
};