import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Plus, Calendar, Target, Smile, CheckSquare } from 'lucide-react';
import { TaskForm } from '../tasks/TaskForm';
import { HabitForm } from '../habits/HabitForm';
import { MoodEntryForm } from '../mood/MoodEntryForm';
import { EventForm } from '../calendar/EventForm';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Simplified quick actions panel that replaces the complex modal system
 * in UnifiedDashboard with focused, single-purpose interactions
 */
export const QuickActions: React.FC = () => {
  const [activeModal, setActiveModal] = useState<'task' | 'habit' | 'mood' | 'event' | null>(null);
  const queryClient = useQueryClient();

  const handleSuccess = (type: string) => {
    setActiveModal(null);
    // Invalidate relevant queries to refresh data
    queryClient.invalidateQueries({ queryKey: [type] });
    queryClient.invalidateQueries({ queryKey: ['productivity-data'] });
  };

  const quickActionButtons = [
    {
      id: 'task',
      label: 'Add Task',
      icon: CheckSquare,
      description: 'Create a new task with priority and due date',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'habit',
      label: 'Add Habit',
      icon: Target,
      description: 'Start tracking a new daily habit',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'mood',
      label: 'Log Mood',
      icon: Smile,
      description: 'Record how you\'re feeling right now',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      id: 'event',
      label: 'Add Event',
      icon: Calendar,
      description: 'Schedule an appointment or reminder',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActionButtons.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className={`h-auto p-4 flex-col items-start text-left space-y-2 ${action.color}`}
                onClick={() => setActiveModal(action.id as any)}
              >
                <div className="flex items-center gap-2 w-full">
                  <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                  <span className="font-medium">{action.label}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Task Modal */}
      <Dialog open={activeModal === 'task'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm onSuccess={() => handleSuccess('tasks')} />
        </DialogContent>
      </Dialog>

      {/* Habit Modal */}
      <Dialog open={activeModal === 'habit'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
          </DialogHeader>
          <HabitForm onSuccess={() => handleSuccess('habits')} />
        </DialogContent>
      </Dialog>

      {/* Mood Modal */}
      <Dialog open={activeModal === 'mood'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Your Mood</DialogTitle>
          </DialogHeader>
          <MoodEntryForm onSuccess={() => handleSuccess('mood')} />
        </DialogContent>
      </Dialog>

      {/* Event Modal */}
      <Dialog open={activeModal === 'event'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Event</DialogTitle>
          </DialogHeader>
          <EventForm onSuccess={() => handleSuccess('calendar')} />
        </DialogContent>
      </Dialog>
    </div>
  );
};