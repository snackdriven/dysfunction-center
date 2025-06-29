import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Heart, 
  BookOpen,
  Settings,
  Search,
  Command,
  Plus
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface DesktopNavigationProps {
  className?: string;
}

interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
  description: string;
  group: 'primary' | 'secondary';
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: Home,
    shortcut: 'Alt+D',
    description: 'Overview and quick actions',
    group: 'primary'
  },
  {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: CheckSquare,
    shortcut: 'Alt+T',
    description: 'Manage your to-do items',
    group: 'primary'
  },
  {
    id: 'habits',
    label: 'Habits',
    path: '/habits',
    icon: TrendingUp,
    shortcut: 'Alt+H',
    description: 'Track daily habits',
    group: 'primary'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    path: '/calendar',
    icon: Calendar,
    shortcut: 'Alt+C',
    description: 'Schedule and events',
    group: 'primary'
  },
  {
    id: 'mood',
    label: 'Mood',
    path: '/mood',
    icon: Heart,
    shortcut: 'Alt+M',
    description: 'Mood tracking and patterns',
    group: 'secondary'
  },
  {
    id: 'journal',
    label: 'Journal',
    path: '/journal',
    icon: BookOpen,
    shortcut: 'Alt+J',
    description: 'Personal reflections',
    group: 'secondary'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
    shortcut: 'Alt+S',
    description: 'App preferences',
    group: 'secondary'
  }
];

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ className }) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Keyboard navigation handler
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    if (event.altKey) {
      const item = navigationItems.find(item => {
        const key = item.shortcut.split('+')[1].toLowerCase();
        return event.key.toLowerCase() === key;
      });
      
      if (item) {
        event.preventDefault();
        window.location.href = item.path;
      }
    }

    // Show shortcuts overlay with Ctrl+/
    if (event.ctrlKey && event.key === '/') {
      event.preventDefault();
      setShowShortcuts(!showShortcuts);
    }

    // Quick search with Ctrl+K
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      // Focus search input or open search modal
      const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }

    // Quick add with Ctrl+N
    if (event.ctrlKey && event.key === 'n') {
      event.preventDefault();
      window.location.href = '/tasks?action=create';
    }
  }, [showShortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  const primaryItems = navigationItems.filter(item => item.group === 'primary');
  const secondaryItems = navigationItems.filter(item => item.group === 'secondary');

  return (
    <>
      <aside 
        className={cn(
          "fixed left-0 top-0 z-30 h-screen w-64 bg-background border-r border-border",
          "flex flex-col shadow-sm",
          className
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Header */}
        <div 
          className="p-6 border-b border-border"
          style={{ padding: 'var(--spacing-normal-element, 1rem)' }}
        >
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 text-foreground hover:text-primary",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
              "transition-colors duration-200"
            )}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">ED</span>
            </div>
            <div>
              <h1 
                className="font-semibold"
                style={{ 
                  fontSize: 'var(--font-size-lg, 1.125rem)',
                  lineHeight: 'var(--line-height-tight, 1.25)'
                }}
              >
                Executive Dysfunction
              </h1>
              <p 
                className="text-muted-foreground"
                style={{ 
                  fontSize: 'var(--font-size-sm, 0.875rem)',
                  lineHeight: 'var(--line-height-normal, 1.5)'
                }}
              >
                Center
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div 
          className="p-4 border-b border-border/50"
          style={{ padding: 'var(--spacing-normal-text, 0.75rem)' }}
        >
          <div className="grid grid-cols-3 gap-2">
            <button
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg",
                "bg-primary/10 text-primary hover:bg-primary/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "transition-colors duration-200"
              )}
              onClick={() => window.location.href = '/tasks?action=create'}
              title="Add Task (Ctrl+N)"
            >
              <Plus className="w-4 h-4" />
              <span 
                className="text-xs font-medium"
                style={{ fontSize: 'var(--font-size-xs, 0.75rem)' }}
              >
                Add
              </span>
            </button>
            
            <button
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "transition-colors duration-200"
              )}
              onClick={() => {
                const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
                searchInput?.focus();
              }}
              title="Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
              <span 
                className="text-xs font-medium"
                style={{ fontSize: 'var(--font-size-xs, 0.75rem)' }}
              >
                Search
              </span>
            </button>
            
            <button
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "transition-colors duration-200"
              )}
              onClick={() => setShowShortcuts(!showShortcuts)}
              title="Shortcuts (Ctrl+/)"
            >
              <Command className="w-4 h-4" />
              <span 
                className="text-xs font-medium"
                style={{ fontSize: 'var(--font-size-xs, 0.75rem)' }}
              >
                Shortcuts
              </span>
            </button>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav 
          className="flex-1 overflow-y-auto py-4"
          style={{ padding: 'var(--spacing-normal-text, 0.75rem) 0' }}
        >
          <div className="px-4 mb-6">
            <h2 
              className="text-muted-foreground font-medium mb-3"
              style={{ 
                fontSize: 'var(--font-size-sm, 0.875rem)',
                letterSpacing: 'var(--letter-spacing-wide, 0.025em)',
                marginBottom: 'var(--spacing-normal-text, 0.75rem)'
              }}
            >
              Main
            </h2>
            <ul className="space-y-1">
              {primaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg",
                        "transition-all duration-200 group",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-primary/10 text-primary border-r-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      aria-current={isActive ? 'page' : undefined}
                      title={`${item.description} (${item.shortcut})`}
                    >
                      <Icon className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        isActive && "scale-110"
                      )} />
                      <span 
                        className="font-medium flex-1"
                        style={{ 
                          fontSize: 'var(--font-size-base, 1rem)',
                          lineHeight: 'var(--line-height-normal, 1.5)'
                        }}
                      >
                        {item.label}
                      </span>
                      {(hoveredItem === item.id || showShortcuts) && (
                        <kbd 
                          className="text-xs bg-muted px-1.5 py-0.5 rounded border"
                          style={{ fontSize: 'var(--font-size-xs, 0.75rem)' }}
                        >
                          {item.shortcut.split('+')[1]}
                        </kbd>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Secondary Navigation */}
          <div className="px-4">
            <h2 
              className="text-muted-foreground font-medium mb-3"
              style={{ 
                fontSize: 'var(--font-size-sm, 0.875rem)',
                letterSpacing: 'var(--letter-spacing-wide, 0.025em)',
                marginBottom: 'var(--spacing-normal-text, 0.75rem)'
              }}
            >
              Tools
            </h2>
            <ul className="space-y-1">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.id}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg",
                        "transition-all duration-200 group",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-primary/10 text-primary border-r-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      aria-current={isActive ? 'page' : undefined}
                      title={`${item.description} (${item.shortcut})`}
                    >
                      <Icon className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        isActive && "scale-110"
                      )} />
                      <span 
                        className="font-medium flex-1"
                        style={{ 
                          fontSize: 'var(--font-size-base, 1rem)',
                          lineHeight: 'var(--line-height-normal, 1.5)'
                        }}
                      >
                        {item.label}
                      </span>
                      {(hoveredItem === item.id || showShortcuts) && (
                        <kbd 
                          className="text-xs bg-muted px-1.5 py-0.5 rounded border"
                          style={{ fontSize: 'var(--font-size-xs, 0.75rem)' }}
                        >
                          {item.shortcut.split('+')[1]}
                        </kbd>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Footer */}
        <div 
          className="p-4 border-t border-border"
          style={{ padding: 'var(--spacing-normal-text, 0.75rem)' }}
        >
          <div 
            className="text-center text-muted-foreground"
            style={{ 
              fontSize: 'var(--font-size-xs, 0.75rem)',
              lineHeight: 'var(--line-height-relaxed, 1.625)'
            }}
          >
            Designed for executive dysfunction support
          </div>
        </div>
      </aside>

      {/* Keyboard Shortcuts Overlay */}
      {showShortcuts && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowShortcuts(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className={cn(
                "bg-background border border-border rounded-lg shadow-xl",
                "w-full max-w-md p-6 animate-fade-in"
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby="shortcuts-title"
            >
              <h2 
                id="shortcuts-title"
                className="font-semibold mb-4"
                style={{ 
                  fontSize: 'var(--font-size-lg, 1.125rem)',
                  marginBottom: 'var(--spacing-normal-text, 0.75rem)'
                }}
              >
                Keyboard Shortcuts
              </h2>
              <div 
                className="space-y-3"
                style={{ gap: 'var(--spacing-normal-text, 0.75rem)' }}
              >
                {navigationItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <span 
                      className="text-muted-foreground"
                      style={{ fontSize: 'var(--font-size-sm, 0.875rem)' }}
                    >
                      {item.label}
                    </span>
                    <kbd 
                      className="bg-muted px-2 py-1 rounded text-xs font-mono"
                      style={{ fontSize: 'var(--font-size-xs, 0.75rem)' }}
                    >
                      {item.shortcut}
                    </kbd>
                  </div>
                ))}
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-muted-foreground"
                      style={{ fontSize: 'var(--font-size-sm, 0.875rem)' }}
                    >
                      Search
                    </span>
                    <kbd 
                      className="bg-muted px-2 py-1 rounded text-xs font-mono"
                      style={{ fontSize: 'var(--font-size-xs, 0.75rem)' }}
                    >
                      Ctrl+K
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-muted-foreground"
                      style={{ fontSize: 'var(--font-size-sm, 0.875rem)' }}
                    >
                      Quick Add
                    </span>
                    <kbd 
                      className="bg-muted px-2 py-1 rounded text-xs font-mono"
                      style={{ fontSize: 'var(--font-size-xs, 0.75rem)' }}
                    >
                      Ctrl+N
                    </kbd>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowShortcuts(false)}
                className={cn(
                  "mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg",
                  "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "transition-colors duration-200"
                )}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DesktopNavigation;