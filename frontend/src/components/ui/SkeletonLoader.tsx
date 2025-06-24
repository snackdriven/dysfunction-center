import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonLoaderProps {
  className?: string;
  children?: React.ReactNode;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  className, 
  children 
}) => {
  return (
    <div 
      className={cn(
        'animate-pulse bg-muted rounded-md',
        className
      )}
      role="status"
      aria-label="Loading content"
    >
      {children}
    </div>
  );
};

// Preset skeleton components
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3 p-4 border rounded-lg', className)}>
    <SkeletonLoader className="h-4 w-3/4" />
    <SkeletonLoader className="h-3 w-full" />
    <SkeletonLoader className="h-3 w-2/3" />
  </div>
);

export const SkeletonList: React.FC<{ items?: number; className?: string }> = ({ 
  items = 3, 
  className 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);