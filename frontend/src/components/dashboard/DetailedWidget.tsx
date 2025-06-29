import React from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { ResponsiveContainer, useContainerQuery } from '../ui/ResponsiveContainer';

// Import icon type from custom types
type IconComponent = React.ComponentType<{ className?: string; size?: string | number; }>;

interface WidgetAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  icon?: IconComponent;
  disabled?: boolean;
  estimatedTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface WidgetStat {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  color?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

interface DetailedWidgetProps {
  title: string;
  description?: string;
  icon?: IconComponent;
  actions?: WidgetAction[];
  stats?: WidgetStat[];
  children?: React.ReactNode;
  className?: string;
  priority?: 'low' | 'medium' | 'high';
  estimatedTime?: number;
  complexity?: 'simple' | 'moderate' | 'complex';
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
}

const StatDisplay: React.FC<{ stat: WidgetStat; compact?: boolean }> = ({ stat, compact = false }) => {
  const colorMap = {
    default: 'text-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  const changeColorMap = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <div className={cn(
      'text-center p-3 rounded-lg border',
      compact ? 'space-y-1' : 'space-y-2'
    )}>
      <div className={cn(
        'font-semibold',
        colorMap[stat.color || 'default'],
        compact ? 'text-lg' : 'text-2xl'
      )}>
        {stat.value}
      </div>
      <div className={cn(
        'text-muted-foreground',
        compact ? 'text-xs' : 'text-sm'
      )}>
        {stat.label}
      </div>
      {stat.change && !compact && (
        <div className={cn(
          'text-xs flex items-center justify-center gap-1',
          changeColorMap[stat.change.type]
        )}>
          <span>{stat.change.type === 'increase' ? '↗' : stat.change.type === 'decrease' ? '↘' : '→'}</span>
          <span>{Math.abs(stat.change.value)}% {stat.change.period}</span>
        </div>
      )}
    </div>
  );
};

const ActionButton: React.FC<{ action: WidgetAction; compact?: boolean }> = ({ action, compact = false }) => {
  const Icon = action.icon;
  
  return (
    <Button
      variant={action.variant || 'outline'}
      size={compact ? 'sm' : 'md'}
      onClick={action.onClick}
      disabled={action.disabled}
      estimatedTime={action.estimatedTime}
      difficulty={action.difficulty}
      className={cn(
        'flex-1',
        compact && 'min-w-0'
      )}
    >
      {Icon && <Icon className={cn('h-4 w-4', !compact && 'mr-2')} />}
      {!compact && action.label}
      {compact && <span className="sr-only">{action.label}</span>}
    </Button>
  );
};

const LoadingState: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center space-y-2">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRefresh?: () => void }> = ({ error, onRefresh }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center space-y-3">
      <div className="text-red-600 text-sm">{error}</div>
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh}>
          Try Again
        </Button>
      )}
    </div>
  </div>
);

export const DetailedWidget: React.FC<DetailedWidgetProps> = ({
  title,
  description,
  icon: Icon,
  actions = [],
  stats = [],
  children,
  className,
  priority = 'medium',
  estimatedTime,
  complexity,
  loading = false,
  error,
  onRefresh,
}) => {
  const widgetRef = React.useRef<HTMLDivElement>(null);
  const { isSmall, isMedium, isLarge } = useContainerQuery(widgetRef);

  const priorityConfig = {
    low: { color: 'border-green-200 bg-green-50/50', badge: 'bg-green-100 text-green-800' },
    medium: { color: 'border-yellow-200 bg-yellow-50/50', badge: 'bg-yellow-100 text-yellow-800' },
    high: { color: 'border-red-200 bg-red-50/50', badge: 'bg-red-100 text-red-800' },
  };

  const complexityConfig = {
    simple: { icon: '●', label: 'Simple', color: 'text-green-600' },
    moderate: { icon: '●●', label: 'Moderate', color: 'text-yellow-600' },
    complex: { icon: '●●●', label: 'Complex', color: 'text-red-600' },
  };

  if (loading) {
    return (
      <Card className={cn('dashboard-widget', className, priorityConfig[priority].color)}>
        <LoadingState />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('dashboard-widget', className, 'border-red-200 bg-red-50/50')}>
        <ErrorState error={error} onRefresh={onRefresh} />
      </Card>
    );
  }

  return (
    <Card 
      ref={widgetRef}
      className={cn(
        'dashboard-widget transition-all duration-200 hover:shadow-lg',
        className,
        priorityConfig[priority].color
      )}
    >
      <CardHeader className={cn(
        'pb-3',
        isLarge ? 'widget-header' : 'space-y-2'
      )}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {Icon && (
              <Icon className={cn(
                'flex-shrink-0',
                isSmall ? 'h-5 w-5' : 'h-6 w-6'
              )} />
            )}
            <div className="min-w-0 flex-1">
              <h3 className={cn(
                'font-semibold leading-tight widget-title',
                isSmall ? 'text-base' : 'text-lg'
              )}>
                {title}
              </h3>
              {description && (
                <p className={cn(
                  'text-muted-foreground mt-1 line-clamp-2 widget-description',
                  isSmall ? 'text-xs' : 'text-sm',
                  !isLarge && 'hidden'
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {priority !== 'medium' && (
              <Badge className={priorityConfig[priority].badge}>
                {priority}
              </Badge>
            )}
            {complexity && (
              <Badge variant="outline" className={complexityConfig[complexity].color}>
                <span aria-hidden="true" className="mr-1">
                  {complexityConfig[complexity].icon}
                </span>
                {isLarge ? complexityConfig[complexity].label : 
                  <span className="sr-only">{complexityConfig[complexity].label}</span>}
              </Badge>
            )}
          </div>
        </div>

        {estimatedTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>⏱</span>
            <span>~{estimatedTime} min</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Display */}
        {stats.length > 0 && (
          <div className={cn(
            'widget-content',
            isSmall ? 'space-y-2' : 'grid gap-3',
            isMedium ? 'grid-cols-2' : '',
            isLarge ? 'grid-cols-3' : ''
          )}>
            {stats.map((stat, index) => (
              <StatDisplay
                key={index}
                stat={stat}
                compact={isSmall}
              />
            ))}
          </div>
        )}

        {/* Custom Content */}
        {children && (
          <div className="widget-custom-content">
            {children}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className={cn(
            'widget-actions flex gap-2',
            isSmall ? 'flex-col' : 'flex-row',
            actions.length > 3 && isSmall && 'grid grid-cols-2'
          )}>
            {actions.map((action, index) => (
              <ActionButton
                key={index}
                action={action}
                compact={isSmall && actions.length > 2}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Widget Grid component that uses container queries for responsive layout
 */
interface WidgetGridProps {
  children: React.ReactNode;
  className?: string;
  minWidgetWidth?: number;
  gap?: string;
}

export const WidgetGrid: React.FC<WidgetGridProps> = ({
  children,
  className,
  minWidgetWidth = 280,
  gap = '1.5rem',
}) => {
  return (
    <ResponsiveContainer
      className={cn('widget-grid', className)}
      containerName="widget-grid"
      gridConfig={{
        minItemWidth: minWidgetWidth,
        gap,
        autoFit: true,
      }}
    >
      {children}
    </ResponsiveContainer>
  );
};

export default EnhancedWidget;