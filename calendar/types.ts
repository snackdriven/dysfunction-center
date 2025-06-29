import { DateString, TimestampString } from "../shared/types";

// Core Calendar Event interface
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_datetime: TimestampString;
  end_datetime?: TimestampString;
  is_all_day: boolean;
  location?: string;
  color?: string;
  recurrence_rule?: string; // RRULE format
  task_id?: number;
  created_at: TimestampString;
  updated_at: TimestampString;
}

// Calendar Event Exception interface for recurring event modifications
export interface CalendarEventException {
  id: number;
  parent_event_id: number;
  exception_date: DateString;
  cancelled: boolean;
  modified_event_id?: number;
  created_at: TimestampString;
}

// Calendar Event with related data
export interface CalendarEventWithDetails extends CalendarEvent {
  task?: {
    id: number;
    title: string;
    completed: boolean;
    priority: string;
  };
  exceptions?: CalendarEventException[];
  is_recurring: boolean;
}

// Recurrence pattern interface for easier handling
export interface RecurrencePattern {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  days_of_week?: string[]; // MO, TU, WE, TH, FR, SA, SU
  until?: DateString;
  count?: number;
}

// Calendar View Data
export interface CalendarDay {
  date: DateString;
  events: CalendarEventWithDetails[];
  is_today: boolean;
  is_current_month: boolean;
}

export interface CalendarWeek {
  week_start: DateString;
  week_end: DateString;
  days: CalendarDay[];
}

export interface CalendarMonth {
  year: number;
  month: number;
  month_name: string;
  weeks: CalendarWeek[];
}

// Request/Response Types
export interface CreateEventRequest {
  title: string;
  description?: string;
  start_datetime: TimestampString;
  end_datetime?: TimestampString;
  is_all_day?: boolean;
  location?: string;
  color?: string;
  recurrence_rule?: string;
  task_id?: number;
}

export interface CreateEventResponse {
  event: CalendarEvent;
}

export interface UpdateEventRequest {
  id: number;
  title?: string;
  description?: string;
  start_datetime?: TimestampString;
  end_datetime?: TimestampString;
  is_all_day?: boolean;
  location?: string;
  color?: string;
  recurrence_rule?: string;
  task_id?: number;
}

export interface UpdateEventResponse {
  event: CalendarEvent;
}

export interface GetEventResponse {
  event: CalendarEventWithDetails;
}

export interface GetEventsRequest {
  start_date?: DateString;
  end_date?: DateString;
  task_id?: number;
  include_tasks?: boolean;
  include_recurring?: boolean;
}

export interface GetEventsResponse {
  events: CalendarEventWithDetails[];
}

export interface DeleteEventRequest {
  id: number;
  delete_series?: boolean; // for recurring events
}

export interface DeleteEventResponse {
  success: boolean;
  message: string;
}

// Calendar View Types
export interface GetDayViewRequest {
  date: string; // ISO date string
  include_tasks?: boolean;
}

export interface GetDayViewResponse {
  day: CalendarDay;
  task_deadlines?: Array<{
    id: number;
    title: string;
    due_date: DateString;
    priority: string;
    completed: boolean;
  }>;
}

export interface GetWeekViewRequest {
  date: string; // ISO date string, any date in the week
  include_tasks?: boolean;
}

export interface GetWeekViewResponse {
  week: CalendarWeek;
  task_deadlines?: Array<{
    id: number;
    title: string;
    due_date: DateString;
    priority: string;
    completed: boolean;
  }>;
}

export interface GetMonthViewRequest {
  year: number;
  month: number; // 1-12
  include_tasks?: boolean;
}

export interface GetMonthViewResponse {
  month: CalendarMonth;
  task_deadlines?: Array<{
    id: number;
    title: string;
    due_date: DateString;
    priority: string;
    completed: boolean;
  }>;
}

// Recurrence Exception Types
export interface CreateExceptionRequest {
  parent_event_id: number;
  exception_date: DateString;
  cancelled?: boolean;
  modified_event?: CreateEventRequest;
}

export interface CreateExceptionResponse {
  exception: CalendarEventException;
  modified_event?: CalendarEvent;
}

// Conflict Detection Types
export interface ConflictCheckRequest {
  start_datetime: TimestampString;
  end_datetime?: TimestampString;
  exclude_event_id?: number;
}

export interface ConflictCheckResponse {
  has_conflicts: boolean;
  conflicts: Array<{
    event: CalendarEvent;
    overlap_start: TimestampString;
    overlap_end: TimestampString;
    overlap_minutes: number;
  }>;
}

// Calendar Analytics Types
export interface CalendarAnalyticsRequest {
  start_date?: DateString;
  end_date?: DateString;
}

export interface CalendarAnalyticsResponse {
  total_events: number;
  total_hours_scheduled: number;
  average_event_duration: number;
  busiest_day: DateString;
  busiest_time_slot: {
    hour: number;
    event_count: number;
  };
  event_distribution: Array<{
    day_of_week: string;
    event_count: number;
    total_hours: number;
  }>;
  task_deadline_adherence: {
    total_deadlines: number;
    met_deadlines: number;
    missed_deadlines: number;
    adherence_rate: number;
  };
}