// Skip navigation and keyboard accessibility components
// for Executive Dysfunction Center WCAG AA compliance

import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

// Skip navigation links component
export const SkipNavigation: React.FC = () => {
  return (
    <div className="skip-navigation">
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4',
          'bg-blue-600 text-white px-4 py-2 rounded-md z-50',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'text-sm font-medium transition-all duration-200'
        )}
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40',
          'bg-blue-600 text-white px-4 py-2 rounded-md z-50',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'text-sm font-medium transition-all duration-200'
        )}
      >
        Skip to navigation
      </a>
      <a
        href="#search"
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-72',
          'bg-blue-600 text-white px-4 py-2 rounded-md z-50',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'text-sm font-medium transition-all duration-200'
        )}
      >
        Skip to search
      </a>
    </div>
  );
};

// Current page indicator for navigation
interface NavigationItemProps {
  href: string;
  children: React.ReactNode;
  current?: boolean;
  className?: string;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  href,
  children,
  current = false,
  className
}) => {
  return (
    <a
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        'min-h-[44px] flex items-center', // Touch target compliance
        current
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
        className
      )}
    >
      {children}
    </a>
  );
};

// Breadcrumb navigation with proper ARIA
interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.current ? (
              <span
                aria-current="page"
                className="text-gray-500 dark:text-gray-400 font-medium"
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className={cn(
                  'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded',
                  'px-1 py-1 min-h-[44px] flex items-center' // Touch target compliance
                )}
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Keyboard shortcuts provider and hook
interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string) => void;
}

const KeyboardShortcutsContext = React.createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);

  const registerShortcut = (shortcut: KeyboardShortcut) => {
    setShortcuts(prev => [...prev.filter(s => s.key !== shortcut.key), shortcut]);
  };

  const unregisterShortcut = (key: string) => {
    setShortcuts(prev => prev.filter(s => s.key !== key));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in form fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement).contentEditable === 'true'
      ) {
        return;
      }

      const matchingShortcut = shortcuts.find(shortcut => 
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.shiftKey === event.shiftKey
      );

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  // Register default shortcuts
  useEffect(() => {
    const defaultShortcuts: KeyboardShortcut[] = [
      {
        key: '/',
        description: 'Focus search',
        action: () => {
          const searchInput = document.getElementById('search') || document.querySelector('[data-search-input]');
          if (searchInput instanceof HTMLElement) {
            searchInput.focus();
          }
        }
      },
      {
        key: 'n',
        description: 'Create new task',
        action: () => {
          const newTaskButton = document.querySelector('[data-new-task]') as HTMLElement;
          if (newTaskButton) {
            newTaskButton.click();
          }
        }
      },
      {
        key: 'h',
        description: 'Go to home/dashboard',
        action: () => {
          window.location.href = '/';
        }
      },
      {
        key: 't',
        description: 'Go to tasks',
        action: () => {
          window.location.href = '/tasks';
        }
      },
      {
        key: 'p',
        description: 'Go to habits',
        action: () => {
          window.location.href = '/habits';
        }
      },
      {
        key: 'm',
        description: 'Go to mood tracker',
        action: () => {
          window.location.href = '/mood';
        }
      },
      {
        key: 'j',
        description: 'Go to journal',
        action: () => {
          window.location.href = '/journal';
        }
      },
      {
        key: '?',
        description: 'Show keyboard shortcuts help',
        shiftKey: true,
        action: () => {
          // Open keyboard shortcuts modal
          const helpButton = document.querySelector('[data-keyboard-help]') as HTMLElement;
          if (helpButton) {
            helpButton.click();
          }
        }
      }
    ];

    defaultShortcuts.forEach(registerShortcut);
  }, []);

  return (
    <KeyboardShortcutsContext.Provider value={{ shortcuts, registerShortcut, unregisterShortcut }}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};

export const useKeyboardShortcuts = () => {
  const context = React.useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

// Keyboard shortcuts help modal
export const KeyboardShortcutsHelp: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { shortcuts } = useKeyboardShortcuts();

  if (!isOpen) return null;

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="shortcuts-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500',
              'min-h-[44px] min-w-[44px] flex items-center justify-center'
            )}
            aria-label="Close keyboard shortcuts help"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded border">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press <kbd className="px-1 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded">Escape</kbd> to close this dialog
          </p>
        </div>
      </div>
    </div>
  );
};

// Landmark regions for better navigation
export const MainContent: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => {
  return (
    <main
      id="main-content"
      role="main"
      className={className}
      tabIndex={-1} // Allow programmatic focus
    >
      {children}
    </main>
  );
};

export const SearchLandmark: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      id="search"
      role="search"
      aria-label="Search"
      className={className}
    >
      {children}
    </div>
  );
};

export const NavigationLandmark: React.FC<{ 
  children: React.ReactNode; 
  label: string;
  className?: string;
}> = ({ children, label, className }) => {
  return (
    <nav
      id="main-navigation"
      role="navigation"
      aria-label={label}
      className={className}
    >
      {children}
    </nav>
  );
};
