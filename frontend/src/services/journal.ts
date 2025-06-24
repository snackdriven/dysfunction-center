import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';

// Journal Entry interfaces
export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  mood_reference?: number;
  tags: string[];
  privacy_level: 'private' | 'shared' | 'public';
  created_at: string;
  updated_at: string;
  related_tasks?: number[];
  related_habits?: number[];
  productivity_score?: number;
}

export interface JournalTemplate {
  id: number;
  name: string;
  description?: string;
  prompts: string[];
  category: 'reflection' | 'planning' | 'gratitude' | 'productivity';
  created_at: string;
  is_active: boolean;
}

// Request interfaces
export interface CreateJournalEntryRequest {
  title: string;
  content: string;
  mood_reference?: number;
  tags?: string[];
  privacy_level?: 'private' | 'shared' | 'public';
  related_tasks?: number[];
  related_habits?: number[];
  productivity_score?: number;
}

export interface UpdateJournalEntryRequest {
  title?: string;
  content?: string;
  mood_reference?: number;
  tags?: string[];
  privacy_level?: 'private' | 'shared' | 'public';
  related_tasks?: number[];
  related_habits?: number[];
  productivity_score?: number;
}

export interface GetJournalEntriesParams {
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
  tags?: string[];
  privacy_level?: 'private' | 'shared' | 'public';
  search?: string;
  mood_reference?: number;
  has_related_tasks?: boolean;
  has_related_habits?: boolean;
  productivity_score_min?: number;
  productivity_score_max?: number;
}

export interface SearchJournalParams {
  query: string;
  tags?: string[];
  start_date?: string;
  end_date?: string;
  privacy_level?: 'private' | 'shared' | 'public';
  limit?: number;
  offset?: number;
}

export interface JournalAnalyticsResponse {
  total_entries: number;
  entries_this_week: number;
  entries_this_month: number;
  writing_streak: number;
  average_words_per_entry: number;
  total_words: number;
  most_used_tags: { tag: string; count: number }[];
  mood_correlation?: {
    average_mood_on_writing_days: number;
    average_mood_on_non_writing_days: number;
    correlation_strength: number;
  };
  productivity_correlation?: {
    average_productivity_score: number;
    entries_by_score: { score: number; count: number }[];
  };
  writing_patterns: {
    entries_by_day_of_week: { day: string; count: number }[];
    entries_by_hour: { hour: number; count: number }[];
  };
}

export interface CreateJournalTemplateRequest {
  name: string;
  description?: string;
  prompts: string[];
  category: 'reflection' | 'planning' | 'gratitude' | 'productivity';
}

export interface UpdateJournalTemplateRequest {
  name?: string;
  description?: string;
  prompts?: string[];
  category?: 'reflection' | 'planning' | 'gratitude' | 'productivity';
  is_active?: boolean;
}

// Helper function to parse journal entry from API response
const parseJournalEntry = (rawEntry: any): JournalEntry => {
  return {
    ...rawEntry,
    tags: Array.isArray(rawEntry.tags) ? rawEntry.tags : 
          (typeof rawEntry.tags === 'string' ? JSON.parse(rawEntry.tags || '[]') : []),
    related_tasks: Array.isArray(rawEntry.related_tasks) ? rawEntry.related_tasks :
                   (typeof rawEntry.related_tasks === 'string' ? JSON.parse(rawEntry.related_tasks || '[]') : []),
    related_habits: Array.isArray(rawEntry.related_habits) ? rawEntry.related_habits :
                    (typeof rawEntry.related_habits === 'string' ? JSON.parse(rawEntry.related_habits || '[]') : [])
  };
};

