import { useUIStore } from '../stores/uiStore';

/**
 * Hook for managing navigation state
 */
export function useNavigation() {
  const {
    isSidebarOpen,
    isMobileMenuOpen,
    isMobile,
    toggleSidebar,
    toggleMobileMenu,
    closeMobileMenu,
    openMobileMenu,
    setMobile,
  } = useUIStore();

  return {
    isSidebarOpen,
    isMobileMenuOpen,
    isMobile,
    toggleSidebar,
    toggleMobileMenu,
    closeMobileMenu,
    openMobileMenu,
    setMobile,
  };
}
