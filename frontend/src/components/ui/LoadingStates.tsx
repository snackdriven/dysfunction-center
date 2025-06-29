import React from 'react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { Card } from './Card';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

// ============================================================================
// LOADING SPINNER COMPONENTS
// ============================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'secondary' | 'muted';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary'
}) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const colorMap = {
    primary: 'border-primary',
    secondary: 'border-secondary',
    muted: 'border-muted-foreground',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-t-transparent',
        sizeMap[size],
        colorMap[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// ============================================================================
// SKELETON LOADING COMPONENTS
// ============================================================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  variant = 'rectangular',
  animation = true,
}) => {
  const baseClasses = cn(
    'bg-muted',
    animation && 'animate-pulse',
    variant === 'text' && 'rounded',
    variant === 'circular' && 'rounded-full',
    variant === 'rectangular' && 'rounded-md',
    className
  );

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return <div className={baseClasses} style={style} aria-hidden="true" />;
};

// Skeleton patterns for common UI elements
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 1, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={16}
        width={i === lines - 1 ? '75%' : '100%'}
        variant="text"
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('p-4 space-y-3', className)}>
    <div className="flex items-center space-x-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-2 flex-1">
        <Skeleton height={16} width="60%" />
        <Skeleton height={14} width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex gap-2">
      <Skeleton height={36} width={80} />
      <Skeleton height={36} width={100} />
    </div>
  </Card>
);

// ============================================================================
// ERROR STATE COMPONENTS
// ============================================================================

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  type?: 'error' | 'warning' | 'network' | 'not-found';
  className?: string;
  showIcon?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryLabel = 'Try Again',
  type = 'error',
  className,
  showIcon = true,
}) => {
  const config = {
    error: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    network: {
      icon: WifiOff,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50 dark:bg-gray-950/20',
      borderColor: 'border-gray-200 dark:border-gray-800',
    },
    'not-found': {
      icon: AlertTriangle,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
  };

  const { icon: Icon, iconColor, bgColor, borderColor } = config[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center rounded-lg border',
        bgColor,
        borderColor,
        className
      )}
      role="alert"
    >
      {showIcon && (
        <Icon className={cn('h-12 w-12 mb-4', iconColor)} aria-hidden="true" />
      )}
      
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
      )}
      
      <p className="text-muted-foreground mb-4 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="min-w-[120px]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// EMPTY STATE COMPONENTS
// ============================================================================

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
  };
  illustration?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  illustration,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center',
        className
      )}
    >
      {illustration && (
        <div className="mb-6 opacity-50" aria-hidden="true">
          {illustration}
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">
          {description}
        </p>
      )}
      
      {action && (
        <Button
          variant={action.variant || 'primary'}
          onClick={action.onClick}
          className="min-w-[140px]"
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </Button>
      )}
    </div>
  );
};

// ============================================================================
// LOADING BUTTON COMPONENT
// ============================================================================

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}) => {
  return (
    <Button
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};

// ============================================================================
// PROGRESSIVE LOADING COMPONENT
// ============================================================================

interface ProgressiveLoadingProps {
  stages: Array<{
    name: string;
    completed: boolean;
    loading: boolean;
    error?: string;
  }>;
  className?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stages,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {stages.map((stage, index) => (
        <div key={stage.name} className="flex items-center gap-3">
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
            stage.completed && 'bg-green-100 text-green-800',
            stage.loading && 'bg-blue-100 text-blue-800',
            stage.error && 'bg-red-100 text-red-800',
            !stage.completed && !stage.loading && !stage.error && 'bg-gray-100 text-gray-600'
          )}>
            {stage.completed ? '✓' : 
             stage.error ? '✕' :
             stage.loading ? <LoadingSpinner size="sm" /> : 
             index + 1}
          </div>
          
          <div className="flex-1">
            <span className={cn(
              'text-sm',
              stage.completed && 'text-green-700',
              stage.loading && 'text-blue-700',
              stage.error && 'text-red-700',
              !stage.completed && !stage.loading && !stage.error && 'text-muted-foreground'
            )}>
              {stage.name}
            </span>
            {stage.error && (
              <p className="text-xs text-red-600 mt-1">{stage.error}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// LOADING OVERLAY COMPONENT
// ============================================================================

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  message = 'Loading...',
  children,
  className,
}) => {
  return (
    <div className={cn('relative', className)}>
      {children}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center space-y-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Development and debugging utilities
export const LoadingStatesDebug = {
  LoadingSpinner,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  ErrorState,
  EmptyState,
  LoadingButton,
  ProgressiveLoading,
  LoadingOverlay,
};