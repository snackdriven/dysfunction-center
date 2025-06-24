import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit, 
  BarChart3, 
  TrendingUp, 
  Activity,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { moodApi, useCreateTrigger, useDeleteTrigger } from '../../services/mood';

interface TriggerManagerProps {
  selectedTriggerIds?: number[];
  onTriggersChange?: (triggerIds: number[]) => void;
  showSelection?: boolean;
}

export const TriggerManager: React.FC<TriggerManagerProps> = ({
  selectedTriggerIds = [],
  onTriggersChange,
  showSelection = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<any>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const [newTrigger, setNewTrigger] = useState({
    name: '',
    category: '' as 'work' | 'personal' | 'health' | 'social' | '',
    icon: '',
    description: ''
  });

  const { data: triggers = [] } = useQuery({
    queryKey: ['mood-triggers', categoryFilter],
    queryFn: () => moodApi.getTriggers(categoryFilter || undefined)
  });

  // const { data: triggerAnalytics } = useQuery({
  //   queryKey: ['mood-triggers', 'analytics'],
  //   queryFn: () => moodApi.getTriggerAnalytics(),
  //   enabled: showAnalytics
  // });

  const createTrigger = useCreateTrigger();
  // const updateTrigger = useUpdateTrigger(); // Not implemented yet
  const deleteTrigger = useDeleteTrigger();

  const filteredTriggers = triggers.filter(trigger => 
    trigger.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.name.trim()) return;

    try {
      const trigger = await createTrigger.mutateAsync({
        name: newTrigger.name,
        category: newTrigger.category || undefined,
        icon: newTrigger.icon || undefined
      });

      if (showSelection && onTriggersChange) {
        onTriggersChange([...selectedTriggerIds, trigger.id]);
      }

      setNewTrigger({ name: '', category: '', icon: '', description: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create trigger:', error);
    }
  };

  const handleUpdateTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrigger || !editingTrigger.name.trim()) return;

    try {
      // TODO: Implement updateTrigger functionality
      console.log('Update trigger:', editingTrigger);

      setEditingTrigger(null);
    } catch (error) {
      console.error('Failed to update trigger:', error);
    }
  };

  const handleDeleteTrigger = async (triggerId: number) => {
    if (window.confirm('Are you sure you want to delete this trigger? This will also remove it from all mood entries.')) {
      try {
        await deleteTrigger.mutateAsync(triggerId);
        
        if (showSelection && onTriggersChange && selectedTriggerIds.includes(triggerId)) {
          onTriggersChange(selectedTriggerIds.filter(id => id !== triggerId));
        }
      } catch (error) {
        console.error('Failed to delete trigger:', error);
      }
    }
  };

  const handleTriggerToggle = (triggerId: number) => {
    if (!showSelection || !onTriggersChange) return;

    if (selectedTriggerIds.includes(triggerId)) {
      onTriggersChange(selectedTriggerIds.filter(id => id !== triggerId));
    } else {
      onTriggersChange([...selectedTriggerIds, triggerId]);
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

  const categoryStats = React.useMemo(() => {
    const stats = triggers.reduce((acc, trigger) => {
      const category = trigger.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, usage: 0 };
      }
      acc[category].count++;
      acc[category].usage += 0;
      return acc;
    }, {} as Record<string, { count: number; usage: number }>);

    return Object.entries(stats)
      .map(([category, data]) => ({
        category,
        count: data.count,
        usage: data.usage,
        avgUsage: data.usage / data.count
      }))
      .sort((a, b) => b.usage - a.usage);
  }, [triggers]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Trigger Management
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage mood triggers and view analytics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Analytics
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Trigger
          </Button>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{triggers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Most Used</CardTitle>
            </CardHeader>
            <CardContent>
              {triggers.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span>{triggers[0]?.icon || getCategoryIcon(triggers[0]?.category)}</span>
                  <span className="font-medium text-sm truncate">
                    {triggers[0]?.name || 'Unknown'}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground">None yet</span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryStats.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Category Breakdown */}
      {showAnalytics && categoryStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryStats.map(({ category, count, usage, avgUsage }) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>{getCategoryIcon(category)}</span>
                    <div>
                      <span className="font-medium capitalize">{category}</span>
                      <div className="text-xs text-muted-foreground">
                        {count} trigger{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{usage}</div>
                      <div className="text-xs text-muted-foreground">total uses</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{avgUsage.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">avg/trigger</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search triggers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
      </div>

      {/* Triggers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTriggers.map((trigger) => (
          <Card
            key={trigger.id}
            className={`transition-all hover:shadow-md ${
              showSelection && selectedTriggerIds.includes(trigger.id) 
                ? 'ring-2 ring-primary' 
                : ''
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{trigger.icon || getCategoryIcon(trigger.category)}</span>
                  <div>
                    <h4 className="font-medium">{trigger.name}</h4>
                    {trigger.category && (
                      <Badge variant="outline" className="text-xs mt-1">
                        {trigger.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {showSelection && (
                    <Button
                      size="sm"
                      variant={selectedTriggerIds.includes(trigger.id) ? "primary" : "outline"}
                      onClick={() => handleTriggerToggle(trigger.id)}
                    >
                      {selectedTriggerIds.includes(trigger.id) ? 'Selected' : 'Select'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingTrigger(trigger)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTrigger(trigger.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Category: {trigger.category || 'None'}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTriggers.length === 0 && (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm || categoryFilter ? 'No triggers match your filters' : 'No triggers created yet'}
          </p>
        </div>
      )}

      {/* Create Trigger Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Trigger</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTrigger} className="space-y-4">
            <Input
              label="Name"
              placeholder="Enter trigger name"
              value={newTrigger.name}
              onChange={(e) => setNewTrigger(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <Input
              label="Description (Optional)"
              placeholder="Describe this trigger"
              value={newTrigger.description}
              onChange={(e) => setNewTrigger(prev => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newTrigger.category}
                  onValueChange={(value) => setNewTrigger(prev => ({ ...prev, category: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">💼 Work</SelectItem>
                    <SelectItem value="personal">🏠 Personal</SelectItem>
                    <SelectItem value="health">🏥 Health</SelectItem>
                    <SelectItem value="social">👥 Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input
                label="Icon (Optional)"
                placeholder="Emoji"
                value={newTrigger.icon}
                onChange={(e) => setNewTrigger(prev => ({ ...prev, icon: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTrigger.isPending || !newTrigger.name.trim()}>
                Create Trigger
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Trigger Dialog */}
      <Dialog open={!!editingTrigger} onOpenChange={() => setEditingTrigger(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Trigger</DialogTitle>
          </DialogHeader>
          {editingTrigger && (
            <form onSubmit={handleUpdateTrigger} className="space-y-4">
              <Input
                label="Name"
                placeholder="Enter trigger name"
                value={editingTrigger.name}
                onChange={(e) => setEditingTrigger((prev: any) => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                label="Description (Optional)"
                placeholder="Describe this trigger"
                value={editingTrigger.description || ''}
                onChange={(e) => setEditingTrigger((prev: any) => ({ ...prev, description: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={editingTrigger.category || ''}
                    onValueChange={(value) => setEditingTrigger((prev: any) => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No category</SelectItem>
                      <SelectItem value="work">💼 Work</SelectItem>
                      <SelectItem value="personal">🏠 Personal</SelectItem>
                      <SelectItem value="health">🏥 Health</SelectItem>
                      <SelectItem value="social">👥 Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  label="Icon (Optional)"
                  placeholder="Emoji"
                  value={editingTrigger.icon || ''}
                  onChange={(e) => setEditingTrigger((prev: any) => ({ ...prev, icon: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingTrigger(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!editingTrigger.name.trim()}>
                  Update Trigger
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};