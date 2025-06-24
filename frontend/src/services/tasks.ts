import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed';
  completed: boolean;
  due_date?: string;
  created_at: string;
  updated_at?: string;
  category_id?: number;
  tags?: string[];
  notes?: string;
  estimated_minutes?: number;
  parent_task_id?: number;
  tag_ids?: number[];
  recurrence_pattern?: RecurrencePattern;
  subtasks?: Task[];
  time_entries?: TimeEntry[];
  actual_minutes?: number;
}

export interface TaskCategory {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface TaskTag {
  id: number;
  name: string;
  created_at: string;
}

export interface TimeEntry {
  id: number;
  task_id: number;
  description?: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  created_at: string;
}

export interface RecurrencePattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  days_of_week?: number[];
  end_date?: string;
  occurrences?: number;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  category_id?: number;
  notes?: string;
  estimated_minutes?: number;
  parent_task_id?: number;
  tag_ids?: number[];
  recurrence_pattern?: RecurrencePattern;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed';
  completed?: boolean;
  due_date?: string;
  category_id?: number;
  notes?: string;
  estimated_minutes?: number;
  parent_task_id?: number;
  tag_ids?: number[];
  recurrence_pattern?: RecurrencePattern;
}

export interface CreateCategoryRequest {
  name: string;
  color?: string;
  icon?: string;
}

export interface CreateTagRequest {
  name: string;
}

export interface CreateTimeEntryRequest {
  task_id: number;
  description?: string;
}

export interface BulkActionRequest {
  task_ids: number[];
  action: 'complete' | 'incomplete' | 'delete' | 'assign_category' | 'assign_tags';
  category_id?: number;
  tag_ids?: number[];
}

export const tasksApi = {
  // Core task operations
  getTasks: async (filters?: any): Promise<Task[]> => {
    const { data } = await api.get(apiEndpoints.tasks.list, { params: filters });
    return data.tasks || [];
  },
  getTask: async (id: number): Promise<Task> => {
    const { data } = await api.get(apiEndpoints.tasks.get(id.toString()));
    return data;
  },
  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const { data } = await api.post(apiEndpoints.tasks.create, task);
    return data;
  },
  updateTask: async ({ id, ...task }: UpdateTaskRequest & { id: number }): Promise<Task> => {
    const { data } = await api.put(apiEndpoints.tasks.update(id.toString()), task);
    return data;
  },
  deleteTask: async (id: number): Promise<void> => {
    await api.delete(apiEndpoints.tasks.delete(id.toString()));
  },
  getTodaysTasks: async (): Promise<Task[]> => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await api.get(apiEndpoints.tasks.list, {
      params: { due_date: today }
    });
    return data.tasks || [];
  },

  // Categories
  getCategories: async (): Promise<TaskCategory[]> => {
    const { data } = await api.get(apiEndpoints.tasks.categories);
    return data.categories || [];
  },
  createCategory: async (category: CreateCategoryRequest): Promise<TaskCategory> => {
    const { data } = await api.post(apiEndpoints.tasks.categories, category);
    return data;
  },
  updateCategory: async ({ id, ...category }: CreateCategoryRequest & { id: number }): Promise<TaskCategory> => {
    const { data } = await api.put(`${apiEndpoints.tasks.categories}/${id}`, category);
    return data;
  },
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`${apiEndpoints.tasks.categories}/${id}`);
  },

  // Tags
  getTags: async (search?: string): Promise<TaskTag[]> => {
    const { data } = await api.get(apiEndpoints.tasks.tags, { params: search ? { search } : {} });
    return data.tags || [];
  },
  createTag: async (tag: CreateTagRequest): Promise<TaskTag> => {
    const { data } = await api.post(apiEndpoints.tasks.tags, tag);
    return data;
  },
  deleteTag: async (id: number): Promise<void> => {
    await api.delete(`${apiEndpoints.tasks.tags}/${id}`);
  },

  // Time tracking
  getTimeEntries: async (filters?: any): Promise<TimeEntry[]> => {
    const { data } = await api.get(apiEndpoints.tasks.timeEntries, { params: filters });
    return data.time_entries || [];
  },
  startTimeEntry: async (taskId: number, entry: Omit<CreateTimeEntryRequest, 'task_id'>): Promise<TimeEntry> => {
    const { data } = await api.post(`/tasks/${taskId}/time-entries`, entry);
    return data;
  },
  stopTimeEntry: async (entryId: number): Promise<TimeEntry> => {
    const { data } = await api.put(`/tasks/time-entries/${entryId}/stop`);
    return data;
  },
  getActiveTimeEntry: async (taskId: number): Promise<TimeEntry | null> => {
    try {
      const { data } = await api.get(`/tasks/${taskId}/time-entries/active`);
      return data;
    } catch (error) {
      return null;
    }
  },

  // Bulk operations
  bulkAction: async (request: BulkActionRequest): Promise<void> => {
    await api.post('/tasks/bulk-actions', request);
  },

  // Analytics
  getAnalytics: async (filters?: any) => {
    const { data } = await api.get(apiEndpoints.tasks.analytics, { params: filters });
    return data;
  },
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.updateTask,
    onSuccess: (data) => {
      queryClient.setQueryData(['tasks', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Category hooks
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-categories'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Tag hooks
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-tags'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Time tracking hooks
export const useStartTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, ...entry }: { taskId: number } & Omit<CreateTimeEntryRequest, 'task_id'>) =>
      tasksApi.startTimeEntry(taskId, entry),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useStopTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.stopTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Bulk operations
export const useBulkAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tasksApi.bulkAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};