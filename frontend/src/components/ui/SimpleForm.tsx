import React from 'react';
import { cn } from '../../utils/cn';

interface SimpleFormProps {
  children: React.ReactNode;
  className?: string;
  layout?: 'stack' | 'adaptive';
  onSubmit?: (e: React.FormEvent) => void;
}

/**
 * SIMPLIFIED: Form component using CSS utilities instead of complex container queries
 * 
 * Before: 200+ lines of complex responsive logic with container queries
 * After: Simple form with CSS utility classes
 */
export const SimpleForm: React.FC<SimpleFormProps> = ({
  children,
  className,
  layout = 'adaptive',
  onSubmit
}) => {
  const layoutClasses = {
    stack: 'form-stack',
    adaptive: 'form-adaptive'
  };

  return (
    <form 
      className={cn(layoutClasses[layout], className)}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
};

interface SimpleFormFieldProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  layout?: 'vertical' | 'horizontal';
}

/**
 * SIMPLIFIED: Form field component with essential functionality only
 */
export const SimpleFormField: React.FC<SimpleFormFieldProps> = ({
  children,
  className,
  label,
  error,
  hint,
  required = false,
  layout = 'vertical'
}) => {
  const layoutClasses = {
    vertical: 'form-field',
    horizontal: 'form-field-horizontal'
  };

  return (
    <div className={cn(layoutClasses[layout], className)}>
      {label && (
        <label className="font-medium text-sm">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <div className="flex-1">
        {children}
        {hint && (
          <p className="text-xs text-muted-foreground mt-1">
            {hint}
          </p>
        )}
        {error && (
          <p className="text-xs text-destructive mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

interface SimpleFormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * SIMPLIFIED: Form actions component
 */
export const SimpleFormActions: React.FC<SimpleFormActionsProps> = ({
  children,
  className,
  align = 'right'
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  return (
    <div className={cn('form-actions', alignClasses[align], className)}>
      {children}
    </div>
  );
};

/**
 * Example usage:
 * 
 * <SimpleForm layout="adaptive">
 *   <SimpleFormField label="Name" required>
 *     <input type="text" className="input-fluid" />
 *   </SimpleFormField>
 *   
 *   <SimpleFormField label="Email" hint="We'll never share your email">
 *     <input type="email" className="input-fluid" />
 *   </SimpleFormField>
 *   
 *   <SimpleFormActions>
 *     <button type="submit" className="btn btn-primary">Submit</button>
 *   </SimpleFormActions>
 * </SimpleForm>
 */

export { SimpleForm as ResponsiveForm }; // Alias for backward compatibility
export { SimpleFormField as ResponsiveFormField };
export { SimpleFormActions as ResponsiveFormActions };
