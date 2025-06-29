// Performance optimization utilities for Executive Dysfunction Center

/**
 * Lazy loading utilities
 */

// Generic lazy loading wrapper component
import React, { Suspense } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingStates';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorBoundary?: boolean;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner />,
  errorBoundary = true 
}) => {
  const content = <Suspense fallback={fallback}>{children}</Suspense>;
  
  if (errorBoundary) {
    return (
      <ErrorBoundary>
        {content}
      </ErrorBoundary>
    );
  }
  
  return content;
};

// Simple error boundary for lazy loaded components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Failed to load component</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Progressive image loading component
 */
interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  width,
  height,
  loading = 'lazy'
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = () => setIsLoaded(true);
  const handleError = () => setHasError(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {placeholder && !isLoaded && !hasError && (
        <img
          src={placeholder}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
          aria-hidden="true"
        />
      )}
      
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-muted-foreground">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

/**
 * Performance monitoring utilities
 */

// Core Web Vitals monitoring
export const measureWebVitals = (metric: any) => {
  // Log metrics for monitoring
  console.log('Web Vital:', metric);
  
  // Send to analytics service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  // Send to custom analytics
  if (typeof window !== 'undefined') {
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric)
    }).catch(() => {
      // Fail silently - analytics shouldn't break the app
    });
  }
};

// Performance observer for executive dysfunction specific metrics
export const observeExecutiveDysfunctionMetrics = () => {
  if (typeof window === 'undefined') return;

  // Measure task completion time
  const measureTaskCompletion = (taskId: string, startTime: number) => {
    const completionTime = performance.now() - startTime;
    
    // Log completion time
    console.log(`Task ${taskId} completed in ${completionTime}ms`);
    
    // Track cognitive load indicators
    const cognitiveLoad = {
      taskId,
      completionTime,
      clickCount: getClickCount(),
      scrollDistance: getScrollDistance(),
      timestamp: Date.now()
    };
    
    // Store locally for analysis
    const existingData = JSON.parse(
      localStorage.getItem('edc-cognitive-load') || '[]'
    );
    existingData.push(cognitiveLoad);
    
    // Keep only last 100 entries
    if (existingData.length > 100) {
      existingData.splice(0, existingData.length - 100);
    }
    
    localStorage.setItem('edc-cognitive-load', JSON.stringify(existingData));
  };

  // Measure habit completion patterns
  const measureHabitCompletion = (habitId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    const completionMetric = {
      habitId,
      difficulty,
      completionTime: performance.now(),
      dayOfWeek: new Date().getDay(),
      hourOfDay: new Date().getHours(),
      timestamp: Date.now()
    };
    
    // Store for pattern analysis
    const existingData = JSON.parse(
      localStorage.getItem('edc-habit-patterns') || '[]'
    );
    existingData.push(completionMetric);
    
    if (existingData.length > 200) {
      existingData.splice(0, existingData.length - 200);
    }
    
    localStorage.setItem('edc-habit-patterns', JSON.stringify(existingData));
  };

  // Export measurement functions
  (window as any).edcMetrics = {
    measureTaskCompletion,
    measureHabitCompletion
  };
};

// Helper functions for tracking user interaction patterns
let clickCount = 0;
let scrollDistance = 0;

const getClickCount = () => clickCount;
const getScrollDistance = () => scrollDistance;

// Track clicks
if (typeof window !== 'undefined') {
  document.addEventListener('click', () => {
    clickCount++;
  });

  // Reset click count every minute
  setInterval(() => {
    clickCount = 0;
  }, 60000);

  // Track scroll distance
  let lastScrollY = window.scrollY;
  document.addEventListener('scroll', () => {
    scrollDistance += Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;
  });

  // Reset scroll distance every minute
  setInterval(() => {
    scrollDistance = 0;
  }, 60000);
}

/**
 * Bundle optimization utilities
 */

// Dynamic import with error handling
export const simpleDynamicImport = async <T,>(importFn: () => Promise<T>): Promise<T | null> => {
  try {
    return await importFn();
  } catch (error) {
    console.error('Dynamic import failed:', error);
    return null;
  }
};

