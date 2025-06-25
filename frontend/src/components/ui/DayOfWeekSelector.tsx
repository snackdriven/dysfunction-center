import React from 'react';
import { Button } from './Button';
import { cn } from '../../utils/cn';

// Day of week type
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type SchedulePattern = 'daily' | 'weekdays' | 'weekends' | 'custom';

interface DayOfWeekSelectorProps {
  selectedDays: DayOfWeek[];
  onChange: (selectedDays: DayOfWeek[]) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact';
  className?: string;
  label?: string;
  description?: string;
  showSelectAll?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const DAYS_OF_WEEK: { key: DayOfWeek; short: string; full: string }[] = [
  { key: 'monday', short: 'Mon', full: 'Monday' },
  { key: 'tuesday', short: 'Tue', full: 'Tuesday' },
  { key: 'wednesday', short: 'Wed', full: 'Wednesday' },
  { key: 'thursday', short: 'Thu', full: 'Thursday' },
  { key: 'friday', short: 'Fri', full: 'Friday' },
  { key: 'saturday', short: 'Sat', full: 'Saturday' },
  { key: 'sunday', short: 'Sun', full: 'Sunday' }
];

export const DayOfWeekSelector: React.FC<DayOfWeekSelectorProps> = ({
  selectedDays,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  className,
  label,
  description,
  showSelectAll = true,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}) => {
  const toggleDay = (day: DayOfWeek) => {
    if (disabled) return;
    
    const isSelected = selectedDays.includes(day);
    if (isSelected) {
      onChange(selectedDays.filter(d => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  const selectAll = () => {
    if (disabled) return;
    onChange(DAYS_OF_WEEK.map(d => d.key));
  };

  const selectNone = () => {
    if (disabled) return;
    onChange([]);
  };

  const selectWeekdays = () => {
    if (disabled) return;
    onChange(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  };

  const selectWeekends = () => {
    if (disabled) return;
    onChange(['saturday', 'sunday']);
  };

  const isWeekdaysSelected = () => {
    const weekdays: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    return weekdays.every(day => selectedDays.includes(day)) && 
           !selectedDays.includes('saturday') && 
           !selectedDays.includes('sunday');
  };

  const isWeekendsSelected = () => {
    const weekends: DayOfWeek[] = ['saturday', 'sunday'];
    return weekends.every(day => selectedDays.includes(day)) && 
           !['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].some(day => selectedDays.includes(day as DayOfWeek));
  };

  const isAllSelected = () => selectedDays.length === DAYS_OF_WEEK.length;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'h-8 w-8 text-xs',
          container: 'gap-1'
        };
      case 'lg':
        return {
          button: 'h-12 w-12 text-base',
          container: 'gap-3'
        };
      default:
        return {
          button: 'h-10 w-10 text-sm',
          container: 'gap-2'
        };
    }
  };

  const { button: buttonClasses, container: containerClasses } = getSizeClasses();

  return (
    <div className={cn('space-y-3', className)}>
      {/* Label and description */}
      {(label || description) && (
        <div>
          {label && (
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-gray-500" id={ariaDescribedBy}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* Quick selection buttons */}
      {showSelectAll && variant !== 'compact' && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={disabled || isAllSelected()}
            className="text-xs"
          >
            All Days
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectWeekdays}
            disabled={disabled || isWeekdaysSelected()}
            className="text-xs"
          >
            Weekdays
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectWeekends}
            disabled={disabled || isWeekendsSelected()}
            className="text-xs"
          >
            Weekends
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectNone}
            disabled={disabled || selectedDays.length === 0}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Day selector buttons */}
      <div 
        className={cn('flex justify-center', containerClasses)}
        role="group"
        aria-label={ariaLabel || 'Select days of the week'}
        aria-describedby={ariaDescribedBy}
      >
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDays.includes(day.key);
          
          return (
            <Button
              key={day.key}
              type="button"
              variant={isSelected ? 'primary' : 'outline'}
              className={cn(
                buttonClasses,
                'relative transition-all',
                isSelected ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-gray-100',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => toggleDay(day.key)}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`${day.full} - ${isSelected ? 'selected' : 'not selected'}`}
              title={day.full}
            >
              <span className="font-medium">
                {variant === 'compact' ? day.short.charAt(0) : day.short}
              </span>
              
              {/* Selected indicator */}
              {isSelected && (
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-400 rounded-full ring-2 ring-white" />
              )}
            </Button>
          );
        })}
      </div>

      {/* Selection summary */}
      {selectedDays.length > 0 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Selected:</span>{' '}
          {selectedDays.length === DAYS_OF_WEEK.length ? (
            'Every day'
          ) : selectedDays.length === 5 && isWeekdaysSelected() ? (
            'Weekdays only'
          ) : selectedDays.length === 2 && isWeekendsSelected() ? (
            'Weekends only'
          ) : selectedDays.length === 1 ? (
            DAYS_OF_WEEK.find(d => d.key === selectedDays[0])?.full
          ) : (
            `${selectedDays.length} days (${selectedDays.map(day => 
              DAYS_OF_WEEK.find(d => d.key === day)?.short
            ).join(', ')})`
          )}
        </div>
      )}

      {/* Accessibility hint */}
      <div className="sr-only" aria-live="polite">
        {selectedDays.length === 0 
          ? 'No days selected'
          : `${selectedDays.length} ${selectedDays.length === 1 ? 'day' : 'days'} selected`
        }
      </div>
    </div>
  );
};

// Hook for managing day selection with common patterns
export const useDayOfWeekSelector = (initialDays: DayOfWeek[] = []) => {
  const [selectedDays, setSelectedDays] = React.useState<DayOfWeek[]>(initialDays);

  // Update state when initialDays changes (for testing)
  React.useEffect(() => {
    setSelectedDays(initialDays);
  }, [initialDays.join(',')]);

  const selectPattern = (pattern: 'all' | 'weekdays' | 'weekends' | 'none') => {
    switch (pattern) {
      case 'all':
        setSelectedDays(DAYS_OF_WEEK.map(d => d.key));
        break;
      case 'weekdays':
        setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
        break;
      case 'weekends':
        setSelectedDays(['saturday', 'sunday']);
        break;
      case 'none':
        setSelectedDays([]);
        break;
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const isSelected = (day: DayOfWeek) => selectedDays.includes(day);

  const getSelectedCount = () => selectedDays.length;

  const getPatternName = (): string => {
    if (selectedDays.length === 0) return 'None';
    if (selectedDays.length === 7) return 'Every day';
    
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekends = ['saturday', 'sunday'];
    
    // Check if exactly weekdays are selected (no more, no less)
    const isWeekdays = selectedDays.length === 5 && 
                      weekdays.every(day => selectedDays.includes(day as DayOfWeek));
    
    // Check if exactly weekends are selected (no more, no less)
    const isWeekends = selectedDays.length === 2 && 
                      weekends.every(day => selectedDays.includes(day as DayOfWeek));
    
    if (isWeekdays) return 'Weekdays';
    if (isWeekends) return 'Weekends';
    if (selectedDays.length === 1) {
      return DAYS_OF_WEEK.find(d => d.key === selectedDays[0])?.full || 'Custom';
    }
    
    return 'Custom';
  };

  return {
    selectedDays,
    setSelectedDays,
    selectPattern,
    toggleDay,
    isSelected,
    getSelectedCount,
    getPatternName
  };
};