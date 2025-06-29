import React from 'react';
import { cn } from '../../utils/cn';

interface SimpleDashboardGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SIMPLIFIED: Dashboard grid using CSS Grid auto-fit instead of complex container queries
 * 
 * Before: 250+ lines with drag/drop, complex responsive logic, and multiple container queries
 * After: Simple CSS Grid that automatically adapts to available space
 */
export const SimpleDashboardGrid: React.FC<SimpleDashboardGridProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('dashboard-grid', className)}>
      {children}
    </div>
  );
};

interface SimpleWidgetProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

/**
 * SIMPLIFIED: Widget component with essential functionality
 */
export const SimpleWidget: React.FC<SimpleWidgetProps> = ({
  children,
  className,
  title,
  subtitle,
  action
}) => {
  return (
    <div className={cn('widget-container', className)}>
      {(title || subtitle || action) && (
        <div className="widget-header">
          <div className="flex flex-col">
            {title && (
              <h3 className="font-semibold text-lg">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      )}
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

/**
 * Example usage:
 * 
 * <SimpleDashboardGrid>
 *   <SimpleWidget title="Tasks" subtitle="Today's priorities">
 *     <TaskList />
 *   </SimpleWidget>
 *   
 *   <SimpleWidget title="Habits" action={<AddHabitButton />}>
 *     <HabitTracker />
 *   </SimpleWidget>
 *   
 *   <SimpleWidget title="Mood">
 *     <MoodChart />
 *   </SimpleWidget>
 * </SimpleDashboardGrid>
 */

export { SimpleDashboardGrid as DashboardGrid }; // Alias for backward compatibility
export { SimpleWidget as DashboardWidget };
