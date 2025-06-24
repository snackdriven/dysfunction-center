import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Navigation state
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  isMobile: boolean;
  
  // Theme state
  theme: 'light' | 'dark' | 'system';
  
  // Search state
  isSearchOpen: boolean;
  searchQuery: string;
  
  // Actions
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setMobile: (isMobile: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSearch: () => void;
  setSearchQuery: (query: string) => void;
  closeMobileMenu: () => void;
  openMobileMenu: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isSidebarOpen: true,
      isMobileMenuOpen: false,
      isMobile: false,
      theme: 'system',
      isSearchOpen: false,
      searchQuery: '',
      
      // Actions
      toggleSidebar: () => set((state) => ({ 
        isSidebarOpen: !state.isSidebarOpen 
      })),
      
      toggleMobileMenu: () => set((state) => ({ 
        isMobileMenuOpen: !state.isMobileMenuOpen 
      })),
      
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      
      openMobileMenu: () => set({ isMobileMenuOpen: true }),
      
      setMobile: (isMobile) => set({ 
        isMobile,
        // Auto-close sidebar on mobile
        isSidebarOpen: isMobile ? false : get().isSidebarOpen
      }),
      
      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else if (theme === 'light') {
          root.classList.remove('dark');
        } else {
          // System theme
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
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
