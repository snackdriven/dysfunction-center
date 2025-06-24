import React from 'react';
import { create } from 'zustand';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// Convenience hook for toast functions
export const useToast = () => {
  const { addToast } = useToastStore();
  
  return {
    toast: addToast,
    success: (description: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'description'>>) =>
      addToast({ ...options, description, type: 'success' }),
    error: (description: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'description'>>) =>
      addToast({ ...options, description, type: 'error', duration: 7000 }),
    warning: (description: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'description'>>) =>
      addToast({ ...options, description, type: 'warning' }),
    info: (description: string, options?: Partial<Omit<Toast, 'id' | 'type' | 'description'>>) =>
      addToast({ ...options, description, type: 'info' }),
  };
};

const ToastIcon: React.FC<{ type: Toast['type'] }> = ({ type }) => {
  const iconClass = "h-4 w-4";
  
  switch (type) {
    case 'success':
      return <CheckCircle className={cn(iconClass, "text-green-600")} />;
    case 'error':
      return <XCircle className={cn(iconClass, "text-red-600")} />;
    case 'warning':
      return <AlertCircle className={cn(iconClass, "text-orange-600")} />;
    case 'info':
      return <Info className={cn(iconClass, "text-blue-600")} />;
  }
};

const ToastComponent: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToastStore();
  
  const typeStyles = {
    success: "border-green-200 bg-green-50 text-green-900",
    error: "border-red-200 bg-red-50 text-red-900",
    warning: "border-orange-200 bg-orange-50 text-orange-900",
    info: "border-blue-200 bg-blue-50 text-blue-900",
  };
  
  return (
    <div
      className={cn(
        "relative flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all",
        typeStyles[toast.type]
      )}
    >
      <ToastIcon type={toast.type} />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold">{toast.title}</h4>
        )}
        <p className="text-sm opacity-90">{toast.description}</p>
      </div>
      
      <div className="flex items-center gap-2">
        {toast.action && (
          <Button
            size="sm"
            variant="ghost"
            onClick={toast.action.onClick}
            className="h-auto p-1 text-xs"
          >
            {toast.action.label}
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={() => removeToast(toast.id)}
          className="h-auto p-1"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
