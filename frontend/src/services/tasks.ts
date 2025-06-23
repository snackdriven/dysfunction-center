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
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  category_id?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed';
  completed?: boolean;
  due_date?: string;
  category_id?: string;
  tags?: string[];
}

export const tasksApi = {  getTasks: async (filters?: any): Promise<Task[]> => {
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
  getCategories: async () => {
    const { data } = await api.get(apiEndpoints.tasks.categories);
    return data.categories || [];
  },

  getTags: async () => {
    const { data } = await api.get(apiEndpoints.tasks.tags);
    return data.tags || [];
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