// API functions
export const journalApi = {
  // Journal Entries
  getJournalEntries: async (params?: GetJournalEntriesParams): Promise<JournalEntry[]> => {
    const { data } = await api.get(apiEndpoints.journal.list, { params });
    const entries = data.journal_entries || [];
    return entries.map(parseJournalEntry);
  },

  getJournalEntry: async (id: number): Promise<JournalEntry> => {
    const { data } = await api.get(apiEndpoints.journal.get(id.toString()));
    return parseJournalEntry(data.journal_entry);
  },

  createJournalEntry: async (entry: CreateJournalEntryRequest): Promise<JournalEntry> => {
    const { data } = await api.post(apiEndpoints.journal.create, entry);
    return parseJournalEntry(data.journal_entry);
  },

  updateJournalEntry: async ({ id, ...entry }: UpdateJournalEntryRequest & { id: number }): Promise<JournalEntry> => {
    const { data } = await api.put(apiEndpoints.journal.update(id.toString()), entry);
    return parseJournalEntry(data.journal_entry);
  },

  deleteJournalEntry: async (id: number): Promise<void> => {
    await api.delete(apiEndpoints.journal.delete(id.toString()));
  },

  // Search
  searchJournalEntries: async (params: SearchJournalParams): Promise<JournalEntry[]> => {
    const { data } = await api.get(apiEndpoints.journal.search, { params });
    return data.journal_entries || [];
  },

  // Analytics
  getJournalAnalytics: async (params?: { 
    start_date?: string; 
    end_date?: string;
    include_word_count?: boolean;
    include_mood_correlation?: boolean;
    include_productivity_correlation?: boolean;
  }): Promise<JournalAnalyticsResponse> => {
    const { data } = await api.get(apiEndpoints.journal.analytics, { params });
    return data;
  },

  // Templates
  getJournalTemplates: async (params?: { 
    category?: 'reflection' | 'planning' | 'gratitude' | 'productivity';
    is_active?: boolean;
  }): Promise<JournalTemplate[]> => {
    const { data } = await api.get(apiEndpoints.journal.templates, { params });
    return data.templates || [];
  },

  createJournalTemplate: async (template: CreateJournalTemplateRequest): Promise<JournalTemplate> => {
    const { data } = await api.post(apiEndpoints.journal.createTemplate, template);
    return data.template;
  },

  updateJournalTemplate: async ({ id, ...template }: UpdateJournalTemplateRequest & { id: number }): Promise<JournalTemplate> => {
    const { data } = await api.put(apiEndpoints.journal.updateTemplate(id.toString()), template);
    return data.template;
  },

  deleteJournalTemplate: async (id: number): Promise<void> => {
    await api.delete(apiEndpoints.journal.deleteTemplate(id.toString()));
  },

  // Export (future feature)
  exportJournalEntries: async (params: {
    format: 'json' | 'csv' | 'markdown';
    start_date?: string;
    end_date?: string;
    include_private?: boolean;
    tags?: string[];
  }): Promise<{ download_url: string; file_name: string }> => {
    const { data } = await api.get(apiEndpoints.journal.export, { params });
    return data;
  },
};

// React Query Hooks

// Journal Entries
export const useJournalEntries = (params?: GetJournalEntriesParams) => {
  return useQuery({
    queryKey: ['journal-entries', params],
    queryFn: () => journalApi.getJournalEntries(params),
  });
};

export const useJournalEntry = (id: number) => {
  return useQuery({
    queryKey: ['journal-entry', id],
    queryFn: () => journalApi.getJournalEntry(id),
    enabled: !!id,
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: journalApi.createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-analytics'] });
    },
  });
};

export const useUpdateJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: journalApi.updateJournalEntry,
    onSuccess: (data) => {
      queryClient.setQueryData(['journal-entry', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-analytics'] });
    },
  });
};

export const useDeleteJournalEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: journalApi.deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['journal-analytics'] });
    },
  });
};

// Search
export const useSearchJournalEntries = (params: SearchJournalParams) => {
  return useQuery({
    queryKey: ['journal-search', params],
    queryFn: () => journalApi.searchJournalEntries(params),
    enabled: !!params.query && params.query.trim().length > 0,
  });
};

// Analytics
export const useJournalAnalytics = (params?: { 
  start_date?: string; 
  end_date?: string;
  include_word_count?: boolean;
  include_mood_correlation?: boolean;
  include_productivity_correlation?: boolean;
}) => {
  return useQuery({
    queryKey: ['journal-analytics', params],
    queryFn: () => journalApi.getJournalAnalytics(params),
  });
};

// Templates
export const useJournalTemplates = (params?: { 
  category?: 'reflection' | 'planning' | 'gratitude' | 'productivity';
  is_active?: boolean;
}) => {
  return useQuery({
    queryKey: ['journal-templates', params],
    queryFn: () => journalApi.getJournalTemplates(params),
  });
};

export const useCreateJournalTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: journalApi.createJournalTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-templates'] });
    },
  });
};

export const useUpdateJournalTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: journalApi.updateJournalTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-templates'] });
    },
  });
};

export const useDeleteJournalTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: journalApi.deleteJournalTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-templates'] });
    },
  });
};
