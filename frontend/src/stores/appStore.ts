import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TaskFilters {
  search: string;
  status: 'all' | 'pending' | 'in_progress' | 'completed';
  priority: 'all' | 'low' | 'medium' | 'high';
  category_id?: number;
  tags: string[];
}

interface DashboardWidgetConfig {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  visible: boolean;
}

interface UserPreferences {
  dashboardLayout: DashboardWidgetConfig[];
  defaultTaskView: 'list' | 'kanban' | 'calendar';
  notificationsEnabled: boolean;
  darkMode: boolean;
  compactMode: boolean;
  autoSyncEnabled: boolean;
  reminderSettings: {
    tasks: boolean;
    habits: boolean;
    mood: boolean;
  };
}

interface AppState {
  // Theme & UI
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'tasks' | 'habits' | 'mood' | 'calendar' | 'journal' | 'settings';
  theme: 'light' | 'dark' | 'system';
  
  // Filters
  taskFilters: TaskFilters;
  
  // User Preferences
  preferences: UserPreferences;
  
  // Navigation & UI State
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  
  // Selected date for cross-component communication
  selectedDate: Date;
  
  // Recent activity for quick access
  recentTasks: number[];
  recentHabits: number[];
  
  // Undo/Redo functionality
  undoStack: Array<{ action: string; data: any; timestamp: number }>;
  redoStack: Array<{ action: string; data: any; timestamp: number }>;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setTheme: (theme: AppState['theme']) => void;
  
  // Filter actions
  setTaskFilters: (filters: Partial<TaskFilters>) => void;
  resetTaskFilters: () => void;
  
  // Preferences actions
  setPreferences: (preferences: Partial<UserPreferences>) => void;
  updateDashboardLayout: (layout: DashboardWidgetConfig[]) => void;
  
  // Loading & Error management
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearErrors: () => void;
  
  // Date selection
  setSelectedDate: (date: Date) => void;
  
  // Recent activity
  addRecentTask: (taskId: number) => void;
  addRecentHabit: (habitId: number) => void;
  
  // Undo/Redo
  addToUndoStack: (action: string, data: any) => void;
  undo: () => any | null;
  redo: () => any | null;
  clearUndoRedo: () => void;
}

const defaultPreferences: UserPreferences = {
  dashboardLayout: [
    { id: 'todays-focus', title: 'Today\'s Focus', size: 'medium', position: { x: 0, y: 0 }, visible: true },
    { id: 'habit-tracker', title: 'Habit Tracker', size: 'medium', position: { x: 1, y: 0 }, visible: true },
    { id: 'mood-checkin', title: 'Mood Check-in', size: 'small', position: { x: 2, y: 0 }, visible: true },
    { id: 'weekly-progress', title: 'Weekly Progress', size: 'large', position: { x: 0, y: 1 }, visible: true },
    { id: 'upcoming-events', title: 'Upcoming Events', size: 'medium', position: { x: 1, y: 1 }, visible: true },
    { id: 'quick-actions', title: 'Quick Actions', size: 'small', position: { x: 2, y: 1 }, visible: true },
  ],
  defaultTaskView: 'list',
  notificationsEnabled: true,
  darkMode: false,
  compactMode: false,
  autoSyncEnabled: true,
  reminderSettings: {
    tasks: true,
    habits: true,
    mood: true,
  },
};

const defaultTaskFilters: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  category_id: undefined,
  tags: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      currentView: 'dashboard',
      theme: 'system',
      taskFilters: defaultTaskFilters,
      preferences: defaultPreferences,
      loading: {},
      errors: {},
      selectedDate: new Date(),
      recentTasks: [],
      recentHabits: [],
      undoStack: [],
      redoStack: [],

      // Actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      setCurrentView: (view) => set({ currentView: view }),
      
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      // Filter actions
      setTaskFilters: (filters) => 
        set((state) => ({
          taskFilters: { ...state.taskFilters, ...filters }
        })),
      
      resetTaskFilters: () => set({ taskFilters: defaultTaskFilters }),

      // Preferences actions
      setPreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences }
        })),
      
      updateDashboardLayout: (layout) =>
        set((state) => ({
          preferences: { ...state.preferences, dashboardLayout: layout }
        })),

      // Loading & Error management
      setLoading: (key, loading) =>
        set((state) => ({
          loading: { ...state.loading, [key]: loading }
        })),
      
      setError: (key, error) =>
        set((state) => ({
          errors: { ...state.errors, [key]: error }
        })),
      
      clearErrors: () => set({ errors: {} }),

      // Date selection
      setSelectedDate: (date) => set({ selectedDate: date }),

      // Recent activity
      addRecentTask: (taskId) =>
        set((state) => ({
          recentTasks: [taskId, ...state.recentTasks.filter(id => id !== taskId)].slice(0, 10)
        })),
      
      addRecentHabit: (habitId) =>
        set((state) => ({
          recentHabits: [habitId, ...state.recentHabits.filter(id => id !== habitId)].slice(0, 10)
        })),

      // Undo/Redo functionality
      addToUndoStack: (action, data) =>
        set((state) => ({
          undoStack: [...state.undoStack, { action, data, timestamp: Date.now() }].slice(-20), // Keep last 20 actions
          redoStack: [], // Clear redo stack when new action is performed
        })),
      
      undo: () => {
        const state = get();
        if (state.undoStack.length === 0) return null;
        
        const lastAction = state.undoStack[state.undoStack.length - 1];
        set({
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, lastAction],
        });
        
        return lastAction;
      },
      
      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return null;
        
        const actionToRedo = state.redoStack[state.redoStack.length - 1];
        set({
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [...state.undoStack, actionToRedo],
        });
        
        return actionToRedo;
      },
      
      clearUndoRedo: () => set({ undoStack: [], redoStack: [] }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        preferences: state.preferences,
        sidebarOpen: state.sidebarOpen,
        recentTasks: state.recentTasks,
        recentHabits: state.recentHabits,
      }),
    }
  )
);

// Utility hooks for specific state slices
export const useSidebar = () => useAppStore((state) => ({
  isOpen: state.sidebarOpen,
  toggle: () => state.setSidebarOpen(!state.sidebarOpen),
  open: () => state.setSidebarOpen(true),
  close: () => state.setSidebarOpen(false),
}));

export const useTheme = () => useAppStore((state) => ({
  theme: state.theme,
  setTheme: state.setTheme,
}));

export const useTaskFilters = () => useAppStore((state) => ({
  filters: state.taskFilters,
  setFilters: state.setTaskFilters,
  resetFilters: state.resetTaskFilters,
}));

export const usePreferences = () => useAppStore((state) => ({
  preferences: state.preferences,
  setPreferences: state.setPreferences,
  updateDashboardLayout: state.updateDashboardLayout,
}));

export const useAppErrors = () => useAppStore((state) => ({
  errors: state.errors,
  setError: state.setError,
  clearErrors: state.clearErrors,
}));

export const useAppLoading = () => useAppStore((state) => ({
  loading: state.loading,
  setLoading: state.setLoading,
  isLoading: (key: string) => state.loading[key] || false,
}));
