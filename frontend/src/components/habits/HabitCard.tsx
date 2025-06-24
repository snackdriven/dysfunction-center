import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, Circle, Edit, Trash2, MoreHorizontal, Flame, Target } from 'lucide-react';
import { Habit, HabitCompletion, useLogHabitCompletion, useUpdateHabit, useDeleteHabit } from '../../services/habits';
import { HabitForm } from './HabitForm';
import { Dialog, DialogContent } from '../ui/Dialog';

interface HabitCardProps {
  habit: Habit;
  completion?: HabitCompletion;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, completion }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const logCompletion = useLogHabitCompletion();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  const isCompleted = completion?.completed || false;
  const isLoading = logCompletion.isPending || updateHabit.isPending || deleteHabit.isPending;

  const handleToggleCompletion = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await logCompletion.mutateAsync({
        habitId: habit.id,
        date: today,
        completed: !isCompleted,
        value: habit.completion_type === 'boolean' ? undefined : 1, // Default value for count/duration
      });
    } catch (error) {
      console.error('Failed to log habit completion:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      try {
        await deleteHabit.mutateAsync(habit.id);
      } catch (error) {
        console.error('Failed to delete habit:', error);
      }
    }
  };

  const getCompletionTypeDisplay = (type: string) => {
    switch (type) {
      case 'boolean': return 'Yes/No';
      case 'count': return 'Count';
      case 'duration': return 'Duration';
      default: return type;
    }
  };

  const getFrequencyDisplay = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  };

  return (
    <>
      <Card className={`transition-all hover:shadow-md ${!habit.active ? 'opacity-60' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{habit.name}</CardTitle>
              {habit.description && (
                <p className="text-sm text-muted-foreground mt-1">{habit.description}</p>
              )}
            </div>
            
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
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Completion Button */}
          <div className="flex items-center justify-center">
            <Button              variant={isCompleted ? "primary" : "outline"}
              onClick={handleToggleCompletion}
              disabled={isLoading || !habit.active}
              className="w-full"
            >
              {isCompleted ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <Circle className="h-4 w-4 mr-2" />
              )}
              {isCompleted ? 'Completed Today!' : 'Mark Complete'}
            </Button>
          </div>

          {/* Habit Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <Badge variant="secondary">{habit.category}</Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frequency:</span>
              <span>{getFrequencyDisplay(habit.target_frequency.toString())}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{getCompletionTypeDisplay(habit.completion_type)}</span>
            </div>

            {habit.target_value && habit.target_value > 1 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target:</span>
                <span>{habit.target_value}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-1 text-sm">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{habit.streak_count}</span>
              <span className="text-muted-foreground">day streak</span>
            </div>
              <div className="flex items-center gap-1 text-sm">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{(habit.completion_rate || 0).toFixed(0)}%</span>
              <span className="text-muted-foreground">rate</span>
            </div>
          </div>          {/* Status Badge */}
          {!habit.active && (
            <Badge variant="outline" className="w-full justify-center">
              Inactive
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md">
          <HabitForm 
            habit={habit} 
            onSuccess={() => setIsEditing(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};