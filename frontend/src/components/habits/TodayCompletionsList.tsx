import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Clock, Edit, Trash2, Plus } from 'lucide-react';
import { HabitCompletion, Habit, useDeleteCompletion } from '../../services/habits';

interface TodayCompletionsListProps {
  habit: Habit;
  completions: HabitCompletion[];
  onAddCompletion?: () => void;
  onEditCompletion?: (completion: HabitCompletion) => void;
  onDeleteCompletion?: (completion: HabitCompletion) => void;
  showActions?: boolean;
  className?: string;
}

export const TodayCompletionsList: React.FC<TodayCompletionsListProps> = ({
  habit,
  completions,
  onAddCompletion,
  onEditCompletion,
  onDeleteCompletion,
  showActions = false,
  className = ''
}) => {
  const deleteCompletion = useDeleteCompletion();

  const handleDeleteCompletion = async (completion: HabitCompletion) => {
    if (window.confirm('Are you sure you want to delete this completion?')) {
      try {
        await deleteCompletion.mutateAsync(completion.id);
      } catch (error) {
        console.error('Failed to delete completion:', error);
      }
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatValue = (value: number | undefined) => {
    if (!value) return '';
    
    if (habit.completion_type === 'duration') {
      const hours = Math.floor(value / 60);
      const mins = value % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    
    return habit.unit ? `${value} ${habit.unit}` : value.toString();
  };

  const sortedCompletions = [...completions].sort((a, b) => {
    const timeA = new Date(a.completion_timestamp || a.date).getTime();
    const timeB = new Date(b.completion_timestamp || b.date).getTime();
    return timeA - timeB;
  });

  if (sortedCompletions.length === 0) {
    return (
      <div className={`text-center py-4 text-muted-foreground ${className}`}>
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No completions logged today</p>
        {onAddCompletion && (
          <Button 
            onClick={onAddCompletion}
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Completion
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Today's Completions</h4>
        {onAddCompletion && (
          <Button onClick={onAddCompletion} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>

      <div className="space-y-1">
        {sortedCompletions.map((completion, index) => (
          <div 
            key={completion.id || index} 
            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {completion.completion_timestamp ? 
                  formatTime(completion.completion_timestamp) : 
                  'No time'
                }
              </div>
              
              {completion.value !== undefined && completion.value > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {formatValue(completion.value)}
                </Badge>
              )}
              
              {completion.notes && (
                <span className="text-xs text-muted-foreground truncate max-w-32">
                  "{completion.notes}"
                </span>
              )}
            </div>

            {showActions && (
              <div className="flex items-center gap-1">
                {onEditCompletion && (
                  <Button
                    onClick={() => onEditCompletion(completion)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                {onDeleteCompletion && (
                  <Button
                    onClick={() => handleDeleteCompletion(completion)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    disabled={deleteCompletion.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{sortedCompletions.length} completion{sortedCompletions.length !== 1 ? 's' : ''}</span>
          {completions.length > 0 && (
            <span>
              Total: {formatValue(completions.reduce((sum, c) => sum + (c.value || 0), 0))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
