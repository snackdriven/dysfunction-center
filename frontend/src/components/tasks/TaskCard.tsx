import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, Circle, Calendar, Edit, Trash2, Clock, Tag, MoreHorizontal, Timer, FolderOpen, PlayCircle, FileText, Repeat } from 'lucide-react';
import { Task, useUpdateTask, useDeleteTask, tasksApi } from '../../services/tasks';
import { TaskForm } from './TaskForm';
import { TaskTimeTracker } from './TaskTimeTracker';
import { SubtaskList } from './SubtaskList';
import { Dialog, DialogContent } from '../ui/Dialog';

interface TaskCardProps {
  task: Task;
  isSelected?: boolean;
  onSelectionChange?: (taskId: number, selected: boolean) => void;
  selectionMode?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  isSelected = false, 
  onSelectionChange, 
  selectionMode = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const { data: categories = [] } = useQuery({
    queryKey: ['task-categories'],
    queryFn: tasksApi.getCategories
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['task-tags'],
    queryFn: () => tasksApi.getTags()
  });

  const category = categories.find(c => c.id === task.category_id);
  const taskTags = task.tag_ids ? tags.filter(t => task.tag_ids!.includes(t.id)) : [];

  const handleToggleComplete = async () => {
    try {
      await updateTask.mutateAsync({
        id: task.id,
        completed: !task.completed,
        status: !task.completed ? 'completed' : 'pending'
      });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask.mutateAsync(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatRecurrencePattern = (pattern: any) => {
    if (!pattern) return null;
    
    const { type, interval } = pattern;
    
    if (type === 'daily') {
      return interval === 1 ? 'Daily' : `Every ${interval} days`;
    } else if (type === 'weekly') {
      return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
    } else if (type === 'monthly') {
      return interval === 1 ? 'Monthly' : `Every ${interval} months`;
    } else {
      return 'Custom recurrence';
    }
  };

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();
  const isDueToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();

  return (
    <>
      <Card 
        className={`container-card transition-all hover:shadow-md focus-within:shadow-lg ${
          task.completed ? 'opacity-75' : ''
        } ${
          isOverdue ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20' : 
          isDueToday ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20' : ''
        } ${
          isSelected ? 'ring-2 ring-blue-500 border-blue-200 dark:ring-blue-400 dark:border-blue-800' : ''
        }`}
      >
        <CardContent className="card-layout-horizontal p-4" style={{ padding: 'var(--spacing-normal-element, 1rem)' }}>
          <div className="flex items-start gap-3" style={{ gap: 'var(--spacing-normal-text, 0.75rem)' }}>
            {/* Selection Checkbox */}
            {selectionMode && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelectionChange?.(task.id, e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            )}

            {/* Completion Toggle */}
            <button
              onClick={handleToggleComplete}
              disabled={updateTask.isPending}
              className="mt-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {task.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 
                    className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                    style={{ 
                      fontSize: 'var(--font-size-lg, 1.125rem)',
                      lineHeight: 'var(--line-height-normal, 1.5)',
                      letterSpacing: 'var(--letter-spacing-wide, 0.025em)'
                    }}
                  >
                    {task.title}
                  </h4>
                  {task.description && (
                    <p 
                      className={`mt-1 ${task.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}
                      style={{ 
                        fontSize: 'var(--font-size-base, 1rem)',
                        lineHeight: 'var(--line-height-relaxed, 1.625)',
                        marginTop: 'var(--spacing-normal-text, 0.5rem)'
                      }}
                    >
                      {task.description}
                    </p>
                  )}

                  {/* Category */}
                  {category && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                           style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                        <FolderOpen className="h-3 w-3" />
                        <span>{category.icon}</span>
                        <span>{category.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {taskTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {taskTags.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Notes Preview */}
                  {task.notes && (
                    <div className="mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="h-3 w-3" />
                        <span className="truncate">{task.notes}</span>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {task.due_date && (
                      <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : ''}`}>
                        <Calendar className="h-3 w-3" />
                        <span>{formatDueDate(task.due_date)}</span>
                      </div>
                    )}
                    
                    {task.status && task.status !== 'pending' && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="capitalize">{task.status.replace('_', ' ')}</span>
                      </div>
                    )}

                    {/* Time Estimate */}
                    {task.estimated_minutes && (
                      <div className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        <span>{Math.floor(task.estimated_minutes / 60)}h {task.estimated_minutes % 60}m</span>
                      </div>
                    )}

                    {/* Actual Time */}
                    {task.actual_minutes && task.actual_minutes > 0 && (
                      <div className="flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" />
                        <span>{Math.floor(task.actual_minutes / 60)}h {task.actual_minutes % 60}m</span>
                      </div>
                    )}

                    {/* Recurrence Pattern */}
                    {task.recurrence_pattern && (
                      <div className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        <span>{formatRecurrencePattern(task.recurrence_pattern)}</span>
                      </div>
                    )}

                    {/* Subtask Count */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <button
                        onClick={() => setShowSubtasks(!showSubtasks)}
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <span>📋</span>
                        <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length} subtasks</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Priority Badge */}
                <div className="flex items-center gap-2 ml-3">
                  <Badge 
                    variant={
                      task.priority === 'high' ? 'destructive' : 
                      task.priority === 'medium' ? 'default' : 
                      'secondary'
                    }
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>

                  {/* Actions Menu */}
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowActions(!showActions)}
                      className="h-6 w-6 p-0"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>

                    {showActions && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowActions(false)}
                        />
                        <div className="absolute right-0 top-full mt-1 z-50 bg-background border rounded-md shadow-md py-1 min-w-[140px]">
                          <button
                            onClick={() => {
                              setIsEditing(true);
                              setShowActions(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setShowTimeTracker(!showTimeTracker);
                              setShowActions(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <Timer className="h-3 w-3" />
                            Time Tracker
                          </button>
                          <button
                            onClick={() => {
                              setShowSubtasks(!showSubtasks);
                              setShowActions(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted flex items-center gap-2"
                          >
                            <span className="h-3 w-3">📋</span>
                            Manage Subtasks
                          </button>
                          <button
                            onClick={() => {
                              handleDelete();
                              setShowActions(false);
                            }}
                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Tracker */}
          {showTimeTracker && (
            <div className="border-t mt-3 pt-3">
              <TaskTimeTracker
                taskId={task.id}
                estimatedMinutes={task.estimated_minutes}
              />
            </div>
          )}

          {/* Subtasks */}
          {showSubtasks && (
            <div className="border-t mt-3 pt-3">
              <SubtaskList
                parentTaskId={task.id}
                onSubtaskUpdate={() => {
                  // Optionally refresh the task data
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg w-full p-4 rounded-lg max-h-[90vh] overflow-y-auto">
          <TaskForm 
            task={task} 
            onSuccess={() => setIsEditing(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};