import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Smile, 
  BookOpen,
  Calendar, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { preferencesService } from '../../services/preferences';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and quick actions'
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    description: 'Manage your tasks'
  },
  {
    name: 'Habits',
    href: '/habits',
    icon: Target,
    description: 'Track your habits'
  },
  {
    name: 'Mood',
    href: '/mood',
    icon: Smile,
    description: 'Log your mood'
  },
  {
    name: 'Journal',
    href: '/journal',
    icon: BookOpen,
    description: 'Record your thoughts'
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'View your schedule'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'View insights'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App preferences'
  },
];

export interface SidebarProps {
  isOpen?: boolean;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, className }) => {
  const location = useLocation();

  // Fetch user preferences for avatar
  const { data: preferences } = useQuery({
    queryKey: ['preferences'],
    queryFn: () => preferencesService.getAllPreferences(),
  });
  const avatarUrl = preferences?.preferences?.avatar_url || '';
  const displayName = preferences?.preferences?.display_name || '';

  return (
    <div className={cn(
      "flex flex-col bg-card border-r border-border transition-all duration-200 ease-in-out",
      isOpen ? "w-64" : "w-16",
      className
    )}>
      {/* Avatar and Display Name as Dashboard Link */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={avatarUrl || 'https://ui-avatars.com/api/?name=User&background=random'}
            alt="User Avatar"
            className="w-10 h-10 rounded-full border flex-shrink-0 group-hover:ring-2 group-hover:ring-primary transition"
            style={{ cursor: 'pointer' }}
          />
          {isOpen && displayName && (
            <span className="font-semibold text-base truncate group-hover:text-primary transition">{displayName}</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
              title={!isOpen ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && (
                <div className="flex-1 overflow-hidden">
                  <div className="truncate">{item.name}</div>
                  <div className={cn(
                    'text-xs truncate',
                    isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {item.description}
                  </div>
                </div>
              )}
              
              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap pointer-events-none">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};