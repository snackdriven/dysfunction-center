import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Alert } from '../ui/Alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Base widget props interface for consistent widget architecture
 */
export interface BaseWidgetProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * Standardized widget wrapper that eliminates duplication across dashboard widgets
 * Provides consistent loading states, error handling, and styling
 * 
 * Replaces 6+ duplicate loading implementations with single, reusable component
 */
export const BaseWidget: React.FC<BaseWidgetProps> = ({
  title,
  subtitle,
  loading,
  error,
  action,
  className,
  children
}) => {
  return (
    <Card className={cn("h-fit", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {action && !loading && !error && action}
        </div>
      </CardHeader>
      <CardContent>
        {loading && <WidgetLoadingSkeleton />}
        {error && <WidgetError error={error} />}
        {!loading && !error && children}
      </CardContent>
    </Card>
  );
};

/**
 * Consistent loading skeleton for all widgets
 * Replaces 6+ different loading implementations with standardized pattern
 */
export interface WidgetLoadingSkeletonProps {
  items?: number;
  height?: 'sm' | 'md' | 'lg';
}

export const WidgetLoadingSkeleton: React.FC<WidgetLoadingSkeletonProps> = ({ 
  items = 3,
  height = 'md'
}) => {
  const heightClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16'
  };

  return (
    <div className="space-y-3" role="status" aria-label="Loading widget content">
      <div className="flex items-center gap-2 mb-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
      {Array.from({ length: items }, (_, i) => (
        <div 
          key={i} 
          className={cn(
            "bg-muted animate-pulse rounded-md",
            heightClasses[height]
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
};

/**
 * Standardized error display for widgets
 * Provides consistent error messaging and recovery suggestions
 */
export interface WidgetErrorProps {
  error: string;
  onRetry?: () => void;
  showIcon?: boolean;
}

export const WidgetError: React.FC<WidgetErrorProps> = ({ 
  error, 
  onRetry,
  showIcon = true 
}) => (
  <Alert variant="destructive" className="text-center py-6">
    {showIcon && <AlertCircle className="h-12 w-12 mx-auto mb-4" />}
    <div className="space-y-2">
      <p className="font-medium">Something went wrong</p>
      <p className="text-sm">{error}</p>
      <div className="text-xs text-muted-foreground mt-2">
        Try refreshing the page or check your connection
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
        >
          Try again
        </button>
      )}
    </div>
  </Alert>
);

/**
 * Empty state component for widgets with no data
 * Provides consistent messaging for empty widgets
 */
export interface WidgetEmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const WidgetEmptyState: React.FC<WidgetEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => (
  <div className="text-center py-8">
    <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm mb-4">
      {description}
    </p>
    {action}
  </div>
);

/**
 * Widget action button component for consistent styling
 * Used in widget headers for primary actions
 */
export interface WidgetActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  'aria-label'?: string;
}

export const WidgetAction: React.FC<WidgetActionProps> = ({
  children,
  onClick,
  variant = 'secondary',
  disabled = false,
  'aria-label': ariaLabel
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
      "focus:outline-none focus:ring-2 focus:ring-offset-2",
      variant === 'primary' 
        ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary"
        : "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    {children}
  </button>
);

/**
 * Widget metric display component for consistent data presentation
 * Used for displaying key metrics in widgets
 */
export interface WidgetMetricProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';
}

export const WidgetMetric: React.FC<WidgetMetricProps> = ({
  label,
  value,
  change,
  color = 'gray'
}) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  };

  return (
    <div className="text-center">
      <div className={cn("text-2xl font-bold", colorClasses[color])}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {change && (
        <div className={cn(
          "text-xs mt-1",
          change.direction === 'up' ? 'text-green-600' : 'text-red-600'
        )}>
          {change.direction === 'up' ? '↗' : '↘'} {Math.abs(change.value)}% {change.period}
        </div>
      )}
    </div>
  );
};