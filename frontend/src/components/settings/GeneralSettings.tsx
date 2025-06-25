import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { 
  Clock, 
  Calendar, 
  Globe, 
  Save,
  Settings as SettingsIcon,
  AlertCircle,
  CheckCircle,
  CalendarDays
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService } from '../../services/preferences';
import { cn } from '../../utils/cn';

export const GeneralSettings: React.FC = () => {
  const queryClient = useQueryClient();
  const [endOfDayTime, setEndOfDayTime] = useState('23:59');
  const [startOfWeek, setStartOfWeek] = useState('monday');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [defaultCalendarView, setDefaultCalendarView] = useState('week');
  const [streakGracePeriod, setStreakGracePeriod] = useState('0');

  // Fetch current preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => preferencesService.getAllPreferences(),
  });

  // Update local state when preferences data changes
  React.useEffect(() => {
    if (preferences?.preferences) {
      setEndOfDayTime(preferences.preferences.end_of_day_time || '23:59');
      setStartOfWeek(preferences.preferences.start_of_week || 'monday');
      setDateFormat(preferences.preferences.date_format || 'YYYY-MM-DD');
      setTimeFormat(preferences.preferences.time_format || '24h');
      setDefaultCalendarView(preferences.preferences.default_calendar_view || 'week');
      setStreakGracePeriod(preferences.preferences.habit_streak_grace_period || '0');
    }
  }, [preferences]);

  // Save preferences mutation
  const savePreferencesMutation = useMutation({
    mutationFn: async (prefs: Record<string, string>) => {
      const promises = Object.entries(prefs).map(([key, value]) =>
        preferencesService.setPreference(key, value)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    }
  });

  const handleSave = () => {
    const prefsToSave = {
      end_of_day_time: endOfDayTime,
      start_of_week: startOfWeek,
      date_format: dateFormat,
      time_format: timeFormat,
      default_calendar_view: defaultCalendarView,
      habit_streak_grace_period: streakGracePeriod
    };
    savePreferencesMutation.mutate(prefsToSave);
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      {/* End of Day Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time & Schedule Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure how the app handles time-based features like habit tracking and daily cycles.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* End of Day Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">End of Day Time</label>
              <Badge variant="outline" className="text-xs">
                Critical for habit tracking
              </Badge>
            </div>
            <Input
              type="time"
              value={endOfDayTime}
              onChange={(e) => setEndOfDayTime(e.target.value)}
              className="w-32"
            />
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">How End of Day Works</p>
                  <p className="text-blue-800">
                    Your "day" for habit tracking extends until this time. 
                    For example, if set to 2:00 AM, activities at 1:30 AM still count for the previous day.
                    This helps night owls track habits consistently.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Start of Week */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Start of Week</label>
            <Select value={startOfWeek} onValueChange={setStartOfWeek}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="tuesday">Tuesday</SelectItem>
                <SelectItem value="wednesday">Wednesday</SelectItem>
                <SelectItem value="thursday">Thursday</SelectItem>
                <SelectItem value="friday">Friday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Time Format</label>
            <Select value={timeFormat} onValueChange={setTimeFormat}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                <SelectItem value="24h">24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Format */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Format</label>
            <Select value={dateFormat} onValueChange={setDateFormat}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YYYY-MM-DD">2024-01-15 (ISO)</SelectItem>
                <SelectItem value="MM/DD/YYYY">01/15/2024 (US)</SelectItem>
                <SelectItem value="DD/MM/YYYY">15/01/2024 (EU)</SelectItem>
                <SelectItem value="DD-MM-YYYY">15-01-2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Calendar Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default Calendar View */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Calendar View</label>
            <Select value={defaultCalendarView} onValueChange={setDefaultCalendarView}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
                <SelectItem value="3day">3 Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="2week">2 Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Habit Tracking Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Habit Tracking Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Streak Grace Period */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Streak Grace Period (days)</label>
              <Badge variant="outline" className="text-xs">
                Advanced
              </Badge>
            </div>
            <Input
              type="number"
              min="0"
              max="7"
              value={streakGracePeriod}
              onChange={(e) => setStreakGracePeriod(e.target.value)}
              className="w-24"
            />
            <p className="text-xs text-muted-foreground">
              Allow this many missed days before breaking a streak. Set to 0 for strict tracking.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <p className="text-sm text-muted-foreground mt-1">
                Coming soon - User profiles will be implemented in a future update.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Time Zone</label>
              <div className="flex items-center gap-2 mt-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Automatically detected from your browser. Manual timezone selection coming soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Save Settings</h4>
              <p className="text-sm text-muted-foreground">
                Apply your configuration changes across the application.
              </p>
            </div>
            <Button 
              onClick={handleSave}
              disabled={savePreferencesMutation.isPending}
              className="flex items-center gap-2"
            >
              {savePreferencesMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
          {savePreferencesMutation.isSuccess && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Settings saved successfully!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};