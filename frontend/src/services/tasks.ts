import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  completed: boolean;
  due_date?: string;
  created_at: string;
  updated_at?: string;
  category_id?: string;
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

export const tasksApi = {
  getTasks: async (filters?: any): Promise<Task[]> => {
    const { data } = await api.get(apiEndpoints.tasks.list, { params: filters });
    return data;
  },

  getTask: async (id: string): Promise<Task> => {
    const { data } = await api.get(apiEndpoints.tasks.get(id));
    return data;
  },

  createTask: async (task: CreateTaskRequest): Promise<Task> => {
    const { data } = await api.post(apiEndpoints.tasks.create, task);
    return data;
  },

  updateTask: async ({ id, ...task }: UpdateTaskRequest & { id: string }): Promise<Task> => {
    const { data } = await api.put(apiEndpoints.tasks.update(id), task);
    return data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(apiEndpoints.tasks.delete(id));
  },

  getTodaysTasks: async (): Promise<Task[]> => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await api.get(apiEndpoints.tasks.list, {
      params: { due_date: today }
    });
    return data;
  },

  getCategories: async () => {
    const { data } = await api.get(apiEndpoints.tasks.categories);
    return data;
  },

  getTags: async () => {
    const { data } = await api.get(apiEndpoints.tasks.tags);
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