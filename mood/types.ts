import { DateString, TimestampString } from "../shared/types";

// Core MoodEntry interface
export interface MoodEntry {
  id: number;
  mood_score: number; // 1-5 scale
  mood_category?: string;
  notes?: string;
  entry_date: DateString;
  created_at: TimestampString;
  updated_at: TimestampString;
}

// Mood statistics interface
export interface MoodStats {
  average_mood: number;
  mood_trend: 'improving' | 'declining' | 'stable';
  best_day: DateString;
  worst_day: DateString;
  total_entries: number;
}

// Request/Response types
export interface CreateMoodEntryRequest {
  mood_score: number;
  mood_category?: string;
  notes?: string;
  entry_date?: DateString;
}

export interface CreateMoodEntryResponse {
  mood_entry: MoodEntry;
}

export interface UpdateMoodEntryRequest {
  id: number;
  mood_score?: number;
  mood_category?: string;
  notes?: string;
}

export interface UpdateMoodEntryResponse {
  mood_entry: MoodEntry;
}

export interface GetMoodEntryResponse {
  mood_entry: MoodEntry;
}

export interface GetMoodEntriesRequest {
  start_date?: DateString;
  end_date?: DateString;
  mood_category?: string;
  min_score?: number;
  max_score?: number;
}

export interface GetMoodEntriesResponse {
  mood_entries: MoodEntry[];
  stats?: MoodStats;
}

export interface DeleteMoodEntryRequest {
  id: number;
}

export interface DeleteMoodEntryResponse {
  success: boolean;
  message: string;
}

// Daily mood check
export interface GetTodayMoodResponse {
  mood_entry?: MoodEntry;
  has_entry: boolean;
}

// Mood analytics
export interface GetMoodAnalyticsRequest {
  days?: number; // number of days to analyze (default 30)
}

export interface GetMoodAnalyticsResponse {
  stats: MoodStats;
  daily_averages: Array<{
    date: DateString;
    average_mood: number;
    entry_count: number;
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    average_mood: number;
  }>;
}
