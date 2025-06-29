import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { 
  Clock, 
  Target, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Pause,
  CheckCircle,
  Circle,
  AlertCircle,
  Timer,
  Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TaskBreakdownProps {
  task: {
    id: number;
    title: string;
    description?: string;
    estimatedMinutes?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    priority?: 'low' | 'medium' | 'high';
    subtasks?: Array<{
      id: number;
      title: string;
      completed: boolean;
      estimatedMinutes?: number;
    }>;
    completed: boolean;
    completedSubtasks?: number;
    totalSubtasks?: number;
  };
  onStart?: (taskId: number) => void;
  onComplete?: (taskId: number) => void;
  onBreakDown?: (taskId: number) => void;
  onDefer?: (taskId: number) => void;
  onEdit?: (taskId: number) => void;
  showBreakSuggestion?: boolean;
}

const DifficultyIndicator: React.FC<{ level?: 'easy' | 'medium' | 'hard' }> = ({ level }) => {
  if (!level) return null;

  const config = {
    easy: { color: 'bg-green-100 text-green-800 border-green-200', icon: '●', label: 'Easy' },
    medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '●●', label: 'Medium' },
    hard: { color: 'bg-red-100 text-red-800 border-red-200', icon: '●●●', label: 'Hard' }
  };

  const { color, icon, label } = config[level];

  return (
    <Badge 
      className={cn('text-xs font-medium', color)}
      aria-label={`Difficulty level: ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span className="ml-1">{label}</span>
    </Badge>
  );
};

const TimeEstimate: React.FC<{ 
  estimated?: number; 
  showBreakSuggestion?: boolean;
}> = ({ estimated, showBreakSuggestion }) => {
  if (!estimated) return null;

  const hours = Math.floor(estimated / 60);
  const minutes = estimated % 60;
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" aria-hidden="true" />
      <span>{timeDisplay}</span>
      {showBreakSuggestion && estimated > 25 && (
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
          <Timer className="h-3 w-3 mr-1" aria-hidden="true" />
          Consider breaks
        </Badge>
      )}
    </div>
  );
};

const SubtaskBreakdown: React.FC<{
  subtasks?: Array<{
    id: number;
    title: string;
    completed: boolean;
    estimatedMinutes?: number;
  }>;
  showNextAction?: boolean;
  highlightCurrentStep?: boolean;
}> = ({ subtasks, showNextAction, highlightCurrentStep }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!subtasks || subtasks.length === 0) return null;

  const nextIncompleteIndex = subtasks.findIndex(subtask => !subtask.completed);
  const hasIncomplete = nextIncompleteIndex !== -1;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded p-1"
        aria-expanded={isExpanded}
        aria-controls="subtask-list"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        )}
        <span>Subtasks ({subtasks.filter(s => s.completed).length}/{subtasks.length})</span>
      </button>

      {isExpanded && (
        <div id="subtask-list" className="space-y-2 ml-6">
          {subtasks.map((subtask, index) => {
            const isNext = highlightCurrentStep && index === nextIncompleteIndex;
            const isCompleted = subtask.completed;

            return (
              <div
                key={subtask.id}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors",
                  isNext && "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800",
                  isCompleted && "opacity-60"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" aria-hidden="true" />
                )}
                
                <span className={cn(
                  "flex-1 text-sm",
                  isCompleted && "line-through text-muted-foreground",
                  isNext && "font-medium text-blue-900 dark:text-blue-100"
                )}>
                  {subtask.title}
                </span>

                {subtask.estimatedMinutes && (
                  <span className="text-xs text-muted-foreground">
                    {subtask.estimatedMinutes}m
                  </span>
                )}

                {isNext && showNextAction && (
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                    <Play className="h-3 w-3 mr-1" aria-hidden="true" />
                    Next
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ProgressIndicator: React.FC<{
  completed?: number;
  total?: number;
  showMilestones?: boolean;
}> = ({ completed = 0, total = 0, showMilestones }) => {
  if (total === 0) return null;

  const percentage = (completed / total) * 100;
  const isNearCompletion = percentage >= 75;
  const isHalfway = percentage >= 50 && percentage < 75;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Progress
        </span>
        <span className="text-muted-foreground">
          {completed}/{total} completed
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={cn(
          "h-3",
          isNearCompletion && "bg-green-100",
          isHalfway && "bg-blue-100"
        )}
        aria-label={`Task progress: ${completed} of ${total} subtasks completed`}
      />

      {showMilestones && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={percentage >= 25 ? "text-green-600" : ""}>25%</span>
          <span className={percentage >= 50 ? "text-blue-600" : ""}>50%</span>
          <span className={percentage >= 75 ? "text-yellow-600" : ""}>75%</span>
          <span className={percentage >= 100 ? "text-green-600 font-medium" : ""}>Done!</span>
        </div>
      )}
    </div>
  );
};

const QuickActions: React.FC<{
  onStart?: () => void;
  onBreakDown?: () => void;
  onDefer?: () => void;
  onEdit?: () => void;
  estimatedTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  disabled?: boolean;
}> = ({ onStart, onBreakDown, onDefer, onEdit, estimatedTime, difficulty, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="prominent"
        size="md"
        onClick={onStart}
        disabled={disabled}
        estimatedTime={estimatedTime}
        difficulty={difficulty}
        ariaLabel="Start working on this task"
        className="flex-1 min-w-[120px]"
      >
        <Play className="h-4 w-4 mr-2" aria-hidden="true" />
        Start Task
      </Button>

      <Button
        variant="outline"
        size="md"
        onClick={onBreakDown}
        disabled={disabled}
        ariaLabel="Break down this task into smaller steps"
      >
        <Target className="h-4 w-4 mr-2" aria-hidden="true" />
        Break Down
      </Button>

      <Button
        variant="ghost"
        size="md"
        onClick={onDefer}
        disabled={disabled}
        ariaLabel="Defer this task to later"
      >
        <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
        Defer
      </Button>

      <Button
        variant="ghost"
        size="md"
        onClick={onEdit}
        disabled={disabled}
        ariaLabel="Edit task details"
      >
        Edit
      </Button>
    </div>
  );
};

export const TaskBreakdownInterface: React.FC<TaskBreakdownProps> = ({
  task,
  onStart,
  onComplete,
  onBreakDown,
  onDefer,
  onEdit,
  showBreakSuggestion = true
}) => {
  const handleStart = () => onStart?.(task.id);
  const handleBreakDown = () => onBreakDown?.(task.id);
  const handleDefer = () => onDefer?.(task.id);
  const handleEdit = () => onEdit?.(task.id);

  const priorityConfig = {
    low: { color: 'border-green-200 bg-green-50 dark:bg-green-950/20', icon: '!' },
    medium: { color: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20', icon: '!!' },
    high: { color: 'border-red-200 bg-red-50 dark:bg-red-950/20', icon: '!!!' }
  };

  const priority = task.priority || 'medium';
  const { color } = priorityConfig[priority];

  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200",
      color,
      "border-l-4",
      task.completed && "opacity-75"
    )} role="article" aria-labelledby={`task-${task.id}-title`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 
              id={`task-${task.id}-title`}
              className={cn(
                "font-semibold text-lg leading-tight",
                task.completed && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <DifficultyIndicator level={task.difficulty} />
            {task.priority && (
              <Badge 
                variant={task.priority === 'high' ? 'destructive' : 'outline'}
                className="text-xs"
              >
                {task.priority}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <TimeEstimate 
            estimated={task.estimatedMinutes} 
            showBreakSuggestion={showBreakSuggestion}
          />
          
          {task.completed && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!task.completed && (
          <>
            <ProgressIndicator
              completed={task.completedSubtasks}
              total={task.totalSubtasks}
              showMilestones
            />
            
            <SubtaskBreakdown
              subtasks={task.subtasks}
              showNextAction
              highlightCurrentStep
            />
          </>
        )}

        {task.estimatedMinutes && task.estimatedMinutes > 45 && !task.completed && (
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">Long Task Detected</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Consider breaking this into smaller, 25-minute chunks for better focus.
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {!task.completed && (
        <CardFooter>
          <QuickActions
            onStart={handleStart}
            onBreakDown={handleBreakDown}
            onDefer={handleDefer}
            onEdit={handleEdit}
            estimatedTime={task.estimatedMinutes}
            difficulty={task.difficulty}
          />
        </CardFooter>
      )}
    </Card>
  );
};

export default TaskBreakdownInterface;