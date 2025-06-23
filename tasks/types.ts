import { Priority, DateString, TimestampString } from "../shared/types";

// Task Category interface
export interface TaskCategory {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: TimestampString;
}

// Task Tag interface
export interface TaskTag {
  id: number;
  name: string;
  created_at: TimestampString;
}

// Task Time Entry interface
export interface TaskTimeEntry {
  id: number;
  task_id: number;
  start_time: TimestampString;
  end_time?: TimestampString;
  description?: string;
  created_at: TimestampString;
}

// Recurrence Pattern interface
export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  days_of_week?: number[]; // 0-6, Sunday = 0
  end_date?: DateString;
  occurrences?: number;
}

// Enhanced Task interface
export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: Priority;
  due_date?: DateString;
  completed: boolean;
  completed_at?: TimestampString;
  created_at: TimestampString;
  updated_at: TimestampString;
  // Phase 2 enhancements
  category_id?: number;
  category?: TaskCategory;
  notes?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  parent_task_id?: number;
  recurrence_pattern?: RecurrencePattern;
  tags?: TaskTag[];
  time_entries?: TaskTimeEntry[];
  subtasks?: Task[];
}

// Enhanced Request/Response types for API endpoints
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: DateString;
  // Phase 2 enhancements
  category_id?: number;
  notes?: string;
  estimated_minutes?: number;
  parent_task_id?: number;
  recurrence_pattern?: RecurrencePattern;
  tag_ids?: number[];
}

export interface CreateTaskResponse {
  task: Task;
}

export interface UpdateTaskRequest {
  id: number;
  title?: string;
  description?: string;
  priority?: Priority;
  due_date?: DateString;
  completed?: boolean;
  // Phase 2 enhancements
  category_id?: number;
  notes?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
  parent_task_id?: number;
  recurrence_pattern?: RecurrencePattern;
  tag_ids?: number[];
}

export interface UpdateTaskResponse {
  task: Task;
}

export interface GetTaskResponse {
  task: Task;
}

export interface GetTasksRequest {
  completed?: boolean;
  priority?: Priority;
  due_before?: DateString;
  due_after?: DateString;
  // Phase 2 enhancements
  category_id?: number;
  tag_ids?: number[];
  parent_task_id?: number;
  has_time_estimate?: boolean;
  overdue?: boolean;
  include_subtasks?: boolean;
  search?: string;
}

export interface GetTasksResponse {
  tasks: Task[];
}

export interface DeleteTaskRequest {
  id: number;
}

export interface DeleteTaskResponse {
  success: boolean;
  message: string;
}

// Phase 2: Category Management Types
export interface CreateCategoryRequest {
  name: string;
  color?: string;
  icon?: string;
}

export interface CreateCategoryResponse {
  category: TaskCategory;
}

export interface GetCategoriesResponse {
  categories: TaskCategory[];
}

export interface UpdateCategoryRequest {
  id: number;
  name?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryResponse {
  category: TaskCategory;
}

export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}

// Phase 2: Tag Management Types
export interface CreateTagRequest {
  name: string;
}

export interface CreateTagResponse {
  tag: TaskTag;
}

export interface GetTagsResponse {
  tags: TaskTag[];
}

export interface DeleteTagResponse {
  success: boolean;
  message: string;
}

// Phase 2: Time Tracking Types
export interface StartTimeEntryRequest {
  task_id: number;
  description?: string;
}

export interface StartTimeEntryResponse {
  time_entry: TaskTimeEntry;
}

export interface StopTimeEntryRequest {
  id: number;
}

export interface StopTimeEntryResponse {
  time_entry: TaskTimeEntry;
  duration_minutes: number;
}

export interface GetTimeEntriesRequest {
  task_id?: number;
  start_date?: DateString;
  end_date?: DateString;
}

export interface GetTimeEntriesResponse {
  time_entries: TaskTimeEntry[];
  total_minutes: number;
}

// Phase 2: Bulk Operations Types
export interface BulkTaskActionRequest {
  task_ids: number[];
  action: 'complete' | 'incomplete' | 'delete' | 'assign_category' | 'assign_tags';
  category_id?: number;
  tag_ids?: number[];
}

export interface BulkTaskActionResponse {
  affected_count: number;
  success: boolean;
  message: string;
}

// Phase 2: Analytics Types
export interface TaskAnalyticsRequest {
  start_date?: DateString;
  end_date?: DateString;
  category_id?: number;
}

export interface TaskAnalyticsResponse {
  completion_rate: number;
  total_tasks: number;
  completed_tasks: number;
  average_completion_time_minutes?: number;
  by_category: Array<{
    category: TaskCategory;
    total: number;
    completed: number;
    completion_rate: number;
  }>;
  by_priority: Array<{
    priority: Priority;
    total: number;
    completed: number;
    completion_rate: number;
  }>;
}
