import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Checkbox } from '../ui/Checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { CurrentTimeDisplay } from '../ui/CurrentTimeDisplay';
import { useTimeDisplayPreferences, useUpdateTimeDisplayPreferences } from '../../hooks/useTimeDisplayPreferences';
import { Clock } from 'lucide-react';

export const TimeDisplaySettings: React.FC = () => {
  const { data: timeDisplayData, isLoading } = useTimeDisplayPreferences();
  const updatePreferences = useUpdateTimeDisplayPreferences();

  const timeDisplay = timeDisplayData?.time_display || {
    time_format: '12h',
    date_format: 'short',
    show_seconds: false,
    show_date: true,
    show_timezone: false,
  };

  const handlePreferenceChange = (key: keyof typeof timeDisplay, value: any) => {
    updatePreferences.mutate({
      preferences: { [key]: value },
    });
  };

  const handleTimeFormatChange = (value: string) => {
    handlePreferenceChange('time_format', value as '12h' | '24h');
  };

  const handleDateFormatChange = (value: string) => {
    handlePreferenceChange('date_format', value as 'short' | 'long' | 'iso');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time & Date Display
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time & Date Display
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="p-4 border rounded-lg bg-muted/50">
          <label className="text-sm font-medium mb-2 block">Preview</label>
          <CurrentTimeDisplay 
            format={{
              timeFormat: timeDisplay.time_format,
              dateFormat: timeDisplay.date_format,
              showSeconds: timeDisplay.show_seconds,
              showDate: timeDisplay.show_date,
              showTimeZone: timeDisplay.show_timezone,
            }}
            size="lg"
          />
        </div>

        {/* Time Format */}
        <div className="space-y-2">
          <label htmlFor="time-format" className="text-sm font-medium">Time Format</label>
          <Select
            value={timeDisplay.time_format}
            onValueChange={handleTimeFormatChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour (2:30 PM)</SelectItem>
              <SelectItem value="24h">24-hour (14:30)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <label htmlFor="date-format" className="text-sm font-medium">Date Format</label>
          <Select
            value={timeDisplay.date_format}
            onValueChange={handleDateFormatChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short (Dec 25, 2025)</SelectItem>
              <SelectItem value="long">Long (Wednesday, December 25, 2025)</SelectItem>
              <SelectItem value="iso">ISO (2025-12-25)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show Seconds */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="show-seconds" className="text-sm font-medium">Show Seconds</label>
            <p className="text-sm text-muted-foreground">
              Display seconds in the time
            </p>
          </div>
          <Checkbox
            id="show-seconds"
            checked={timeDisplay.show_seconds}
            onCheckedChange={(checked: boolean) => handlePreferenceChange('show_seconds', checked)}
          />
        </div>

        {/* Show Date */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="show-date" className="text-sm font-medium">Show Date</label>
            <p className="text-sm text-muted-foreground">
              Display the date below the time
            </p>
          </div>
          <Checkbox
            id="show-date"
            checked={timeDisplay.show_date}
            onCheckedChange={(checked: boolean) => handlePreferenceChange('show_date', checked)}
          />
        </div>

        {/* Show Time Zone */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label htmlFor="show-timezone" className="text-sm font-medium">Show Time Zone</label>
            <p className="text-sm text-muted-foreground">
              Display the time zone abbreviation
            </p>
          </div>
          <Checkbox
            id="show-timezone"
            checked={timeDisplay.show_timezone}
            onCheckedChange={(checked: boolean) => handlePreferenceChange('show_timezone', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