// Preload critical resources
export const preloadResource = (href: string, as: string, type?: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
};

// Prefetch resources for likely navigation
export const prefetchResource = (href: string) => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  document.head.appendChild(link);
};

/**
 * Memory optimization utilities
 */

// Cleanup function for components
export const useCleanup = (cleanupFn: () => void) => {
  React.useEffect(() => {
    return cleanupFn;
  }, [cleanupFn]);
};

// Debounce hook for performance
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll/resize events
export const useThrottle = <T,>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef<number>(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Executive dysfunction specific performance optimizations
 */

// Reduce cognitive load by limiting simultaneous animations
let activeAnimations = 0;
const MAX_ANIMATIONS = 3;

export const requestAnimation = (animationFn: () => void): boolean => {
  if (activeAnimations >= MAX_ANIMATIONS) {
    console.log('Animation skipped due to cognitive load management');
    return false;
  }
  
  activeAnimations++;
  animationFn();
  
  // Automatically decrease count after typical animation duration
  setTimeout(() => {
    activeAnimations = Math.max(0, activeAnimations - 1);
  }, 300);
  
  return true;
};

// Progressive disclosure for complex interfaces
export const useProgressiveDisclosure = (steps: number) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<boolean[]>(
    new Array(steps).fill(false)
  );

  const goToStep = (step: number) => {
    if (step >= 0 && step < steps) {
      setCurrentStep(step);
    }
  };

  const completeStep = (step: number) => {
    setCompletedSteps(prev => {
      const updated = [...prev];
      updated[step] = true;
      return updated;
    });
  };

  const nextStep = () => {
    if (currentStep < steps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    currentStep,
    completedSteps,
    goToStep,
    completeStep,
    nextStep,
    previousStep,
    isLastStep: currentStep === steps - 1,
    isFirstStep: currentStep === 0
  };
};

// Focus management for executive dysfunction
export const useFocusManagement = () => {
  const focusHistory = React.useRef<HTMLElement[]>([]);

  const storeFocus = () => {
    if (document.activeElement && document.activeElement !== document.body) {
      focusHistory.current.push(document.activeElement as HTMLElement);
    }
  };

  const restoreFocus = () => {
    const lastFocused = focusHistory.current.pop();
    if (lastFocused && lastFocused.focus) {
      lastFocused.focus();
    }
  };

  const clearFocusHistory = () => {
    focusHistory.current = [];
  };

  return {
    storeFocus,
    restoreFocus,
    clearFocusHistory
  };
};

/**
 * Bundle size optimization utilities
 */

// Dynamic import with retry logic
export const dynamicImport = async <T,>(
  factory: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await factory();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
  throw new Error('Failed to import module after retries');
};

// Code splitting by feature
export const createFeatureLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) => {
  const LazyComponent = React.lazy(() =>
    dynamicImport(importFn).catch(() =>
      Promise.resolve({ 
        default: (fallback || (() => <div>Feature unavailable</div>) as unknown) as T 
      })
    )
  );

  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={<LoadingSpinner />}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
};

// Tree shaking utilities
export const ifFeatureEnabled = <T,>(
  feature: string,
  component: T,
  fallback: T | null = null
): T | null => {
  // In production, this would check feature flags
  const features = {
    'advanced-analytics': true,
    'experimental-ui': false,
    'premium-features': false,
    // Add more feature flags
  };

  return features[feature as keyof typeof features] ? component : fallback;
};

/**
 * Memory optimization utilities
 */

// Memory-efficient state management
export const useOptimizedState = <T,>(
  initialValue: T,
  isEqual?: (a: T, b: T) => boolean
) => {
  const [state, setState] = React.useState(initialValue);
  const previousValue = React.useRef(initialValue);

  const optimizedSetState = React.useCallback((newValue: T | ((prev: T) => T)) => {
    setState(current => {
      const next = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(current)
        : newValue;

      // Use custom equality check or shallow comparison
      const areEqual = isEqual 
        ? isEqual(current, next)
        : JSON.stringify(current) === JSON.stringify(next);

      if (areEqual) {
        return current; // Prevent unnecessary re-renders
      }

      previousValue.current = current;
      return next;
    });
  }, [isEqual]);

  return [state, optimizedSetState, previousValue.current] as const;
};

