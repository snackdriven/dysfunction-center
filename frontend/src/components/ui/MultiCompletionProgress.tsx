import React from 'react';
import { Progress } from './Progress';
import { Badge } from './Badge';
import { CheckCircle, Clock, Target, Plus } from 'lucide-react';
import { HabitCompletion } from '../../services/habits';

export interface MultiCompletionProgressProps {
  completions: HabitCompletion[];
  targetValue: number;
  currentTotal: number;
  unit?: string;
  completionType: 'boolean' | 'count' | 'duration';
  onAddCompletion?: () => void;
  className?: string;
}

export const MultiCompletionProgress: React.FC<MultiCompletionProgressProps> = ({
  completions,
  targetValue,
  currentTotal,
  unit,
  completionType,
  onAddCompletion,
  className = ''
}) => {
  const progress = Math.min((currentTotal / targetValue) * 100, 100);
  const isComplete = currentTotal >= targetValue;
  
  const formatValue = (value: number) => {
    if (completionType === 'duration') {
      const hours = Math.floor(value / 60);
      const mins = value % 60;
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    }
    
    return unit ? `${value} ${unit}` : value.toString();
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Progress Overview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress Today</span>
          <span className="font-medium">
            {formatValue(currentTotal)} / {formatValue(targetValue)}
          </span>
        </div>
        
        <Progress value={progress} className="h-2" />
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}% complete
          </span>
          
          {isComplete && (
            <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Goal Reached!
            </Badge>
          )}
        </div>
      </div>

      {/* Completion Timeline */}
      {completions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Today's Completions ({completions.length})
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {completions
              .sort((a, b) => new Date(b.completion_timestamp || b.date).getTime() - 
                            new Date(a.completion_timestamp || a.date).getTime())
              .map((completion, index) => (
              <div
                key={completion.id || index}
                className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  {completion.completion_timestamp && (
                    <span className="text-muted-foreground">
                      {formatTime(completion.completion_timestamp)}
                    </span>
                  )}
                  {completion.notes && (
                    <span className="text-muted-foreground italic">
                      "{completion.notes}"
                    </span>
                  )}
                </div>
                
                <span className="font-medium">
                  +{formatValue(completion.completion_value || completion.value || 1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Button */}
      {onAddCompletion && !isComplete && (
        <button
          onClick={onAddCompletion}
          className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-muted-foreground/30 rounded-md text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add another completion
        </button>
      )}

      {/* Remaining to Goal */}
      {!isComplete && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Target className="h-4 w-4" />
          <span>
            {formatValue(targetValue - currentTotal)} remaining to reach goal
          </span>
        </div>
      )}
    </div>
  );
};