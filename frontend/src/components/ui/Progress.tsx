import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  className,
  indicatorClassName,
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div className={cn(
      'w-full bg-muted rounded-full overflow-hidden',
      className
    )}>
      <div
        className={cn(
          'h-full bg-primary transition-all duration-300 ease-in-out',
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};