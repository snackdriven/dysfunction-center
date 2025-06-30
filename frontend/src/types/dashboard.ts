/**
 * Comprehensive TypeScript interfaces for dashboard components
 * Eliminates 'any' types and provides semantic clarity
 */

// Core productivity data structures
export interface ProductivityMetrics {
  productivity_score: number;
  tasks: CompletionStats;
  habits: CompletionStats;
  mood: MoodStats;
  events: EventStats;
}

export interface CompletionStats {
  completed: number;
  total: number;
  percentage: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface MoodStats {
  score: number | null;
  entries_count: number;
  average_energy: number | null;
  average_stress: number | null;
  latest_entry?: MoodEntry;
}

export interface EventStats {
  total_events: number;
  duration_minutes: number;
  upcoming_count: number;
  today_count: number;
}

// Enhanced entity interfaces with semantic properties
export interface DashboardTask {
  id: number;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  due_date: string | null;
  category?: string;
  estimated_duration?: number;
  is_overdue?: boolean;
}

export interface DashboardHabit {
  id: number;
  name: string;
  description?: string;
  current_streak?: number;
  streak_count?: number;
  target_frequency: number;
  completion_type: 'boolean' | 'count' | 'duration';
  is_active: boolean;
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  date: string;
  completed: boolean;
  value: number;
  notes?: string;
}

export interface MoodEntry {
  id: number;
  mood_score: number;
  energy_level?: number;
  stress_level?: number;
  mood_category?: string;
  notes?: string;
  triggers?: string[];
  created_at: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  is_all_day: boolean;
  location?: string;
  task_id?: number;
  category?: string;
}

export interface ProductivityInsight {
  id: string;
  type: 'positive' | 'warning' | 'suggestion';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action_items: string[];
  category: 'tasks' | 'habits' | 'mood' | 'calendar' | 'general';
  generated_at: string;
}

// Widget-specific interfaces
export interface WidgetProps<T = unknown> {
  data?: T;
  loading?: boolean;
  error?: string;
  className?: string;
  onAction?: (action: string, payload?: unknown) => void;
}

export interface TaskWidgetProps extends WidgetProps<DashboardTask[]> {
  onTaskToggle?: (taskId: number, completed: boolean) => void;
  onTaskEdit?: (task: DashboardTask) => void;
  maxItems?: number;
}

export interface HabitWidgetProps extends WidgetProps<DashboardHabit[]> {
  completions?: HabitCompletion[];
  onHabitToggle?: (habitId: number) => void;
  onHabitEdit?: (habit: DashboardHabit) => void;
  maxItems?: number;
}

export interface MoodWidgetProps extends WidgetProps<MoodEntry[]> {
  onMoodAdd?: () => void;
  onMoodEdit?: (entry: MoodEntry) => void;
  showTrend?: boolean;
}

export interface EventWidgetProps extends WidgetProps<CalendarEvent[]> {
  onEventAdd?: () => void;
  onEventEdit?: (event: CalendarEvent) => void;
  timeRange?: 'today' | 'week' | 'month';
}

// Utility type definitions
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MoodCategory = 'excited' | 'happy' | 'content' | 'anxious' | 'sad' | 'angry';
export type ViewTimeRange = 'today' | 'week' | 'month' | 'custom';
export type DashboardTab = 'overview' | 'today' | 'insights' | 'actions';

// Form interfaces for modal operations
export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  due_date?: string;
  category?: string;
  estimated_duration?: number;
}

export interface HabitFormData {
  name: string;
  description?: string;
  target_frequency: number;
  completion_type: 'boolean' | 'count' | 'duration';
  reminder_time?: string;
  reminder_days?: number[];
}

export interface MoodFormData {
  mood_score: number;
  energy_level?: number;
  stress_level?: number;
  mood_category?: MoodCategory;
  notes?: string;
  triggers?: string[];
}

export interface EventFormData {
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  is_all_day: boolean;
  location?: string;
  category?: string;
}

// State management interfaces
export interface DashboardState {
  selectedDate: string;
  activeTab: DashboardTab;
  filters: {
    priority?: TaskPriority[];
    category?: string[];
    timeRange: ViewTimeRange;
  };
  preferences: {
    defaultView: DashboardTab;
    itemsPerWidget: number;
    showCompletedTasks: boolean;
    autoRefreshInterval: number;
  };
}

// API response wrapper
export interface APIResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
  success: boolean;
}

// Error handling
export interface DashboardError {
  code: string;
  message: string;
  component?: string;
  timestamp: string;
  recoverable: boolean;
}