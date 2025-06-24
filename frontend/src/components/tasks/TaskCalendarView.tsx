import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Task } from '../../services/tasks';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Dialog, DialogContent, DialogTrigger } from '../ui/Dialog';
import { TaskForm } from './TaskForm';
import { CalendarIcon, Plus } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

interface TaskCalendarViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: number, updates: Partial<Task>) => void;
  onTaskCreate: (status?: string, date?: Date) => void;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Task;
  allDay?: boolean;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onTaskUpdate,
  onTaskCreate,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = React.useState(false);

  // Convert tasks to calendar events
  const events: CalendarEvent[] = React.useMemo(() => {
    return tasks
      .filter(task => task.due_date)
      .map(task => {
        const dueDate = new Date(task.due_date!);
        return {
          id: task.id,
          title: task.title,
          start: dueDate,
          end: dueDate,
          resource: task,
          allDay: true,
        };
      });
  }, [tasks]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedDate(slotInfo.start);
    setIsCreateDialogOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedTask(event.resource);
    setIsTaskDialogOpen(true);
  };

  const handleTaskCreate = () => {
    onTaskCreate(undefined, selectedDate || undefined);
    setIsCreateDialogOpen(false);
    setSelectedDate(null);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    const task = event.resource;
    let backgroundColor = '#3174ad';
    
    if (task.completed) {
      backgroundColor = '#28a745';
    } else if (task.priority === 'high') {
      backgroundColor = '#dc3545';
    } else if (task.priority === 'medium') {
      backgroundColor = '#ffc107';
    } else if (task.priority === 'low') {
      backgroundColor = '#6c757d';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: task.completed ? 0.7 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
      },
    };
  };

  const CustomEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const task = event.resource;
    return (
      <div className="flex items-center gap-1 text-xs">
        <span className="truncate">{task.title}</span>
        {task.priority && (
          <Badge 
            variant={task.priority === 'high' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {task.priority}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Task Calendar</h3>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              eventPropGetter={eventStyleGetter}
              components={{
                event: CustomEvent,
              }}
              views={['month', 'week', 'day']}
              defaultView="month"
              popup
              popupOffset={30}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => !t.completed).length}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.completed).length}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && !t.completed).length}
              </div>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {tasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString()).length}
              </div>
              <p className="text-sm text-muted-foreground">Due Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <TaskForm onSuccess={handleTaskCreate} />
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          {selectedTask && (
            <TaskForm
              task={selectedTask}
              onSuccess={() => setIsTaskDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
