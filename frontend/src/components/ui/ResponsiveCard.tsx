import React from 'react';
import { cn } from '../../utils/cn';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'expanded' | 'featured';
  interactive?: boolean;
  onClick?: () => void;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  variant = 'default',
  interactive = false,
  onClick
}) => {
  const variantStyles = {
    default: 'p-4 @container/card-[min-width:_300px]:p-6',
    compact: 'p-3 @container/card-[min-width:_250px]:p-4',
    expanded: 'p-4 @container/card-[min-width:_400px]:p-8',
    featured: 'p-6 @container/card-[min-width:_500px]:p-10'
  };

  return (
    <div
      className={cn(
        'responsive-card',
        'container-type-inline-size',
        'bg-card border rounded-lg shadow-sm',
        'transition-all duration-200 ease-in-out',
        // Reduced motion support
        'motion-reduce:transition-none',
        // Interactive states
        interactive && [
          'cursor-pointer',
          'hover:shadow-md hover:border-primary/20',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'active:scale-[0.99]',
          'motion-reduce:active:scale-100'
        ],
        variantStyles[variant],
        className
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
};

interface ResponsiveCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const ResponsiveCardHeader: React.FC<ResponsiveCardHeaderProps> = ({
  title,
  subtitle,
  action,
  className
}) => {
  return (
    <div className={cn(
      'responsive-card-header',
      'mb-4',
      // Responsive header layout
      '@container/card-[min-width:_300px]:flex @container/card-[min-width:_300px]:items-start @container/card-[min-width:_300px]:justify-between',
      className
    )}>
      <div className="card-header-content">
        <h3 className={cn(
          'card-title',
          'font-semibold text-card-foreground',
          // Responsive typography
          'text-sm @container/card-[min-width:_250px]:text-base @container/card-[min-width:_400px]:text-lg',
          'leading-tight'
        )}>
          {title}
        </h3>
        {subtitle && (
          <p className={cn(
            'card-subtitle',
            'text-xs @container/card-[min-width:_250px]:text-sm',
            'text-muted-foreground mt-1',
            // Hide subtitle on very small containers
            'hidden @container/card-[min-width:_200px]:block'
          )}>
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className={cn(
          'card-action',
          'mt-2 @container/card-[min-width:_300px]:mt-0',
          'flex-shrink-0'
        )}>
          {action}
        </div>
      )}
    </div>
  );
};

interface ResponsiveCardContentProps {
  children: React.ReactNode;
  className?: string;
  layout?: 'default' | 'grid' | 'flex' | 'stack';
}

export const ResponsiveCardContent: React.FC<ResponsiveCardContentProps> = ({
  children,
  className,
  layout = 'default'
}) => {
  const layoutStyles = {
    default: '',
    grid: cn(
      'grid gap-3',
      'grid-cols-1 @container/card-[min-width:_300px]:grid-cols-2',
      '@container/card-[min-width:_500px]:grid-cols-3'
    ),
    flex: cn(
      'flex flex-col gap-3',
      '@container/card-[min-width:_400px]:flex-row @container/card-[min-width:_400px]:items-center'
    ),
    stack: 'space-y-3 @container/card-[min-width:_300px]:space-y-4'
  };

  return (
    <div className={cn(
      'responsive-card-content',
      layoutStyles[layout],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveCardFooterProps {
  children: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'center' | 'right' | 'between';
}

export const ResponsiveCardFooter: React.FC<ResponsiveCardFooterProps> = ({
  children,
  className,
  alignment = 'left'
}) => {
  const alignmentStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={cn(
      'responsive-card-footer',
      'mt-4 pt-4 border-t',
      'flex items-center gap-2',
      alignmentStyles[alignment],
      // Responsive footer layout
      'flex-col @container/card-[min-width:_300px]:flex-row',
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveCardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall';
}

export const ResponsiveCardImage: React.FC<ResponsiveCardImageProps> = ({
  src,
  alt,
  className,
  aspectRatio = 'video'
}) => {
  const aspectRatioStyles = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[3/1]',
    tall: 'aspect-[3/4]'
  };

  return (
    <div className={cn(
      'responsive-card-image',
      'relative overflow-hidden rounded-md',
      'mb-4',
      aspectRatioStyles[aspectRatio],
      // Responsive image sizing
      'w-full @container/card-[min-width:_400px]:w-auto @container/card-[min-width:_400px]:max-w-[200px]',
      className
    )}>
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

interface ResponsiveCardStatsProps {
  stats: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export const ResponsiveCardStats: React.FC<ResponsiveCardStatsProps> = ({
  stats,
  className
}) => {
  return (
    <div className={cn(
      'responsive-card-stats',
      'grid gap-3',
      // Responsive stats grid
      'grid-cols-1 @container/card-[min-width:_250px]:grid-cols-2',
      '@container/card-[min-width:_400px]:grid-cols-3',
      '@container/card-[min-width:_600px]:grid-cols-4',
      className
    )}>
      {stats.map((stat, index) => (
        <div key={index} className="stat-item text-center">
          {stat.icon && (
            <div className="stat-icon mb-1 flex justify-center">
              {stat.icon}
            </div>
          )}
          <div className={cn(
            'stat-value',
            'font-semibold text-foreground',
            'text-lg @container/card-[min-width:_300px]:text-xl',
            stat.trend === 'up' && 'text-green-600',
            stat.trend === 'down' && 'text-red-600'
          )}>
            {stat.value}
          </div>
          <div className={cn(
            'stat-label',
            'text-xs @container/card-[min-width:_250px]:text-sm',
            'text-muted-foreground'
          )}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};
