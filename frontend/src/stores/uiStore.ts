import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Navigation state
  isSidebarOpen: boolean;
  
  // Theme state (simplified to light/dark only)
  theme: 'light' | 'dark';
  
  // Search state
  isSearchOpen: boolean;
  searchQuery: string;
  
  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      isSidebarOpen: true,
      theme: 'light',
      isSearchOpen: false,
      searchQuery: '',
      
      // Actions
      toggleSidebar: () => set((state) => ({ 
        isSidebarOpen: !state.isSidebarOpen 
      })),
      
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      },
      
      toggleSearch: () => set((state) => ({ 
        isSearchOpen: !state.isSearchOpen 
      })),
      
      setSearchQuery: (searchQuery) => set({ searchQuery }),
    }),
    {
      name: 'ui-state',
      partialize: (state) => ({ 
        isSidebarOpen: state.isSidebarOpen,
        theme: state.theme 
      }),
    }
  )
);
