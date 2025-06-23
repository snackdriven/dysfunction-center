import { DateString, TimestampString } from "../shared/types";

// Mood Trigger interface
export interface MoodTrigger {
  id: number;
  name: string;
  category?: string; // work, personal, health, social
  icon?: string;
  created_at: TimestampString;
}

// Custom Mood interface
export interface CustomMood {
  id: number;
  user_id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: TimestampString;
}

// Context tags type
export type ContextTags = {
  activities?: string[];
  people?: string[];
  emotions?: string[];
  locations?: string[];
};

// Enhanced MoodEntry interface
export interface MoodEntry {
  id: number;
  mood_score: number; // 1-5 scale
  mood_category?: string;
  notes?: string;
  entry_date: DateString;
  created_at: TimestampString;
  updated_at: TimestampString;
  // Phase 2 enhancements
  secondary_mood?: string;
  energy_level?: number; // 1-10 scale
  stress_level?: number; // 1-10 scale
  location?: string;
  weather?: string;
  context_tags?: ContextTags;
  triggers?: MoodTrigger[];
}

// Enhanced Mood statistics interface
export interface MoodStats {
  average_mood: number;
  mood_trend: 'improving' | 'declining' | 'stable';
  best_day: DateString;
  worst_day: DateString;
  total_entries: number;
  // Phase 2 enhancements
  average_energy?: number;
  average_stress?: number;
  most_common_triggers: string[];
  mood_variability: number; // measure of mood consistency
  best_locations: string[];
  weather_correlations?: Array<{
    weather: string;
    average_mood: number;
    count: number;
  }>;
}

// Enhanced Request/Response types
export interface CreateMoodEntryRequest {
  mood_score: number;
  mood_category?: string;
  notes?: string;
  entry_date?: DateString;
  // Phase 2 enhancements
  secondary_mood?: string;
  energy_level?: number;
  stress_level?: number;
  location?: string;
  weather?: string;
  context_tags?: ContextTags;
  trigger_ids?: number[];
}

export interface CreateMoodEntryResponse {
  mood_entry: MoodEntry;
}

export interface UpdateMoodEntryRequest {
  id: number;
  mood_score?: number;
  mood_category?: string;
  notes?: string;
  // Phase 2 enhancements
  secondary_mood?: string;
  energy_level?: number;
  stress_level?: number;
  location?: string;
  weather?: string;
  context_tags?: ContextTags;
  trigger_ids?: number[];
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
  // Phase 2 enhancements
  secondary_mood?: string;
  min_energy?: number;
  max_energy?: number;
  min_stress?: number;
  max_stress?: number;
  location?: string;
  weather?: string;
  trigger_ids?: number[];
  has_triggers?: boolean;
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
    average_energy?: number;
    average_stress?: number;
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    average_mood: number;
    average_energy?: number;
    average_stress?: number;
  }>;
  // Phase 2 enhancements
  trigger_analysis: Array<{
    trigger: MoodTrigger;
    frequency: number;
    average_mood_impact: number;
    correlation_strength: number;
  }>;
  pattern_insights: {
    best_days_of_week: string[];
    mood_time_patterns?: Array<{
      hour: number;
      average_mood: number;
    }>;
    location_impacts: Array<{
      location: string;
      average_mood: number;
      frequency: number;
    }>;
    weather_impacts: Array<{
      weather: string;
      average_mood: number;
      frequency: number;
    }>;
  };
}

// Phase 2: Trigger Management Types
export interface CreateTriggerRequest {
  name: string;
  category?: string;
  icon?: string;
}

export interface CreateTriggerResponse {
  trigger: MoodTrigger;
}

export interface GetTriggersRequest {
  category?: string;
}

export interface GetTriggersResponse {
  triggers: MoodTrigger[];
}

export interface DeleteTriggerResponse {
  success: boolean;
  message: string;
}

// Phase 2: Custom Mood Types
export interface CreateCustomMoodRequest {
  name: string;
  color?: string;
  icon?: string;
}

export interface CreateCustomMoodResponse {
  custom_mood: CustomMood;
}

export interface GetCustomMoodsResponse {
  custom_moods: CustomMood[];
}

export interface UpdateCustomMoodRequest {
  id: number;
  name?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCustomMoodResponse {
  custom_mood: CustomMood;
}

export interface DeleteCustomMoodResponse {
  success: boolean;
  message: string;
}

// Phase 2: Pattern Analysis Types
export interface GetMoodPatternsRequest {
  start_date?: DateString;
  end_date?: DateString;
  pattern_type?: 'daily' | 'weekly' | 'monthly' | 'triggers' | 'correlations';
}

export interface GetMoodPatternsResponse {
  patterns: {
    weekly_patterns?: Array<{
      day_of_week: string;
      average_mood: number;
      entry_count: number;
    }>;
    hourly_patterns?: Array<{
      hour: number;
      average_mood: number;
      entry_count: number;
    }>;
    trigger_correlations?: Array<{
      trigger: MoodTrigger;
      positive_correlation: number;
      negative_correlation: number;
      frequency: number;
    }>;
    mood_sequences?: Array<{
      sequence: number[];
      frequency: number;
      average_improvement: number;
    }>;
  };
  insights: string[];
}

// Phase 2: Mood Insights Types
export interface GetMoodInsightsRequest {
  days?: number;
}

export interface GetMoodInsightsResponse {
  insights: Array<{
    type: 'trend' | 'trigger' | 'pattern' | 'recommendation';
    title: string;
    description: string;
    confidence: number; // 0-1
    actionable: boolean;
  }>;
  summary: {
    overall_trend: 'improving' | 'declining' | 'stable';
    key_factors: string[];
    recommendations: string[];
  };
}
