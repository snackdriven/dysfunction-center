import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';

/**
 * Hook to apply custom theme on app initialization
 * This ensures custom themes are applied after page reload
 */
export const useThemeInitializer = () => {
  const { customTheme, setCustomTheme } = useAppStore();

  useEffect(() => {
    // Re-apply custom theme if it exists (after page reload)
    if (customTheme) {
      setCustomTheme(customTheme);
    }
  }, [customTheme, setCustomTheme]);
};