// Debounced state for expensive operations
export const useDebouncedState = <T,>(
  initialValue: T,
  delay: number = 300
) => {
  const [state, setState] = React.useState(initialValue);
  const [debouncedState, setDebouncedState] = React.useState(initialValue);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedState(state);
    }, delay);

    return () => clearTimeout(timer);
  }, [state, delay]);

  return [state, setState, debouncedState] as const;
};

// Memory leak prevention
export const useCleanupEffect = (
  effect: () => (() => void) | void,
  deps: React.DependencyList
) => {
  React.useEffect(() => {
    const cleanup = effect();
    
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/**
 * Network optimization utilities
 */

// Request deduplication
const requestCache = new Map<string, Promise<any>>();

export const dedupedFetch = async <T,>(
  url: string,
  options?: RequestInit,
  cacheKey?: string
): Promise<T> => {
  const key = cacheKey || `${url}:${JSON.stringify(options)}`;
  
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }

  const request = fetch(url, options)
    .then(response => response.json())
    .finally(() => {
      // Remove from cache after completion
      setTimeout(() => requestCache.delete(key), 1000);
    });

  requestCache.set(key, request);
  return request;
};

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;

  const criticalResources = [
    '/api/user/preferences',
    '/api/tasks/today',
    '/api/habits/today',
    '/api/mood/latest'
  ];

  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Render optimization utilities
 */

// Virtualization helper
export const useVirtualization = <T,>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

  const visibleItems = React.useMemo(
    () => items.slice(startIndex, endIndex + 1),
    [items, startIndex, endIndex]
  );

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
    startIndex,
    endIndex
  };
};

// Intersection observer for lazy loading
export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => callback(entry.isIntersecting),
      { threshold: 0.1, ...options }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
};

/**
 * Executive dysfunction specific optimizations
 */

// Cognitive load aware rendering
export const useCognitiveLoadOptimization = () => {
  const [cognitiveLoad, setCognitiveLoad] = React.useState(0);
  const [optimizationLevel, setOptimizationLevel] = React.useState<'low' | 'medium' | 'high'>('low');

  React.useEffect(() => {
    if (cognitiveLoad <= 30) {
      setOptimizationLevel('low');
    } else if (cognitiveLoad <= 60) {
      setOptimizationLevel('medium');
    } else {
      setOptimizationLevel('high');
    }
  }, [cognitiveLoad]);

  const getOptimizedProps = React.useCallback((baseProps: any) => {
    switch (optimizationLevel) {
      case 'high':
        return {
          ...baseProps,
          animationDuration: 0,
          showTooltips: false,
          simplifiedLayout: true,
          reducedColors: true
        };
      case 'medium':
        return {
          ...baseProps,
          animationDuration: baseProps.animationDuration * 0.5,
          showTooltips: false,
          simplifiedLayout: false,
          reducedColors: false
        };
      default:
        return baseProps;
    }
  }, [optimizationLevel]);

  return {
    cognitiveLoad,
    setCognitiveLoad,
    optimizationLevel,
    getOptimizedProps
  };
};

// Focus-friendly component optimization
export const useFocusOptimization = () => {
  const [isFocusMode, setIsFocusMode] = React.useState(false);
  const [distractionLevel, setDistractionLevel] = React.useState<'low' | 'medium' | 'high'>('low');

  const enableFocusMode = React.useCallback(() => {
    setIsFocusMode(true);
    document.body.classList.add('focus-mode');
  }, []);

  const disableFocusMode = React.useCallback(() => {
    setIsFocusMode(false);
    document.body.classList.remove('focus-mode');
  }, []);

  const getDistractionReducedProps = React.useCallback((baseProps: any) => {
    if (!isFocusMode) return baseProps;

    return {
      ...baseProps,
      showSecondaryActions: false,
      showNotifications: false,
      simplifiedNavigation: true,
      hideNonEssentialContent: true
    };
  }, [isFocusMode]);

  return {
    isFocusMode,
    distractionLevel,
    setDistractionLevel,
    enableFocusMode,
    disableFocusMode,
    getDistractionReducedProps
  };
};
