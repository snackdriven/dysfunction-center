import React, { useState } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, Circle, Calendar, Edit, Trash2, Clock, Tag, MoreHorizontal } from 'lucide-react';
import { Task, useUpdateTask, useDeleteTask } from '../../services/tasks';
import { TaskForm } from './TaskForm';
import { Dialog, DialogContent } from '../ui/Dialog';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

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

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();
  const isDueToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();

  return (
    <>
      <Card 
        className={`transition-all hover:shadow-md ${
          task.completed ? 'opacity-75' : ''
        } ${
          isOverdue ? 'border-red-200 bg-red-50' : 
          isDueToday ? 'border-orange-200 bg-orange-50' : ''
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
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
                  <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className={`text-sm mt-1 ${task.completed ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                      {task.description}
                    </p>
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

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        <span>{task.tags.join(', ')}</span>
                      </div>
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
                        <div className="absolute right-0 top-full mt-1 z-50 bg-background border rounded-md shadow-md py-1 min-w-[120px]">
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
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <TaskForm 
            task={task} 
            onSuccess={() => setIsEditing(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};