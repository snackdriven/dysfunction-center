// Enhanced form components with complete ARIA implementation
// for Executive Dysfunction Center accessibility compliance

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils/cn';

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  helpText?: string;
  error?: string;
  success?: string;
  className?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export const AccessibleFormField: React.FC<FormFieldProps> = ({
  id,
  name,
  label,
  type = 'text',
  required = false,
  disabled = false,
  placeholder,
  value,
  defaultValue,
  helpText,
  error,
  success,
  className,
  onChange,
  onBlur,
  onFocus
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [hasBeenBlurred, setHasBeenBlurred] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const helpTextId = `${id}-help`;
  const errorId = `${id}-error`;
  const successId = `${id}-success`;
  
  const currentValue = value !== undefined ? value : internalValue;
  const showError = error && hasBeenBlurred;
  const showSuccess = success && hasBeenBlurred && !error;
  
  // Build aria-describedby string
  const buildAriaDescribedBy = () => {
    const ids = [];
    if (helpText) ids.push(helpTextId);
    if (showError) ids.push(errorId);
    if (showSuccess) ids.push(successId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    setHasBeenBlurred(true);
    onBlur?.();
  };
  
  return (
    <div className={cn('form-field-container', className)}>
      <label
        htmlFor={id}
        className={cn(
          'block text-sm font-medium mb-2 transition-colors',
          disabled ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100',
          required && 'after:content-["*"] after:ml-1 after:text-red-500'
        )}
      >
        {label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={name}
          type={type}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-required={required}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={buildAriaDescribedBy()}
          className={cn(
            'w-full px-3 py-2 border rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'min-h-[44px]', // Touch target compliance
            disabled && 'bg-gray-100 cursor-not-allowed',
            showError && 'border-red-500 focus:ring-red-500',
            showSuccess && 'border-green-500 focus:ring-green-500',
            !showError && !showSuccess && 'border-gray-300 dark:border-gray-600'
          )}
        />
        
        {/* Visual indicators */}
        {showError && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {showSuccess && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Help text */}
      {helpText && (
        <p
          id={helpTextId}
          className="mt-1 text-sm text-gray-600 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
      
      {/* Error message with live region */}
      {showError && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
      
      {/* Success message with live region */}
      {showSuccess && (
        <p
          id={successId}
          role="status"
          aria-live="polite"
          className="mt-1 text-sm text-green-600 dark:text-green-400"
        >
          {success}
        </p>
      )}
    </div>
  );
};

// Accessible form group with fieldset and legend
interface AccessibleFormGroupProps {
  legend: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

export const AccessibleFormGroup: React.FC<AccessibleFormGroupProps> = ({
  legend,
  description,
  children,
  className,
  required = false
}) => {
  const groupId = `form-group-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = description ? `${groupId}-description` : undefined;
  
  return (
    <fieldset
      className={cn(
        'border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4',
        className
      )}
      aria-describedby={descriptionId}
    >
      <legend className={cn(
        'text-base font-semibold px-2 text-gray-900 dark:text-gray-100',
        required && 'after:content-["*"] after:ml-1 after:text-red-500'
      )}>
        {legend}
      </legend>
      
      {description && (
        <p
          id={descriptionId}
          className="text-sm text-gray-600 dark:text-gray-400 mb-4"
        >
          {description}
        </p>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </fieldset>
  );
};

// Accessible select component
interface AccessibleSelectProps {
  id: string;
  name: string;
  label: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  error?: string;
  className?: string;
  onChange?: (value: string) => void;
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  id,
  name,
  label,
  options,
  value,
  defaultValue,
  required = false,
  disabled = false,
  placeholder,
  helpText,
  error,
  className,
  onChange
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const helpTextId = `${id}-help`;
  const errorId = `${id}-error`;
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const buildAriaDescribedBy = () => {
    const ids = [];
    if (helpText) ids.push(helpTextId);
    if (error) ids.push(errorId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };
  
  return (
    <div className={cn('form-field-container', className)}>
      <label
        htmlFor={id}
        className={cn(
          'block text-sm font-medium mb-2',
          disabled ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100',
          required && 'after:content-["*"] after:ml-1 after:text-red-500'
        )}
      >
        {label}
      </label>
      
      <select
        id={id}
        name={name}
        value={currentValue}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={buildAriaDescribedBy()}
        className={cn(
          'w-full px-3 py-2 border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'min-h-[44px]', // Touch target compliance
          'bg-white dark:bg-gray-800',
          disabled && 'bg-gray-100 cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          !error && 'border-gray-300 dark:border-gray-600'
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      
      {helpText && (
        <p
          id={helpTextId}
          className="mt-1 text-sm text-gray-600 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
      
      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible textarea component
interface AccessibleTextareaProps {
  id: string;
  name: string;
  label: string;
  rows?: number;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  helpText?: string;
  error?: string;
  maxLength?: number;
  className?: string;
  onChange?: (value: string) => void;
}

export const AccessibleTextarea: React.FC<AccessibleTextareaProps> = ({
  id,
  name,
  label,
  rows = 3,
  value,
  defaultValue,
  required = false,
  disabled = false,
  placeholder,
  helpText,
  error,
  maxLength,
  className,
  onChange
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const helpTextId = `${id}-help`;
  const errorId = `${id}-error`;
  const countId = `${id}-count`;
  
  const currentValue = value !== undefined ? value : internalValue;
  const characterCount = currentValue.length;
  
  const buildAriaDescribedBy = () => {
    const ids = [];
    if (helpText) ids.push(helpTextId);
    if (error) ids.push(errorId);
    if (maxLength) ids.push(countId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };
  
  return (
    <div className={cn('form-field-container', className)}>
      <label
        htmlFor={id}
        className={cn(
          'block text-sm font-medium mb-2',
          disabled ? 'text-gray-400' : 'text-gray-900 dark:text-gray-100',
          required && 'after:content-["*"] after:ml-1 after:text-red-500'
        )}
      >
        {label}
      </label>
      
      <textarea
        id={id}
        name={name}
        rows={rows}
        value={currentValue}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={buildAriaDescribedBy()}
        className={cn(
          'w-full px-3 py-2 border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          'resize-vertical min-h-[88px]', // Touch target compliance for minimum height
          disabled && 'bg-gray-100 cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          !error && 'border-gray-300 dark:border-gray-600'
        )}
      />
      
      {helpText && (
        <p
          id={helpTextId}
          className="mt-1 text-sm text-gray-600 dark:text-gray-400"
        >
          {helpText}
        </p>
      )}
      
      {maxLength && (
        <p
          id={countId}
          className="mt-1 text-sm text-gray-500 dark:text-gray-400 text-right"
          aria-live="polite"
        >
          {characterCount} / {maxLength} characters
        </p>
      )}
      
      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
};

export {
  AccessibleFormField as FormField,
  AccessibleFormGroup as FormGroup,
  AccessibleSelect as Select,
  AccessibleTextarea as Textarea
};
