import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { 
  CheckCircle, 
  Circle, 
  X, 
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi, Task, TaskTag } from '../../services/tasks';

interface BulkTaskOperationsProps {
  selectedTaskIds: number[];
  tasks: Task[];
  onClearSelection: () => void;
  onSelectionChange: (taskIds: number[]) => void;
}

type BulkAction = 'complete' | 'incomplete' | 'delete' | 'assign_category' | 'assign_tags';

interface BulkActionConfig {
  action: BulkAction;
  categoryId?: number;
  tagIds?: number[];
}

export const BulkTaskOperations: React.FC<BulkTaskOperationsProps> = ({
  selectedTaskIds,
  tasks,
  onClearSelection,
  onSelectionChange
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionConfig, setActionConfig] = useState<BulkActionConfig>({ action: 'complete' });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['task-categories'],
    queryFn: tasksApi.getCategories
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['task-tags'],
    queryFn: () => tasksApi.getTags()
  });

  const bulkOperation = useMutation({
    mutationFn: async (config: BulkActionConfig) => {
      // Since we don't have a bulk API endpoint yet, we'll do individual operations
      const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));
      const promises = selectedTasks.map(task => {
        switch (config.action) {
          case 'complete':
            return tasksApi.updateTask({ id: task.id, completed: true, status: 'completed' });
          case 'incomplete':
            return tasksApi.updateTask({ id: task.id, completed: false, status: 'pending' });
          case 'delete':
            return tasksApi.deleteTask(task.id);
          case 'assign_category':
            return tasksApi.updateTask({ id: task.id, category_id: config.categoryId });
          case 'assign_tags':
            return tasksApi.updateTask({ id: task.id, tag_ids: config.tagIds });
          default:
            throw new Error(`Unknown action: ${config.action}`);
        }
      });
      
      await Promise.all(promises);
      return { affected_count: selectedTaskIds.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      onClearSelection();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error('Bulk operation failed:', error);
    }
  });

  const selectedTasks = tasks.filter(task => selectedTaskIds.includes(task.id));
  const completedCount = selectedTasks.filter(task => task.completed).length;
  const incompleteCount = selectedTasks.length - completedCount;

  const handleExecuteAction = () => {
    let finalConfig = { ...actionConfig };
    
    if (actionConfig.action === 'assign_category') {
      finalConfig.categoryId = selectedCategoryId;
    } else if (actionConfig.action === 'assign_tags') {
      finalConfig.tagIds = selectedTagIds;
    }
    
    bulkOperation.mutate(finalConfig);
  };

  const getActionDescription = () => {
    const count = selectedTaskIds.length;
    switch (actionConfig.action) {
      case 'complete':
        return `Mark ${count} task${count !== 1 ? 's' : ''} as completed`;
      case 'incomplete':
        return `Mark ${count} task${count !== 1 ? 's' : ''} as incomplete`;
      case 'delete':
        return `Delete ${count} task${count !== 1 ? 's' : ''} permanently`;
      case 'assign_category':
        const category = categories.find(c => c.id === selectedCategoryId);
        return `Assign ${count} task${count !== 1 ? 's' : ''} to category "${category?.name || 'Unknown'}"`;
      case 'assign_tags':
        const selectedTagNames = (tags as TaskTag[]).filter(t => selectedTagIds.includes(t.id)).map(t => t.name);
        return `Add tags "${selectedTagNames.join(', ')}" to ${count} task${count !== 1 ? 's' : ''}`;
      default:
        return '';
    }
  };

  const canExecuteAction = () => {
    if (selectedTaskIds.length === 0) return false;
    
    switch (actionConfig.action) {
      case 'complete':
        return incompleteCount > 0;
      case 'incomplete':
        return completedCount > 0;
      case 'assign_category':
        return selectedCategoryId !== undefined;
      case 'assign_tags':
        return selectedTagIds.length > 0;
      case 'delete':
        return true;
      default:
        return false;
    }
  };

  if (selectedTaskIds.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-background border border-border rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="default" className="px-3 py-1">
                {selectedTaskIds.length} task{selectedTaskIds.length !== 1 ? 's' : ''} selected
              </Badge>
              
              <div className="text-sm text-muted-foreground">
                {completedCount > 0 && <span>{completedCount} completed</span>}
                {completedCount > 0 && incompleteCount > 0 && <span>, </span>}
                {incompleteCount > 0 && <span>{incompleteCount} incomplete</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              {incompleteCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActionConfig({ action: 'complete' });
                    bulkOperation.mutate({ action: 'complete' });
                  }}
                  disabled={bulkOperation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
              
              {completedCount > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActionConfig({ action: 'incomplete' });
                    bulkOperation.mutate({ action: 'incomplete' });
                  }}
                  disabled={bulkOperation.isPending}
                >
                  <Circle className="h-4 w-4 mr-1" />
                  Reopen
                </Button>
              )}

              {/* More Actions Dialog */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    More Actions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Bulk Actions</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Action</label>
                      <Select 
                        value={actionConfig.action} 
                        onValueChange={(value: string) => setActionConfig({ action: value as BulkAction })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {incompleteCount > 0 && (
                            <SelectItem value="complete">Mark as Complete</SelectItem>
                          )}
                          {completedCount > 0 && (
                            <SelectItem value="incomplete">Mark as Incomplete</SelectItem>
                          )}
                          <SelectItem value="assign_category">Assign Category</SelectItem>
                          <SelectItem value="assign_tags">Add Tags</SelectItem>
                          <SelectItem value="delete">Delete Tasks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category Selection */}
                    {actionConfig.action === 'assign_category' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select 
                          value={selectedCategoryId?.toString() || ''} 
                          onValueChange={(value) => setSelectedCategoryId(value ? parseInt(value) : undefined)}
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
                    )}

                    {/* Tag Selection */}
                    {actionConfig.action === 'assign_tags' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <div className="space-y-2">
                          {(tags as TaskTag[]).map((tag) => (
                            <div key={tag.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`tag-${tag.id}`}
                                checked={selectedTagIds.includes(tag.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTagIds([...selectedTagIds, tag.id]);
                                  } else {
                                    setSelectedTagIds(selectedTagIds.filter(id => id !== tag.id));
                                  }
                                }}
                                className="rounded border-gray-300"
                              />
                              <label htmlFor={`tag-${tag.id}`} className="text-sm">
                                {tag.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warning for destructive actions */}
                    {actionConfig.action === 'delete' && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            This action cannot be undone
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Preview */}
                    <div className="text-sm text-muted-foreground">
                      {getActionDescription()}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={bulkOperation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleExecuteAction}
                        disabled={!canExecuteAction() || bulkOperation.isPending}
                        variant={actionConfig.action === 'delete' ? 'destructive' : 'primary'}
                      >
                        {bulkOperation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Execute'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                size="sm"
                variant="ghost"
                onClick={onClearSelection}
                disabled={bulkOperation.isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};