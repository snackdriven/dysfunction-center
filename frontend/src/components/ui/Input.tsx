import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const inputVariants = cva(
  "flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-error focus-visible:ring-error",
        success: "border-success focus-visible:ring-success",
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
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Label for the input
   */
  label?: string;
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
    ...props 
  }, ref) => {
    const inputId = React.useId();
    const hasError = !!error;
    const inputVariant = hasError ? "error" : variant;

    const idToUse = id || inputId;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={idToUse}
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
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
            className={cn(
              inputVariants({ variant: inputVariant, size, className }),
              startIcon && "pl-9",
              endIcon && "pr-9"
            )}
            ref={ref}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-error" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Label for the textarea
   */
  label?: string;
  /**
   * Helper text to display below the textarea
   */
  helperText?: string;
}

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
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaIdToUse}
          className={cn(
            inputVariants({ variant: textareaVariant, size, className }),
            "min-h-[80px] resize-vertical"
          )}
          ref={ref}
          {...props}
        />
        
        {(error || helperText) && (
          <p className={cn(
            "mt-1 text-xs",
            error ? "text-error" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea, inputVariants };