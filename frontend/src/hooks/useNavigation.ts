import { useUIStore } from '../stores/uiStore';

/**
 * Simplified navigation state management
 */
export function useNavigation() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return {
    isSidebarOpen,
    toggleSidebar,
  };
}
