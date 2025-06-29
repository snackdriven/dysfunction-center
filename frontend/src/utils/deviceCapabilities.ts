// Device capability detection and progressive enhancement utilities
// for Executive Dysfunction Center cross-device compatibility

/**
 * Device and browser capability detection
 */

export interface DeviceCapabilities {
  // Basic device info
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'small' | 'medium' | 'large' | 'xlarge';
  
  // Input capabilities
  hasTouch: boolean;
  hasKeyboard: boolean;
  hasMouse: boolean;
  hasStylus: boolean;
  
  // Display capabilities
  isDarkModeSupported: boolean;
  supportsHighContrast: boolean;
  pixelDensity: number;
  supportsColorScheme: boolean;
  
  // Browser features
  supportsContainerQueries: boolean;
  supportsPWA: boolean;
  supportsServiceWorker: boolean;
  supportsWebP: boolean;
  supportsIntersectionObserver: boolean;
  
  // Performance indicators
  connectionSpeed: 'slow' | 'medium' | 'fast';
  deviceMemory: number; // GB
  hardwareConcurrency: number;
  
  // Accessibility features
  prefersReducedMotion: boolean;
  prefersHighContrast: boolean;
  invertedColors: boolean;
  
  // Executive dysfunction specific
  cognitiveLoadCapacity: 'high' | 'medium' | 'low';
  attentionSpanIndicator: 'short' | 'medium' | 'long';
}

/**
 * Detect device capabilities
 */
export const detectDeviceCapabilities = (): DeviceCapabilities => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isSSR = typeof window === 'undefined';
  
  if (isSSR) {
    // Server-side defaults
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenSize: 'large',
      hasTouch: false,
      hasKeyboard: true,
      hasMouse: true,
      hasStylus: false,
      isDarkModeSupported: false,
      supportsHighContrast: false,
      pixelDensity: 1,
      supportsColorScheme: false,
      supportsContainerQueries: false,
      supportsPWA: false,
      supportsServiceWorker: false,
      supportsWebP: false,
      supportsIntersectionObserver: false,
      connectionSpeed: 'medium',
      deviceMemory: 4,
      hardwareConcurrency: 4,
      prefersReducedMotion: false,
      prefersHighContrast: false,
      invertedColors: false,
      cognitiveLoadCapacity: 'medium',
      attentionSpanIndicator: 'medium'
    };
  }

  // Device type detection
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android.*tablet|kindle|playbook|silk/i.test(userAgent) || 
    (window.innerWidth >= 768 && window.innerWidth <= 1024);
  const isDesktop = !isMobile && !isTablet;

  // Screen size detection
  const screenWidth = window.innerWidth;
  let screenSize: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';
  if (screenWidth < 640) screenSize = 'small';
  else if (screenWidth < 1024) screenSize = 'medium';
  else if (screenWidth < 1920) screenSize = 'large';
  else screenSize = 'xlarge';

  // Input capability detection
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const hasKeyboard = !isMobile || window.innerWidth > 768; // Assume keyboard available on larger screens
  const hasMouse = window.matchMedia('(pointer: fine)').matches;
  const hasStylus = window.matchMedia('(pointer: fine) and (hover: none)').matches;

  // Display capabilities
  const isDarkModeSupported = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const supportsHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  const pixelDensity = window.devicePixelRatio || 1;
  const supportsColorScheme = CSS.supports('color-scheme', 'dark light');

  // Browser feature detection
  const supportsContainerQueries = CSS.supports('container-type', 'inline-size');
  const supportsPWA = 'serviceWorker' in navigator && 'PushManager' in window;
  const supportsServiceWorker = 'serviceWorker' in navigator;
  const supportsIntersectionObserver = 'IntersectionObserver' in window;
  
  // WebP support detection
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  })();

  // Connection speed estimation
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  let connectionSpeed: 'slow' | 'medium' | 'fast' = 'medium';
  if (connection) {
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      connectionSpeed = 'slow';
    } else if (connection.effectiveType === '4g') {
      connectionSpeed = 'fast';
    }
  }

  // Device performance indicators
  const deviceMemory = (navigator as any).deviceMemory || 4; // GB
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  // Accessibility preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  const invertedColors = window.matchMedia('(inverted-colors: inverted)').matches;

  // Executive dysfunction capacity estimation (heuristic)
  let cognitiveLoadCapacity: 'high' | 'medium' | 'low' = 'medium';
  let attentionSpanIndicator: 'short' | 'medium' | 'long' = 'medium';

  // Lower capacity for slower devices or connections
  if (connectionSpeed === 'slow' || deviceMemory < 3 || hardwareConcurrency < 4) {
    cognitiveLoadCapacity = 'low';
    attentionSpanIndicator = 'short';
  } else if (connectionSpeed === 'fast' && deviceMemory >= 8 && hardwareConcurrency >= 8) {
    cognitiveLoadCapacity = 'high';
    attentionSpanIndicator = 'long';
  }

  // Adjust for accessibility preferences (users who need reduced motion may have lower tolerance)
  if (prefersReducedMotion || prefersHighContrast) {
    cognitiveLoadCapacity = cognitiveLoadCapacity === 'high' ? 'medium' : 'low';
    attentionSpanIndicator = attentionSpanIndicator === 'long' ? 'medium' : 'short';
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenSize,
    hasTouch,
    hasKeyboard,
    hasMouse,
    hasStylus,
    isDarkModeSupported,
    supportsHighContrast,
    pixelDensity,
    supportsColorScheme,
    supportsContainerQueries,
    supportsPWA,
    supportsServiceWorker,
    supportsWebP,
    supportsIntersectionObserver,
    connectionSpeed,
    deviceMemory,
    hardwareConcurrency,
    prefersReducedMotion,
    prefersHighContrast,
    invertedColors,
    cognitiveLoadCapacity,
    attentionSpanIndicator
  };
};

