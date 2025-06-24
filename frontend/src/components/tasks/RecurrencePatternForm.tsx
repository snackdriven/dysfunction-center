import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { CalendarDays, Repeat, Clock, AlertCircle } from 'lucide-react';
import { RecurrencePattern } from '../../services/tasks';

interface RecurrencePatternFormProps {
  pattern?: RecurrencePattern;
  onChange: (pattern: RecurrencePattern | undefined) => void;
  startDate?: string;
}

const DAYS_OF_WEEK = [
  { label: 'Sunday', value: 0, short: 'Sun' },
  { label: 'Monday', value: 1, short: 'Mon' },
  { label: 'Tuesday', value: 2, short: 'Tue' },
  { label: 'Wednesday', value: 3, short: 'Wed' },
  { label: 'Thursday', value: 4, short: 'Thu' },
  { label: 'Friday', value: 5, short: 'Fri' },
  { label: 'Saturday', value: 6, short: 'Sat' },
];

export const RecurrencePatternForm: React.FC<RecurrencePatternFormProps> = ({ 
  pattern, 
  onChange, 
  startDate 
}) => {
  const [isEnabled, setIsEnabled] = useState(!!pattern);
  const [formData, setFormData] = useState<RecurrencePattern>({
    type: 'daily',
    interval: 1,
    days_of_week: [],
    end_date: undefined,
    occurrences: undefined,
    ...pattern
  });
  const [endType, setEndType] = useState<'never' | 'date' | 'occurrences'>('never');

  useEffect(() => {
    if (pattern) {
      setFormData(pattern);
      if (pattern.end_date) {
        setEndType('date');
      } else if (pattern.occurrences) {
        setEndType('occurrences');
      } else {
        setEndType('never');
      }
    }
  }, [pattern]);

  useEffect(() => {
    if (isEnabled) {
      onChange(formData);
    } else {
      onChange(undefined);
    }
  }, [isEnabled, formData, onChange]);

  const handleToggleEnabled = () => {
    setIsEnabled(!isEnabled);
  };

  const handleTypeChange = (type: 'daily' | 'weekly' | 'monthly' | 'custom') => {
    const newPattern = { ...formData, type };
    
    // Reset days_of_week for non-weekly types
    if (type !== 'weekly' && type !== 'custom') {
      newPattern.days_of_week = [];
    }
    
    // Set default days_of_week for weekly
    if (type === 'weekly' && (!formData.days_of_week || formData.days_of_week.length === 0)) {
      const today = new Date().getDay();
      newPattern.days_of_week = [today];
    }
    
    setFormData(newPattern);
  };

  const handleIntervalChange = (interval: number) => {
    setFormData(prev => ({ ...prev, interval: Math.max(1, interval) }));
  };

  const handleDayToggle = (dayValue: number) => {
    const currentDays = formData.days_of_week || [];
    const newDays = currentDays.includes(dayValue)
      ? currentDays.filter(d => d !== dayValue)
      : [...currentDays, dayValue].sort();
    
    setFormData(prev => ({ ...prev, days_of_week: newDays }));
  };

  const handleEndTypeChange = (type: 'never' | 'date' | 'occurrences') => {
    setEndType(type);
    const newPattern = { ...formData };
    
    if (type === 'never') {
      newPattern.end_date = undefined;
      newPattern.occurrences = undefined;
    } else if (type === 'date') {
      newPattern.occurrences = undefined;
      if (!newPattern.end_date) {
        // Set end date to 1 month from start date or today
        const baseDate = startDate ? new Date(startDate) : new Date();
        baseDate.setMonth(baseDate.getMonth() + 1);
        newPattern.end_date = baseDate.toISOString().split('T')[0];
      }
    } else if (type === 'occurrences') {
      newPattern.end_date = undefined;
      if (!newPattern.occurrences) {
        newPattern.occurrences = 10;
      }
    }
    
    setFormData(newPattern);
  };

  const generatePreviewText = (): string => {
    if (!isEnabled) return 'Not recurring';
    
    const { type, interval, days_of_week, end_date, occurrences } = formData;
    let text = '';
    
    // Frequency part
    if (type === 'daily') {
      text = interval === 1 ? 'Daily' : `Every ${interval} days`;
    } else if (type === 'weekly') {
      const selectedDays = (days_of_week || []).map(d => DAYS_OF_WEEK.find(day => day.value === d)?.short).filter(Boolean);
      if (interval === 1) {
        text = selectedDays.length > 0 ? `Weekly on ${selectedDays.join(', ')}` : 'Weekly';
      } else {
        text = `Every ${interval} weeks${selectedDays.length > 0 ? ` on ${selectedDays.join(', ')}` : ''}`;
      }
    } else if (type === 'monthly') {
      text = interval === 1 ? 'Monthly' : `Every ${interval} months`;
    } else {
      text = 'Custom pattern';
    }
    
    // End condition part
    if (end_date) {
      text += ` until ${new Date(end_date).toLocaleDateString()}`;
    } else if (occurrences) {
      text += ` for ${occurrences} times`;
    }
    
    return text;
  };

  const isPatternValid = (): boolean => {
    if (!isEnabled) return true;
    
    if (formData.type === 'weekly' || formData.type === 'custom') {
      return (formData.days_of_week?.length || 0) > 0;
    }
    
    return true;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Recurring Task
          </CardTitle>
          <Button
            type="button"
            variant={isEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleToggleEnabled}
          >
            {isEnabled ? 'Enabled' : 'Enable'}
          </Button>
        </div>
      </CardHeader>

      {isEnabled && (
        <CardContent className="space-y-4">
          {/* Pattern Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Repeat</label>
            <Select value={formData.type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interval */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Every {formData.type === 'daily' ? 'day(s)' : formData.type === 'weekly' ? 'week(s)' : formData.type === 'monthly' ? 'month(s)' : 'interval'}
            </label>
            <Input
              type="number"
              min="1"
              max="365"
              value={formData.interval}
              onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
            />
          </div>

          {/* Days of Week (for weekly and custom) */}
          {(formData.type === 'weekly' || formData.type === 'custom') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Days of the week</label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-1">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={(formData.days_of_week || []).includes(day.value)}
                      onCheckedChange={() => handleDayToggle(day.value)}
                    />
                    <label htmlFor={`day-${day.value}`} className="text-xs font-medium cursor-pointer">
                      {day.short}
                    </label>
                  </div>
                ))}
              </div>
              {!isPatternValid() && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  Please select at least one day
                </div>
              )}
            </div>
          )}

          {/* End Condition */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Ends</label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="end-never"
                  name="endType"
                  checked={endType === 'never'}
                  onChange={() => handleEndTypeChange('never')}
                  className="rounded border-gray-300"
                />
                <label htmlFor="end-never" className="text-sm">Never</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="end-date"
                  name="endType"
                  checked={endType === 'date'}
                  onChange={() => handleEndTypeChange('date')}
                  className="rounded border-gray-300"
                />
                <label htmlFor="end-date" className="text-sm">On</label>
                {endType === 'date' && (
                  <Input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value || undefined }))}
                    className="w-40"
                    min={startDate}
                  />
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="end-occurrences"
                  name="endType"
                  checked={endType === 'occurrences'}
                  onChange={() => handleEndTypeChange('occurrences')}
                  className="rounded border-gray-300"
                />
                <label htmlFor="end-occurrences" className="text-sm">After</label>
                {endType === 'occurrences' && (
                  <>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      value={formData.occurrences || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, occurrences: parseInt(e.target.value) || undefined }))}
                      className="w-20"
                    />
                    <span className="text-sm">occurrences</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            <Badge variant={isPatternValid() ? "default" : "destructive"} className="text-xs">
              {generatePreviewText()}
            </Badge>
          </div>
        </CardContent>
      )}
    </Card>
  );
};