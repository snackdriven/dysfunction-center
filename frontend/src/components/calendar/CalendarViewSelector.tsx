import React from 'react';
import { Button } from '../ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { 
  Calendar,
  List,
  CalendarDays,
  CalendarRange,
  CalendarX2,
  CalendarClock
} from 'lucide-react';
import { cn } from '../../utils/cn';

export type CalendarViewType = 'day' | 'agenda' | '3day' | 'week' | '2week' | 'month';

interface CalendarViewSelectorProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  className?: string;
}

const viewOptions: Array<{
  value: CalendarViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    value: 'day',
    label: 'Day',
    icon: CalendarClock,
    description: 'Single day detailed view'
  },
  {
    value: 'agenda',
    label: 'Agenda',
    icon: List,
    description: 'Linear list of upcoming events'
  },
  {
    value: '3day',
    label: '3 Day',
    icon: CalendarDays,
    description: 'Three day overview'
  },
  {
    value: 'week',
    label: 'Week',
    icon: Calendar,
    description: 'Weekly grid view'
  },
  {
    value: '2week',
    label: '2 Week',
    icon: CalendarRange,
    description: 'Two week compact view'
  },
  {
    value: 'month',
    label: 'Month',
    icon: CalendarX2,
    description: 'Full month overview'
  }
];

export const CalendarViewSelector: React.FC<CalendarViewSelectorProps> = ({
  currentView,
  onViewChange,
  currentDate,
  onDateChange,
  className
}) => {
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
      case 'agenda':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case '3day':
        newDate.setDate(newDate.getDate() - 3);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case '2week':
        newDate.setDate(newDate.getDate() - 14);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    
    onDateChange(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
      case 'agenda':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case '3day':
        newDate.setDate(newDate.getDate() + 3);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case '2week':
        newDate.setDate(newDate.getDate() + 14);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateRangeLabel = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    switch (currentView) {
      case 'day':
        return formatDate(currentDate);
      case 'agenda':
        return `${formatDate(currentDate)} onwards`;
      case '3day': {
        const endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + 2);
        return `${formatDate(currentDate)} - ${formatDate(endDate)}`;
      }
      case 'week': {
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;
      }
      case '2week': {
        const endOf2Week = new Date(startOfWeek);
        endOf2Week.setDate(startOfWeek.getDate() + 13);
        return `${formatDate(startOfWeek)} - ${formatDate(endOf2Week)}`;
      }
      case 'month':
        return currentDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
    }
  };

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {/* Date Navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          className="h-8 px-2"
        >
          ←
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="h-8 px-3"
        >
          Today
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          className="h-8 px-2"
        >
          →
        </Button>
        
        <div className="ml-2 font-medium text-lg">
          {getDateRangeLabel()}
        </div>
      </div>

      {/* View Selector */}
      <div className="flex items-center gap-2">
        {/* Desktop: Button Group */}
        <div className="hidden lg:flex bg-muted rounded-lg p-1">
          {viewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.value}
                variant={currentView === option.value ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onViewChange(option.value)}
                className={cn(
                  "h-8 px-3 text-xs font-medium",
                  currentView === option.value 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
                title={option.description}
              >
                <Icon className="h-3 w-3 mr-1" />
                {option.label}
              </Button>
            );
          })}
        </div>

        {/* Mobile: Dropdown */}
        <div className="lg:hidden">
          <Select value={currentView} onValueChange={(value) => onViewChange(value as CalendarViewType)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};