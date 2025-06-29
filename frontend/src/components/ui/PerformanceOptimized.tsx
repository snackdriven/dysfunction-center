import React, { Suspense, lazy } from 'react';
import { cn } from '../../utils/cn';

interface LazyComponentProps {
  factory: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  className?: string;
  errorBoundary?: boolean;
  retryAttempts?: number;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  factory,
  fallback,
  className,
  errorBoundary = true,
  retryAttempts = 3
}) => {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);

  const loadComponent = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const module = await factory();
      setComponent(() => module.default);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
      if (retryCount < retryAttempts) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadComponent();
        }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
      }
    } finally {
      setIsLoading(false);
    }
  }, [factory, retryCount, retryAttempts]);

  React.useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  const defaultFallback = (
    <div className={cn(
      'lazy-component-loading',
      'flex items-center justify-center p-8',
      'bg-muted/20 rounded-lg',
      className
    )}>
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );

  const errorFallback = (
    <div className={cn(
      'lazy-component-error',
      'flex flex-col items-center justify-center p-8',
      'bg-destructive/10 border border-destructive/20 rounded-lg text-destructive',
      className
    )}>
      <div className="mb-4 text-center">
        <h3 className="font-semibold mb-2">Failed to load component</h3>
        <p className="text-sm opacity-80">{error?.message}</p>
      </div>
      {retryCount < retryAttempts && (
        <button
          onClick={() => {
            setRetryCount(prev => prev + 1);
            loadComponent();
          }}
          className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
        >
          Retry ({retryAttempts - retryCount} attempts left)
        </button>
      )}
    </div>
  );

  if (error && (retryCount >= retryAttempts || !errorBoundary)) {
    return <>{errorFallback}</>;
  }

  if (isLoading || !Component) {
    return <>{fallback || defaultFallback}</>;
  }

  return <Component />;
};

interface CodeSplitRouteProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  className?: string;
  preload?: boolean;
}

export const CodeSplitRoute: React.FC<CodeSplitRouteProps> = ({
  component,
  fallback,
  className,
  preload = false
}) => {
  const LazyRouteComponent = React.useMemo(() => lazy(component), [component]);

  // Preload component on hover/focus
  React.useEffect(() => {
    if (preload) {
      const timer = setTimeout(() => {
        component().catch(() => {
          // Silently catch preload errors
        });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [component, preload]);

  const defaultFallback = (
    <div className={cn(
      'code-split-loading',
      'flex items-center justify-center min-h-[400px]',
      'bg-background',
      className
    )}>
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading page...</span>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      <LazyRouteComponent />
    </Suspense>
  );
};

interface ProgressiveImageProps {
  src: string;
  lowQualitySrc?: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall';
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  lowQualitySrc,
  alt,
  className,
  aspectRatio = 'video',
  priority = false,
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(lowQualitySrc || src);
  const imgRef = React.useRef<HTMLImageElement>(null);

  const aspectRatioStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[3/1]',
    tall: 'aspect-[3/4]'
  };

  React.useEffect(() => {
    if (!lowQualitySrc) {
      setIsLoaded(false);
      setCurrentSrc(src);
      return;
    }

    // Load low quality first
    const lowQualityImg = new Image();
    lowQualityImg.onload = () => {
      setCurrentSrc(lowQualitySrc);
      
      // Then load high quality
      const highQualityImg = new Image();
      highQualityImg.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      highQualityImg.onerror = () => {
        setHasError(true);
        onError?.();
      };
      highQualityImg.src = src;
    };
    lowQualityImg.onerror = () => {
      // Fallback to high quality if low quality fails
      setCurrentSrc(src);
    };
    lowQualityImg.src = lowQualitySrc;
  }, [src, lowQualitySrc, onLoad, onError]);

  const handleLoad = () => {
    if (!lowQualitySrc) {
      setIsLoaded(true);
      onLoad?.();
    }
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={cn(
      'progressive-image-container',
      'relative overflow-hidden bg-muted',
      aspectRatioStyles[aspectRatio],
      className
    )}>
      {!hasError ? (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            lowQualitySrc && !isLoaded && 'opacity-80 filter blur-sm scale-105',
            isLoaded && 'opacity-100'
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 opacity-50">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            </div>
            <p className="text-sm">Image unavailable</p>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-6 h-6 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number;
  className?: string;
  overscan?: number;
  onEndReached?: () => void;
  endReachedThreshold?: number;
}

export function VirtualizedList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight,
  className,
  overscan = 5,
  onEndReached,
  endReachedThreshold = 0.8
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);

    // Check if we've reached the end
    if (onEndReached) {
      const scrollPercentage = (newScrollTop + containerHeight) / totalHeight;
      if (scrollPercentage >= endReachedThreshold) {
        onEndReached();
      }
    }
  }, [containerHeight, totalHeight, endReachedThreshold, onEndReached]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'virtualized-list',
        'overflow-auto',
        className
      )}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="virtualized-list-item"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface InfiniteScrollProps {
  children: React.ReactNode;
  className?: string;
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  loading?: boolean;
  threshold?: number;
  loader?: React.ReactNode;
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  className,
  onLoadMore,
  hasMore,
  loading = false,
  threshold = 0.8,
  loader
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  const loadMore = React.useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, onLoadMore]);

  // Intersection Observer for better performance
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  const defaultLoader = (
    <div className="flex items-center justify-center p-6">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span>Loading more...</span>
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={cn('infinite-scroll-container', className)}
    >
      {children}
      
      {hasMore && (
        <div
          ref={sentinelRef}
          className="infinite-scroll-sentinel"
        >
          {(isLoading || loading) && (loader || defaultLoader)}
        </div>
      )}
      
      {!hasMore && (
        <div className="text-center p-6 text-muted-foreground">
          <span className="text-sm">No more items to load</span>
        </div>
      )}
    </div>
  );
};
