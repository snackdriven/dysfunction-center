import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { FormProps } from "../../types/components";

const inputVariants = cva(
  "flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-background text-foreground placeholder:text-muted-foreground transition-colors",
  {
    variants: {
      variant: {
        default: "border-input hover:border-input/80 focus-visible:border-ring",
        error: "border-destructive focus-visible:ring-destructive hover:border-destructive/80",
      },
      size: {
        sm: "h-9 px-2 py-1 text-xs",
        md: "h-10 px-3 py-2 text-sm",
        lg: "h-11 px-4 py-3 text-base",
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
    VariantProps<typeof inputVariants>,
    FormProps {
  /**
   * Icon to display at the start of the input
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to display at the end of the input
   */
  endIcon?: React.ReactNode;
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
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-invalid': ariaInvalid,
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
      ariaDescribedby,
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
              priority === 'high' && "text-orange-600 dark:text-orange-400",
              priority === 'urgent' && "text-red-600 dark:text-red-400 font-semibold"
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-hidden="true">*</span>
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
            type={type}
            id={idToUse}
            value={value}
            onChange={handleChange}
            disabled={loading || props.disabled}
            className={cn(
              inputVariants({ variant: inputVariant, size }),
              startIcon && "pl-9",
              endIcon && "pr-9",
              loading && "cursor-wait",
              priority === 'high' && "border-orange-300 focus:border-orange-500 focus:ring-orange-500",
              priority === 'urgent' && "border-red-400 focus:border-red-600 focus:ring-red-600",
              className
            )}
            ref={ref}
            aria-describedby={finalAriaDescribedBy}
            aria-invalid={ariaInvalid ?? (hasError ? 'true' : undefined)}
            aria-required={required ? 'true' : undefined}
            aria-label={ariaLabel}
            data-testid={dataTestId}
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
        
        {/* Error display */}
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

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof inputVariants>,
    Pick<FormProps, 'label' | 'error' | 'helperText' | 'loading' | 'required' | 'priority'> {}

/**
 * Textarea component for multi-line text input.
 * 
 * @example
 * ```tsx
 * <Textarea 
 *   label="Description" 
 *   placeholder="Enter description"
 *   rows={4}
 * />
 * ```
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant, 
    size, 
    error, 
    label, 
    helperText,
    required,
    priority,
    id,
    ...props 
  }, ref) => {
    const textareaId = React.useId();
    const hasError = !!error;
    const textareaVariant = hasError ? "error" : variant;

    const textareaIdToUse = id || textareaId;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaIdToUse}
            className={cn(
              "block text-sm font-medium text-foreground mb-1",
              priority === 'high' && "text-orange-600 dark:text-orange-400",
              priority === 'urgent' && "text-red-600 dark:text-red-400 font-semibold"
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-hidden="true">*</span>
            )}
          </label>
        )}
        
        <textarea
          id={textareaIdToUse}
          className={cn(
            inputVariants({ variant: textareaVariant, size }),
            "min-h-[80px] resize-vertical",
            priority === 'high' && "border-orange-300 focus:border-orange-500 focus:ring-orange-500",
            priority === 'urgent' && "border-red-400 focus:border-red-600 focus:ring-red-600",
            className
          )}
          aria-invalid={hasError ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          ref={ref}
          {...props}
        />
        
        {helperText && !error && (
          <p className="mt-1 text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
        
        {error && (
          <p className="mt-1 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea, inputVariants };