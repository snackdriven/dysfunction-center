import React from 'react';
import { cn } from '../../utils/cn';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ResponsiveDashboardGridProps {
  children: React.ReactNode;
  className?: string;
  dragEnabled?: boolean;
  onReorder?: (newOrder: string[]) => void;
  widgetSizes?: Record<string, 'small' | 'medium' | 'large' | 'xl'>;
}

export const ResponsiveDashboardGrid: React.FC<ResponsiveDashboardGridProps> = ({ 
  children, 
  className,
  dragEnabled = false,
  onReorder,
  widgetSizes = {}
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<string[]>([]);

  React.useEffect(() => {
    // Initialize items from children
    const childArray = React.Children.toArray(children);
    const newItems = childArray.map((_, index) => `widget-${index}`);
    setItems(newItems);
  }, [children]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        
        const newItems = [...items];
        newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, active.id as string);
        
        if (onReorder) {
          onReorder(newItems);
        }
        
        return newItems;
      });
    }

    setActiveId(null);
  };

  if (!dragEnabled) {
    return (
      <div className={cn(
        'responsive-dashboard-grid',
        'grid gap-4 sm:gap-6',
        // Use CSS Grid with container queries for responsive layout
        'grid-cols-1',
        '@container/dashboard-[min-width:_600px]:grid-cols-2',
        '@container/dashboard-[min-width:_900px]:grid-cols-3',
        '@container/dashboard-[min-width:_1200px]:grid-cols-4',
        className
      )}>
        {React.Children.map(children, (child, index) => (
          <ResponsiveWidgetContainer 
            key={`widget-${index}`} 
            size={widgetSizes[`widget-${index}`] || 'medium'}
          >
            {child}
          </ResponsiveWidgetContainer>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div className={cn(
          'responsive-dashboard-grid',
          'grid gap-4 sm:gap-6',
          'grid-cols-1',
          '@container/dashboard-[min-width:_600px]:grid-cols-2',
          '@container/dashboard-[min-width:_900px]:grid-cols-3',
          '@container/dashboard-[min-width:_1200px]:grid-cols-4',
          className
        )}>
          {React.Children.map(children, (child, index) => (
            <SortableResponsiveWidget 
              key={`widget-${index}`} 
              id={`widget-${index}`}
              size={widgetSizes[`widget-${index}`] || 'medium'}
            >
              {child}
            </SortableResponsiveWidget>
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeId ? <div className="opacity-50">Dragging...</div> : null}
      </DragOverlay>
    </DndContext>
  );
};

interface ResponsiveWidgetContainerProps {
  children: React.ReactNode;
  size: 'small' | 'medium' | 'large' | 'xl';
}

const ResponsiveWidgetContainer: React.FC<ResponsiveWidgetContainerProps> = ({ 
  children, 
  size 
}) => {
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 @container/dashboard-[min-width:_900px]:col-span-1',
    large: 'col-span-1 @container/dashboard-[min-width:_600px]:col-span-2 @container/dashboard-[min-width:_1200px]:col-span-2',
    xl: 'col-span-1 @container/dashboard-[min-width:_600px]:col-span-2 @container/dashboard-[min-width:_900px]:col-span-3'
  };

  return (
    <div className={cn('responsive-widget-container', sizeClasses[size])}>
      {children}
    </div>
  );
};

interface SortableResponsiveWidgetProps {
  id: string;
  children: React.ReactNode;
  size: 'small' | 'medium' | 'large' | 'xl';
}

const SortableResponsiveWidget: React.FC<SortableResponsiveWidgetProps> = ({ 
  id, 
  children, 
  size 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <ResponsiveWidgetContainer size={size}>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    </ResponsiveWidgetContainer>
  );
};

interface ResponsiveDashboardWidgetProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'xl';
}

export const ResponsiveDashboardWidget: React.FC<ResponsiveDashboardWidgetProps> = ({
  title,
  subtitle,
  action,
  children,
  className,
  size = 'medium'
}) => {
  return (
    <div className={cn(
      'responsive-dashboard-widget',
      'container-type-inline-size',
      'bg-card border rounded-lg shadow-sm',
      'transition-all duration-200 ease-in-out',
      'hover:shadow-md focus-within:shadow-md',
      // Reduced motion support
      'motion-reduce:transition-none',
      className
    )}>
      <div className={cn(
        'widget-header',
        'p-4 pb-2',
        // Responsive header layout using container queries
        '@container/widget-[min-width:_280px]:flex @container/widget-[min-width:_280px]:items-start @container/widget-[min-width:_280px]:justify-between'
      )}>
        <div className="widget-title-group">
          <h3 className={cn(
            'widget-title',
            'font-semibold text-card-foreground',
            // Responsive typography
            'text-sm @container/widget-[min-width:_240px]:text-base',
            'leading-tight'
          )}>
            {title}
          </h3>
          {subtitle && (
            <p className={cn(
              'widget-subtitle',
              'text-xs @container/widget-[min-width:_240px]:text-sm',
              'text-muted-foreground mt-1',
              // Hide subtitle on very small containers
              'hidden @container/widget-[min-width:_200px]:block'
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className={cn(
            'widget-action',
            'mt-2 @container/widget-[min-width:_280px]:mt-0',
            'flex-shrink-0'
          )}>
            {action}
          </div>
        )}
      </div>
      <div className={cn(
        'widget-content',
        'p-4 pt-2',
        // Container-based content layout
        size === 'small' && 'p-3 pt-1',
        size === 'large' && '@container/widget-[min-width:_400px]:p-6 @container/widget-[min-width:_400px]:pt-3',
        size === 'xl' && '@container/widget-[min-width:_400px]:p-8 @container/widget-[min-width:_400px]:pt-4'
      )}>
        {children}
      </div>
    </div>
  );
};