/**
 * Progressive Enhancement Hook
 */
export const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = React.useState<DeviceCapabilities>(() => 
    detectDeviceCapabilities()
  );

  React.useEffect(() => {
    // Update capabilities on window resize or orientation change
    const updateCapabilities = () => {
      setCapabilities(detectDeviceCapabilities());
    };

    window.addEventListener('resize', updateCapabilities);
    window.addEventListener('orientationchange', updateCapabilities);

    // Listen for media query changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleMediaQueryChange = () => {
      setCapabilities(detectDeviceCapabilities());
    };

    motionQuery.addListener(handleMediaQueryChange);
    contrastQuery.addListener(handleMediaQueryChange);
    colorSchemeQuery.addListener(handleMediaQueryChange);

    return () => {
      window.removeEventListener('resize', updateCapabilities);
      window.removeEventListener('orientationchange', updateCapabilities);
      motionQuery.removeListener(handleMediaQueryChange);
      contrastQuery.removeListener(handleMediaQueryChange);
      colorSchemeQuery.removeListener(handleMediaQueryChange);
    };
  }, []);

  return capabilities;
};

/**
 * Adaptive loading strategies based on device capabilities
 */
export const getAdaptiveLoadingStrategy = (capabilities: DeviceCapabilities) => {
  const strategy = {
    // Image loading
    imageFormat: capabilities.supportsWebP ? 'webp' : 'jpg',
    imageQuality: capabilities.connectionSpeed === 'slow' ? 'low' : 
                 capabilities.connectionSpeed === 'fast' ? 'high' : 'medium',
    lazyLoadImages: true,
    
    // JavaScript loading
    loadAnalytics: capabilities.connectionSpeed !== 'slow',
    loadNonEssentialFeatures: capabilities.deviceMemory >= 4,
    enableAnimations: !capabilities.prefersReducedMotion && capabilities.connectionSpeed !== 'slow',
    
    // UI complexity
    showAdvancedFeatures: capabilities.cognitiveLoadCapacity === 'high',
    simplifyNavigation: capabilities.cognitiveLoadCapacity === 'low' || capabilities.screenSize === 'small',
    enableGestures: capabilities.hasTouch && !capabilities.prefersReducedMotion,
    
    // Performance optimizations
    useVirtualization: capabilities.deviceMemory < 4 || capabilities.connectionSpeed === 'slow',
    preloadCriticalResources: capabilities.connectionSpeed === 'fast',
    enableServiceWorker: capabilities.supportsServiceWorker && capabilities.connectionSpeed !== 'slow',
    
    // Executive dysfunction adaptations
    reduceCognitiveLoad: capabilities.cognitiveLoadCapacity === 'low',
    shortenAnimations: capabilities.attentionSpanIndicator === 'short',
    enableFocusMode: capabilities.cognitiveLoadCapacity === 'low',
    simplifyInteractions: capabilities.attentionSpanIndicator === 'short'
  };

  return strategy;
};

/**
 * Feature detection for specific capabilities
 */
export const featureSupport = {
  containerQueries: () => CSS.supports('container-type', 'inline-size'),
  
  webp: () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  },
  
  intersectionObserver: () => 'IntersectionObserver' in window,
  
  serviceWorker: () => 'serviceWorker' in navigator,
  
  pushNotifications: () => 'PushManager' in window && 'Notification' in window,
  
  webShare: () => 'share' in navigator,
  
  clipboard: () => 'clipboard' in navigator,
  
  fullscreen: () => 'requestFullscreen' in document.documentElement,
  
  vibration: () => 'vibrate' in navigator,
  
  geolocation: () => 'geolocation' in navigator,
  
  deviceMotion: () => 'DeviceMotionEvent' in window,
  
  wake_lock: () => 'wakeLock' in navigator
};

// Import React for hooks
import React from 'react';

/**
 * Polyfill loader for missing features
 */
export const loadPolyfills = async (capabilities: DeviceCapabilities) => {
  const polyfills = [];

  // Container queries polyfill
  if (!capabilities.supportsContainerQueries) {
    polyfills.push(
      // Note: Install with npm install container-query-polyfill
      // import('container-query-polyfill').catch(() => {
      //   console.warn('Container queries polyfill failed to load');
      // })
      Promise.resolve() // Placeholder for now
    );
  }

  // Intersection Observer polyfill
  if (!capabilities.supportsIntersectionObserver) {
    polyfills.push(
      // Note: Install with npm install intersection-observer
      // import('intersection-observer').catch(() => {
      //   console.warn('IntersectionObserver polyfill failed to load');
      // })
      Promise.resolve() // Placeholder for now
    );
  }

  return Promise.allSettled(polyfills);
};

/**
 * Export device info for debugging and analytics
 */
export const getDeviceInfo = () => {
  const capabilities = detectDeviceCapabilities();
  const strategy = getAdaptiveLoadingStrategy(capabilities);
  
  return {
    capabilities,
    strategy,
    userAgent: navigator.userAgent,
    screen: {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio
    },
    timestamp: Date.now()
  };
};
