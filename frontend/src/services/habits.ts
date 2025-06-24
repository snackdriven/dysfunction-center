import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';

export interface Habit {
  id: number;
  name: string;
  description?: string;
  category: 'health' | 'productivity' | 'personal';
  target_frequency: number;
  target_value: number;
  completion_type: 'boolean' | 'count' | 'duration';
  target_type?: 'daily' | 'weekly' | 'custom';
  active: boolean;
  created_at: string;
  updated_at?: string;
  streak_count?: number;
  completion_rate?: number;
  today_completed?: boolean;
  current_streak?: number;
  longest_streak?: number;
  consistency_score?: number;
  template_id?: number;
  reminder_enabled?: boolean;
  reminder_time?: string;
  unit?: string;
}

export interface HabitTemplate {
  id: number;
  name: string;
  description: string;
  category: 'health' | 'productivity' | 'personal';
  suggested_frequency: number;
  suggested_value: number;
  completion_type: 'boolean' | 'count' | 'duration';
  target_type: 'daily' | 'weekly' | 'custom';
  unit?: string;
  icon?: string;
  tags?: string[];
  created_at: string;
}

export interface HabitCompletion {
  id: number;
  habit_id: number;
  date: string;
  completed: boolean;
  value?: number;
  notes?: string;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  category: 'health' | 'productivity' | 'personal';
  target_frequency: number;
  target_value: number;
  completion_type: 'boolean' | 'count' | 'duration';
  target_type?: 'daily' | 'weekly' | 'custom';
  template_id?: number;
  reminder_enabled?: boolean;
  reminder_time?: string;
  unit?: string;
}

export interface CreateHabitFromTemplateRequest {
  template_id: number;
  name?: string;
  target_value?: number;
  reminder_enabled?: boolean;
  reminder_time?: string;
}

export const habitsApi = {  getHabits: async (): Promise<Habit[]> => {
    const { data } = await api.get(apiEndpoints.habits.list);
    return data.habits || [];
  },
  getHabit: async (id: number): Promise<Habit> => {
    const { data } = await api.get(apiEndpoints.habits.get(id.toString()));
    return data;
  },

  createHabit: async (habit: CreateHabitRequest): Promise<Habit> => {
    const { data } = await api.post(apiEndpoints.habits.create, habit);
    return data;
  },
  updateHabit: async ({ id, ...habit }: Partial<CreateHabitRequest> & { id: number; active?: boolean; target_type?: 'daily' | 'weekly' | 'custom' }): Promise<Habit> => {
    const { data } = await api.put(apiEndpoints.habits.update(id.toString()), habit);
    return data;
  },

  deleteHabit: async (id: number): Promise<void> => {
    await api.delete(apiEndpoints.habits.delete(id.toString()));
  },

  getHabitCompletions: async (habitId: number, params?: any): Promise<HabitCompletion[]> => {
    const { data } = await api.get(apiEndpoints.habits.completions(habitId.toString()), { params });
    return data;
  },

  logCompletion: async (habitId: number, completion: { date: string; completed: boolean; value?: number; notes?: string }): Promise<HabitCompletion> => {
    const { data } = await api.post(apiEndpoints.habits.completions(habitId.toString()), completion);
    return data;
  },

  getTodayCompletions: async (): Promise<HabitCompletion[]> => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await api.get('/habits/completions/today', { params: { date: today } });
    return data;
  },

  getTemplates: async (category?: string): Promise<HabitTemplate[]> => {
    const { data } = await api.get(apiEndpoints.habits.templates, { 
      params: category ? { category } : undefined 
    });
    return data.templates || [];
  },

  createHabitFromTemplate: async (request: CreateHabitFromTemplateRequest): Promise<Habit> => {
    const { data } = await api.post(`/habits/from-template/${request.template_id}`, request);
    return data;
  },

  getAnalytics: async (habitId?: string) => {
    const { data } = await api.get(apiEndpoints.habits.analytics, { 
      params: habitId ? { habit_id: habitId } : undefined 
    });
    return data;
  },
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsApi.createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsApi.updateHabit,
    onSuccess: (data) => {
      queryClient.setQueryData(['habits', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsApi.deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useLogHabitCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ habitId, ...completion }: { habitId: number; date: string; completed: boolean; value?: number; notes?: string }) =>
      habitsApi.logCompletion(habitId, completion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};

export const useCreateHabitFromTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: habitsApi.createHabitFromTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};