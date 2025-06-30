import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [announcements, setAnnouncements] = useState<{
    polite: string;
    assertive: string;
  }>({ polite: '', assertive: '' });

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(current => [...current, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);

    // Announce to screen readers
    const message = `${toast.title}${toast.description ? '. ' + toast.description : ''}`;
    announce(message, toast.variant === 'error' ? 'assertive' : 'polite');
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncements(current => ({
      ...current,
      [priority]: message
    }));

    // Clear announcement after a short delay to allow for new announcements
    setTimeout(() => {
      setAnnouncements(current => ({
        ...current,
        [priority]: ''
      }));
    }, 1000);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, announce }}>
      {children}
      
      {/* Screen Reader Live Regions */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        role="status"
      >
        {announcements.polite}
      </div>
      <div 
        aria-live="assertive" 
        aria-atomic="true" 
        className="sr-only"
        role="alert"
      >
        {announcements.assertive}
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

interface ToastComponentProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const variantStyles = {
    default: {
      className: 'bg-background border border-border text-foreground',
      icon: Info
    },
    success: {
      className: 'bg-green-50 border border-green-200 text-green-800',
      icon: CheckCircle
    },
    error: {
      className: 'bg-red-50 border border-red-200 text-red-800',
      icon: AlertCircle
    },
    warning: {
      className: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
      icon: AlertCircle
    }
  };

  const variant = variantStyles[toast.variant || 'default'];
  const Icon = variant.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className={cn(
        'rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-bottom-4',
        variant.className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm opacity-90 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


