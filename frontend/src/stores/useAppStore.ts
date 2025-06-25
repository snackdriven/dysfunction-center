import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { DailyProductivityData, CalendarDataOverlay, CustomTheme } from '../../../shared/types';
import { hexToHsl } from '../utils/colorUtils';

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
  selectedDate: string;
  
  // Recent activity for quick access
  recentTasks: number[];
  recentHabits: number[];
  
  // Undo/Redo functionality
  undoStack: Array<{ action: string; data: any; timestamp: number }>;
  redoStack: Array<{ action: string; data: any; timestamp: number }>;
  
  // Sync state
  lastSyncTime: string | null;
  
  // Additional properties for test compatibility
  customTheme?: CustomTheme;
  dailyProductivityData: Map<string, DailyProductivityData>;
  calendarOverlayData: Map<string, CalendarDataOverlay>;
  
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
  setSelectedDate: (date: string) => void;
  
  // Recent activity
  addRecentTask: (taskId: number) => void;
  addRecentHabit: (habitId: number) => void;
  
  // Undo/Redo
  addToUndoStack: (action: string, data: any) => void;
  undo: () => any | null;
  redo: () => any | null;
  clearUndoRedo: () => void;
  
  // Sync
  setLastSyncTime: (time: string) => void;
  
  // Custom theme
  setCustomTheme: (theme?: CustomTheme) => void;
  previewCustomTheme: (theme?: CustomTheme) => void;
  clearThemePreview: () => void;
  
  // Data caching
  setDailyProductivityData: (date: string, data: DailyProductivityData) => void;
  setCalendarOverlayData: (date: string, data: CalendarDataOverlay) => void;
}

