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
  productivity_score: number;
}

export interface CrossDomainCorrelation {
  type: 'task_mood' | 'habit_mood' | 'task_habit' | 'schedule_productivity';
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
  related_domains: ('tasks' | 'habits' | 'mood' | 'calendar')[];
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
  domains: ('tasks' | 'habits' | 'mood' | 'calendar' | 'preferences')[];
  format: 'json' | 'csv';
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
  domains?: ('tasks' | 'habits' | 'mood' | 'calendar' | 'preferences')[];
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
  font_family: 'system' | 'serif' | 'monospace';
  high_contrast: boolean;
  reduce_motion: boolean;
  created_at: TimestampString;
  updated_at: TimestampString;
}
