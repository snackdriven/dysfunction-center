import React, { useState } from 'react';
import { JournalEntry, JournalTemplate, CreateJournalEntryRequest, UpdateJournalEntryRequest } from '../../services/journal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MarkdownEditor } from '../ui/MarkdownEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select'; 
import { Badge } from '../ui/Badge';

interface JournalEntryFormProps {
  entry?: JournalEntry;
  template?: JournalTemplate;
  onSubmit: (data: CreateJournalEntryRequest | UpdateJournalEntryRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  entry,
  template,
  onSubmit,
  onCancel,
  isLoading = false
}) => {  const [formData, setFormData] = useState({
    title: entry?.title || '',
    content: entry?.content || '',
    mood_reference: entry?.mood_reference || undefined,
    tags: (entry && Array.isArray(entry.tags)) ? entry.tags : [],
    privacy_level: entry?.privacy_level || 'private' as const,
    productivity_score: entry?.productivity_score || undefined,
    related_tasks: (entry && Array.isArray(entry.related_tasks)) ? entry.related_tasks : [],
    related_habits: (entry && Array.isArray(entry.related_habits)) ? entry.related_habits : []
  });

  const [newTag, setNewTag] = useState('');
  const [newTaskId, setNewTaskId] = useState('');
  const [newHabitId, setNewHabitId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      tags: formData.tags,
      related_tasks: formData.related_tasks?.filter(id => id > 0),
      related_habits: formData.related_habits?.filter(id => id > 0)
    };

    if (entry) {
      onSubmit(submitData as UpdateJournalEntryRequest);
    } else {
      onSubmit(submitData as CreateJournalEntryRequest);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  const addRelatedTask = () => {
    const taskId = parseInt(newTaskId);
    if (taskId > 0 && !formData.related_tasks?.includes(taskId)) {
      setFormData(prev => ({
        ...prev,
        related_tasks: [...(prev.related_tasks || []), taskId]
      }));
      setNewTaskId('');
    }
  };

  const addRelatedHabit = () => {
    const habitId = parseInt(newHabitId);
    if (habitId > 0 && !formData.related_habits?.includes(habitId)) {
      setFormData(prev => ({
        ...prev,
        related_habits: [...(prev.related_habits || []), habitId]
      }));
      setNewHabitId('');
    }
  };

  const removeRelatedTask = (taskId: number) => {
    setFormData(prev => ({
      ...prev,
      related_tasks: prev.related_tasks?.filter(id => id !== taskId)
    }));
  };

  const removeRelatedHabit = (habitId: number) => {
    setFormData(prev => ({
      ...prev,
      related_habits: prev.related_habits?.filter(id => id !== habitId)
    }));
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <Input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter journal entry title..."
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content
            <span className="text-xs text-gray-500 ml-2">
              (Supports Markdown formatting)
            </span>
          </label>
          <MarkdownEditor
            id="content"
            value={formData.content}
            onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
            placeholder="Write your journal entry using markdown formatting..."
            height={400}
            maxLength={50000}
            showCharacterCount={true}
            autoFocus={!entry} // Auto-focus for new entries
            required
            aria-label="Journal entry content editor"
            aria-describedby="content-help"
          />
          <div id="content-help" className="sr-only">
            Rich markdown editor for writing journal entries. Use the toolbar buttons or keyboard shortcuts for formatting.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
              Mood (1-5)
            </label>
            <Select
              value={formData.mood_reference?.toString() || ''}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                mood_reference: value ? parseInt(value) : undefined 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select mood..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                <SelectItem value="1">1 - Terrible</SelectItem>
                <SelectItem value="2">2 - Bad</SelectItem>
                <SelectItem value="3">3 - Okay</SelectItem>
                <SelectItem value="4">4 - Good</SelectItem>
                <SelectItem value="5">5 - Great</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="privacy" className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Level
            </label>
            <Select
              value={formData.privacy_level}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                privacy_level: value as 'private' | 'shared' | 'public'
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="shared">Shared</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="productivity" className="block text-sm font-medium text-gray-700 mb-2">
              Productivity Score (1-10)
            </label>
            <Input
              id="productivity"
              type="number"
              min="1"
              max="10"
              value={formData.productivity_score || ''}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                productivity_score: e.target.value ? parseInt(e.target.value) : undefined 
              }))}
              placeholder="Rate your productivity..."
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add a tag..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add Tag
            </Button>
          </div>          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag: string, index: number) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="cursor-pointer"
                onClick={() => removeTag(tag)}
              >
                #{tag} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Related Tasks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Tasks
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              type="number"
              value={newTaskId}
              onChange={(e) => setNewTaskId(e.target.value)}
              placeholder="Task ID..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelatedTask())}
            />
            <Button type="button" onClick={addRelatedTask} variant="outline">
              Add Task
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.related_tasks?.map((taskId, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="cursor-pointer"
                onClick={() => removeRelatedTask(taskId)}
              >
                Task #{taskId} ×
              </Badge>
            ))}
          </div>
        </div>

        {/* Related Habits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Habits
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              type="number"
              value={newHabitId}
              onChange={(e) => setNewHabitId(e.target.value)}
              placeholder="Habit ID..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRelatedHabit())}
            />
            <Button type="button" onClick={addRelatedHabit} variant="outline">
              Add Habit
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.related_habits?.map((habitId, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="cursor-pointer"
                onClick={() => removeRelatedHabit(habitId)}
              >
                Habit #{habitId} ×
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (entry ? 'Update Entry' : 'Create Entry')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};
