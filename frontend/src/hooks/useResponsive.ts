import { useEffect, useState } from 'react';
import { useUIStore } from '../stores/uiStore';

interface ResponsiveConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

const DEFAULT_BREAKPOINTS: ResponsiveConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
};

/**
 * Hook for responsive breakpoint detection
 */
export function useResponsive(breakpoints: ResponsiveConfig = DEFAULT_BREAKPOINTS) {
  const [windowWidth, setWindowWidth] = useState(0);
  const { setMobile } = useUIStore();

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setMobile(width < breakpoints.mobile);
    };

    // Set initial width
    updateWidth();

    const handleResize = () => updateWidth();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoints.mobile, setMobile]);

  return {
    windowWidth,
    isMobile: windowWidth < breakpoints.mobile,
    isTablet: windowWidth >= breakpoints.mobile && windowWidth < breakpoints.tablet,
    isDesktop: windowWidth >= breakpoints.desktop,
    breakpoints,
  };
}
