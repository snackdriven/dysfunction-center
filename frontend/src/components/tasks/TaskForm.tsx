import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { DialogHeader, DialogTitle } from '../ui/Dialog';
import { Task, useCreateTask, useUpdateTask, tasksApi, RecurrencePattern } from '../../services/tasks';
import { TaskTagInput } from './TaskTagInput';
import { TaskTimeTracker } from './TaskTimeTracker';
import { SubtaskList } from './SubtaskList';
import { RecurrencePatternForm } from './RecurrencePatternForm';

interface TaskFormProps {
  task?: Task;
  onSuccess?: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, onSuccess }) => {
  const [formData, setFormData] = React.useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium' as 'low' | 'medium' | 'high',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    status: task?.status || 'pending' as 'pending' | 'in_progress' | 'completed',
    category_id: task?.category_id || undefined as number | undefined,
    notes: task?.notes || '',
    estimated_minutes: task?.estimated_minutes || undefined as number | undefined,
    tag_ids: task?.tag_ids || [] as number[],
    recurrence_pattern: task?.recurrence_pattern || undefined,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['task-categories'],
    queryFn: tasksApi.getCategories
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const isEditing = !!task;
  const isLoading = createTask.isPending || updateTask.isPending;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }

    if (formData.due_date && new Date(formData.due_date) < new Date(new Date().setHours(0, 0, 0, 0))) {
      newErrors.due_date = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        due_date: formData.due_date || undefined,
        status: formData.status,
        category_id: formData.category_id,
        notes: formData.notes.trim() || undefined,
        estimated_minutes: formData.estimated_minutes,
        tag_ids: formData.tag_ids.length > 0 ? formData.tag_ids : undefined,
        recurrence_pattern: formData.recurrence_pattern,
      };

      if (isEditing) {
        await updateTask.mutateAsync({
          id: task.id,
          ...taskData,
        });
      } else {
        await createTask.mutateAsync(taskData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to save task:', error);
      setErrors({ submit: 'Failed to save task. Please try again.' });
    }
  };

  const handleInputChange = (field: string, value: string | number | undefined | RecurrencePattern | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <Input
            label="Title"
            placeholder="Enter task title..."
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
            placeholder="Add task description (optional)..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
          />
        </div>

        {/* Priority and Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select
              value={formData.priority}
              onValueChange={(value) => 
                handleInputChange('priority', value as 'low' | 'medium' | 'high')
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) => 
                  handleInputChange('status', value as 'pending' | 'in_progress' | 'completed')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Due Date */}
        <div>
          <Input
            label="Due Date"
            type="date"
            value={formData.due_date}
            onChange={(e) => handleInputChange('due_date', e.target.value)}
            error={errors.due_date}
          />
        </div>

        {/* Category and Estimated Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={formData.category_id?.toString() || ''}
              onValueChange={(value) => 
                handleInputChange('category_id', value ? parseInt(value) : undefined)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.icon}</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Time (minutes)</label>
            <Input
              type="number"
              min="5"
              step="5"
              value={formData.estimated_minutes || ''}
              onChange={(e) => handleInputChange('estimated_minutes', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 30"
            />
          </div>
        </div>

        {/* Tags */}
        <TaskTagInput
          selectedTagIds={formData.tag_ids}
          onTagsChange={(tagIds) => handleInputChange('tag_ids', tagIds)}
        />

        {/* Notes */}
        <div>
          <Textarea
            label="Notes"
            placeholder="Additional notes or details..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={2}
          />
        </div>

        {/* Recurrence Pattern */}
        <RecurrencePatternForm
          pattern={formData.recurrence_pattern}
          onChange={(pattern) => handleInputChange('recurrence_pattern', pattern)}
          startDate={formData.due_date}
        />

        {/* Time Tracking (for editing existing tasks) */}
        {isEditing && (
          <div className="border-t pt-4">
            <TaskTimeTracker
              taskId={task.id}
              estimatedMinutes={formData.estimated_minutes}
            />
          </div>
        )}

        {/* Subtasks (for editing existing tasks) */}
        {isEditing && (
          <div className="border-t pt-4">
            <SubtaskList
              parentTaskId={task.id}
              onSubtaskUpdate={() => {
                // Optionally refresh parent task data or trigger callbacks
              }}
            />
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
            {errors.submit}
          </div>
        )}

        {/* Actions */}
        <div className="sticky-buttons flex justify-end gap-2">
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
              isEditing ? 'Update Task' : 'Create Task'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};