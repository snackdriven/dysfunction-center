import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Clock, 
  Calendar, 
  Target, 
  CheckCircle2, 
  Circle,
  Smile,
  MapPin,
  Plus,
  ChevronRight,
  Star
} from 'lucide-react';
import { CalendarEvent } from '../../services/calendar';
import { Task } from '../../services/tasks';
import { Habit } from '../../services/habits';
import { MoodEntry } from '../../services/mood';
import { cn } from '../../utils/cn';

interface CalendarAgendaViewDetailedProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  habits: Habit[];
  moodEntries: MoodEntry[];
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
  onHabitClick?: (habit: Habit) => void;
  onMoodClick?: (mood: MoodEntry) => void;
  onAddEvent?: () => void;
  onAddTask?: () => void;
  onAddMood?: () => void;
}

interface AgendaItem {
  id: string;
  type: 'event' | 'task' | 'habit' | 'mood';
  title: string;
  time?: string;
  endTime?: string;
  date: Date;
  priority?: 'low' | 'medium' | 'high';
  completed?: boolean;
  location?: string;
  description?: string;
  data: CalendarEvent | Task | Habit | MoodEntry;
}

export const CalendarAgendaViewDetailed: React.FC<CalendarAgendaViewDetailedProps> = ({
  currentDate,
  events,
  tasks,
  habits,
  moodEntries,
  onEventClick,
  onTaskClick,
  onHabitClick,
  onMoodClick,
  onAddEvent,
  onAddTask,
  onAddMood
}) => {
  const [showCompleted, setShowCompleted] = useState(false);

  // Create agenda items from all data sources
  const agendaItems: AgendaItem[] = useMemo(() => {
    const items: AgendaItem[] = [];
    const startDate = new Date(currentDate);
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + 30); // Show next 30 days

    // Add events
    events.forEach(event => {
      const eventDate = new Date(event.start_datetime);
      if (eventDate >= startDate && eventDate <= endDate) {
        items.push({
          id: `event-${event.id}`,
          type: 'event',
          title: event.title,
          time: eventDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          endTime: event.end_datetime ? new Date(event.end_datetime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }) : undefined,
          date: eventDate,
          location: event.location,
          description: event.description,
          data: event
        });
      }
    });

    // Add task deadlines
    tasks.forEach(task => {
      if (task.due_date && !task.completed) {
        const dueDate = new Date(task.due_date);
        if (dueDate >= startDate && dueDate <= endDate) {
          items.push({
            id: `task-${task.id}`,
            type: 'task',
            title: task.title,
            date: dueDate,
            priority: task.priority,
            completed: task.completed,
            description: task.description,
            data: task
          });
        }
      }
    });

    // Add habit check-ins for upcoming days
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      habits.forEach(habit => {
        if (habit.active) {
          items.push({
            id: `habit-${habit.id}-${checkDate.toISOString().split('T')[0]}`,
            type: 'habit',
            title: `${habit.name} check-in`,
            date: checkDate,
            completed: false, // This would need to be checked against actual completions
            description: habit.description,
            data: habit
          });
        }
      });
    }

    // Sort by date and time
    return items.sort((a, b) => {
      const dateCompare = a.date.getTime() - b.date.getTime();
      if (dateCompare !== 0) return dateCompare;
      
      // If same date, sort by time (events with time first)
      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      
      return 0;
    });
  }, [currentDate, events, tasks, habits]);

  // Group items by date
  const groupedItems = React.useMemo(() => {
    const groups: { [key: string]: AgendaItem[] } = {};
    
    agendaItems.forEach(item => {
      const dateKey = item.date.toISOString().split('T')[0];
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    
    return groups;
  }, [agendaItems]);

  const handleItemClick = (item: AgendaItem) => {
    switch (item.type) {
      case 'event':
        onEventClick?.(item.data as CalendarEvent);
        break;
      case 'task':
        onTaskClick?.(item.data as Task);
        break;
      case 'habit':
        onHabitClick?.(item.data as Habit);
        break;
      case 'mood':
        onMoodClick?.(item.data as MoodEntry);
        break;
    }
  };

  const getItemIcon = (item: AgendaItem) => {
    switch (item.type) {
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'task':
        return item.completed ? 
          <CheckCircle2 className="h-4 w-4 text-green-600" /> :
          <Circle className="h-4 w-4" />;
      case 'habit':
        return <Target className="h-4 w-4" />;
      case 'mood':
        return <Smile className="h-4 w-4" />;
    }
  };

  const getItemColor = (item: AgendaItem) => {
    switch (item.type) {
      case 'event':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'task':
        if (item.priority === 'high') return 'bg-red-50 border-red-200 text-red-800';
        if (item.priority === 'medium') return 'bg-yellow-50 border-yellow-200 text-yellow-800';
        return 'bg-gray-50 border-gray-200 text-gray-800';
      case 'habit':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'mood':
        return 'bg-purple-50 border-purple-200 text-purple-800';
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Agenda View</h2>
          <p className="text-sm text-muted-foreground">
            Upcoming events, tasks, and habits
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? 'Hide' : 'Show'} Completed
          </Button>
          
          <Button size="sm" onClick={onAddEvent}>
            <Plus className="h-4 w-4 mr-1" />
            Event
          </Button>
          
          <Button size="sm" onClick={onAddTask}>
            <Plus className="h-4 w-4 mr-1" />
            Task
          </Button>
        </div>
      </div>

      {/* Agenda Items */}
      <div className="space-y-6">
        {Object.keys(groupedItems).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No upcoming items</h3>
              <p className="text-muted-foreground mb-4">
                Your agenda is clear! Add some events or tasks to get started.
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={onAddEvent}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
                <Button variant="outline" onClick={onAddTask}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedItems).map(([dateString, items]) => {
            const filteredItems = showCompleted ? items : items.filter(item => !item.completed);
            
            if (filteredItems.length === 0) return null;
            
            return (
              <Card key={dateString}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {formatDateHeader(dateString)}
                    <Badge variant="secondary" className="ml-auto">
                      {filteredItems.length} items
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow",
                        getItemColor(item),
                        item.completed && "opacity-60"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {getItemIcon(item)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              "font-medium truncate",
                              item.completed && "line-through"
                            )}>
                              {item.title}
                            </h4>
                            
                            {item.priority === 'high' && (
                              <Star className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm opacity-75 mt-1">
                            {item.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.time}
                                {item.endTime && ` - ${item.endTime}`}
                              </div>
                            )}
                            
                            {item.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                              </div>
                            )}
                          </div>
                          
                          {item.description && (
                            <p className="text-sm opacity-75 mt-1 truncate">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-4 w-4 opacity-50" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};