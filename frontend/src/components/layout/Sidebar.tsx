import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  },  {
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

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg">Executive Dysfunction Center</h1>
            <p className="text-xs text-muted-foreground">Productivity Tracker</p>
          </div>
        </div>
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
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              <div className="flex-1">
                <div>{item.name}</div>
                <div className={cn(
                  'text-xs',
                  isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {item.description}
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};