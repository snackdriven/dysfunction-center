import React from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { DialogHeader, DialogTitle } from '../ui/Dialog';
import { DayOfWeekSelector, type DayOfWeek, type SchedulePattern } from '../ui/DayOfWeekSelector';
import { Habit, useCreateHabit, useUpdateHabit } from '../../services/habits';

interface HabitFormProps {
  habit?: Habit;
  onSuccess?: () => void;
}

const habitCategories = [
  { label: 'Health & Fitness', value: 'health' },
  { label: 'Productivity', value: 'productivity' },
  { label: 'Personal Development', value: 'personal' },
  { label: 'Learning', value: 'personal' },
  { label: 'Mindfulness', value: 'health' },
  { label: 'Social', value: 'personal' },
  { label: 'Creative', value: 'personal' },
  { label: 'Personal Care', value: 'health' },
  { label: 'Finance', value: 'productivity' },
  { label: 'Other', value: 'personal' }
];

export const HabitForm: React.FC<HabitFormProps> = ({ habit, onSuccess }) => {
  const [formData, setFormData] = React.useState({
    name: habit?.name || '',
    description: habit?.description || '',
    category: habit?.category || 'health',
    target_frequency: habit?.target_frequency || 1,
    target_value: habit?.target_value || 1,
    completion_type: habit?.completion_type || 'boolean' as 'boolean' | 'count' | 'duration',
    target_type: habit?.target_type || 'daily' as 'daily' | 'weekly' | 'custom',
    active: habit?.active ?? true,
    reminder_enabled: habit?.reminder_enabled || false,
    reminder_time: habit?.reminder_time || '',
    unit: habit?.unit || '',
    schedule_pattern: habit?.schedule_pattern || 'daily' as SchedulePattern,
    scheduled_days: habit?.scheduled_days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as DayOfWeek[],
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();

  const isEditing = !!habit;
  const isLoading = createHabit.isPending || updateHabit.isPending;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name must be less than 255 characters';
    }

    if (formData.target_value < 1) {
      newErrors.target_value = 'Target value must be at least 1';
    } else if (formData.target_value > 1000) {
      newErrors.target_value = 'Target value must be less than 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const habitData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        category: formData.category as 'health' | 'productivity' | 'personal',
        target_frequency: formData.target_frequency,
        target_value: formData.target_value,
        completion_type: formData.completion_type,
        target_type: formData.target_type,
        reminder_enabled: formData.reminder_enabled,
        reminder_time: formData.reminder_enabled ? formData.reminder_time : undefined,
        unit: formData.completion_type !== 'boolean' ? formData.unit : undefined,
        schedule_pattern: formData.schedule_pattern,
        scheduled_days: formData.scheduled_days,
      };

      if (isEditing) {        await updateHabit.mutateAsync({
          id: habit.id,
          ...habitData,
          active: formData.active,
        });
      } else {
        await createHabit.mutateAsync(habitData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to save habit:', error);
      setErrors({ submit: 'Failed to save habit. Please try again.' });
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean | DayOfWeek[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Habit' : 'Create New Habit'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Input
            label="Name"
            placeholder="Enter habit name..."
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
          />
        </div>

        {/* Description */}
        <div>
          <Textarea
            label="Description"
            placeholder="Add habit description (optional)..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={2}
          />
        </div>

        {/* Category and Target Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {habitCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Type</label>
            <Select
              value={formData.target_type}
              onValueChange={(value) => handleInputChange('target_type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Target Frequency */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Target Frequency (times per {formData.target_type === 'daily' ? 'day' : formData.target_type === 'weekly' ? 'week' : 'period'})
          </label>
          <Select
            value={formData.target_frequency.toString()}
            onValueChange={(value) => 
              handleInputChange('target_frequency', parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} time{num !== 1 ? 's' : ''} per {formData.target_type === 'daily' ? 'day' : formData.target_type === 'weekly' ? 'week' : 'period'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Completion Type and Target Value */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Completion Type</label>
            <Select
              value={formData.completion_type}
              onValueChange={(value) => 
                handleInputChange('completion_type', value as 'boolean' | 'count' | 'duration')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boolean">Yes/No</SelectItem>
                <SelectItem value="count">Count</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.completion_type !== 'boolean' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Target {formData.completion_type === 'count' ? 'Count' : 'Duration (minutes)'}
              </label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={formData.target_value}
                onChange={(e) => handleInputChange('target_value', parseInt(e.target.value) || 1)}
                error={errors.target_value}
              />
            </div>
          )}
        </div>

        {/* Unit (for count/duration types) */}
        {formData.completion_type !== 'boolean' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Unit {formData.completion_type === 'duration' ? '(optional - defaults to minutes)' : '(optional)'}
            </label>
            <Input
              placeholder={formData.completion_type === 'count' ? 'e.g., reps, pages, glasses' : 'e.g., minutes, hours'}
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
            />
          </div>
        )}

        {/* Day-of-Week Scheduling */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium">Schedule</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Schedule Pattern</label>
            <Select
              value={formData.schedule_pattern}
              onValueChange={(value) => {
                const pattern = value as SchedulePattern;
                handleInputChange('schedule_pattern', pattern);
                
                // Auto-select appropriate days based on pattern
                if (pattern === 'daily') {
                  handleInputChange('scheduled_days', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
                } else if (pattern === 'weekdays') {
                  handleInputChange('scheduled_days', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
                } else if (pattern === 'weekends') {
                  handleInputChange('scheduled_days', ['saturday', 'sunday']);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Every Day</SelectItem>
                <SelectItem value="weekdays">Weekdays Only</SelectItem>
                <SelectItem value="weekends">Weekends Only</SelectItem>
                <SelectItem value="custom">Custom Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.schedule_pattern === 'custom' && (
            <div className="space-y-2">
              <DayOfWeekSelector
                selectedDays={formData.scheduled_days}
                onChange={(days) => handleInputChange('scheduled_days', days)}
                label="Select Days"
                description="Choose which days to track this habit"
                showSelectAll={true}
              />
            </div>
          )}
        </div>

        {/* Reminder Settings */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-medium">Reminder Settings</h4>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reminder_enabled"
              checked={formData.reminder_enabled}
              onChange={(e) => handleInputChange('reminder_enabled', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="reminder_enabled" className="text-sm font-medium">
              Enable daily reminder
            </label>
          </div>

          {formData.reminder_enabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Reminder Time</label>
              <Input
                type="time"
                value={formData.reminder_time}
                onChange={(e) => handleInputChange('reminder_time', e.target.value)}
                required={formData.reminder_enabled}
              />
            </div>
          )}
        </div>

        {/* Active Status (for editing only) */}
        {isEditing && (
          <div className="flex items-center space-x-2">            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange('active', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="active" className="text-sm font-medium">
              Active habit
            </label>
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
            isEditing ? 'Update Habit' : 'Create Habit'
          )}
        </Button>
      </div>
    </form>
  );
};