import { useUIStore } from '../stores/uiStore';

/**
 * Simplified theme management hook
 */
export function useTheme() {
  const { theme, setTheme } = useUIStore();

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
