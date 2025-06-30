import { HabitCategory, DateString, TimestampString } from "../shared/types";

// Habit Template interface
export interface HabitTemplate {
  id: number;
  name: string;
  description?: string;
  category?: string;
  suggested_target_type: 'daily' | 'weekly' | 'custom';
  suggested_target_value: number;
  suggested_unit?: string;
  icon?: string;
  created_at: TimestampString;
}

// Habit Streak interface
export interface HabitStreak {
  id: number;
  habit_id: number;
  start_date: DateString;
  end_date?: DateString;
  streak_length: number;
  is_current: boolean;
  created_at: TimestampString;
}

// Target and completion type definitions
export type TargetType = 'daily' | 'weekly' | 'custom';
export type CompletionType = 'boolean' | 'count' | 'duration';

// Day of week scheduling
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type SchedulePattern = 'daily' | 'weekdays' | 'weekends' | 'custom';

// Enhanced Habit interface
export interface Habit {
  id: number;
  name: string;
  description?: string;
  category: HabitCategory;
  target_frequency: number;
  active: boolean;
  created_at: TimestampString;
  updated_at: TimestampString;
  // Phase 2 enhancements
  target_type: TargetType;
  completion_type: CompletionType;
  target_value: number;
  unit?: string;
  template_id?: number;
  template?: HabitTemplate;
  reminder_enabled: boolean;
  reminder_time?: string; // TIME format
  // Day-of-week scheduling
  schedule_pattern?: SchedulePattern;
  scheduled_days?: DayOfWeek[]; // For custom scheduling
}

// Enhanced Habit completion interface
export interface HabitCompletion {
  id: number;
  habit_id: number;
  completion_date: DateString;
  completed: boolean;
  notes?: string;
  created_at: TimestampString;
  // Phase 2 enhancements
  completion_value: number;
  // Multi-completion support
  completion_timestamp: TimestampString; // Exact timestamp for multiple completions per day
}

// Enhanced Habit with completion data
export interface HabitWithCompletion extends Habit {
  today_completed: boolean;
  current_streak: number;
  completion_rate: number; // percentage for last 30 days
  // Phase 2 enhancements
  today_completion_value?: number;
  longest_streak: number;
  average_completion_value?: number;
  consistency_score: number; // 0-100 based on regularity
  // Multi-completion support
  today_completions?: HabitCompletion[]; // All completions for today
  today_total_value?: number; // Sum of all completion values for today
}

// Enhanced Request/Response types
export interface CreateHabitRequest {
  name: string;
  description?: string;
  category?: HabitCategory;
  target_frequency?: number;
  // Phase 2 enhancements
  target_type?: TargetType;
  completion_type?: CompletionType;
  target_value?: number;
  unit?: string;
  template_id?: number;
  reminder_enabled?: boolean;
  reminder_time?: string;
  // Day-of-week scheduling
  schedule_pattern?: SchedulePattern;
  scheduled_days?: DayOfWeek[];
}

export interface CreateHabitResponse {
  habit: Habit;
}

export interface UpdateHabitRequest {
  id: number;
  name?: string;
  description?: string;
  category?: HabitCategory;
  target_frequency?: number;
  active?: boolean;
  // Phase 2 enhancements
  target_type?: TargetType;
  completion_type?: CompletionType;
  target_value?: number;
  unit?: string;
  template_id?: number;
  reminder_enabled?: boolean;
  reminder_time?: string;
  // Day-of-week scheduling
  schedule_pattern?: SchedulePattern;
  scheduled_days?: DayOfWeek[];
}

export interface UpdateHabitResponse {
  habit: Habit;
}

export interface GetHabitResponse {
  habit: HabitWithCompletion;
}

export interface GetHabitsRequest {
  active?: boolean;
  category?: HabitCategory;
  include_today?: boolean;
  // Phase 2 enhancements
  target_type?: TargetType;
  completion_type?: CompletionType;
  template_id?: number;
  with_reminders?: boolean;
}

export interface GetHabitsResponse {
  habits: HabitWithCompletion[];
}

export interface DeleteHabitRequest {
  id: number;
}

export interface DeleteHabitResponse {
  success: boolean;
  message: string;
}

// Enhanced Completion tracking types
export interface LogHabitCompletionRequest {
  habit_id: number;
  completion_date?: DateString;
  completed?: boolean;
  notes?: string;
  // Phase 2 enhancements
  completion_value?: number;
  // Multi-completion support
  completion_timestamp?: TimestampString; // Specific timestamp for this completion
}

export interface LogHabitCompletionResponse {
  completion: HabitCompletion;
  updated_streak: number;
  // Multi-completion support
  daily_total_value?: number; // Total completion value for the day
  target_progress?: number; // Progress towards daily target (0-100%)
}

// New interface for getting daily completions
export interface GetDailyCompletionsRequest {
  habit_id: number;
  date?: DateString; // Defaults to today
}

export interface GetDailyCompletionsResponse {
  completions: HabitCompletion[];
  total_value: number;
  target_value: number;
  progress_percentage: number;
  is_target_met: boolean;
}

// New interface for bulk completion logging (for multi-count habits)
export interface LogMultipleCompletionsRequest {
  habit_id: number;
  completions: Array<{
    completion_value?: number;
    notes?: string;
    completion_timestamp?: TimestampString;
  }>;
  completion_date?: DateString;
}

export interface LogMultipleCompletionsResponse {
  completions: HabitCompletion[];
  daily_total_value: number;
  updated_streak: number;
  target_progress: number;
}

export interface GetHabitHistoryRequest {
  habit_id: number;
  start_date?: DateString;
  end_date?: DateString;
}

export interface GetHabitHistoryResponse {
  completions: HabitCompletion[];
  streak_data: {
    current_streak: number;
    longest_streak: number;
    completion_rate: number;
    consistency_score: number;
    average_completion_value?: number;
  };
  streaks: HabitStreak[];
}

// Phase 2: Template Management Types
export interface GetTemplatesRequest {
  category?: string;
}

export interface GetTemplatesResponse {
  templates: HabitTemplate[];
}

export interface CreateFromTemplateRequest {
  template_id: number;
  name?: string; // override template name
  target_value?: number; // override suggested value
  reminder_enabled?: boolean;
  reminder_time?: string;
}

export interface CreateFromTemplateResponse {
  habit: Habit;
}

// Phase 2: Analytics Types
export interface HabitAnalyticsRequest {
  habit_id?: number;
  start_date?: DateString;
  end_date?: DateString;
  category?: HabitCategory;
}

export interface HabitAnalyticsResponse {
  total_habits: number;
  active_habits: number;
  average_streak: number;
  best_category: string;
  completion_trends: Array<{
    date: DateString;
    completion_rate: number;
    completed_habits: number;
    total_habits: number;
  }>;
  habit_insights: Array<{
    habit: Habit;
    current_streak: number;
    longest_streak: number;
    completion_rate: number;
    consistency_score: number;
    recommendation?: string;
  }>;
}

// Phase 2: Reminder Types
export interface GetUpcomingRemindersResponse {
  reminders: Array<{
    habit: Habit;
    reminder_time: string;
    minutes_until: number;
  }>;
}

export interface UpdateReminderRequest {
  habit_id: number;
  reminder_enabled: boolean;
  reminder_time?: string;
}

export interface UpdateReminderResponse {
  habit: Habit;
}

// Response type for getting today's completions across all habits
export interface GetTodayCompletionsAllResponse {
  completions: HabitCompletion[];
}
