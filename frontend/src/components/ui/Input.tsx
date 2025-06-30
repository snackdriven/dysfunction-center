import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below the field */
  helperText?: string;
  /** Whether the component is in a loading state */
  loading?: boolean;
  /** Icon to display at the start of the input */
  startIcon?: React.ReactNode;
  /** Icon to display at the end of the input */
  endIcon?: React.ReactNode;
  /** Priority level for attention management (executive dysfunction support) */
  priority?: 'high' | 'urgent';
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
    type = "text", 
    error, 
    label, 
    helperText, 
    startIcon, 
    endIcon,
    id,
    required,
    loading,
    priority,
    ...props 
  }, ref) => {
    const inputId = React.useId();
    const hasError = !!error;
    const idToUse = id || inputId;
    const descriptionId = `${idToUse}-description`;
    const errorId = `${idToUse}-error`;

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
              "block text-sm font-medium mb-1",
              priority === 'high' && "text-orange-600",
              priority === 'urgent' && "text-red-600 font-semibold"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {startIcon}
            </div>
          )}
          
          <input
            {...props}
            type={type}
            id={idToUse}
            disabled={loading || props.disabled}
            className={cn(
              "flex w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
              hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300",
              startIcon && "pl-9",
              endIcon && "pr-9",
              loading && "cursor-wait",
              priority === 'high' && "border-orange-400 focus:ring-orange-500",
              priority === 'urgent' && "border-red-500 focus:ring-red-500",
              className
            )}
            ref={ref}
            aria-describedby={finalAriaDescribedBy}
            aria-invalid={hasError}
            aria-required={required}
          />
          
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full" />
            </div>
          )}
          
          {!loading && endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {endIcon}
            </div>
          )}
        </div>
        
        {helperText && !error && (
          <p id={descriptionId} className="mt-1 text-xs text-gray-600">
            {helperText}
          </p>
        )}
        
        {error && (
          <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Field label */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below the field */
  helperText?: string;
  /** Priority level for attention management */
  priority?: 'high' | 'urgent';
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
    const textareaIdToUse = id || textareaId;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaIdToUse}
            className={cn(
              "block text-sm font-medium mb-1",
              priority === 'high' && "text-orange-600",
              priority === 'urgent' && "text-red-600 font-semibold"
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          {...props}
          id={textareaIdToUse}
          className={cn(
            "flex w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-vertical",
            hasError ? "border-red-500 focus:ring-red-500" : "border-gray-300",
            priority === 'high' && "border-orange-400 focus:ring-orange-500",
            priority === 'urgent' && "border-red-500 focus:ring-red-500",
            className
          )}
          aria-invalid={hasError}
          aria-required={required}
          ref={ref}
        />
        
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-600">
            {helperText}
          </p>
        )}
        
        {error && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };