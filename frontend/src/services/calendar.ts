import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiEndpoints } from './api';

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  is_all_day: boolean;
  location?: string;
  color?: string;
  recurrence_rule?: string;
  task_id?: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  start_datetime: string;
  end_datetime: string;
  is_all_day?: boolean;
  location?: string;
  color?: string;
  recurrence_rule?: string;
  task_id?: number;
}

export const calendarApi = {  getEvents: async (params?: { start?: string; end?: string }): Promise<CalendarEvent[]> => {
    const { data } = await api.get(apiEndpoints.calendar.events, { params });
    return data.events || [];
  },
  getEvent: async (id: number): Promise<CalendarEvent> => {
    const { data } = await api.get(apiEndpoints.calendar.get(id.toString()));
    return data;
  },

  createEvent: async (event: CreateEventRequest): Promise<CalendarEvent> => {
    const { data } = await api.post(apiEndpoints.calendar.create, event);
    return data;
  },

  updateEvent: async ({ id, ...event }: Partial<CreateEventRequest> & { id: number }): Promise<CalendarEvent> => {
    const { data } = await api.put(apiEndpoints.calendar.update(id.toString()), event);
    return data;
  },

  deleteEvent: async (id: number): Promise<void> => {
    await api.delete(apiEndpoints.calendar.delete(id.toString()));
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