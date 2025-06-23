import { HabitCategory, DateString, TimestampString } from "../shared/types";

// Core Habit interface
export interface Habit {
  id: number;
  name: string;
  description?: string;
  category: HabitCategory;
  target_frequency: number;
  active: boolean;
  created_at: TimestampString;
  updated_at: TimestampString;
}

// Habit completion interface
export interface HabitCompletion {
  id: number;
  habit_id: number;
  completion_date: DateString;
  completed: boolean;
  notes?: string;
  created_at: TimestampString;
}

// Habit with completion data
export interface HabitWithCompletion extends Habit {
  today_completed: boolean;
  current_streak: number;
  completion_rate: number; // percentage for last 30 days
}

// Request/Response types
export interface CreateHabitRequest {
  name: string;
  description?: string;
  category?: HabitCategory;
  target_frequency?: number;
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

// Completion tracking types
export interface LogHabitCompletionRequest {
  habit_id: number;
  completion_date?: DateString;
  completed?: boolean;
  notes?: string;
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
  };
}
