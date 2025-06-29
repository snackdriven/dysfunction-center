import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Keyboard shortcut definitions
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'accessibility' | 'app';
  disabled?: boolean;
}

interface KeyboardShortcutsProps {
  shortcuts?: KeyboardShortcut[];
  disabled?: boolean;
}

// Default global shortcuts
export const useGlobalKeyboardShortcuts = () => {
  const navigate = useNavigate();

  const defaultShortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: '1',
      altKey: true,
      description: 'Go to Dashboard',
      action: () => navigate('/dashboard'),
      category: 'navigation'
    },
    {
      key: '2',
      altKey: true,
      description: 'Go to Tasks',
      action: () => navigate('/tasks'),
      category: 'navigation'
    },
    {
      key: '3',
      altKey: true,
      description: 'Go to Habits',
      action: () => navigate('/habits'),
      category: 'navigation'
    },
    {
      key: '4',
      altKey: true,
      description: 'Go to Mood',
      action: () => navigate('/mood'),
      category: 'navigation'
    },
    {
      key: '5',
      altKey: true,
      description: 'Go to Journal',
      action: () => navigate('/journal'),
      category: 'navigation'
    },
    {
      key: '6',
      altKey: true,
      description: 'Go to Calendar',
      action: () => navigate('/calendar'),
      category: 'navigation'
    },
    {
      key: '7',
      altKey: true,
      description: 'Go to Analytics',
      action: () => navigate('/analytics'),
      category: 'navigation'
    },
    {
      key: '8',
      altKey: true,
      description: 'Go to Settings',
      action: () => navigate('/settings'),
      category: 'navigation'
    },
    // Accessibility shortcuts
    {
      key: '/',
      ctrlKey: true,
      description: 'Show keyboard shortcuts help',
      action: () => {
        // This will be handled by the KeyboardShortcutsHelp component
        window.dispatchEvent(new CustomEvent('show-shortcuts-help'));
      },
      category: 'accessibility'
    },
    {
      key: 'k',
      ctrlKey: true,
      description: 'Quick search',
      action: () => {
        // Focus search input if it exists
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        } else {
          console.log('Search not available on this page');
        }
      },
      category: 'actions'
    },
    // App shortcuts
    {
      key: 'Escape',
      description: 'Close modal or cancel current action',
      action: () => {
        // Close any open modals/dialogs
        const closeButtons = document.querySelectorAll('[data-close-modal], [data-dismiss]');
        if (closeButtons.length > 0) {
          (closeButtons[0] as HTMLElement).click();
        }
      },
      category: 'app'
    }
  ];

  return defaultShortcuts;
};

// Hook for managing keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], disabled = false) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;

    // Don't trigger shortcuts when typing in inputs
    const activeElement = document.activeElement;
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' ||
       activeElement.tagName === 'TEXTAREA' ||
       activeElement.getAttribute('contenteditable') === 'true') &&
      event.key !== 'Escape'
    ) {
      return;
    }

    shortcuts.forEach(shortcut => {
      if (shortcut.disabled) return;

      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = Boolean(event.ctrlKey) === Boolean(shortcut.ctrlKey);
      const altMatches = Boolean(event.altKey) === Boolean(shortcut.altKey);
      const shiftMatches = Boolean(event.shiftKey) === Boolean(shortcut.shiftKey);
      const metaMatches = Boolean(event.metaKey) === Boolean(shortcut.metaKey);

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
      }
    });
  }, [shortcuts, disabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// Global keyboard shortcuts provider
export const GlobalKeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  shortcuts: customShortcuts = [],
  disabled = false
}) => {
  const defaultShortcuts = useGlobalKeyboardShortcuts();
  const allShortcuts = [...defaultShortcuts, ...customShortcuts];
  
  useKeyboardShortcuts(allShortcuts, disabled);
  
  return null; // This component doesn't render anything
};

// Keyboard shortcuts help dialog
interface KeyboardShortcutsHelpProps {
  shortcuts?: KeyboardShortcut[];
}

export const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  shortcuts: customShortcuts = []
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const defaultShortcuts = useGlobalKeyboardShortcuts();
  const allShortcuts = [...defaultShortcuts, ...customShortcuts];

  useEffect(() => {
    const handleShowHelp = () => setIsOpen(true);
    window.addEventListener('show-shortcuts-help', handleShowHelp);
    return () => window.removeEventListener('show-shortcuts-help', handleShowHelp);
  }, []);

  const formatShortcut = (shortcut: KeyboardShortcut) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.metaKey) keys.push('Cmd');
    keys.push(shortcut.key.toUpperCase());
    return keys.join(' + ');
  };

  const groupedShortcuts = allShortcuts.reduce((groups, shortcut) => {
    if (!groups[shortcut.category]) {
      groups[shortcut.category] = [];
    }
    groups[shortcut.category].push(shortcut);
    return groups;
  }, {} as Record<string, KeyboardShortcut[]>);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 id="shortcuts-title" className="text-xl font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close shortcuts help"
              data-close-modal
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 capitalize">
                  {category}
                </h3>
                <div className="grid gap-2">
                  {shortcuts.map((shortcut, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {shortcut.description}
                      </span>
                      <kbd className="px-2 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Escape</kbd> or click outside to close this dialog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Roving tabindex hook for managing focus in groups
export const useRovingTabIndex = (
  containerRef: React.RefObject<HTMLElement>,
  itemSelector: string,
  options: {
    direction?: 'horizontal' | 'vertical' | 'both';
    wrap?: boolean;
    disabled?: boolean;
  } = {}
) => {
  const { direction = 'both', wrap = true, disabled = false } = options;

  useEffect(() => {
    if (disabled || !containerRef.current) return;

    const container = containerRef.current;
    const items = Array.from(container.querySelectorAll(itemSelector)) as HTMLElement[];
    
    if (items.length === 0) return;

    // Set initial tabindex
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      const currentFocus = document.activeElement as HTMLElement;
      const currentIndex = items.indexOf(currentFocus);
      
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          if (direction === 'vertical' || direction === 'both') {
            event.preventDefault();
            nextIndex = wrap ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case 'ArrowUp':
          if (direction === 'vertical' || direction === 'both') {
            event.preventDefault();
            nextIndex = wrap ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'ArrowRight':
          if (direction === 'horizontal' || direction === 'both') {
            event.preventDefault();
            nextIndex = wrap ? (currentIndex + 1) % items.length : Math.min(currentIndex + 1, items.length - 1);
          }
          break;
        case 'ArrowLeft':
          if (direction === 'horizontal' || direction === 'both') {
            event.preventDefault();
            nextIndex = wrap ? (currentIndex - 1 + items.length) % items.length : Math.max(currentIndex - 1, 0);
          }
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        items[currentIndex].setAttribute('tabindex', '-1');
        items[nextIndex].setAttribute('tabindex', '0');
        items[nextIndex].focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, itemSelector, direction, wrap, disabled]);
};
