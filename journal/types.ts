import { DateString, TimestampString } from "../shared/types";

// Core journal interfaces
export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood_reference?: number; // Link to mood entries
  tags: string[];
  privacy_level: 'private' | 'shared' | 'public';
  created_at: TimestampString;
  updated_at: TimestampString;
  // Cross-domain integration
  related_tasks?: number[];
  related_habits?: number[];
  productivity_score?: number; // 1-10 based on day's achievements
}

export interface JournalTemplate {
  id: number;
  name: string;
  description?: string;
  prompts: string[];
  category: 'reflection' | 'planning' | 'gratitude' | 'productivity';
  created_at: TimestampString;
  is_active: boolean;
}

// Request/Response types for API endpoints
export interface CreateJournalEntryRequest {
  title: string;
  content: string;
  mood_reference?: number;
  tags?: string[];
  privacy_level?: 'private' | 'shared' | 'public';
  related_tasks?: number[];
  related_habits?: number[];
  productivity_score?: number;
}

export interface CreateJournalEntryResponse {
  journal_entry: JournalEntry;
  success: boolean;
}

export interface UpdateJournalEntryRequest {
  title?: string;
  content?: string;
  mood_reference?: number;
  tags?: string[];
  privacy_level?: 'private' | 'shared' | 'public';
  related_tasks?: number[];
  related_habits?: number[];
  productivity_score?: number;
}

export interface UpdateJournalEntryResponse {
  journal_entry: JournalEntry;
  success: boolean;
}

export interface GetJournalEntryResponse {
  journal_entry: JournalEntry;
}

export interface GetJournalEntriesParams {
  limit?: number;
  offset?: number;
  start_date?: DateString;
  end_date?: DateString;
  tags?: string[];
  privacy_level?: 'private' | 'shared' | 'public';
  search?: string;
  mood_reference?: number;
  has_related_tasks?: boolean;
  has_related_habits?: boolean;
  productivity_score_min?: number;
  productivity_score_max?: number;
}

export interface GetJournalEntriesResponse {
  journal_entries: JournalEntry[];
  total: number;
  has_more: boolean;
}

export interface DeleteJournalEntryResponse {
  success: boolean;
}

// Search functionality
export interface SearchJournalParams {
  query: string;
  tags?: string[];
  start_date?: DateString;
  end_date?: DateString;
  privacy_level?: 'private' | 'shared' | 'public';
  limit?: number;
  offset?: number;
}

export interface SearchJournalResponse {
  journal_entries: JournalEntry[];
  total: number;
  has_more: boolean;
}

// Analytics
export interface AnalyticsParams {
  start_date?: DateString;
  end_date?: DateString;
  include_word_count?: boolean;
  include_mood_correlation?: boolean;
  include_productivity_correlation?: boolean;
}

export interface JournalAnalyticsResponse {
  total_entries: number;
  entries_this_week: number;
  entries_this_month: number;
  writing_streak: number;
  average_words_per_entry: number;
  total_words: number;
  most_used_tags: { tag: string; count: number }[];
  mood_correlation?: {
    average_mood_on_writing_days: number;
    average_mood_on_non_writing_days: number;
    correlation_strength: number;
  };
  productivity_correlation?: {
    average_productivity_score: number;
    entries_by_score: { score: number; count: number }[];
  };
  writing_patterns: {
    entries_by_day_of_week: { day: string; count: number }[];
    entries_by_hour: { hour: number; count: number }[];
  };
}

// Export functionality
export interface ExportParams {
  format: 'json' | 'csv' | 'markdown';
  start_date?: DateString;
  end_date?: DateString;
  include_private?: boolean;
  tags?: string[];
}

export interface ExportResponse {
  download_url: string;
  file_name: string;
  file_size: number;
  expires_at: TimestampString;
}

// Template management
export interface CreateJournalTemplateRequest {
  name: string;
  description?: string;
  prompts: string[];
  category: 'reflection' | 'planning' | 'gratitude' | 'productivity';
}

export interface CreateJournalTemplateResponse {
  template: JournalTemplate;
  success: boolean;
}

export interface GetJournalTemplatesParams {
  category?: 'reflection' | 'planning' | 'gratitude' | 'productivity';
  is_active?: boolean;
}

export interface GetJournalTemplatesResponse {
  templates: JournalTemplate[];
}

export interface UpdateJournalTemplateRequest {
  name?: string;
  description?: string;
  prompts?: string[];
  category?: 'reflection' | 'planning' | 'gratitude' | 'productivity';
  is_active?: boolean;
}

export interface UpdateJournalTemplateResponse {
  template: JournalTemplate;
  success: boolean;
}

export interface DeleteJournalTemplateResponse {
  success: boolean;
}
