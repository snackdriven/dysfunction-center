import axios from 'axios';

// Base API configuration
export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Tasks
  tasks: {
    list: '/tasks',
    create: '/tasks',
    get: (id: string) => `/tasks/${id}`,
    update: (id: string) => `/tasks/${id}`,
    delete: (id: string) => `/tasks/${id}`,
    categories: '/tasks/categories',
    tags: '/tasks/tags',
    timeEntries: '/tasks/time-entries',
    analytics: '/tasks/analytics',
    bulkActions: '/tasks/bulk-actions',
    startTimeEntry: (taskId: string) => `/tasks/${taskId}/time-entries`,
    stopTimeEntry: (entryId: string) => `/tasks/time-entries/${entryId}/stop`,
    activeTimeEntry: (taskId: string) => `/tasks/${taskId}/time-entries/active`,
  },
  
  // Habits
  habits: {
    list: '/habits',
    create: '/habits',
    get: (id: string) => `/habits/${id}`,
    update: (id: string) => `/habits/${id}`,
    delete: (id: string) => `/habits/${id}`,
    completions: (id: string) => `/habits/${id}/completions`,
    templates: '/habits/templates',
    analytics: '/habits/analytics',
  },
  
  // Mood
  mood: {
    list: '/mood',
    create: '/mood',
    get: (id: string) => `/mood/${id}`,
    update: (id: string) => `/mood/${id}`,
    delete: (id: string) => `/mood/${id}`,
    today: '/mood/today',
    patterns: '/mood/patterns',
    triggers: '/mood/triggers',
  },
  
  // Calendar
  calendar: {
    events: '/calendar/events',
    create: '/calendar/events',
    get: (id: string) => `/calendar/events/${id}`,
    update: (id: string) => `/calendar/events/${id}`,
    delete: (id: string) => `/calendar/events/${id}`,
    day: (date: string) => `/calendar/events/day/${date}`,
    week: (date: string) => `/calendar/events/week/${date}`,
    month: (year: number, month: number) => `/calendar/events/month/${year}/${month}`,
  },
  
  // Preferences
  preferences: {
    get: (key: string) => `/preferences/${key}`,
    set: '/preferences',
    theme: '/theme',
  },
  
  // API Info
  api: {
    info: '/api/info',
    health: '/api/health',
  },
};