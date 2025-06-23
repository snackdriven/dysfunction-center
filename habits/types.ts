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
}

export interface LogHabitCompletionResponse {
  completion: HabitCompletion;
  updated_streak: number;
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
