import React, { ComponentType, SVGAttributes } from 'react';
import { cn } from '../../utils/cn';

type IconProps = SVGAttributes<SVGElement> & {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'indigo';
  badge?: string | number;
  disabled?: boolean;
  className?: string;
}

const colorVariants = {
  blue: {
    background: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
    hover: 'hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50'
  },
  green: {
    background: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-900 dark:text-green-100',
    hover: 'hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/50 dark:hover:to-emerald-900/50'
  },
  purple: {
    background: 'bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-900 dark:text-purple-100',
    hover: 'hover:from-purple-100 hover:to-violet-100 dark:hover:from-purple-900/50 dark:hover:to-violet-900/50'
  },
  red: {
    background: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-900 dark:text-red-100',
    hover: 'hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/50 dark:hover:to-pink-900/50'
  },
  orange: {
    background: 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400',
    text: 'text-orange-900 dark:text-orange-100',
    hover: 'hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-900/50 dark:hover:to-amber-900/50'
  },
  indigo: {
    background: 'bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30',
    border: 'border-indigo-200 dark:border-indigo-800',
    icon: 'text-indigo-600 dark:text-indigo-400',
    text: 'text-indigo-900 dark:text-indigo-100',
    hover: 'hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/50 dark:hover:to-blue-900/50'
  }
};

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  onClick,
  color = 'blue',
  badge,
  disabled = false,
  className
}) => {
  const colorClasses = colorVariants[color];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative w-full p-6 rounded-xl border-2 transition-all-smooth hover-lift focus-ring-brand disabled:opacity-50 disabled:cursor-not-allowed",
        colorClasses.background,
        colorClasses.border,
        colorClasses.hover,
        "hover:shadow-lg hover:border-opacity-80",
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-2 -right-2 min-w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-md">
          {badge}
        </div>
      )}
      
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-12 h-12 rounded-lg bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center group-hover:shadow-md transition-all-smooth",
          colorClasses.border
        )}>
          <Icon className={cn("h-6 w-6", colorClasses.icon)} />
        </div>
        
        {/* Content */}
        <div className="flex-1 text-left min-w-0">
          <h3 className={cn(
            "font-semibold text-base mb-1 group-hover:translate-x-1 transition-transform duration-200",
            colorClasses.text
          )}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Arrow indicator */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200">
          <svg className={cn("h-5 w-5", colorClasses.icon)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
};