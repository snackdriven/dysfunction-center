import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Slider } from '../ui/Slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { DialogHeader, DialogTitle } from '../ui/Dialog';
import { MoodEntry, useCreateMoodEntry, useUpdateMoodEntry, ContextTags } from '../../services/mood';
import { MoodTriggerSelector } from './MoodTriggerSelector';
import { MoodContextTags } from './MoodContextTags';

interface MoodEntryFormProps {
  entry?: MoodEntry;
  onSuccess?: () => void;
}

const moodEmojis = ['😢', '😔', '😐', '🙂', '😊'];
const moodLabels = ['Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];

const secondaryMoods = [
  'Anxious', 'Excited', 'Frustrated', 'Grateful', 'Hopeful', 'Lonely', 
  'Motivated', 'Overwhelmed', 'Peaceful', 'Restless', 'Satisfied', 'Worried'
];

export const MoodEntryForm: React.FC<MoodEntryFormProps> = ({ entry, onSuccess }) => {
  const [formData, setFormData] = useState({
    mood_score: entry?.mood_score || 3,
    energy_level: entry?.energy_level || 3,
    stress_level: entry?.stress_level || 3,
    secondary_mood: entry?.secondary_mood || '',
    notes: entry?.notes || '',
    weather: entry?.weather || '',
    trigger_ids: entry?.triggers?.map(t => t.id) || [] as number[],
    context_tags: entry?.context_tags || { activities: [], people: [], locations: [] } as ContextTags,
    entry_date: entry?.entry_date || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMoodEntry = useCreateMoodEntry();
  const updateMoodEntry = useUpdateMoodEntry();

  const isEditing = !!entry;
  const isLoading = createMoodEntry.isPending || updateMoodEntry.isPending;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.mood_score < 1 || formData.mood_score > 5) {
      newErrors.mood_score = 'Mood score must be between 1 and 5';
    }

    if (formData.energy_level && (formData.energy_level < 1 || formData.energy_level > 5)) {
      newErrors.energy_level = 'Energy level must be between 1 and 5';
    }

    if (formData.stress_level && (formData.stress_level < 1 || formData.stress_level > 5)) {
      newErrors.stress_level = 'Stress level must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;    try {
      const entryData = {
        mood_score: formData.mood_score,
        energy_level: formData.energy_level || undefined,
        stress_level: formData.stress_level || undefined,
        secondary_mood: formData.secondary_mood || undefined,
        notes: formData.notes || undefined,
        weather: formData.weather || undefined,
        trigger_ids: formData.trigger_ids.length > 0 ? formData.trigger_ids : undefined,
        context_tags: Object.values(formData.context_tags).some(arr => arr && arr.length > 0) ? formData.context_tags : undefined,
        entry_date: formData.entry_date,
      };

      if (isEditing) {
        await updateMoodEntry.mutateAsync({
          id: entry.id,
          ...entryData,
        });
      } else {
        await createMoodEntry.mutateAsync(entryData);
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to save mood entry:', error);
      setErrors({ submit: 'Failed to save mood entry. Please try again.' });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Edit Mood Entry' : 'Add New Mood Entry'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Date */}
        <div>
          <Input
            label="Date"
            type="date"            value={formData.entry_date}
            onChange={(e) => handleInputChange('entry_date', e.target.value)}
            required
          />
        </div>

        {/* Primary Mood */}
        <div className="space-y-3">
          <label className="text-sm font-medium">How are you feeling?</label>
          <div className="text-center">
            <div className="text-6xl mb-2">
              {moodEmojis[formData.mood_score - 1]}
            </div>
            <p className="text-lg font-medium mb-4">
              {moodLabels[formData.mood_score - 1]}
            </p>
            <Slider
              value={[formData.mood_score]}
              onValueChange={(value) => handleInputChange('mood_score', value[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Very Low</span>
              <span>Low</span>
              <span>Neutral</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
          {errors.mood_score && (
            <p className="text-sm text-red-600">{errors.mood_score}</p>
          )}
        </div>

        {/* Secondary Mood */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Secondary feeling (optional)</label>
          <Select
            value={formData.secondary_mood}
            onValueChange={(value) => handleInputChange('secondary_mood', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a secondary mood" />
            </SelectTrigger>
            <SelectContent>
              {secondaryMoods.map((mood) => (
                <SelectItem key={mood} value={mood}>
                  {mood}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Energy and Stress Levels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Energy Level</label>
            <Slider
              value={[formData.energy_level]}
              onValueChange={(value) => handleInputChange('energy_level', value[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>3</span>
              <span>5</span>
            </div>
            {errors.energy_level && (
              <p className="text-sm text-red-600">{errors.energy_level}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stress Level</label>
            <Slider
              value={[formData.stress_level]}
              onValueChange={(value) => handleInputChange('stress_level', value[0])}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>3</span>
              <span>5</span>
            </div>
            {errors.stress_level && (
              <p className="text-sm text-red-600">{errors.stress_level}</p>
            )}
          </div>
        </div>        {/* Weather */}
        <div>
          <Select
            value={formData.weather}
            onValueChange={(value) => handleInputChange('weather', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Weather (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No weather info</SelectItem>
              <SelectItem value="sunny">☀️ Sunny</SelectItem>
              <SelectItem value="cloudy">☁️ Cloudy</SelectItem>
              <SelectItem value="rainy">🌧️ Rainy</SelectItem>
              <SelectItem value="snowy">❄️ Snowy</SelectItem>
              <SelectItem value="stormy">⛈️ Stormy</SelectItem>
              <SelectItem value="foggy">🌫️ Foggy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mood Triggers */}
        <MoodTriggerSelector
          selectedTriggerIds={formData.trigger_ids}
          onTriggersChange={(triggerIds) => handleInputChange('trigger_ids', triggerIds)}
        />

        {/* Context Tags */}
        <MoodContextTags
          contextTags={formData.context_tags}
          onContextChange={(contextTags) => handleInputChange('context_tags', contextTags)}
        />

        {/* Notes */}
        <div>
          <Textarea
            label="Notes (optional)"
            placeholder="Add any additional thoughts or details..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

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
              {isEditing ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            isEditing ? 'Update Entry' : 'Save Entry'
          )}
        </Button>
      </div>
    </form>
  );
};