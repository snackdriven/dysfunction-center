import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  items: string[];
  setItems: (items: string[]) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [items, setItems] = useState<string[]>([]);

  return (
    <SelectContext.Provider value={{ 
      value, 
      onValueChange, 
      open, 
      setOpen, 
      focusedIndex, 
      setFocusedIndex,
      items,
      setItems
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

export const SelectTrigger: React.FC<SelectTriggerProps> = ({ className, children }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        context.setOpen(!context.open);
        if (!context.open) {
          context.setFocusedIndex(0);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!context.open) {
          context.setOpen(true);
          context.setFocusedIndex(0);
        } else {
          const nextIndex = Math.min(context.focusedIndex + 1, context.items.length - 1);
          context.setFocusedIndex(nextIndex);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!context.open) {
          context.setOpen(true);
          context.setFocusedIndex(context.items.length - 1);
        } else {
          const prevIndex = Math.max(context.focusedIndex - 1, 0);
          context.setFocusedIndex(prevIndex);
        }
        break;
      case 'Escape':
        if (context.open) {
          event.preventDefault();
          context.setOpen(false);
          context.setFocusedIndex(-1);
        }
        break;
    }
  }, [context]);

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      onKeyDown={handleKeyDown}
      aria-expanded={context.open}
      aria-haspopup="listbox"
      aria-label="Select option"
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
    </button>
  );
};

interface SelectValueProps {
  placeholder?: string;
}

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  return <span>{context.value || placeholder}</span>;
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export const SelectContent: React.FC<SelectContentProps> = ({ children, className }) => {
  const context = useContext(SelectContext);
  const contentRef = useRef<HTMLDivElement>(null);
  
  if (!context) throw new Error('SelectContent must be used within Select');

  // Focus management for keyboard navigation
  useEffect(() => {
    if (context.open && contentRef.current) {
      const focusedItem = contentRef.current.querySelector(`[data-index="${context.focusedIndex}"]`) as HTMLElement;
      if (focusedItem) {
        focusedItem.focus();
      }
    }
  }, [context.open, context.focusedIndex]);

  // Collect items from children
  useEffect(() => {
    if (context.open && contentRef.current) {
      const itemElements = contentRef.current.querySelectorAll('[data-value]');
      const itemValues = Array.from(itemElements).map(el => el.getAttribute('data-value')).filter(Boolean) as string[];
      context.setItems(itemValues);
    }
  }, [context.open, children]);

  if (!context.open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => context.setOpen(false)}
        aria-hidden="true"
      />
      <div 
        ref={contentRef}
        role="listbox"
        aria-label="Select options"
        className={cn(
          'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          'top-full mt-1 w-full',
          className
        )}
      >
        {children}
      </div>
    </>
  );
};

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  const itemIndex = context.items.indexOf(value);
  const isFocused = context.focusedIndex === itemIndex;
  const isSelected = context.value === value;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        context.onValueChange(value);
        context.setOpen(false);
        context.setFocusedIndex(-1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = Math.min(context.focusedIndex + 1, context.items.length - 1);
        context.setFocusedIndex(nextIndex);
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = Math.max(context.focusedIndex - 1, 0);
        context.setFocusedIndex(prevIndex);
        break;
      case 'Escape':
        event.preventDefault();
        context.setOpen(false);
        context.setFocusedIndex(-1);
        break;
    }
  };

  return (
    <button
      type="button"
      data-value={value}
      data-index={itemIndex}
      onClick={() => {
        context.onValueChange(value);
        context.setOpen(false);
        context.setFocusedIndex(-1);
      }}
      onKeyDown={handleKeyDown}
      role="option"
      aria-selected={isSelected}
      tabIndex={isFocused ? 0 : -1}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors',
        'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        isSelected && 'bg-accent text-accent-foreground',
        isFocused && 'bg-accent text-accent-foreground',
        className
      )}
    >
      {children}
      {isSelected && (
        <span className="absolute right-2 h-3.5 w-3.5">
          ✓
        </span>
      )}
    </button>
  );
};