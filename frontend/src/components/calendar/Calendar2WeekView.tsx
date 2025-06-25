import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Target, 
  CheckCircle2, 
  Circle,
  Smile,
  Calendar,
} from 'lucide-react';
import { CalendarEvent } from '../../services/calendar';
import { Task } from '../../services/tasks';
import { Habit } from '../../services/habits';
import { MoodEntry } from '../../services/mood';
import { cn } from '../../utils/cn';

interface Calendar2WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: Task[];
  habits: Habit[];
  moodEntries: MoodEntry[];
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
}

interface DayData {
  date: Date;
  dateString: string;
  dayOfWeek: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  moodScore?: number;
  habitCompletions: number;
  totalHabits: number;
}

export const Calendar2WeekView: React.FC<Calendar2WeekViewProps> = ({
  currentDate,
  events,
  tasks,
  habits,
  moodEntries,
  onDateClick,
  onEventClick,
  onTaskClick
}) => {
  // Generate 2 weeks of days
  const twoWeeksDays: DayData[] = React.useMemo(() => {
    const days: DayData[] = [];
    const today = new Date();
    
    // Start from the beginning of the week containing currentDate
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - currentDate.getDay()); // Go to Sunday
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      // Filter events for this day
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
        return eventDate === dateString;
      });
      
      // Filter tasks for this day
      const dayTasks = tasks.filter(task => task.due_date === dateString);
      const completedTasks = dayTasks.filter(task => task.completed).length;
      
      // Get mood score for this day
      const dayMood = moodEntries.find(mood => {
        const moodDate = new Date(mood.entry_date).toISOString().split('T')[0];
        return moodDate === dateString;
      });
      
      // Calculate habit completions (this is simplified - in real app you'd check actual completions)
      const totalHabits = habits.filter(habit => habit.active).length;
      const habitCompletions = Math.floor(Math.random() * (totalHabits + 1)); // Mock data
      
      days.push({
        date,
        dateString,
        dayOfWeek: date.getDay(),
        isToday: date.toDateString() === today.toDateString(),
        isCurrentMonth: date.getMonth() === currentDate.getMonth(),
        events: dayEvents,
        tasks: dayTasks,
        completedTasks,
        totalTasks: dayTasks.length,
        moodScore: dayMood?.mood_score,
        habitCompletions,
        totalHabits
      });
    }
    
    return days;
  }, [currentDate, events, tasks, habits, moodEntries]);

  // Split into 2 weeks
  const firstWeek = twoWeeksDays.slice(0, 7);
  const secondWeek = twoWeeksDays.slice(7, 14);

  const getProductivityScore = (day: DayData): number => {
    let score = 0;
    const factors = [];
    
    // Task completion rate (40% weight)
    if (day.totalTasks > 0) {
      const taskScore = (day.completedTasks / day.totalTasks) * 40;
      score += taskScore;
      factors.push(`Tasks: ${day.completedTasks}/${day.totalTasks}`);
    }
    
    // Habit completion rate (40% weight)
    if (day.totalHabits > 0) {
      const habitScore = (day.habitCompletions / day.totalHabits) * 40;
      score += habitScore;
      factors.push(`Habits: ${day.habitCompletions}/${day.totalHabits}`);
    }
    
    // Mood score (20% weight)
    if (day.moodScore) {
      const moodScore = (day.moodScore / 5) * 20;
      score += moodScore;
      factors.push(`Mood: ${day.moodScore}/5`);
    }
    
    return Math.round(score);
  };

  const getProductivityColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100 border-green-200 text-green-800';
    if (score >= 60) return 'bg-yellow-100 border-yellow-200 text-yellow-800';
    if (score >= 40) return 'bg-orange-100 border-orange-200 text-orange-800';
    return 'bg-red-100 border-red-200 text-red-800';
  };

  const getDayContent = (day: DayData) => {
    const productivityScore = getProductivityScore(day);
    
    return (
      <Card
        key={day.dateString}
        className={cn(
          "h-24 cursor-pointer hover:shadow-md transition-all duration-200 border",
          day.isToday && "ring-2 ring-primary ring-offset-1",
          !day.isCurrentMonth && "opacity-50",
          getProductivityColor(productivityScore)
        )}
        onClick={() => onDateClick?.(day.date)}
      >
        <CardContent className="p-2 h-full flex flex-col">
          {/* Date header */}
          <div className="flex items-center justify-between mb-1">
            <span className={cn(
              "text-sm font-medium",
              day.isToday && "font-bold"
            )}>
              {day.date.getDate()}
            </span>
            
            {productivityScore > 0 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                {productivityScore}%
              </Badge>
            )}
          </div>
          
          {/* Content indicators */}
          <div className="flex-1 space-y-1 text-xs">
            {/* Events */}
            {day.events.length > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span className="truncate">
                  {day.events.length === 1 
                    ? day.events[0].title 
                    : `${day.events.length} events`
                  }
                </span>
              </div>
            )}
            
            {/* Tasks */}
            {day.totalTasks > 0 && (
              <div className="flex items-center gap-1">
                {day.completedTasks === day.totalTasks ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                <span>
                  {day.completedTasks}/{day.totalTasks} tasks
                </span>
              </div>
            )}
            
            {/* Habits */}
            {day.totalHabits > 0 && (
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>
                  {day.habitCompletions}/{day.totalHabits} habits
                </span>
              </div>
            )}
            
            {/* Mood */}
            {day.moodScore && (
              <div className="flex items-center gap-1">
                <Smile className="h-3 w-3" />
                <span>{day.moodScore}/5</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Week headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
            {day}
          </div>
        ))}
      </div>

      {/* First Week */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Week of {firstWeek[0].date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </h3>
          
          {/* Week summary */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {firstWeek.reduce((sum, day) => sum + day.events.length, 0)} events
            </div>
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3" />
              {firstWeek.reduce((sum, day) => sum + day.totalTasks, 0)} tasks
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {firstWeek.reduce((sum, day) => sum + day.totalHabits, 0)} habits/day
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {firstWeek.map(getDayContent)}
        </div>
      </div>

      {/* Second Week */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Week of {secondWeek[0].date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </h3>
          
          {/* Week summary */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {secondWeek.reduce((sum, day) => sum + day.events.length, 0)} events
            </div>
            <div className="flex items-center gap-1">
              <Circle className="h-3 w-3" />
              {secondWeek.reduce((sum, day) => sum + day.totalTasks, 0)} tasks
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {secondWeek.reduce((sum, day) => sum + day.totalHabits, 0)} habits/day
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {secondWeek.map(getDayContent)}
        </div>
      </div>

      {/* Productivity Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Productivity Score Legend</h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
                <span>Excellent (80%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
                <span>Good (60-79%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-200 border border-orange-300 rounded"></div>
                <span>Fair (40-59%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-200 border border-red-300 rounded"></div>
                <span>Needs Work (&lt;40%)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};