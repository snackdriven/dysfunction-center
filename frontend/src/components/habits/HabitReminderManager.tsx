import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar,
  Smartphone,
  Mail,
  Volume2,
  VolumeX,
  Edit,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Habit, useUpdateHabit } from '../../services/habits';

interface HabitReminder {
  id: string;
  time: string;
  days: number[];
  type: 'notification' | 'email' | 'sound';
  message?: string;
  enabled: boolean;
  created_at: string;
}

interface HabitReminderManagerProps {
  habit: Habit;
  reminders?: HabitReminder[];
  onRemindersUpdate?: (reminders: HabitReminder[]) => void;
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

const REMINDER_TYPES = [
  { value: 'notification', label: 'Push Notification', icon: Smartphone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'sound', label: 'Sound Alert', icon: Volume2 },
];

export const HabitReminderManager: React.FC<HabitReminderManagerProps> = ({
  habit,
  reminders = [],
  onRemindersUpdate
}) => {
  const [localReminders, setLocalReminders] = useState<HabitReminder[]>(reminders);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<HabitReminder>>({
    time: '09:00',
    days: [1, 2, 3, 4, 5], // Weekdays by default
    type: 'notification',
    message: '',
    enabled: true,
  });

  const updateHabit = useUpdateHabit();

  // Load reminders from localStorage for this habit
  useEffect(() => {
    const saved = localStorage.getItem(`habit-reminders-${habit.id}`);
    if (saved) {
      const savedReminders = JSON.parse(saved);
      setLocalReminders(savedReminders);
    }
  }, [habit.id]);

  // Save reminders to localStorage
  const saveReminders = (updatedReminders: HabitReminder[]) => {
    setLocalReminders(updatedReminders);
    localStorage.setItem(`habit-reminders-${habit.id}`, JSON.stringify(updatedReminders));
    onRemindersUpdate?.(updatedReminders);
  };

  const createReminder = () => {
    if (!newReminder.time) return;

    const reminder: HabitReminder = {
      id: Date.now().toString(),
      time: newReminder.time!,
      days: newReminder.days || [1, 2, 3, 4, 5],
      type: newReminder.type as 'notification' | 'email' | 'sound',
      message: newReminder.message || `Time for your ${habit.name} habit!`,
      enabled: true,
      created_at: new Date().toISOString(),
    };

    const updatedReminders = [...localReminders, reminder];
    saveReminders(updatedReminders);
    
    setIsCreateDialogOpen(false);
    setNewReminder({
      time: '09:00',
      days: [1, 2, 3, 4, 5],
      type: 'notification',
      message: '',
      enabled: true,
    });
  };

  const deleteReminder = (reminderId: string) => {
    const updatedReminders = localReminders.filter(r => r.id !== reminderId);
    saveReminders(updatedReminders);
  };

  const toggleReminder = (reminderId: string) => {
    const updatedReminders = localReminders.map(r =>
      r.id === reminderId ? { ...r, enabled: !r.enabled } : r
    );
    saveReminders(updatedReminders);
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDays = (days: number[]) => {
    if (days.length === 7) return 'Daily';
    if (days.length === 5 && days.every(d => d >= 1 && d <= 5)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    
    return days.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.short).join(', ');
  };

  const getTypeIcon = (type: string) => {
    const reminderType = REMINDER_TYPES.find(t => t.value === type);
    const Icon = reminderType?.icon || Bell;
    return <Icon className="h-4 w-4" />;
  };

  const enabledReminders = localReminders.filter(r => r.enabled);
  const nextReminder = enabledReminders.find(r => {
    const now = new Date();
    const todayDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return r.days.includes(todayDay) && r.time > currentTime;
  });

  // Mock analytics data
  const reminderStats = {
    totalReminders: localReminders.length,
    enabledReminders: enabledReminders.length,
    dailyReminders: localReminders.filter(r => r.days.length === 7).length,
    completionRate: 85, // Mock data
    averageResponseTime: '3.2', // Mock data in minutes
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Habit Reminders
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAnalyticsOpen(true)}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Reminder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>

                  {/* Days */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Days</label>
                    <div className="grid grid-cols-7 gap-1">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => {
                            const currentDays = newReminder.days || [];
                            const newDays = currentDays.includes(day.value)
                              ? currentDays.filter(d => d !== day.value)
                              : [...currentDays, day.value].sort();
                            setNewReminder(prev => ({ ...prev, days: newDays }));
                          }}
                          className={`p-2 text-xs rounded-md border transition-colors ${
                            (newReminder.days || []).includes(day.value)
                              ? 'bg-blue-100 border-blue-300 text-blue-700'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {day.short}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reminder Type</label>
                    <Select
                      value={newReminder.type}
                      onValueChange={(value) => setNewReminder(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REMINDER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Message */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Message (Optional)</label>
                    <Input
                      placeholder={`Time for your ${habit.name} habit!`}
                      value={newReminder.message}
                      onChange={(e) => setNewReminder(prev => ({ ...prev, message: e.target.value }))}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createReminder} disabled={!newReminder.time}>
                      Create Reminder
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold">{enabledReminders.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{localReminders.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{nextReminder ? formatTime(nextReminder.time) : 'None'}</div>
            <div className="text-xs text-muted-foreground">Next</div>
          </div>
        </div>

        {/* Reminders List */}
        {localReminders.length > 0 ? (
          <div className="space-y-3">
            {localReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  reminder.enabled ? 'bg-background' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(reminder.type)}
                    <div>
                      <div className="font-medium text-sm">
                        {formatTime(reminder.time)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDays(reminder.days)}
                      </div>
                    </div>
                  </div>
                  
                  {reminder.message && (
                    <div className="text-xs text-muted-foreground max-w-40 truncate">
                      "{reminder.message}"
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleReminder(reminder.id)}
                    className="h-6 w-6 p-0"
                  >
                    {reminder.enabled ? (
                      <Volume2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <VolumeX className="h-3 w-3 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteReminder(reminder.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p>No reminders set up yet.</p>
            <p>Create your first reminder to stay on track!</p>
          </div>
        )}

        {/* Legacy Reminder Notice */}
        {habit.reminder_enabled && habit.reminder_time && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                Legacy reminder: {formatTime(habit.reminder_time)} daily
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Consider migrating to the new reminder system for more flexibility.
            </p>
          </div>
        )}
      </CardContent>

      {/* Analytics Dialog */}
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Reminder Analytics
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{reminderStats.totalReminders}</div>
                  <div className="text-sm text-muted-foreground">Total Reminders</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{reminderStats.enabledReminders}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{reminderStats.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Response Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{reminderStats.averageResponseTime}m</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </CardContent>
              </Card>
            </div>

            {/* Reminder Type Distribution */}
            <div>
              <h4 className="font-medium mb-3">Reminder Types</h4>
              <div className="space-y-2">
                {REMINDER_TYPES.map((type) => {
                  const count = localReminders.filter(r => r.type === type.value).length;
                  const percentage = localReminders.length > 0 ? Math.round((count / localReminders.length) * 100) : 0;
                  
                  return (
                    <div key={type.value} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        <span className="text-sm">{type.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">Performance Tips</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Set reminders 15-30 minutes before your optimal habit time</li>
                <li>• Use multiple reminder types for better recall</li>
                <li>• Customize messages to be specific and motivating</li>
                <li>• Review and adjust reminder times based on your response rate</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};