import React from 'react';
import { cn } from '../../utils/cn';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  layout?: 'grid' | 'flex' | 'stack';
}

/**
 * SIMPLIFIED: ResponsiveContainer now uses modern CSS Grid/Flexbox patterns
 * instead of complex container queries and JavaScript abstractions
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  layout = 'stack'
}) => {
  const layoutClasses = {
    // Modern CSS Grid with intrinsic sizing - no container queries needed
    grid: 'grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-[var(--space-md)]',
    // Responsive flexbox with wrapping
    flex: 'flex flex-wrap gap-[var(--space-md)]',
    // Simple vertical stacking
    stack: 'space-y-[var(--space-md)]'
  };

  return (
    <div className={cn(layoutClasses[layout], className)}>
      {children}
    </div>
  );
};

/**
 * SIMPLIFIED: Hook for container size detection (only when truly needed)
 */
export const useContainerQuery = (containerRef: React.RefObject<HTMLElement>) => {
  const [containerSize, setContainerSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

  // Simplified breakpoint detection - only essential sizes
  return {
    containerSize,
    isSmall: containerSize.width < 400,
    isLarge: containerSize.width >= 600,
  };
};

/**
 * SIMPLIFIED: Responsive Grid - uses CSS Grid's auto-fit instead of complex queries
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  minItemWidth?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  minItemWidth = 250,
}) => {
  return (
    <div 
      className={cn('responsive-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(${minItemWidth}px, 100%), 1fr))`,
        gap: 'var(--space-md)'
      }}
    >
      {children}
    </div>
  );
};

/**
 * SIMPLIFIED: Responsive Card - minimal container query usage
 */
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  title,
  description,
  actions,
}) => {
  return (
    <div className={cn(
      'responsive-card',
      'border rounded-lg p-[var(--space-md)] bg-card',
      'space-y-[var(--space-sm)]',
      className
    )}>
      {title && (
        <h3 className="font-semibold text-lg">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-muted-foreground text-sm">
          {description}
        </p>
      )}
      <div className="flex-1">
        {children}
      </div>
      {actions && (
        <div className="flex gap-[var(--space-sm)] flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
};

export default ResponsiveContainer;
