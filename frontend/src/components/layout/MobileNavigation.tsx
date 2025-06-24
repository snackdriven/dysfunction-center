import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Smile, 
  Calendar 
} from 'lucide-react';

const mobileNavigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Habits',
    href: '/habits',
    icon: Target,
  },
  {
    name: 'Mood',
    href: '/mood',
    icon: Smile,
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
];

export interface MobileNavigationProps {
  className?: string;
}

/**
 * Mobile navigation bar component for bottom tab bar navigation
 */
export const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-pb",
      className
    )}>
      <nav className="flex items-center justify-around px-2 py-2">
        {mobileNavigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all min-w-0 flex-1',
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-all",
                isActive ? "scale-110" : ""
              )} />
              <span className="truncate leading-none">
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
