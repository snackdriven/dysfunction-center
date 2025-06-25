import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Clock, 
  Target, 
  CheckCircle2, 
  Circle,
  Smile,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { CalendarEvent } from '../../services/calendar';
import { Task } from '../../services/tasks';
import { Habit } from '../../services/habits';
import { MoodEntry } from '../../services/mood';
import { cn } from '../../utils/cn';

interface Calendar3DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  habits: Habit[];
  moodEntries: MoodEntry[];
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
  onHabitClick?: (habit: Habit) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

interface DayData {
  date: Date;
  dateString: string;
  isToday: boolean;
  events: CalendarEvent[];
  tasks: Task[];
  habits: Habit[];
  moodScore?: number;
}

interface TimeSlot {
  hour: number;
  label: string;
  events: CalendarEvent[];
}

export const Calendar3DayView: React.FC<Calendar3DayViewProps> = ({
  currentDate,
  events,
  tasks,
  habits,
  moodEntries,
  onEventClick,
  onTaskClick,
  onHabitClick,
  onTimeSlotClick
}) => {
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; hour: number } | null>(null);

  // Generate 3 days starting from current date
  const threeDays: DayData[] = React.useMemo(() => {
    const days: DayData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Filter events for this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
        return eventDate === dateString;
      });
      
      // Filter tasks with deadlines for this day
      const dayTasks = tasks.filter(task => {
        return task.due_date === dateString;
      });
      
      // Filter habits for this day (all active habits)
      const dayHabits = habits.filter(habit => habit.active);
      
      // Get mood score for this day
      const dayMood = moodEntries.find(mood => {
        const moodDate = new Date(mood.entry_date).toISOString().split('T')[0];
        return moodDate === dateString;
      });
      
      days.push({
        date,
        dateString,
        isToday: date.toDateString() === today.toDateString(),
        events: dayEvents,
        tasks: dayTasks,
        habits: dayHabits,
        moodScore: dayMood?.mood_score
      });
    }
    
    return days;
  }, [currentDate, events, tasks, habits, moodEntries]);

  // Generate time slots for the day (6 AM to 11 PM)
  const timeSlots: TimeSlot[] = React.useMemo(() => {
    const slots: TimeSlot[] = [];
    
    for (let hour = 6; hour <= 23; hour++) {
      const label = new Date(2024, 0, 1, hour, 0).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true
      });
      
      slots.push({
        hour,
        label,
        events: []
      });
    }
    
    return slots;
  }, []);

  const getEventPosition = (event: CalendarEvent) => {
    const startTime = new Date(event.start_datetime);
    const hour = startTime.getHours();
    const minutes = startTime.getMinutes();
    
    // Calculate position as percentage of hour
    const topPercent = (minutes / 60) * 100;
    
    // Calculate height based on duration
    let heightPercent = 100; // Default to 1 hour
    if (event.end_datetime) {
      const endTime = new Date(event.end_datetime);
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      heightPercent = Math.min((durationMinutes / 60) * 100, 400); // Max 4 hours display
    }
    
    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 25)}%`, // Minimum height for visibility
      hour
    };
  };

  const getEventsByHour = (dayEvents: CalendarEvent[], hour: number) => {
    return dayEvents.filter(event => {
      const eventHour = new Date(event.start_datetime).getHours();
      return eventHour === hour;
    });
  };

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedTimeSlot({ date, hour });
    onTimeSlotClick?.(date, hour);
  };

  const getDayLabel = (day: DayData) => {
    if (day.isToday) return 'Today';
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (day.date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return day.date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Day Headers */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {/* Time column header */}
        <div className="flex items-center justify-center">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
        
        {/* Day headers */}
        {threeDays.map((day) => (
          <Card key={day.dateString} className={cn(
            "relative",
            day.isToday && "ring-2 ring-primary"
          )}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{getDayLabel(day)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                
                {day.moodScore && (
                  <Badge variant="outline" className="text-xs">
                    <Smile className="h-3 w-3 mr-1" />
                    {day.moodScore}/5
                  </Badge>
                )}
              </div>
              
              {/* Day summary */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {day.events.length > 0 && (
                  <span>{day.events.length} events</span>
                )}
                {day.tasks.length > 0 && (
                  <span>{day.tasks.length} tasks due</span>
                )}
                {day.habits.length > 0 && (
                  <span>{day.habits.length} habits</span>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-4 gap-4">
          {/* Time labels column */}
          <div className="space-y-16">
            {timeSlots.map((slot) => (
              <div key={slot.hour} className="h-16 flex items-start justify-end pr-2">
                <span className="text-xs text-muted-foreground font-medium">
                  {slot.label}
                </span>
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {threeDays.map((day) => (
            <div key={day.dateString} className="relative">
              {timeSlots.map((slot) => {
                const slotEvents = getEventsByHour(day.events, slot.hour);
                
                return (
                  <div
                    key={slot.hour}
                    className={cn(
                      "h-16 border-t border-border/50 relative cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedTimeSlot?.date === day.date && selectedTimeSlot?.hour === slot.hour && "bg-primary/10"
                    )}
                    onClick={() => handleTimeSlotClick(day.date, slot.hour)}
                  >
                    {/* Events in this time slot */}
                    {slotEvents.map((event) => {
                      const position = getEventPosition(event);
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                          className={cn(
                            "absolute left-1 right-1 bg-blue-500 text-white text-xs p-1 rounded cursor-pointer",
                            "hover:bg-blue-600 transition-colors z-10"
                          )}
                          style={{
                            top: position.top,
                            height: position.height
                          }}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          {event.location && (
                            <div className="flex items-center gap-1 opacity-75">
                              <MapPin className="h-2 w-2" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              
              {/* All-day items at bottom */}
              <div className="mt-4 space-y-1">
                {/* Due Tasks */}
                {day.tasks.length > 0 && (
                  <div className="text-xs">
                    <div className="font-medium text-muted-foreground mb-1">Due Tasks</div>
                    {day.tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => onTaskClick?.(task)}
                        className={cn(
                          "flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-muted",
                          task.priority === 'high' && "text-red-600",
                          task.priority === 'medium' && "text-yellow-600"
                        )}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                        ) : (
                          <Circle className="h-3 w-3" />
                        )}
                        <span className="truncate">{task.title}</span>
                        {task.priority === 'high' && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    ))}
                    {day.tasks.length > 3 && (
                      <div className="text-muted-foreground pl-5">
                        +{day.tasks.length - 3} more
                      </div>
                    )}
                  </div>
                )}
                
                {/* Habits */}
                {day.habits.length > 0 && (
                  <div className="text-xs">
                    <div className="font-medium text-muted-foreground mb-1">Habits</div>
                    {day.habits.slice(0, 2).map((habit) => (
                      <div
                        key={habit.id}
                        onClick={() => onHabitClick?.(habit)}
                        className="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-muted"
                      >
                        <Target className="h-3 w-3 text-green-600" />
                        <span className="truncate">{habit.name}</span>
                      </div>
                    ))}
                    {day.habits.length > 2 && (
                      <div className="text-muted-foreground pl-5">
                        +{day.habits.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};