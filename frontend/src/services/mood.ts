import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';

export interface MoodEntry {
  id: string;
  mood_score: number;
  energy_level?: number;
  stress_level?: number;
  secondary_mood?: string;
  notes?: string;
  triggers?: string[];
  context?: string;
  date: string;
  created_at: string;
}

export interface CreateMoodEntryRequest {
  mood_score: number;
  energy_level?: number;
  stress_level?: number;
  secondary_mood?: string;
  notes?: string;
  triggers?: string[];
  context?: string;
  date?: string;
}

export const moodApi = {
  getMoodEntries: async (params?: { limit?: number; start_date?: string; end_date?: string }): Promise<MoodEntry[]> => {
    const { data } = await api.get(apiEndpoints.mood.list, { params });
    return data;
  },

  getMoodEntry: async (id: string): Promise<MoodEntry> => {
    const { data } = await api.get(apiEndpoints.mood.get(id));
    return data;
  },

  createMoodEntry: async (entry: CreateMoodEntryRequest): Promise<MoodEntry> => {
    const { data } = await api.post(apiEndpoints.mood.create, entry);
    return data;
  },

  updateMoodEntry: async ({ id, ...entry }: Partial<CreateMoodEntryRequest> & { id: string }): Promise<MoodEntry> => {
    const { data } = await api.put(apiEndpoints.mood.update(id), entry);
    return data;
  },

  deleteMoodEntry: async (id: string): Promise<void> => {
    await api.delete(apiEndpoints.mood.delete(id));
  },

  getTodayMood: async (): Promise<MoodEntry | null> => {
    try {
      const { data } = await api.get(apiEndpoints.mood.today);
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getMoodPatterns: async (params?: { days?: number }): Promise<any> => {
    const { data } = await api.get(apiEndpoints.mood.patterns, { params });
    return data;
  },

  getTriggers: async (): Promise<string[]> => {
    const { data } = await api.get(apiEndpoints.mood.triggers);
    return data;
  },
};

export const useCreateMoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moodApi.createMoodEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood'] });
    },
  });
};

export const useUpdateMoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moodApi.updateMoodEntry,
    onSuccess: (data) => {
      queryClient.setQueryData(['mood', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['mood'] });
    },
  });
};

export const useDeleteMoodEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moodApi.deleteMoodEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood'] });
    },
  });
};