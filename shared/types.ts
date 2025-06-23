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
