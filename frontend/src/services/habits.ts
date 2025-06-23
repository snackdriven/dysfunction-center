import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  target_frequency: 'daily' | 'weekly' | 'monthly';
  target_value: number;
  completion_type: 'boolean' | 'count' | 'duration';
  is_active: boolean;
  created_at: string;
  streak_count: number;
  completion_rate: number;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
  value?: number;
  notes?: string;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  category: string;
  target_frequency: 'daily' | 'weekly' | 'monthly';
  target_value: number;
  completion_type: 'boolean' | 'count' | 'duration';
}

export const habitsApi = {
  getHabits: async (): Promise<Habit[]> => {
    const { data } = await api.get(apiEndpoints.habits.list);
    return data;
  },

  getHabit: async (id: string): Promise<Habit> => {
    const { data } = await api.get(apiEndpoints.habits.get(id));
    return data;
  },

  createHabit: async (habit: CreateHabitRequest): Promise<Habit> => {
    const { data } = await api.post(apiEndpoints.habits.create, habit);
    return data;
  },

  updateHabit: async ({ id, ...habit }: Partial<CreateHabitRequest> & { id: string; is_active?: boolean }): Promise<Habit> => {
    const { data } = await api.put(apiEndpoints.habits.update(id), habit);
    return data;
  },

  deleteHabit: async (id: string): Promise<void> => {
    await api.delete(apiEndpoints.habits.delete(id));
  },

  getHabitCompletions: async (habitId: string, params?: any): Promise<HabitCompletion[]> => {
    const { data } = await api.get(apiEndpoints.habits.completions(habitId), { params });
    return data;
  },

  logCompletion: async (habitId: string, completion: { date: string; completed: boolean; value?: number; notes?: string }): Promise<HabitCompletion> => {
    const { data } = await api.post(apiEndpoints.habits.completions(habitId), completion);
    return data;
  },

  getTodayCompletions: async (): Promise<HabitCompletion[]> => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await api.get('/habits/completions/today', { params: { date: today } });
    return data;
  },

  getTemplates: async () => {
    const { data } = await api.get(apiEndpoints.habits.templates);
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
    mutationFn: ({ habitId, ...completion }: { habitId: string; date: string; completed: boolean; value?: number; notes?: string }) =>
      habitsApi.logCompletion(habitId, completion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habit-completions'] });
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
};