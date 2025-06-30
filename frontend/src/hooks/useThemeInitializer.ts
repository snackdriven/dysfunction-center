import { useEffect } from 'react';
import { useAppStore } from '../stores/appStore';

/**
 * Hook to apply custom theme on app initialization
 * Sets up theme based on user preferences and system settings
 */
export const useThemeInitializer = () => {
  const { theme } = useAppStore();

  useEffect(() => {
    // Apply the theme immediately on mount
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
  }, [theme]);
};
