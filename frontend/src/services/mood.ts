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
  trigger_ids?: number[];
}

export interface CreateTriggerRequest {
  name: string;
  category?: 'work' | 'personal' | 'health' | 'social';
  icon?: string;
}

export interface CustomMood {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface CreateCustomMoodRequest {
  name: string;
  color?: string;
  icon?: string;
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

  // Triggers
  getTriggers: async (category?: string): Promise<MoodTrigger[]> => {
    const { data } = await api.get(apiEndpoints.mood.triggers, {
      params: category ? { category } : undefined
    });
    return data.triggers || [];
  },

  createTrigger: async (trigger: CreateTriggerRequest): Promise<MoodTrigger> => {
    const { data } = await api.post(apiEndpoints.mood.triggers, trigger);
    return data;
  },

  deleteTrigger: async (id: number): Promise<void> => {
    await api.delete(`${apiEndpoints.mood.triggers}/${id}`);
  },

  // Custom Moods
  getCustomMoods: async (): Promise<CustomMood[]> => {
    const { data } = await api.get('/mood/custom-moods');
    return data.custom_moods || [];
  },

  createCustomMood: async (mood: CreateCustomMoodRequest): Promise<CustomMood> => {
    const { data } = await api.post('/mood/custom-moods', mood);
    return data;
  },

  updateCustomMood: async ({ id, ...mood }: CreateCustomMoodRequest & { id: number }): Promise<CustomMood> => {
    const { data } = await api.put(`/mood/custom-moods/${id}`, mood);
    return data;
  },

  deleteCustomMood: async (id: number): Promise<void> => {
    await api.delete(`/mood/custom-moods/${id}`);
  },

  // Advanced Analytics
  getMoodInsights: async (params?: { days?: number }): Promise<any> => {
    const { data } = await api.get('/mood/insights', { params });
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

// Trigger hooks
export const useCreateTrigger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moodApi.createTrigger,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-triggers'] });
    },
  });
};

export const useDeleteTrigger = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moodApi.deleteTrigger,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-triggers'] });
    },
  });
};

// Custom mood hooks
export const useCreateCustomMood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moodApi.createCustomMood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-moods'] });
    },
  });
};

export const useUpdateCustomMood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moodApi.updateCustomMood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-moods'] });
    },
  });
};

export const useDeleteCustomMood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moodApi.deleteCustomMood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-moods'] });
    },
  });
};