import React from 'react';
import { Button } from '../../ui/Button';
import { Plus, CheckSquare, Target, Smile, Calendar } from 'lucide-react';

export const QuickActionsWidget: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Task
      </Button>
      <Button size="sm" variant="outline">
        <Target className="h-4 w-4 mr-2" />
        Habit
      </Button>
      <Button size="sm" variant="outline">
        <Smile className="h-4 w-4 mr-2" />
        Mood
      </Button>
      <Button size="sm" variant="outline">
        <Calendar className="h-4 w-4 mr-2" />
        Event
      </Button>
    </div>
  );
};