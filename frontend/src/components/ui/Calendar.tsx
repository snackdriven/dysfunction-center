import React from 'react';
import { Button } from './Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  mode?: 'single' | 'multiple';
  selected?: Date | Date[];
  onSelect?: (date: Date | Date[] | undefined) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  mode = 'single',
  selected,
  onSelect,
  disabled,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isSelected = (date: Date) => {
    if (!selected) return false;
    if (mode === 'single') {
      return selected instanceof Date && 
        date.toDateString() === selected.toDateString();
    }
    if (Array.isArray(selected)) {
      return selected.some(d => d.toDateString() === date.toDateString());
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (disabled?.(date)) return;
    
    if (mode === 'single') {
      onSelect?.(date);
    } else if (mode === 'multiple') {
      const selectedArray = Array.isArray(selected) ? selected : [];
      const isDateSelected = selectedArray.some(d => d.toDateString() === date.toDateString());
      
      if (isDateSelected) {
        onSelect?.(selectedArray.filter(d => d.toDateString() !== date.toDateString()));
      } else {
        onSelect?.([...selectedArray, date]);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-9 w-9" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled = disabled?.(date);
      const isDateSelected = isSelected(date);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          disabled={isDisabled}
          className={`
            h-9 w-9 rounded-md text-sm font-medium transition-colors
            hover:bg-accent hover:text-accent-foreground
            focus:bg-accent focus:text-accent-foreground focus:outline-none
            disabled:pointer-events-none disabled:opacity-50
            ${isDateSelected ? 'bg-primary text-primary-foreground' : ''}
          `}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className={`p-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('prev')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="font-semibold">
          {monthNames[month]} {year}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth('next')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Week days header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map(day => (
          <div key={day} className="h-9 w-9 text-center text-sm font-medium text-muted-foreground flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};
