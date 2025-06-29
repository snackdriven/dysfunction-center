import React from 'react';
import { cn } from '../../utils/cn';

interface ResponsiveDataVisualizationProps {
  children: React.ReactNode;
  className?: string;
  layout?: 'chart' | 'table' | 'cards' | 'adaptive';
  title?: string;
  subtitle?: string;
}

export const ResponsiveDataVisualization: React.FC<ResponsiveDataVisualizationProps> = ({
  children,
  className,
  layout = 'adaptive',
  title,
  subtitle
}) => {
  const layoutStyles = {
    chart: 'space-y-4',
    table: 'overflow-x-auto',
    cards: cn(
      'grid gap-4',
      'grid-cols-1 @container/viz-[min-width:_500px]:grid-cols-2',
      '@container/viz-[min-width:_800px]:grid-cols-3'
    ),
    adaptive: cn(
      'space-y-4',
      '@container/viz-[min-width:_600px]:space-y-6'
    )
  };

  return (
    <div className={cn(
      'responsive-data-visualization',
      'container-type-inline-size',
      'w-full',
      className
    )}>
      {(title || subtitle) && (
        <div className="viz-header mb-4 @container/viz-[min-width:_400px]:mb-6">
          {title && (
            <h3 className={cn(
              'viz-title',
              'font-semibold text-foreground',
              'text-lg @container/viz-[min-width:_400px]:text-xl'
            )}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p className={cn(
              'viz-subtitle',
              'text-sm @container/viz-[min-width:_400px]:text-base',
              'text-muted-foreground mt-1'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div className={cn('viz-content', layoutStyles[layout])}>
        {children}
      </div>
    </div>
  );
};

interface ResponsiveChartContainerProps {
  children: React.ReactNode;
  className?: string;
  aspectRatio?: 'auto' | 'square' | 'video' | 'wide';
  minHeight?: number;
}

export const ResponsiveChartContainer: React.FC<ResponsiveChartContainerProps> = ({
  children,
  className,
  aspectRatio = 'auto',
  minHeight = 200
}) => {
  const aspectRatioStyles = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[3/1]'
  };

  return (
    <div className={cn(
      'responsive-chart-container',
      'relative w-full',
      'bg-card border rounded-lg p-4',
      aspectRatio !== 'auto' && aspectRatioStyles[aspectRatio],
      className
    )}
    style={aspectRatio === 'auto' ? { minHeight } : undefined}>
      <div className="chart-content h-full">
        {children}
      </div>
    </div>
  );
};

interface ResponsiveTableProps {
  headers: string[];
  data: Array<Record<string, any>>;
  className?: string;
  stickyHeader?: boolean;
  compactOnMobile?: boolean;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  data,
  className,
  stickyHeader = false,
  compactOnMobile = true
}) => {
  return (
    <div className={cn(
      'responsive-table-container',
      'w-full overflow-x-auto',
      'bg-card border rounded-lg',
      className
    )}>
      <table className="w-full">
        <thead className={cn(
          'bg-muted/50',
          stickyHeader && 'sticky top-0 z-10'
        )}>
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={cn(
                  'text-left p-3 font-medium text-sm',
                  'border-b',
                  // Hide less important columns on mobile
                  compactOnMobile && index > 2 && 'hidden @container/viz-[min-width:_600px]:table-cell'
                )}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted/25">
              {headers.map((header, colIndex) => (
                <td
                  key={colIndex}
                  className={cn(
                    'p-3 text-sm border-b',
                    // Hide less important columns on mobile
                    compactOnMobile && colIndex > 2 && 'hidden @container/viz-[min-width:_600px]:table-cell'
                  )}
                >
                  {row[header.toLowerCase().replace(/\s+/g, '_')]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface ResponsiveMetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  className?: string;
  format?: 'number' | 'percentage' | 'currency' | 'time';
}

export const ResponsiveMetricCard: React.FC<ResponsiveMetricCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
  format = 'number'
}) => {
  const formatValue = (val: string | number) => {
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        return `$${val}`;
      case 'time':
        return `${val}min`;
      default:
        return val;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn(
      'responsive-metric-card',
      'bg-card border rounded-lg p-4',
      'hover:shadow-md transition-shadow',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className={cn(
            'metric-title',
            'text-sm text-muted-foreground truncate',
            '@container/viz-[min-width:_300px]:text-base'
          )}>
            {title}
          </p>
          <p className={cn(
            'metric-value',
            'text-lg @container/viz-[min-width:_300px]:text-2xl',
            'font-semibold text-foreground mt-1'
          )}>
            {formatValue(value)}
          </p>
          {change && (
            <div className={cn(
              'metric-change',
              'flex items-center gap-1 mt-2',
              'text-xs @container/viz-[min-width:_300px]:text-sm',
              getTrendColor(change.trend)
            )}>
              <span>{change.trend === 'up' ? '↗' : change.trend === 'down' ? '↘' : '→'}</span>
              <span>{formatValue(change.value)}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'metric-icon',
            'text-muted-foreground',
            'hidden @container/viz-[min-width:_250px]:block'
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

interface ResponsiveProgressRingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  showValue?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const ResponsiveProgressRing: React.FC<ResponsiveProgressRingProps> = ({
  value,
  max = 100,
  size = 'md',
  label,
  showValue = true,
  color = 'primary',
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeStyles = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20 @container/viz-[min-width:_300px]:w-24 @container/viz-[min-width:_300px]:h-24',
    lg: 'w-24 h-24 @container/viz-[min-width:_300px]:w-32 @container/viz-[min-width:_300px]:h-32'
  };

  const colorStyles = {
    primary: 'text-primary',
    success: 'text-green-600',
    warning: 'text-orange-600',
    danger: 'text-red-600'
  };

  return (
    <div className={cn(
      'responsive-progress-ring',
      'flex flex-col items-center gap-2',
      className
    )}>
      <div className={cn('relative', sizeStyles[size])}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-muted/20"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-500 ease-in-out',
              'motion-reduce:transition-none',
              colorStyles[color]
            )}
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'text-xs @container/viz-[min-width:_300px]:text-sm',
              'font-semibold text-foreground'
            )}>
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
      {label && (
        <span className={cn(
          'text-xs @container/viz-[min-width:_300px]:text-sm',
          'text-muted-foreground text-center'
        )}>
          {label}
        </span>
      )}
    </div>
  );
};

interface ResponsiveHeatmapProps {
  data: Array<{ date: string; value: number; label?: string }>;
  className?: string;
  colorScheme?: 'green' | 'blue' | 'purple' | 'orange';
  showLabels?: boolean;
}

export const ResponsiveHeatmap: React.FC<ResponsiveHeatmapProps> = ({
  data,
  className,
  colorScheme = 'green',
  showLabels = false
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  const getIntensity = (value: number) => {
    if (maxValue === 0) return 0;
    return Math.min(value / maxValue, 1);
  };

  const colorSchemes = {
    green: 'bg-green-100 data-[intensity="1"]:bg-green-200 data-[intensity="2"]:bg-green-400 data-[intensity="3"]:bg-green-600 data-[intensity="4"]:bg-green-800',
    blue: 'bg-blue-100 data-[intensity="1"]:bg-blue-200 data-[intensity="2"]:bg-blue-400 data-[intensity="3"]:bg-blue-600 data-[intensity="4"]:bg-blue-800',
    purple: 'bg-purple-100 data-[intensity="1"]:bg-purple-200 data-[intensity="2"]:bg-purple-400 data-[intensity="3"]:bg-purple-600 data-[intensity="4"]:bg-purple-800',
    orange: 'bg-orange-100 data-[intensity="1"]:bg-orange-200 data-[intensity="2"]:bg-orange-400 data-[intensity="3"]:bg-orange-600 data-[intensity="4"]:bg-orange-800'
  };

  return (
    <div className={cn(
      'responsive-heatmap',
      'grid gap-1',
      // Responsive grid
      'grid-cols-7 @container/viz-[min-width:_400px]:grid-cols-10',
      '@container/viz-[min-width:_600px]:grid-cols-14',
      className
    )}>
      {data.map((item, index) => {
        const intensity = Math.floor(getIntensity(item.value) * 4);
        return (
          <div
            key={index}
            className={cn(
              'heatmap-cell',
              'aspect-square rounded-sm',
              'cursor-pointer hover:opacity-80',
              'transition-opacity',
              colorSchemes[colorScheme]
            )}
            data-intensity={intensity}
            title={`${item.date}: ${item.value}${item.label ? ` ${item.label}` : ''}`}
          />
        );
      })}
    </div>
  );
};
