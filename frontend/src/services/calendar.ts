import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day: boolean;
  location?: string;
  reminder_minutes?: number;
  recurrence_pattern?: string;
  linked_task_id?: string;
  created_at: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  all_day?: boolean;
  location?: string;
  reminder_minutes?: number;
  recurrence_pattern?: string;
  linked_task_id?: string;
}

export const calendarApi = {
  getEvents: async (params?: { start?: string; end?: string }): Promise<CalendarEvent[]> => {
    const { data } = await api.get(apiEndpoints.calendar.events, { params });
    return data;
  },

  getEvent: async (id: string): Promise<CalendarEvent> => {
    const { data } = await api.get(apiEndpoints.calendar.get(id));
    return data;
  },

  createEvent: async (event: CreateEventRequest): Promise<CalendarEvent> => {
    const { data } = await api.post(apiEndpoints.calendar.create, event);
    return data;
  },

  updateEvent: async ({ id, ...event }: Partial<CreateEventRequest> & { id: string }): Promise<CalendarEvent> => {
    const { data } = await api.put(apiEndpoints.calendar.update(id), event);
    return data;
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(apiEndpoints.calendar.delete(id));
  },

  getDayEvents: async (date: string): Promise<CalendarEvent[]> => {
    const { data } = await api.get(apiEndpoints.calendar.day(date));
    return data;
  },

  getWeekEvents: async (date: string): Promise<CalendarEvent[]> => {
    const { data } = await api.get(apiEndpoints.calendar.week(date));
    return data;
  },

  getMonthEvents: async (year: number, month: number): Promise<CalendarEvent[]> => {
    const { data } = await api.get(apiEndpoints.calendar.month(year, month));
    return data;
  },
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.updateEvent,
    onSuccess: (data) => {
      queryClient.setQueryData(['calendar', data.id], data);
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
    },
  });
};