import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, Circle, Edit, Trash2, MoreHorizontal, Flame, Target, Plus, Minus, Play, Pause, Bell, Calendar } from 'lucide-react';
import { Habit, HabitCompletion, useLogHabitCompletion, useUpdateHabit, useDeleteHabit } from '../../services/habits';
import { HabitForm } from './HabitForm';
import { HabitReminderManager } from './HabitReminderManager';
import { MultiCompletionProgress } from '../ui/MultiCompletionProgress';
import { Dialog, DialogContent } from '../ui/Dialog';
import { BulkCompletionModal } from './BulkCompletionModal';
import { TodayCompletionsList } from './TodayCompletionsList';

interface HabitCardProps {
  habit: Habit;
  completion?: HabitCompletion;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, completion }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [showBulkCompletion, setShowBulkCompletion] = useState(false);
  const [showCompletionsList, setShowCompletionsList] = useState(false);
  const [currentValue, setCurrentValue] = useState(completion?.value || 0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);

  const logCompletion = useLogHabitCompletion();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();

  // Multi-completion support
  const todayCompletions = habit.today_completions || [];
  const todayTotalValue = habit.today_total_value || 0;
  const isCompleted = todayTotalValue >= (habit.target_value || 1);
  const isLoading = logCompletion.isPending || updateHabit.isPending || deleteHabit.isPending;
  
  // Schedule pattern display
  const getScheduleDisplay = () => {
    if (!habit.schedule_pattern || habit.schedule_pattern === 'daily') {
      return 'Daily';
    }
    if (habit.schedule_pattern === 'weekdays') {
      return 'Weekdays only';
    }
    if (habit.schedule_pattern === 'weekends') {
      return 'Weekends only';
    }
    if (habit.schedule_pattern === 'custom' && habit.scheduled_days) {
      const dayAbbrevs = {
        monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
        friday: 'Fri', saturday: 'Sat', sunday: 'Sun'
      };
      return habit.scheduled_days.map(day => dayAbbrevs[day]).join(', ');
    }
    return 'Custom';
  };

  const handleAddCompletion = async (value: number = 1, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      await logCompletion.mutateAsync({
        habitId: habit.id,
        date: today,
        completed: false, // Will be calculated based on total value
        value: value,
        notes: notes,
        completion_timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log habit completion:', error);
    }
  };

  const handleToggleCompletion = async () => {
    if (habit.completion_type === 'boolean') {
      // For boolean habits, toggle the completion status
      await handleAddCompletion(1);
    } else {
      // For count/duration habits, add one unit
      await handleAddCompletion(1);
    }
  };

  const handleCountChange = async (newValue: number) => {
    const today = new Date().toISOString().split('T')[0];
    const targetReached = newValue >= (habit.target_value || 1);
    
    setCurrentValue(newValue);
    
    try {
      await logCompletion.mutateAsync({
        habitId: habit.id,
        date: today,
        completed: targetReached,
        value: newValue,
      });
    } catch (error) {
      console.error('Failed to log habit completion:', error);
    }
  };

  const handleTimerToggle = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true);
      setTimerStart(new Date());
    } else {
      if (timerStart) {
        const duration = Math.floor((new Date().getTime() - timerStart.getTime()) / (1000 * 60)); // in minutes
        const newValue = (completion?.value || 0) + duration;
        handleCountChange(newValue);
      }
      setIsTimerRunning(false);
      setTimerStart(null);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
                        setShowReminders(true);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <Bell className="h-3 w-3" />
                      Reminders
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
                    <button
                      onClick={() => {
                        setShowBulkCompletion(true);
                        setShowActions(false);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      Bulk Add Completions
                    </button>
                    {todayCompletions.length > 0 && (
                      <button
                        onClick={() => {
                          setShowCompletionsList(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Calendar className="h-3 w-3" />
                        View Today's Completions ({todayCompletions.length})
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Multi-Completion Progress for count/duration types */}
          {habit.completion_type !== 'boolean' && (habit.target_value || 0) > 1 ? (
            <MultiCompletionProgress
              completions={todayCompletions}
              targetValue={habit.target_value || 1}
              currentTotal={todayTotalValue}
              unit={habit.unit}
              completionType={habit.completion_type}
              onAddCompletion={() => handleAddCompletion(1)}
            />
          ) : habit.completion_type === 'boolean' ? (
            // Boolean: Simple toggle button
            <div className="flex items-center justify-center">
              <Button
                variant={isCompleted ? "primary" : "outline"}
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
          ) : (
            // Simple count/duration interface for target_value = 1
            <div className="space-y-3">
              <div className="text-center">
                <Button
                  variant={isCompleted ? "primary" : "outline"}
                  onClick={handleToggleCompletion}
                  disabled={isLoading || !habit.active}
                  className="w-full"
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  {isCompleted ? 'Completed Today!' : `Add ${habit.unit || 'completion'}`}
                </Button>
              </div>
            </div>
          )}

          {/* Habit Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category:</span>
              <Badge variant="secondary">{habit.category}</Badge>
            </div>
            
            {/* Schedule Information */}
            {habit.schedule_pattern && habit.schedule_pattern !== 'daily' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Schedule:</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span className="text-xs">{getScheduleDisplay()}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type:</span>
              <span>{getCompletionTypeDisplay(habit.completion_type)}</span>
            </div>

            {habit.target_value && habit.target_value > 1 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target:</span>
                <span>{habit.target_value} {habit.unit}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="font-medium">{habit.streak_count}</span>
                <span className="text-muted-foreground">day streak</span>
              </div>
              
              {/* Reminder Indicator */}
              {habit.reminder_enabled && habit.reminder_time && (
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <Bell className="h-3 w-3" />
                  <span className="text-xs">reminder</span>
                </div>
              )}
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

      {/* Reminders Dialog */}
      <Dialog open={showReminders} onOpenChange={setShowReminders}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <HabitReminderManager
            habit={habit}
            onRemindersUpdate={() => {
              // Optionally refresh habit data or trigger callbacks
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Completion Modal */}
      <BulkCompletionModal
        habit={habit}
        isOpen={showBulkCompletion}
        onClose={() => setShowBulkCompletion(false)}
      />

      {/* Today Completions List Dialog */}
      <Dialog open={showCompletionsList} onOpenChange={setShowCompletionsList}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <TodayCompletionsList
            habit={habit}
            completions={todayCompletions}
            onAddCompletion={() => {
              setShowCompletionsList(false);
              setShowBulkCompletion(true);
            }}
            showActions={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};