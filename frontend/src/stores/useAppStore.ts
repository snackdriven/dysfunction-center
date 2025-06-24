import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  DailyProductivityData, 
  CrossDomainCorrelation, 
  ProductivityInsight,
  CalendarDataOverlay,
  CustomTheme 
} from '../../../shared/types';

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  customTheme?: CustomTheme;
  setCustomTheme: (theme: CustomTheme | undefined) => void;

  // Navigation
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeView: 'dashboard' | 'tasks' | 'habits' | 'mood' | 'calendar';
  setActiveView: (view: 'dashboard' | 'tasks' | 'habits' | 'mood' | 'calendar') => void;

  // UI State
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Cross-domain integration state
  selectedDate: string; // ISO date string
  setSelectedDate: (date: string) => void;
  
  // Productivity data cache
  dailyProductivityData: Map<string, DailyProductivityData>;
  setDailyProductivityData: (date: string, data: DailyProductivityData) => void;
  
  // Calendar overlay data cache
  calendarOverlayData: Map<string, CalendarDataOverlay>;
  setCalendarOverlayData: (date: string, data: CalendarDataOverlay) => void;
  
  // Insights and correlations
  correlations: CrossDomainCorrelation[];
  setCorrelations: (correlations: CrossDomainCorrelation[]) => void;
  
  insights: ProductivityInsight[];
  setInsights: (insights: ProductivityInsight[]) => void;
  
  // Sync status
  syncStatus: 'idle' | 'syncing' | 'error';
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  lastSyncTime?: string;
  setLastSyncTime: (time: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        const { customTheme } = get();
        if (customTheme) {
          // Apply custom theme colors
          Object.entries(customTheme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-${key}`, value);
          });
        }
        
        if (theme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        } else {
          // System theme
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
        }
      },
      customTheme: undefined,
      setCustomTheme: (theme) => {
        set({ customTheme: theme });
        if (theme) {
          // Apply custom theme immediately
          Object.entries(theme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-${key}`, value);
          });
          document.documentElement.style.setProperty('--font-size-base', 
            theme.font_size === 'small' ? '14px' :
            theme.font_size === 'large' ? '18px' :
            theme.font_size === 'extra-large' ? '20px' : '16px'
          );
          document.documentElement.style.setProperty('--font-family-base', 
            theme.font_family === 'serif' ? 'Georgia, serif' :
            theme.font_family === 'monospace' ? 'Monaco, monospace' : 
            'system-ui, sans-serif'
          );
        }
      },

      // Navigation
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),

      // UI State
      loading: false,
      setLoading: (loading) => set({ loading }),
      
      // Cross-domain integration state
      selectedDate: new Date().toISOString().split('T')[0],
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      // Productivity data cache
      dailyProductivityData: new Map(),
      setDailyProductivityData: (date, data) => {
        const current = get().dailyProductivityData;
        const updated = new Map(current);
        updated.set(date, data);
        set({ dailyProductivityData: updated });
      },
      
      // Calendar overlay data cache
      calendarOverlayData: new Map(),
      setCalendarOverlayData: (date, data) => {
        const current = get().calendarOverlayData;
        const updated = new Map(current);
        updated.set(date, data);
        set({ calendarOverlayData: updated });
      },
      
      // Insights and correlations
      correlations: [],
      setCorrelations: (correlations) => set({ correlations }),
      
      insights: [],
      setInsights: (insights) => set({ insights }),
      
      // Sync status
      syncStatus: 'idle',
      setSyncStatus: (status) => set({ syncStatus: status }),
      lastSyncTime: undefined,
      setLastSyncTime: (time) => set({ lastSyncTime: time }),
    }),
    {
      name: 'executive-dysfunction-center-app-store',
      partialize: (state) => ({
        theme: state.theme,
        customTheme: state.customTheme,
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
        selectedDate: state.selectedDate,
      }),
    }
  )
);