const defaultPreferences: UserPreferences = {
  dashboardLayout: [
    { id: 'todays-focus', title: "Today's Focus", size: 'medium', position: { x: 0, y: 0 }, visible: true },
    { id: 'weekly-progress', title: 'Weekly Progress', size: 'large', position: { x: 1, y: 0 }, visible: true },
    { id: 'mood-tracker', title: 'Mood Tracker', size: 'small', position: { x: 0, y: 1 }, visible: true },
    { id: 'habit-streak', title: 'Habit Streaks', size: 'medium', position: { x: 1, y: 1 }, visible: true },
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
      selectedDate: new Date().toISOString().split('T')[0],
      recentTasks: [],
      recentHabits: [],
      undoStack: [],
      redoStack: [],
      lastSyncTime: null,
      customTheme: undefined,
      dailyProductivityData: new Map(),
      calendarOverlayData: new Map(),
      
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
      setTaskFilters: (filters) => {
        const currentFilters = get().taskFilters;
        set({ taskFilters: { ...currentFilters, ...filters } });
      },
      
      resetTaskFilters: () => set({ taskFilters: defaultTaskFilters }),
      
      // Preferences actions
      setPreferences: (preferences) => {
        const currentPreferences = get().preferences;
        set({ preferences: { ...currentPreferences, ...preferences } });
      },
      
      updateDashboardLayout: (layout) => {
        const currentPreferences = get().preferences;
        set({ 
          preferences: { 
            ...currentPreferences, 
            dashboardLayout: layout 
          } 
        });
      },
      
      // Loading & Error management
      setLoading: (key, loading) => {
        const currentLoading = get().loading;
        set({ loading: { ...currentLoading, [key]: loading } });
      },
      
      setError: (key, error) => {
        const currentErrors = get().errors;
        set({ errors: { ...currentErrors, [key]: error } });
      },
      
      clearErrors: () => set({ errors: {} }),
      
      // Date selection
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      // Recent activity
      addRecentTask: (taskId) => {
        const recentTasks = get().recentTasks;
        const updated = [taskId, ...recentTasks.filter(id => id !== taskId)].slice(0, 10);
        set({ recentTasks: updated });
      },
      
      addRecentHabit: (habitId) => {
        const recentHabits = get().recentHabits;
        const updated = [habitId, ...recentHabits.filter(id => id !== habitId)].slice(0, 10);
        set({ recentHabits: updated });
      },
      
      // Undo/Redo
      addToUndoStack: (action, data) => {
        const undoStack = get().undoStack;
        const timestamp = Date.now();
        const updated = [...undoStack, { action, data, timestamp }].slice(-50); // Keep last 50 actions
        set({ undoStack: updated, redoStack: [] }); // Clear redo stack when new action is added
      },
      
      undo: () => {
        const { undoStack, redoStack } = get();
        if (undoStack.length === 0) return null;
        
        const lastAction = undoStack[undoStack.length - 1];
        const newUndoStack = undoStack.slice(0, -1);
        const newRedoStack = [...redoStack, lastAction];
        
        set({ undoStack: newUndoStack, redoStack: newRedoStack });
        return lastAction;
      },
      
      redo: () => {
        const { undoStack, redoStack } = get();
        if (redoStack.length === 0) return null;
        
        const lastAction = redoStack[redoStack.length - 1];
        const newRedoStack = redoStack.slice(0, -1);
        const newUndoStack = [...undoStack, lastAction];
        
        set({ undoStack: newUndoStack, redoStack: newRedoStack });
        return lastAction;
      },
      
      clearUndoRedo: () => set({ undoStack: [], redoStack: [] }),
      
      // Sync
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
      
      // Custom theme
      setCustomTheme: (theme) => {
        set({ customTheme: theme });
        // Apply custom theme colors as CSS variables
        if (theme) {
          const root = document.documentElement;
          // Set both hex values and HSL values for compatibility
          root.style.setProperty('--color-primary', theme.colors.primary);
          root.style.setProperty('--color-secondary', theme.colors.secondary);
          root.style.setProperty('--color-accent', theme.colors.accent);
          root.style.setProperty('--color-background', theme.colors.background);
          root.style.setProperty('--color-foreground', theme.colors.foreground);
          root.style.setProperty('--color-muted', theme.colors.muted);
          root.style.setProperty('--color-border', theme.colors.border);
          
          // Map to existing Tailwind variables (HSL format)
          root.style.setProperty('--primary', hexToHsl(theme.colors.primary));
          root.style.setProperty('--secondary', hexToHsl(theme.colors.secondary));
          root.style.setProperty('--accent', hexToHsl(theme.colors.accent));
          root.style.setProperty('--background', hexToHsl(theme.colors.background));
          root.style.setProperty('--foreground', hexToHsl(theme.colors.foreground));
          root.style.setProperty('--muted', hexToHsl(theme.colors.muted));
          root.style.setProperty('--border', hexToHsl(theme.colors.border));
        } else {
          // Reset to default CSS variables
          const root = document.documentElement;
          root.style.removeProperty('--color-primary');
          root.style.removeProperty('--color-secondary');
          root.style.removeProperty('--color-accent');
          root.style.removeProperty('--color-background');
          root.style.removeProperty('--color-foreground');
          root.style.removeProperty('--color-muted');
          root.style.removeProperty('--color-border');
          
          // Reset Tailwind variables
          root.style.removeProperty('--primary');
          root.style.removeProperty('--secondary');
          root.style.removeProperty('--accent');
          root.style.removeProperty('--background');
          root.style.removeProperty('--foreground');
          root.style.removeProperty('--muted');
          root.style.removeProperty('--border');
        }
      },

      // Preview theme without saving
      previewCustomTheme: (theme) => {
        if (theme) {
          const root = document.documentElement;
          // Set both hex values and HSL values for compatibility
          root.style.setProperty('--color-primary', theme.colors.primary);
          root.style.setProperty('--color-secondary', theme.colors.secondary);
          root.style.setProperty('--color-accent', theme.colors.accent);
          root.style.setProperty('--color-background', theme.colors.background);
          root.style.setProperty('--color-foreground', theme.colors.foreground);
          root.style.setProperty('--color-muted', theme.colors.muted);
          root.style.setProperty('--color-border', theme.colors.border);
          
          // Map to existing Tailwind variables (HSL format)
          root.style.setProperty('--primary', hexToHsl(theme.colors.primary));
          root.style.setProperty('--secondary', hexToHsl(theme.colors.secondary));
          root.style.setProperty('--accent', hexToHsl(theme.colors.accent));
          root.style.setProperty('--background', hexToHsl(theme.colors.background));
          root.style.setProperty('--foreground', hexToHsl(theme.colors.foreground));
          root.style.setProperty('--muted', hexToHsl(theme.colors.muted));
          root.style.setProperty('--border', hexToHsl(theme.colors.border));
        }
      },

      // Clear preview and restore saved theme or defaults
      clearThemePreview: () => {
        const { customTheme } = get();
        if (customTheme) {
          // Restore saved theme
          const root = document.documentElement;
          root.style.setProperty('--color-primary', customTheme.colors.primary);
          root.style.setProperty('--color-secondary', customTheme.colors.secondary);
          root.style.setProperty('--color-accent', customTheme.colors.accent);
          root.style.setProperty('--color-background', customTheme.colors.background);
          root.style.setProperty('--color-foreground', customTheme.colors.foreground);
          root.style.setProperty('--color-muted', customTheme.colors.muted);
          root.style.setProperty('--color-border', customTheme.colors.border);
          
          // Map to existing Tailwind variables (HSL format)
          root.style.setProperty('--primary', hexToHsl(customTheme.colors.primary));
          root.style.setProperty('--secondary', hexToHsl(customTheme.colors.secondary));
          root.style.setProperty('--accent', hexToHsl(customTheme.colors.accent));
          root.style.setProperty('--background', hexToHsl(customTheme.colors.background));
          root.style.setProperty('--foreground', hexToHsl(customTheme.colors.foreground));
          root.style.setProperty('--muted', hexToHsl(customTheme.colors.muted));
          root.style.setProperty('--border', hexToHsl(customTheme.colors.border));
        } else {
          // Reset to defaults
          const root = document.documentElement;
          root.style.removeProperty('--color-primary');
          root.style.removeProperty('--color-secondary');
          root.style.removeProperty('--color-accent');
          root.style.removeProperty('--color-background');
          root.style.removeProperty('--color-foreground');
          root.style.removeProperty('--color-muted');
          root.style.removeProperty('--color-border');
          
          // Reset Tailwind variables
          root.style.removeProperty('--primary');
          root.style.removeProperty('--secondary');
          root.style.removeProperty('--accent');
          root.style.removeProperty('--background');
          root.style.removeProperty('--foreground');
          root.style.removeProperty('--muted');
          root.style.removeProperty('--border');
        }
      },
      
      // Data caching
      setDailyProductivityData: (date, data) => {
        const currentData = get().dailyProductivityData;
        const updatedData = new Map(currentData);
        updatedData.set(date, data);
        set({ dailyProductivityData: updatedData });
      },
      
      setCalendarOverlayData: (date, data) => {
        const currentData = get().calendarOverlayData;
        const updatedData = new Map(currentData);
        updatedData.set(date, data);
        set({ calendarOverlayData: updatedData });
      },
    }),
    {
      name: 'executive-dysfunction-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        customTheme: state.customTheme,
        preferences: state.preferences,
        taskFilters: state.taskFilters,
        recentTasks: state.recentTasks,
        recentHabits: state.recentHabits,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);