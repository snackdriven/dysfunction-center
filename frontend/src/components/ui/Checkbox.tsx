import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked = false,
  onCheckedChange,
  disabled = false,
  className,
  'aria-label': ariaLabel,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onCheckedChange) {
      onCheckedChange(event.target.checked);
    }
  };

  return (
    <div className="relative">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className="sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          'flex items-center justify-center w-4 h-4 border-2 rounded cursor-pointer transition-colors',
          checked
            ? 'bg-primary border-primary text-primary-foreground'
            : 'border-input bg-background hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {checked && (
          <Check className="w-3 h-3" />
        )}
      </label>
    </div>
  );
};