import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { preferencesService, TimeDisplayPreference, TimeDisplayResponse } from '../services/preferences';

export const useTimeDisplayPreferences = (userId?: string) => {
  return useQuery({
    queryKey: ['time-display-preferences', userId],
    queryFn: () => preferencesService.getTimeDisplayPreferences(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateTimeDisplayPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ preferences, userId }: { 
      preferences: Partial<TimeDisplayPreference>; 
      userId?: string; 
    }) => preferencesService.setTimeDisplayPreferences(preferences, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ 
        queryKey: ['time-display-preferences', userId] 
      });
    },
  });
};
