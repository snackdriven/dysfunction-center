import React from 'react';
import { cn } from '../../utils/cn';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Container name for CSS container queries
   */
  containerName?: string;
  /**
   * Container type for CSS container queries
   */
  containerType?: 'inline-size' | 'block-size' | 'size' | 'normal';
  /**
   * Minimum width breakpoints for container queries
   */
  breakpoints?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /**
   * Grid layout options that respond to container size
   */
  gridConfig?: {
    minItemWidth?: number;
    gap?: string;
    autoFit?: boolean;
  };
}

/**
 * ResponsiveContainer provides CSS Container Query support for component-based responsive design.
 * This allows components to adapt based on their own container size rather than viewport size.
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  containerName = 'responsive-container',
  containerType = 'inline-size',
  breakpoints = { sm: 300, md: 500, lg: 768, xl: 1024 },
  gridConfig,
}) => {
  const containerStyle: React.CSSProperties = {
    containerType: containerType as any,
    containerName,
  };

  // Generate CSS custom properties for breakpoints
  const breakpointVars = Object.entries(breakpoints).reduce((acc, [key, value]) => {
    (acc as any)[`--breakpoint-${key}`] = `${value}px`;
    return acc;
  }, {} as React.CSSProperties);

  // Generate grid configuration if provided
  const gridStyle = gridConfig ? {
    display: 'grid',
    gap: gridConfig.gap || '1rem',
    gridTemplateColumns: gridConfig.autoFit 
      ? `repeat(auto-fit, minmax(${gridConfig.minItemWidth || 250}px, 1fr))`
      : undefined,
  } : {};

  return (
    <div
      className={cn('responsive-container', className)}
      style={{
        ...containerStyle,
        ...breakpointVars,
        ...gridStyle,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Hook to provide container query utilities and responsive state
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

  const getBreakpoint = (breakpoints: Record<string, number>) => {
    const { width } = containerSize;
    const sortedBreakpoints = Object.entries(breakpoints)
      .sort(([, a], [, b]) => b - a);

    for (const [name, size] of sortedBreakpoints) {
      if (width >= size) return name;
    }
    
    return 'xs';
  };

  const isSize = (minWidth: number, maxWidth?: number) => {
    const { width } = containerSize;
    return width >= minWidth && (maxWidth ? width <= maxWidth : true);
  };

  return {
    containerSize,
    getBreakpoint,
    isSize,
    isSmall: isSize(0, 300),
    isMedium: isSize(301, 500),
    isLarge: isSize(501, 768),
    isXLarge: isSize(769),
  };
};

/**
 * Responsive Grid component that uses container queries
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  minItemWidth?: number;
  gap?: string;
  maxColumns?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  minItemWidth = 250,
  gap = '1rem',
  maxColumns = 4,
}) => {
  return (
    <ResponsiveContainer
      className={cn('responsive-grid', className)}
      containerName="grid-container"
      gridConfig={{
        minItemWidth,
        gap,
        autoFit: true,
      }}
    >
      {children}
    </ResponsiveContainer>
  );
};

/**
 * Responsive Card component that adapts its layout based on container size
 */
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  layout?: 'horizontal' | 'vertical' | 'auto';
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  title,
  description,
  actions,
  layout = 'auto',
}) => {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const { isSmall, isMedium } = useContainerQuery(cardRef);

  const adaptiveLayout = layout === 'auto' 
    ? (isSmall ? 'vertical' : 'horizontal')
    : layout;

  return (
    <div
      ref={cardRef}
      className={cn(
        'responsive-card border rounded-lg p-4 bg-card',
        adaptiveLayout === 'horizontal' && 'flex items-center gap-4',
        adaptiveLayout === 'vertical' && 'space-y-3',
        className
      )}
      style={{
        containerType: 'inline-size',
        containerName: 'card',
      }}
    >
      <div className={cn(
        'flex-1',
        adaptiveLayout === 'vertical' && 'space-y-2'
      )}>
        {title && (
          <h3 className={cn(
            'font-semibold',
            isSmall ? 'text-lg' : 'text-xl'
          )}>
            {title}
          </h3>
        )}
        {description && (
          <p className={cn(
            'text-muted-foreground',
            isSmall ? 'text-sm' : 'text-base'
          )}>
            {description}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div className={cn(
          'flex gap-2',
          adaptiveLayout === 'vertical' && 'flex-row',
          adaptiveLayout === 'horizontal' && 'flex-col',
          isSmall && 'flex-wrap'
        )}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default ResponsiveContainer;