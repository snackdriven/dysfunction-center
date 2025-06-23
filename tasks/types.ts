import { Priority, DateString, TimestampString } from "../shared/types";

// Core Task interface
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
}

// Request/Response types for API endpoints
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: DateString;
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
