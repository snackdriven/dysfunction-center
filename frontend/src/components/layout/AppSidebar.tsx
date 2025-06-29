import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Target, 
  Heart, 
  Calendar, 
  BookOpen, 
  Settings, 
  HelpCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    description: 'Overview and quick actions',
    color: 'text-blue-600 bg-blue-50 border-blue-200'
  },
  { 
    path: '/tasks', 
    label: 'Tasks', 
    icon: CheckSquare, 
    description: 'Manage your to-dos',
    color: 'text-red-600 bg-red-50 border-red-200',
    badge: 5
  },
  { 
    path: '/habits', 
    label: 'Habits', 
    icon: Target, 
    description: 'Track daily habits',
    color: 'text-green-600 bg-green-50 border-green-200'
  },
  { 
    path: '/mood', 
    label: 'Mood', 
    icon: Heart, 
    description: 'Log your feelings',
    color: 'text-purple-600 bg-purple-50 border-purple-200'
  },
  { 
    path: '/calendar', 
    label: 'Calendar', 
    icon: Calendar, 
    description: 'Schedule and events',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    badge: 2
  },
  { 
    path: '/journal', 
    label: 'Journal', 
    icon: BookOpen, 
    description: 'Daily reflections',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
  }
];

const secondaryItems = [
  { 
    path: '/analytics', 
    label: 'Analytics', 
    icon: TrendingUp, 
    description: 'Insights and trends',
    color: 'text-gray-600 bg-gray-50 border-gray-200'
  },
  { 
    path: '/settings', 
    label: 'Settings', 
    icon: Settings, 
    description: 'App preferences',
    color: 'text-gray-600 bg-gray-50 border-gray-200'
  },
  { 
    path: '/help', 
    label: 'Help', 
    icon: HelpCircle, 
    description: 'Support and guides',
    color: 'text-gray-600 bg-gray-50 border-gray-200'
  }
];

export const AppSidebar: React.FC<AppSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose(); // Close mobile menu after navigation
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  EDC
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Executive Dysfunction Center
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
            {/* Main navigation */}
            <div>
              <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Main
              </h3>
              <div className="mt-3 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all-smooth hover-lift focus-ring-brand group",
                        isActive 
                          ? cn("border", item.color, "shadow-sm") 
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={`${item.label} - ${item.description}${item.badge ? ` (${item.badge} items)` : ''}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={cn(
                          "h-5 w-5",
                          isActive ? item.color.split(' ')[0] : "text-gray-500 dark:text-gray-400"
                        )} />
                        <div className="text-left">
                          <div className={cn(
                            "font-medium",
                            isActive ? item.color.split(' ')[0] : ""
                          )}>
                            {item.label}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 hidden lg:block">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="ml-auto h-5 min-w-5 rounded-full"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary navigation */}
            <div>
              <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tools
              </h3>
              <div className="mt-3 space-y-1">
                {secondaryItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all-smooth hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring-brand",
                        isActive 
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" 
                          : "text-gray-700 dark:text-gray-300"
                      )}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={`${item.label} - ${item.description}`}
                    >
                      <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Daily Progress
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                You're doing great! Keep it up.
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                75% complete
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};