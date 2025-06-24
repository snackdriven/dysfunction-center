import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { tasksApi, TimeEntry, useStartTimeEntry, useStopTimeEntry } from '../../services/tasks';
import { Play, Pause, Clock, Timer } from 'lucide-react';

interface TaskTimeTrackerProps {
  taskId: number;
  estimatedMinutes?: number;
  onTimeUpdate?: (actualMinutes: number) => void;
}

export const TaskTimeTracker: React.FC<TaskTimeTrackerProps> = ({
  taskId,
  estimatedMinutes,
  onTimeUpdate
}) => {
  // First, run the query without refetchInterval
  const { data: activeEntry, refetch: refetchActiveEntry } = useQuery<TimeEntry | null>({
    queryKey: ['active-time-entry', taskId],
    queryFn: () => tasksApi.getActiveTimeEntry(taskId),
  });

  // Dynamically set refetchInterval using useEffect
  React.useEffect(() => {
    if (!activeEntry) return;
    const interval = setInterval(() => {
      refetchActiveEntry();
    }, 1000);
    return () => clearInterval(interval);
  }, [activeEntry, refetchActiveEntry]);

  const { data: timeEntries = [] } = useQuery({
    queryKey: ['time-entries', taskId],
    queryFn: () => tasksApi.getTimeEntries({ task_id: taskId })
  });

  const startTimeEntry = useStartTimeEntry();
  const stopTimeEntry = useStopTimeEntry();

  const totalMinutes = timeEntries.reduce((sum, entry) => 
    sum + (entry.duration_minutes || 0), 0
  );

  const getCurrentDuration = () => {
    if (!activeEntry) return 0;
    const start = new Date(activeEntry.start_time);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
  };

  const currentSessionMinutes = getCurrentDuration();
  const actualMinutes = totalMinutes + currentSessionMinutes;

  React.useEffect(() => {
    onTimeUpdate?.(actualMinutes);
  }, [actualMinutes, onTimeUpdate]);

  const handleStart = async () => {
    try {
      await startTimeEntry.mutateAsync({ taskId });
      refetchActiveEntry();
    } catch (error) {
      console.error('Failed to start time tracking:', error);
    }
  };

  const handleStop = async () => {
    if (activeEntry) {
      try {
        await stopTimeEntry.mutateAsync(activeEntry.id);
        refetchActiveEntry();
      } catch (error) {
        console.error('Failed to stop time tracking:', error);
      }
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProgressColor = () => {
    if (!estimatedMinutes) return 'bg-blue-500';
    
    const percentage = (actualMinutes / estimatedMinutes) * 100;
    if (percentage <= 100) return 'bg-green-500';
    if (percentage <= 120) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProgressPercentage = () => {
    if (!estimatedMinutes) return 0;
    return Math.min((actualMinutes / estimatedMinutes) * 100, 100);
  };

  return (
    <div className="space-y-3">
      {/* Timer Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-gray-600" />
          <span className="font-medium">Time Tracking</span>
        </div>

        <Button
          size="sm"
          variant={activeEntry ? "destructive" : "primary"}
          onClick={activeEntry ? handleStop : handleStart}
          disabled={startTimeEntry.isPending || stopTimeEntry.isPending}
        >
          {activeEntry ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Stop
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Start
            </>
          )}
        </Button>
      </div>

      {/* Current Session */}
      {activeEntry && (
        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-green-700">
            Currently tracking: {formatDuration(currentSessionMinutes)}
          </span>
        </div>
      )}

      {/* Time Summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Time</span>
          <span className="font-medium">{formatDuration(actualMinutes)}</span>
        </div>

        {estimatedMinutes && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Estimated</span>
              <span>{formatDuration(estimatedMinutes)}</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>{formatDuration(estimatedMinutes)}</span>
              </div>
            </div>

            {/* Variance */}
            {actualMinutes > 0 && (
              <div className="text-xs text-center">
                {actualMinutes === estimatedMinutes ? (
                  <Badge variant="default">On target</Badge>
                ) : actualMinutes < estimatedMinutes ? (
                  <Badge variant="secondary">
                    {formatDuration(estimatedMinutes - actualMinutes)} under
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    {formatDuration(actualMinutes - estimatedMinutes)} over
                  </Badge>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Time Entries History */}
      {timeEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Time Entries</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {timeEntries.slice(-5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">
                    {new Date(entry.start_time).toLocaleDateString()}
                  </span>
                  {entry.description && (
                    <span className="text-gray-500">- {entry.description}</span>
                  )}
                </div>
                <span className="font-medium">
                  {formatDuration(entry.duration_minutes || 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};