import React from 'react';
import { cn } from '../../utils/cn';

interface SimpleGridProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Number of columns (responsive by default)
   * Supports: 1, 2, 3, 4, 6, 12
   */
  cols?: 1 | 2 | 3 | 4 | 6 | 12 | 'auto';
  /**
   * Gap between items
   */
  gap?: 'sm' | 'md' | 'lg';
  /**
   * Minimum width for auto-fit columns
   */
  minItemWidth?: string;
}

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-4 md:grid-cols-6 lg:grid-cols-12',
  auto: '', // Handled with CSS style
};

const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

/**
 * Simple, responsive grid component that replaces complex container query systems
 */
export const SimpleGrid: React.FC<SimpleGridProps> = ({
  children,
  className,
  cols = 'auto',
  gap = 'md',
  minItemWidth = '250px'
}) => {
  const gridStyle = cols === 'auto' ? {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
  } : undefined;

  return (
    <div 
      className={cn(
        'grid',
        cols !== 'auto' && colsMap[cols],
        gapMap[gap],
        className
      )}
      style={gridStyle}
    >
      {children}
    </div>
  );
};

interface SimpleStackProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Direction of the stack
   */
  direction?: 'vertical' | 'horizontal';
  /**
   * Space between items
   */
  space?: 'sm' | 'md' | 'lg';
  /**
   * Responsive - stack vertically on small screens
   */
  responsive?: boolean;
}

const spaceMap = {
  vertical: {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  },
  horizontal: {
    sm: 'space-x-2',
    md: 'space-x-4', 
    lg: 'space-x-6',
  }
};

/**
 * Simple stack component for linear layouts
 */
export const SimpleStack: React.FC<SimpleStackProps> = ({
  children,
  className,
  direction = 'vertical',
  space = 'md',
  responsive = true
}) => {
  const isHorizontal = direction === 'horizontal';
  
  return (
    <div className={cn(
      'flex',
      isHorizontal ? 'flex-row' : 'flex-col',
      responsive && isHorizontal && 'flex-col sm:flex-row',
      spaceMap[direction][space],
      className
    )}>
      {children}
    </div>
  );
};

interface SimpleContainerProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Maximum width constraint
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /**
   * Center the container
   */
  center?: boolean;
}

const maxWidthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

/**
 * Simple container component for content width constraints
 */
export const SimpleContainer: React.FC<SimpleContainerProps> = ({
  children,
  className,
  maxWidth = 'full',
  center = true
}) => {
  return (
    <div className={cn(
      maxWidthMap[maxWidth],
      center && 'mx-auto',
      'px-4',
      className
    )}>
      {children}
    </div>
  );
};

// Re-export for easy migration
export { SimpleGrid as Grid, SimpleStack as Stack, SimpleContainer as Container };
