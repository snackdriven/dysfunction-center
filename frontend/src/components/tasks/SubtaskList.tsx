import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Card, CardContent } from '../ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { Plus, GripVertical, CheckCircle, Circle, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Task, useCreateTask, useUpdateTask, useDeleteTask, tasksApi } from '../../services/tasks';
import { TaskForm } from './TaskForm';

interface SubtaskListProps {
  parentTaskId: number;
  onSubtaskUpdate?: () => void;
}

interface CreateSubtaskFormProps {
  parentTaskId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateSubtaskForm: React.FC<CreateSubtaskFormProps> = ({ parentTaskId, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);

  const createTask = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      await createTask.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        parent_task_id: parentTaskId,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create subtask:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Create Subtask</DialogTitle>
      </DialogHeader>

      <div className="space-y-3">
        <Input
          label="Subtask Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter subtask title..."
          required
        />

        <Input
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <Button
                key={p}
                type="button"
                variant={priority === p ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setPriority(p)}
                className="capitalize"
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? 'Creating...' : 'Create Subtask'}
        </Button>
      </div>
    </form>
  );
};

export const SubtaskList: React.FC<SubtaskListProps> = ({ parentTaskId, onSubtaskUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<Task | null>(null);

  const { data: subtasks = [], isLoading, refetch } = useQuery({
    queryKey: ['subtasks', parentTaskId],
    queryFn: () => tasksApi.getTasks({ parent_task_id: parentTaskId }),
  });

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const completedCount = subtasks.filter(task => task.completed).length;
  const totalCount = subtasks.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleToggleComplete = async (subtask: Task) => {
    try {
      await updateTask.mutateAsync({
        id: subtask.id,
        completed: !subtask.completed,
        status: !subtask.completed ? 'completed' : 'pending'
      });
      onSubtaskUpdate?.();
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: number) => {
    if (!window.confirm('Are you sure you want to delete this subtask?')) return;

    try {
      await deleteTask.mutateAsync(subtaskId);
      onSubtaskUpdate?.();
    } catch (error) {
      console.error('Failed to delete subtask:', error);
    }
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch();
    onSubtaskUpdate?.();
  };

  const handleEditSuccess = () => {
    setEditingSubtask(null);
    refetch();
    onSubtaskUpdate?.();
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        {[1, 2].map(i => (
          <div key={i} className="flex items-center gap-2 p-2 border rounded">
            <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Subtask Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Subtasks ({completedCount}/{totalCount})
        </button>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-3 w-3 mr-1" />
              Add Subtask
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateSubtaskForm
              parentTaskId={parentTaskId}
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="space-y-1">
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{completedCount} completed</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      )}

      {/* Subtasks List */}
      {isExpanded && (
        <div className="space-y-2">
          {subtasks.length === 0 ? (
            <div className="text-center py-4 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded">
              No subtasks yet. Create your first subtask to break down this task.
            </div>
          ) : (
            subtasks.map((subtask, index) => (
              <Card key={subtask.id} className="relative">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {/* Drag Handle */}
                    <div className="flex items-center">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                    </div>

                    {/* Completion Toggle */}
                    <button
                      onClick={() => handleToggleComplete(subtask)}
                      className="mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {subtask.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>

                    {/* Subtask Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            subtask.completed ? 'line-through text-gray-500' : ''
                          }`}>
                            {subtask.title}
                          </h4>
                          {subtask.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {subtask.description}
                            </p>
                          )}
                          
                          {/* Metadata */}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={
                                subtask.priority === 'high' ? 'destructive' : 
                                subtask.priority === 'medium' ? 'default' : 
                                'secondary'
                              }
                              className="text-xs px-1.5 py-0.5"
                            >
                              {subtask.priority}
                            </Badge>
                            
                            {subtask.due_date && (
                              <span className="text-xs text-gray-500">
                                Due: {new Date(subtask.due_date).toLocaleDateString()}
                              </span>
                            )}

                            {subtask.estimated_minutes && (
                              <span className="text-xs text-gray-500">
                                ~{Math.floor(subtask.estimated_minutes / 60)}h {subtask.estimated_minutes % 60}m
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingSubtask(subtask)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSubtask(subtask.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Subtask Dialog */}
      <Dialog open={!!editingSubtask} onOpenChange={() => setEditingSubtask(null)}>
        <DialogContent>
          {editingSubtask && (
            <TaskForm
              task={editingSubtask}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};