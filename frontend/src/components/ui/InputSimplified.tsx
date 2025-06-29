import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const inputVariants = cva(
  "flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-background text-foreground placeholder:text-muted-foreground transition-colors touch-manipulation",
  {
    variants: {
      variant: {
        default: "border-input hover:border-input/80 focus-visible:border-ring",
        error: "border-destructive focus-visible:ring-destructive hover:border-destructive/80",
        success: "border-green-500 focus-visible:ring-green-500 hover:border-green-500/80",
      },
      size: {
        sm: "h-9 px-2 py-1 text-xs min-h-[44px]",
        md: "h-10 px-3 py-2 text-sm min-h-[44px]",
        lg: "h-11 px-4 py-3 text-base min-h-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange'>,
    VariantProps<typeof inputVariants> {
  /**
   * Label text for the input
   */
  label?: string;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Icon to display at the start of the input
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display at the end of the input
   */
  endIcon?: React.ReactNode;
  /**
   * Loading state for the input
   */
  loading?: boolean;
  /**
   * Priority level for executive dysfunction support
   */
  priority?: 'high' | 'urgent';
  /**
   * Input value for controlled components
   */
  value?: string;
  /**
   * Change handler with standardized signature
   */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Input type
   */
  type?: 'text' | 'email' | 'password' | 'search' | 'tel' | 'url' | 'number' | 'date' | 'time' | 'datetime-local';
}

/**
 * Input component for text input and similar form controls.
 * 
 * @example
 * ```tsx
 * <Input 
 *   label="Email" 
 *   placeholder="Enter your email" 
 *   error="Please enter a valid email"
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type = "text", 
    error, 
    label, 
    helperText, 
    startIcon, 
    endIcon,
    id,
    required,
    loading,
    value,
    onChange,
    priority,
    ...props 
  }, ref) => {
    const inputId = React.useId();
    const hasError = !!error;
    const inputVariant = hasError ? "error" : variant;

    const idToUse = id || inputId;
    const descriptionId = `${idToUse}-description`;
    const errorId = `${idToUse}-error`;

    // Handle controlled component change
    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event.target.value, event);
      }
    }, [onChange]);

    // Build aria-describedby
    const ariaDescribedByParts = [
      props['aria-describedby'],
      helperText && descriptionId,
      error && errorId
    ].filter(Boolean);
    
    const finalAriaDescribedBy = ariaDescribedByParts.length > 0 ? ariaDescribedByParts.join(' ') : undefined;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={idToUse}
            className={cn(
              "block text-sm font-medium text-foreground mb-1",
              priority === 'high' && "text-red-600 dark:text-red-400",
              priority === 'urgent' && "text-red-700 dark:text-red-300 font-semibold"
            )}
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}
          
          <input
            id={idToUse}
            ref={ref}
            type={type}
            value={value}
            onChange={handleChange}
            className={cn(
              inputVariants({ variant: inputVariant, size, className }),
              startIcon && "pl-10",
              (endIcon || loading) && "pr-10"
            )}
            aria-describedby={finalAriaDescribedBy}
            aria-invalid={hasError}
            aria-required={required}
            {...props}
          />
          
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          
          {!loading && endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>
        
        {/* Helper text */}
        {helperText && !error && (
          <p id={descriptionId} className="mt-1 text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
        
        {/* Error message */}
        {error && (
          <p id={errorId} className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants };
