import React, { useRef, useCallback, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface TouchGestureProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPinch?: (scale: number) => void;
  swipeThreshold?: number;
  longPressDelay?: number;
  doubleTapDelay?: number;
  disabled?: boolean;
}

export const TouchGesture: React.FC<TouchGestureProps> = ({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onTap,
  onDoubleTap,
  onLongPress,
  onPinch,
  swipeThreshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  disabled = false
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialPinchDistanceRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      initialPinchDistanceRef.current = distance;
    }

    // Start long press timer
    if (onLongPress && e.touches.length === 1) {
      longPressTimerRef.current = setTimeout(() => {
        onLongPress();
        // Provide haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }, longPressDelay);
    }
  }, [disabled, onLongPress, onPinch, longPressDelay]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled) return;

    // Cancel long press if finger moves
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle pinch gesture
    if (e.touches.length === 2 && onPinch && initialPinchDistanceRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      const scale = distance / initialPinchDistanceRef.current;
      onPinch(scale);
    }
  }, [disabled, onPinch]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (disabled) return;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Reset pinch distance
    if (e.touches.length === 0) {
      initialPinchDistanceRef.current = null;
    }

    if (!touchStartRef.current || e.touches.length > 0) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Handle swipe gestures
    if (distance > swipeThreshold && deltaTime < 500) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
          // Provide haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(25);
          }
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
          if ('vibrate' in navigator) {
            navigator.vibrate(25);
          }
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
          if ('vibrate' in navigator) {
            navigator.vibrate(25);
          }
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
          if ('vibrate' in navigator) {
            navigator.vibrate(25);
          }
        }
      }
    } else if (distance < 10 && deltaTime < 500) {
      // Handle tap gestures
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < doubleTapDelay && onDoubleTap) {
        onDoubleTap();
        lastTapRef.current = 0; // Reset to prevent triple tap
        if ('vibrate' in navigator) {
          navigator.vibrate(30);
        }
      } else {
        lastTapRef.current = now;
        // Delay single tap to check for double tap
        if (onTap) {
          setTimeout(() => {
            if (now === lastTapRef.current) {
              onTap();
            }
          }, doubleTapDelay);
        }
      }
    }

    touchStartRef.current = null;
  }, [disabled, swipeThreshold, doubleTapDelay, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, onDoubleTap]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners with passive option for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={elementRef}
      className={cn(
        'touch-gesture-container',
        'select-none', // Prevent text selection during gestures
        className
      )}
      style={{
        touchAction: disabled ? 'auto' : 'none', // Prevent default touch behaviors
        userSelect: 'none',
        WebkitUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      {children}
    </div>
  );
};

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  threshold = 80,
  disabled = false
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isPulling, setIsPulling] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    startYRef.current = e.touches[0].clientY;
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !startYRef.current) return;

    const container = containerRef.current;
    if (!container || container.scrollTop > 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      e.preventDefault();
      setIsPulling(true);
      setPullDistance(Math.min(diff, threshold * 1.5));
    }
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return;

    setIsPulling(false);

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      // Provide haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    startYRef.current = 0;
  }, [disabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn(
        'pull-to-refresh-container',
        'relative overflow-hidden',
        className
      )}
      style={{
        transform: `translateY(${isPulling ? pullDistance * 0.5 : 0}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease'
      }}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'pull-to-refresh-indicator',
          'absolute top-0 left-0 right-0 z-10',
          'flex items-center justify-center',
          'bg-background/90 backdrop-blur-sm',
          'transition-opacity duration-200',
          (isPulling || isRefreshing) ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          height: Math.max(0, pullDistance * 0.8),
          transform: `translateY(-${Math.max(0, pullDistance * 0.3)}px)`
        }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          {isRefreshing ? (
            <>
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Refreshing...</span>
            </>
          ) : (
            <>
              <div 
                className={cn(
                  'w-5 h-5 border-2 border-muted-foreground rounded-full',
                  'transition-transform duration-200',
                  shouldTrigger && 'border-primary'
                )}
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`
                }}
              >
                <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-current" />
              </div>
              <span className={cn(
                'text-sm font-medium transition-colors',
                shouldTrigger ? 'text-primary' : 'text-muted-foreground'
              )}>
                {shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="pull-to-refresh-content">
        {children}
      </div>
    </div>
  );
};

interface SwipeableListItemProps {
  children: React.ReactNode;
  className?: string;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  disabled?: boolean;
}

export const SwipeableListItem: React.FC<SwipeableListItemProps> = ({
  children,
  className,
  leftActions,
  rightActions,
  onSwipeLeft,
  onSwipeRight,
  threshold = 80,
  disabled = false
}) => {
  const [swipeDistance, setSwipeDistance] = React.useState(0);
  const [isSwipeActive, setIsSwipeActive] = React.useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled) return;
    startXRef.current = e.touches[0].clientX;
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || !startXRef.current) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startXRef.current;

    // Only allow swipe if there are actions for that direction
    if ((diff > 0 && !leftActions) || (diff < 0 && !rightActions)) return;

    setIsSwipeActive(true);
    setSwipeDistance(diff);
  }, [disabled, leftActions, rightActions]);

  const handleTouchEnd = useCallback(() => {
    if (disabled || !isSwipeActive) return;

    const absDistance = Math.abs(swipeDistance);
    
    if (absDistance >= threshold) {
      if (swipeDistance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (swipeDistance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
      
      // Provide haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    }

    setIsSwipeActive(false);
    setSwipeDistance(0);
    startXRef.current = 0;
  }, [disabled, isSwipeActive, swipeDistance, threshold, onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'swipeable-list-item',
        'relative overflow-hidden',
        className
      )}
    >
      {/* Left actions */}
      {leftActions && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 z-0',
            'flex items-center justify-start px-4',
            'bg-green-500 text-white',
            'transition-opacity duration-200',
            swipeDistance > 0 ? 'opacity-100' : 'opacity-0'
          )}
          style={{ width: Math.max(0, swipeDistance) }}
        >
          {leftActions}
        </div>
      )}

      {/* Right actions */}
      {rightActions && (
        <div
          className={cn(
            'absolute right-0 top-0 bottom-0 z-0',
            'flex items-center justify-end px-4',
            'bg-red-500 text-white',
            'transition-opacity duration-200',
            swipeDistance < 0 ? 'opacity-100' : 'opacity-0'
          )}
          style={{ width: Math.max(0, -swipeDistance) }}
        >
          {rightActions}
        </div>
      )}

      {/* Content */}
      <div
        className="swipeable-content z-10 relative bg-background"
        style={{
          transform: `translateX(${swipeDistance}px)`,
          transition: isSwipeActive ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
};
