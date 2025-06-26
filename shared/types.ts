// Shared types across all services

export type Priority = 'high' | 'medium' | 'low';
export type HabitCategory = 'health' | 'productivity' | 'personal';
export type Theme = 'light' | 'dark' | 'system';

// Common response wrapper
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Common error response
export interface APIError {
  error: string;
  details?: string;
  code?: string;
}

// Pagination types for future use
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Date utility types
export type DateString = string; // ISO date string
export type TimestampString = string; // ISO timestamp string

// Cross-domain integration types
export interface DailyProductivityData {
  date: DateString;
  tasks: {
    total: number;
    completed: number;
    overdue: number;
  };
  habits: {
    total: number;
    completed: number;
    streak_count: number;
  };
  mood: {
    score?: number;
    energy_level?: number;
    stress_level?: number;
  };
  events: {
    total: number;
    duration_minutes: number;
  };
  journal: {
    entries_count: number;
    word_count: number;
    productivity_score?: number;
    tags: string[];
  };
  productivity_score: number;
}

export interface CrossDomainCorrelation {
  type: 'task_mood' | 'habit_mood' | 'task_habit' | 'schedule_productivity' | 'journal_mood' | 'journal_productivity' | 'journal_habits';
  factor: string;
  strength: number; // -1 to 1
  confidence: number; // 0 to 1
  description: string;
  data_points: number;
}

export interface ProductivityInsight {
  id: string;
  type: 'positive' | 'warning' | 'opportunity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action_items: string[];
  related_domains: ('tasks' | 'habits' | 'mood' | 'calendar' | 'journal')[];
  created_at: TimestampString;
}

// Calendar integration types
export interface CalendarDataOverlay {
  date: DateString;
  task_deadlines: Array<{
    id: number;
    title: string;
    priority: Priority;
    completed: boolean;
  }>;
  habit_completions: Array<{
    id: number;
    name: string;
    completed: boolean;
    streak_count: number;
  }>;
  mood_score?: number;
  mood_color?: string;
  events: Array<{
    id: number;
    title: string;
    start_time: string;
    end_time?: string;
  }>;
}

// Export/Import types
export interface DataExportRequest {
  domains: ('tasks' | 'habits' | 'mood' | 'calendar' | 'preferences' | 'journal')[];
  format: 'json' | 'csv' | 'markdown';
  start_date?: DateString;
  end_date?: DateString;
  include_deleted?: boolean;
}

export interface DataExportResponse {
  export_id: string;
  download_url: string;
  expires_at: TimestampString;
  file_size_bytes: number;
  record_count: number;
}

// Versioned data export format
export interface VersionedDataExport {
  version: string;
  export_date: TimestampString;
  metadata: {
    total_records: number;
    domains: string[];
    date_range?: {
      start_date: DateString;
      end_date: DateString;
    };
  };
  data: {
    tasks?: VersionedTaskData[];
    habits?: VersionedHabitData[];
    mood?: VersionedMoodData[];
    calendar?: VersionedCalendarData[];
    preferences?: VersionedPreferenceData[];
    journal?: VersionedJournalData[];
  };
}

// Versioned data interfaces for portability
export interface VersionedTaskData {
  id: number;
  title: string;
  description?: string;
  priority: Priority;
  due_date?: DateString;
  completed: boolean;
  completed_at?: TimestampString;
  created_at: TimestampString;
  updated_at: TimestampString;
  category_id?: number;
  category_name?: string;
  notes?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  parent_task_id?: number;
  tags?: string[];
  time_entries?: Array<{
    id: number;
    start_time: TimestampString;
    end_time?: TimestampString;
    description?: string;
  }>;
  subtasks?: VersionedTaskData[];
}

export interface VersionedHabitData {
  id: number;
  name: string;
  description?: string;
  category: HabitCategory;
  target_frequency: number;
  active: boolean;
  created_at: TimestampString;
  updated_at: TimestampString;
  target_type: 'daily' | 'weekly' | 'custom';
  completion_type: 'boolean' | 'count' | 'duration';
  target_value: number;
  unit?: string;
  template_id?: number;
  template_name?: string;
  reminder_enabled: boolean;
  reminder_time?: string;
  completions: Array<{
    id: number;
    completion_date: DateString;
    completed: boolean;
    completion_value: number;
    notes?: string;
    created_at: TimestampString;
  }>;
}

export interface VersionedMoodData {
  id: number;
  mood_score: number;
  mood_category?: string;
  secondary_mood?: string;
  energy_level?: number;
  stress_level?: number;
  location?: string;
  weather?: string;
  notes?: string;
  entry_date: DateString;
  created_at: TimestampString;
  updated_at: TimestampString;
  context_tags?: {
    activities?: string[];
    people?: string[];
    emotions?: string[];
    locations?: string[];
  };
  triggers?: Array<{
    id: number;
    name: string;
    category?: string;
  }>;
}

export interface VersionedCalendarData {
  id: number;
  title: string;
  description?: string;
  start_datetime: TimestampString;
  end_datetime?: TimestampString;
  is_all_day: boolean;
  location?: string;
  color?: string;
  recurrence_rule?: string;
  task_id?: number;
  task_title?: string;
  created_at: TimestampString;
  updated_at: TimestampString;
}

export interface VersionedPreferenceData {
  id: number;
  user_id: string;
  preference_key: string;
  preference_value: string;
  created_at: TimestampString;
  updated_at: TimestampString;
}

export interface VersionedJournalData {
  id: number;
  title: string;
  content: string;
  mood_reference?: number;
  tags: string[];
  privacy_level: 'private' | 'shared' | 'public';
  created_at: TimestampString;
  updated_at: TimestampString;
  related_tasks?: number[];
  related_habits?: number[];
  productivity_score?: number;
}

// Import types
export interface DataImportRequest {
  file_content: string;
  format: 'json' | 'csv' | 'markdown';
  domains?: ('tasks' | 'habits' | 'mood' | 'calendar' | 'preferences' | 'journal')[];
  import_mode: 'replace' | 'merge' | 'append';
  validate_only?: boolean;
}

export interface DataImportResponse {
  success: boolean;
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors?: string[];
  validation_warnings?: string[];
}

// Backup/Restore types
export interface BackupMetadata {
  id: string;
  created_at: TimestampString;
  size_bytes: number;
  domains: string[];
  version: string;
  user_initiated: boolean;
}

export interface RestoreRequest {
  backup_id: string;
  domains?: ('tasks' | 'habits' | 'mood' | 'calendar' | 'preferences' | 'journal')[];
  replace_existing?: boolean;
}

// Theme customization types
export interface CustomTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  font_size: 'small' | 'medium' | 'large' | 'extra-large';
  font_family: 'system' | 'serif' | 'monospace' | 'inter' | 'roboto' | 'open-sans' | 'poppins' | 'source-sans' | 'lato' | 'nunito' | 'dyslexic-friendly';
  high_contrast: boolean;
  reduce_motion: boolean;
  created_at: TimestampString;
  updated_at: TimestampString;
}
