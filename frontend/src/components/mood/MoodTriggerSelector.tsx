import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { moodApi, MoodTrigger, useCreateTrigger, useDeleteTrigger } from '../../services/mood';
import { Plus, X, AlertTriangle, Settings, Trash2 } from 'lucide-react';

interface MoodTriggerSelectorProps {
  selectedTriggerIds: number[];
  onTriggersChange: (triggerIds: number[]) => void;
}

export const MoodTriggerSelector: React.FC<MoodTriggerSelectorProps> = ({
  selectedTriggerIds,
  onTriggersChange
}) => {
  const [showManagement, setShowManagement] = React.useState(false);
  const [newTrigger, setNewTrigger] = React.useState({
    name: '',
    category: '' as 'work' | 'personal' | 'health' | 'social' | '',
    icon: ''
  });
  const [categoryFilter, setCategoryFilter] = React.useState<string>('');

  const { data: triggers = [] } = useQuery({
    queryKey: ['mood-triggers', categoryFilter],
    queryFn: () => moodApi.getTriggers(categoryFilter || undefined)
  });

  const createTrigger = useCreateTrigger();
  const deleteTrigger = useDeleteTrigger();

  const selectedTriggers = triggers.filter(t => selectedTriggerIds.includes(t.id));
  const availableTriggers = triggers.filter(t => !selectedTriggerIds.includes(t.id));

  const handleTriggerToggle = (triggerId: number) => {
    if (selectedTriggerIds.includes(triggerId)) {
      onTriggersChange(selectedTriggerIds.filter(id => id !== triggerId));
    } else {
      onTriggersChange([...selectedTriggerIds, triggerId]);
    }
  };

  const handleCreateTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.name.trim()) return;

    try {
      const trigger = await createTrigger.mutateAsync({
        name: newTrigger.name,
        category: newTrigger.category || undefined,
        icon: newTrigger.icon || undefined
      });
      
      // Auto-select the new trigger
      onTriggersChange([...selectedTriggerIds, trigger.id]);
      
      setNewTrigger({ name: '', category: '', icon: '' });
    } catch (error) {
      console.error('Failed to create trigger:', error);
    }
  };

  const handleDeleteTrigger = async (triggerId: number) => {
    if (window.confirm('Are you sure you want to delete this trigger?')) {
      try {
        await deleteTrigger.mutateAsync(triggerId);
        // Remove from selected if it was selected
        if (selectedTriggerIds.includes(triggerId)) {
          onTriggersChange(selectedTriggerIds.filter(id => id !== triggerId));
        }
      } catch (error) {
        console.error('Failed to delete trigger:', error);
      }
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '🏠';
      case 'health': return '🏥';
      case 'social': return '👥';
      default: return '⚡';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'work': return 'border-blue-200 bg-blue-50';
      case 'personal': return 'border-green-200 bg-green-50';
      case 'health': return 'border-red-200 bg-red-50';
      case 'social': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Mood Triggers (optional)
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowManagement(true)}
        >
          <Settings className="h-4 w-4 mr-1" />
          Manage
        </Button>
      </div>

      {/* Selected Triggers */}
      {selectedTriggers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTriggers.map((trigger) => (
            <Badge
              key={trigger.id}
              variant="secondary"
              className={`flex items-center gap-1 ${getCategoryColor(trigger.category)}`}
            >
              <span>{trigger.icon || getCategoryIcon(trigger.category)}</span>
              {trigger.name}
              <button
                type="button"
                onClick={() => handleTriggerToggle(trigger.id)}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Available Triggers */}
      {availableTriggers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Click to add:</p>
          <div className="flex flex-wrap gap-2">
            {availableTriggers.slice(0, 8).map((trigger) => (
              <button
                key={trigger.id}
                type="button"
                onClick={() => handleTriggerToggle(trigger.id)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors hover:bg-opacity-80 ${getCategoryColor(trigger.category)}`}
              >
                <span className="mr-1">{trigger.icon || getCategoryIcon(trigger.category)}</span>
                {trigger.name}
              </button>
            ))}
            {availableTriggers.length > 8 && (
              <button
                type="button"
                onClick={() => setShowManagement(true)}
                className="text-xs px-3 py-1 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                +{availableTriggers.length - 8} more
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Add */}
      <form onSubmit={handleCreateTrigger} className="flex gap-2">
        <Input
          placeholder="Add new trigger..."
          value={newTrigger.name}
          onChange={(e) => setNewTrigger(prev => ({ ...prev, name: e.target.value }))}
          className="flex-1"
        />
        <Button
          type="submit"
          size="sm"
          disabled={createTrigger.isPending || !newTrigger.name.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Management Dialog */}
      <Dialog open={showManagement} onOpenChange={setShowManagement}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Mood Triggers</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                <SelectItem value="work">💼 Work</SelectItem>
                <SelectItem value="personal">🏠 Personal</SelectItem>
                <SelectItem value="health">🏥 Health</SelectItem>
                <SelectItem value="social">👥 Social</SelectItem>
              </SelectContent>
            </Select>

            {/* Create New Trigger */}
            <form onSubmit={handleCreateTrigger} className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium">Create New Trigger</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  placeholder="Trigger name"
                  value={newTrigger.name}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
                <Select
                  value={newTrigger.category}
                  onValueChange={(value) => setNewTrigger(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">💼 Work</SelectItem>
                    <SelectItem value="personal">🏠 Personal</SelectItem>
                    <SelectItem value="health">🏥 Health</SelectItem>
                    <SelectItem value="social">👥 Social</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Icon (emoji)"
                    value={newTrigger.icon}
                    onChange={(e) => setNewTrigger(prev => ({ ...prev, icon: e.target.value }))}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={createTrigger.isPending || !newTrigger.name.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </form>

            {/* Triggers List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {triggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className={`flex items-center justify-between p-3 border rounded ${getCategoryColor(trigger.category)}`}
                >
                  <div className="flex items-center gap-3">
                    <span>{trigger.icon || getCategoryIcon(trigger.category)}</span>
                    <span className="font-medium">{trigger.name}</span>
                    {trigger.category && (
                      <Badge variant="outline" className="text-xs">
                        {trigger.category}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={selectedTriggerIds.includes(trigger.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTriggerToggle(trigger.id)}
                    >
                      {selectedTriggerIds.includes(trigger.id) ? 'Selected' : 'Select'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTrigger(trigger.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {triggers.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No triggers found. Create your first trigger above.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};