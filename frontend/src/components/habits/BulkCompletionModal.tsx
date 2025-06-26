import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { Habit, useLogMultipleCompletions } from '../../services/habits';

interface BulkCompletionEntry {
  id: string;
  completion_value: number;
  notes: string;
  completion_time: string;
}

interface BulkCompletionModalProps {
  habit: Habit;
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
}

export const BulkCompletionModal: React.FC<BulkCompletionModalProps> = ({
  habit,
  isOpen,
  onClose,
  selectedDate
}) => {
  const [entries, setEntries] = useState<BulkCompletionEntry[]>([
    { id: '1', completion_value: 1, notes: '', completion_time: '09:00' }
  ]);
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);

  const logMultipleCompletions = useLogMultipleCompletions();

  const addEntry = () => {
    const newEntry: BulkCompletionEntry = {
      id: Date.now().toString(),
      completion_value: 1,
      notes: '',
      completion_time: '12:00'
    };
    setEntries([...entries, newEntry]);
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  const updateEntry = (id: string, field: keyof BulkCompletionEntry, value: string | number) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleSubmit = async () => {
    try {
      const completions = entries.map(entry => ({
        completion_value: entry.completion_value,
        notes: entry.notes,
        completion_timestamp: `${date}T${entry.completion_time}:00.000Z`,
      }));

      await logMultipleCompletions.mutateAsync({
        habitId: habit.id,
        completions,
        date
      });
      onClose();
    } catch (error) {
      console.error('Failed to log bulk completions:', error);
    }
  };

  const totalValue = entries.reduce((sum, entry) => sum + entry.completion_value, 0);
  const progressPercentage = Math.min((totalValue / (habit.target_value || 1)) * 100, 100);

  const formatUnit = (value: number) => {
    if (habit.completion_type === 'duration') {
      const hours = Math.floor(value / 60);
      const mins = value % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    return habit.unit ? `${value} ${habit.unit}` : value.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Bulk Log: {habit.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-48"
            />
          </div>

          {/* Progress Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Total Progress</span>
              <Badge variant={totalValue >= (habit.target_value || 1) ? 'default' : 'secondary'}>
                {formatUnit(totalValue)} / {formatUnit(habit.target_value || 1)}
              </Badge>
            </div>
            <div className="w-full bg-background rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Completion Entries */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Completion Entries</h4>
              <Button onClick={addEntry} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>

            {entries.map((entry, index) => (
              <div key={entry.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Entry #{index + 1}</span>
                  {entries.length > 1 && (
                    <Button
                      onClick={() => removeEntry(entry.id)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {habit.completion_type === 'count' ? 'Count' : 
                       habit.completion_type === 'duration' ? 'Duration (minutes)' : 'Value'}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={entry.completion_value}
                      onChange={(e) => updateEntry(entry.id, 'completion_value', parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Time
                    </label>
                    <Input
                      type="time"
                      value={entry.completion_time}
                      onChange={(e) => updateEntry(entry.id, 'completion_time', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Textarea
                    placeholder="Add notes about this completion..."
                    value={entry.notes}
                    onChange={(e) => updateEntry(entry.id, 'notes', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={logMultipleCompletions.isPending}
            >
              {logMultipleCompletions.isPending ? 'Logging...' : `Log ${entries.length} Completion${entries.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
