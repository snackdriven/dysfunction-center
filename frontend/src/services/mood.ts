import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';

export interface MoodTrigger {
  id: number;
  name: string;
  category?: string;
  icon?: string;
  created_at: string;
}

export interface ContextTags {
  activities?: string[];
  people?: string[];
  emotions?: string[];
  locations?: string[];
}

export interface MoodEntry {
  id: number;
  mood_score: number;
  mood_category?: string;
  notes?: string;
  entry_date: string;
  created_at: string;
  updated_at?: string;
  // Phase 2 enhancements
  secondary_mood?: string;
  energy_level?: number;
  stress_level?: number;
  location?: string;
  weather?: string;
  context_tags?: ContextTags;
  triggers?: MoodTrigger[];
}

export interface CreateMoodEntryRequest {
  mood_score: number;
  mood_category?: string;
  notes?: string;
  entry_date?: string;
  // Phase 2 enhancements
  secondary_mood?: string;
  energy_level?: number;
  stress_level?: number;
  location?: string;
  weather?: string;
  context_tags?: ContextTags;
  triggers?: MoodTrigger[];
}

export const moodApi = {  getMoodEntries: async (params?: { limit?: number; start_date?: string; end_date?: string }): Promise<MoodEntry[]> => {
    const { data } = await api.get(apiEndpoints.mood.list, { params });
    return data.mood_entries || [];
  },
  getMoodEntry: async (id: number): Promise<MoodEntry> => {
    const { data } = await api.get(apiEndpoints.mood.get(id.toString()));
    return data;
  },

  createMoodEntry: async (entry: CreateMoodEntryRequest): Promise<MoodEntry> => {
    const { data } = await api.post(apiEndpoints.mood.create, entry);
    return data;
  },

  updateMoodEntry: async ({ id, ...entry }: Partial<CreateMoodEntryRequest> & { id: number }): Promise<MoodEntry> => {
    const { data } = await api.put(apiEndpoints.mood.update(id.toString()), entry);
    return data;
  },

  deleteMoodEntry: async (id: number): Promise<void> => {
    await api.delete(apiEndpoints.mood.delete(id.toString()));
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