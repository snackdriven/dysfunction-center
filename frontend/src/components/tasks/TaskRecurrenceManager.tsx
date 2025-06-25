import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Calendar } from '../ui/Calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { 
  Repeat,
  Calendar as CalendarIcon,
  Plus,
  Trash2
} from 'lucide-react';

export interface RecurrenceRule {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  interval: number;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
  dayOfMonth?: number;
  monthOfYear?: number;
  endDate?: Date;
  maxOccurrences?: number;
  exceptions?: Date[]; // Dates to skip
  timezone?: string;
}

interface TaskRecurrenceManagerProps {
  taskId: number;
  currentRecurrence?: RecurrenceRule;
  onUpdate: (recurrence: RecurrenceRule | null) => void;
  onClose?: () => void;
}

const WEEKDAYS = [
  { value: 0, label: 'Sunday', short: 'Su' },
  { value: 1, label: 'Monday', short: 'Mo' },
  { value: 2, label: 'Tuesday', short: 'Tu' },
  { value: 3, label: 'Wednesday', short: 'We' },
  { value: 4, label: 'Thursday', short: 'Th' },
  { value: 5, label: 'Friday', short: 'Fr' },
  { value: 6, label: 'Saturday', short: 'Sa' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const TaskRecurrenceManager: React.FC<TaskRecurrenceManagerProps> = ({
  taskId,
  currentRecurrence,
  onUpdate,
  onClose
}) => {
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(
    currentRecurrence || {
      id: `recur_${Date.now()}`,
      frequency: 'daily',
      interval: 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  );
  
  const [previewDates, setPreviewDates] = useState<Date[]>([]);
  const [exceptions, setExceptions] = useState<Date[]>(currentRecurrence?.exceptions || []);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedExceptionDate, setSelectedExceptionDate] = useState<Date | undefined>();

  // Generate preview dates for the recurrence pattern
  const generatePreview = () => {
    const dates: Date[] = [];
    const startDate = new Date();
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < Math.min(10, recurrence.maxOccurrences || 10); i++) {
      if (recurrence.endDate && currentDate > recurrence.endDate) break;
      
      // Skip exception dates
      if (!exceptions.some(ex => ex.toDateString() === currentDate.toDateString())) {
        dates.push(new Date(currentDate));
      }

      // Calculate next occurrence based on frequency
      switch (recurrence.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + recurrence.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * recurrence.interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + recurrence.interval);
          break;
      }
    }
    
    setPreviewDates(dates);
  };

  React.useEffect(() => {
    generatePreview();
  }, [recurrence, exceptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFrequencyChange = (frequency: RecurrenceRule['frequency']) => {
    setRecurrence(prev => ({
      ...prev,
      frequency,
      // Reset specific settings when frequency changes
      daysOfWeek: frequency === 'weekly' ? prev.daysOfWeek : undefined,
      dayOfMonth: frequency === 'monthly' ? prev.dayOfMonth : undefined,
      monthOfYear: frequency === 'yearly' ? prev.monthOfYear : undefined,
    }));
  };

  const handleDayOfWeekToggle = (day: number) => {
    setRecurrence(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek 
        ? prev.daysOfWeek.includes(day)
          ? prev.daysOfWeek.filter(d => d !== day)
          : [...prev.daysOfWeek, day].sort()
        : [day]
    }));
  };

  const addException = (date: Date) => {
    if (!exceptions.some(ex => ex.toDateString() === date.toDateString())) {
      setExceptions(prev => [...prev, date]);
    }
  };

  const removeException = (date: Date) => {
    setExceptions(prev => prev.filter(ex => ex.toDateString() !== date.toDateString()));
  };

  const handleSave = () => {
    const finalRecurrence = {
      ...recurrence,
      exceptions
    };
    onUpdate(finalRecurrence);
    onClose?.();
  };

  const handleRemove = () => {
    onUpdate(null);
    onClose?.();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Repeat className="h-5 w-5" />
          Task Recurrence Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Frequency Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Repeat Frequency</label>
          <Select 
            value={recurrence.frequency} 
            onValueChange={(value) => handleFrequencyChange(value as RecurrenceRule['frequency'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interval */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Every</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={365}
              value={recurrence.interval}
              onChange={(e) => setRecurrence(prev => ({
                ...prev,
                interval: parseInt(e.target.value) || 1
              }))}
              className="w-20"
            />
            <span className="text-sm text-muted-foreground">
              {recurrence.frequency === 'daily' && 'day(s)'}
              {recurrence.frequency === 'weekly' && 'week(s)'}
              {recurrence.frequency === 'monthly' && 'month(s)'}
              {recurrence.frequency === 'yearly' && 'year(s)'}
            </span>
          </div>
        </div>

        {/* Weekly specific options */}
        {recurrence.frequency === 'weekly' && (
          <div className="space-y-3">
            <label className="text-sm font-medium">On days</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map(day => (
                <Button
                  key={day.value}
                  variant={recurrence.daysOfWeek?.includes(day.value) ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleDayOfWeekToggle(day.value)}
                >
                  {day.short}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Monthly specific options */}
        {recurrence.frequency === 'monthly' && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Day of month</label>
            <Input
              type="number"
              min={1}
              max={31}
              value={recurrence.dayOfMonth || 1}
              onChange={(e) => setRecurrence(prev => ({
                ...prev,
                dayOfMonth: parseInt(e.target.value) || 1
              }))}
              className="w-20"
            />
          </div>
        )}

        {/* Yearly specific options */}
        {recurrence.frequency === 'yearly' && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Month</label>
            <Select 
              value={recurrence.monthOfYear?.toString() || '1'}
              onValueChange={(value) => setRecurrence(prev => ({
                ...prev,
                monthOfYear: parseInt(value)
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={index} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* End conditions */}
        <div className="space-y-3">
          <label className="text-sm font-medium">End condition</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={!!recurrence.maxOccurrences}
                onCheckedChange={(checked) => setRecurrence(prev => ({
                  ...prev,
                  maxOccurrences: checked ? 10 : undefined
                }))}
              />
              <span className="text-sm">After</span>
              <Input
                type="number"
                min={1}
                max={365}
                value={recurrence.maxOccurrences || 10}
                onChange={(e) => setRecurrence(prev => ({
                  ...prev,
                  maxOccurrences: parseInt(e.target.value) || undefined
                }))}
                disabled={!recurrence.maxOccurrences}
                className="w-20"
              />
              <span className="text-sm">occurrences</span>
            </div>
          </div>
        </div>

        {/* Exception dates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Exception dates</label>
            <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add exception
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Select exception date</DialogTitle>
                </DialogHeader>
                <Calendar
                  mode="single"
                  selected={selectedExceptionDate}
                  onSelect={(date: Date | Date[] | undefined) => {
                    if (date && !Array.isArray(date)) {
                      addException(date);
                      setSelectedExceptionDate(undefined);
                      setShowCalendar(false);
                    }
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          {exceptions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {exceptions.map((date, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {date.toLocaleDateString()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeException(date)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Next occurrences</label>
          <div className="space-y-2">
            {previewDates.map((date, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>{date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={handleRemove}>
            <Trash2 className="h-4 w-4 mr-2" />
            Remove recurrence
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save recurrence
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
