import React, { ComponentType, SVGAttributes } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

type IconProps = SVGAttributes<SVGElement> & {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
};

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ComponentType<IconProps>;
  trend?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'indigo' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorVariants = {
  blue: {
    background: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    accent: 'text-blue-700 dark:text-blue-300'
  },
  green: {
    background: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    accent: 'text-green-700 dark:text-green-300'
  },
  purple: {
    background: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    accent: 'text-purple-700 dark:text-purple-300'
  },
  red: {
    background: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
    accent: 'text-red-700 dark:text-red-300'
  },
  orange: {
    background: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
    accent: 'text-orange-700 dark:text-orange-300'
  },
  indigo: {
    background: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/20',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
    accent: 'text-indigo-700 dark:text-indigo-300'
  },
  gray: {
    background: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20',
    border: 'border-gray-200 dark:border-gray-800',
    icon: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30',
    accent: 'text-gray-700 dark:text-gray-300'
  }
};

const sizeVariants = {
  sm: {
    container: 'p-4',
    icon: 'h-8 w-8',
    iconSize: 'h-4 w-4',
    title: 'text-sm',
    value: 'text-lg',
    description: 'text-xs'
  },
  md: {
    container: 'p-6',
    icon: 'h-10 w-10',
    iconSize: 'h-5 w-5',
    title: 'text-sm',
    value: 'text-2xl',
    description: 'text-sm'
  },
  lg: {
    container: 'p-8',
    icon: 'h-12 w-12',
    iconSize: 'h-6 w-6',
    title: 'text-base',
    value: 'text-3xl',
    description: 'text-base'
  }
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'blue',
  size = 'md',
  className
}) => {
  const colorClasses = colorVariants[color];
  const sizeClasses = sizeVariants[size];

  const getTrendIcon = () => {
    switch (trend?.type) {
      case 'increase':
        return TrendingUp;
      case 'decrease':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = () => {
    switch (trend?.type) {
      case 'increase':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <div className={cn(
      "rounded-xl border transition-all-smooth hover-lift",
      colorClasses.background,
      colorClasses.border,
      sizeClasses.container,
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <p className={cn(
            "font-medium text-gray-700 dark:text-gray-300 mb-2",
            sizeClasses.title
          )}>
            {title}
          </p>
          
          {/* Value */}
          <p className={cn(
            "font-bold tracking-tight mb-1",
            colorClasses.accent,
            sizeClasses.value
          )}>
            {value}
          </p>
          
          {/* Description */}
          {description && (
            <p className={cn(
              "text-gray-600 dark:text-gray-400",
              sizeClasses.description
            )}>
              {description}
            </p>
          )}
          
          {/* Trend */}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2",
              sizeClasses.description
            )}>
              <TrendIcon className={cn("h-3 w-3", getTrendColor())} />
              <span className={getTrendColor()}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              {trend.period && (
                <span className="text-gray-500 dark:text-gray-400">
                  {trend.period}
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Icon */}
        {Icon && (
          <div className={cn(
            "rounded-lg flex items-center justify-center border shadow-sm",
            colorClasses.icon,
            colorClasses.border,
            sizeClasses.icon
          )}>
            <Icon className={sizeClasses.iconSize} />
          </div>
        )}
      </div>
    </div>
  );
};