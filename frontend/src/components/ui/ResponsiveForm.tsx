import React from 'react';
import { cn } from '../../utils/cn';

interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
  layout?: 'single' | 'two-column' | 'adaptive' | 'stepped';
  onSubmit?: (e: React.FormEvent) => void;
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({
  children,
  className,
  layout = 'adaptive',
  onSubmit
}) => {
  const layoutStyles = {
    single: 'space-y-6',
    'two-column': cn(
      'space-y-6',
      '@container/form-[min-width:_640px]:grid @container/form-[min-width:_640px]:grid-cols-2 @container/form-[min-width:_640px]:gap-6 @container/form-[min-width:_640px]:space-y-0'
    ),
    adaptive: cn(
      'space-y-4',
      '@container/form-[min-width:_400px]:space-y-6',
      '@container/form-[min-width:_768px]:grid @container/form-[min-width:_768px]:grid-cols-2 @container/form-[min-width:_768px]:gap-6 @container/form-[min-width:_768px]:space-y-0'
    ),
    stepped: 'space-y-8'
  };

  return (
    <form
      className={cn(
        'responsive-form',
        'container-type-inline-size',
        'w-full max-w-none',
        layoutStyles[layout],
        className
      )}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
};

interface ResponsiveFormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  span?: 'single' | 'double' | 'full';
}

export const ResponsiveFormSection: React.FC<ResponsiveFormSectionProps> = ({
  title,
  description,
  children,
  className,
  span = 'single'
}) => {
  const spanStyles = {
    single: '',
    double: '@container/form-[min-width:_768px]:col-span-2',
    full: 'col-span-full'
  };

  return (
    <div className={cn('responsive-form-section', spanStyles[span], className)}>
      {(title || description) && (
        <div className="form-section-header mb-4">
          {title && (
            <h3 className={cn(
              'form-section-title',
              'font-semibold text-foreground',
              'text-base @container/form-[min-width:_400px]:text-lg'
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(
              'form-section-description',
              'text-sm text-muted-foreground mt-1',
              '@container/form-[min-width:_400px]:text-base'
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className="form-section-content space-y-4">
        {children}
      </div>
    </div>
  );
};

interface ResponsiveFormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  layout?: 'stacked' | 'horizontal' | 'adaptive';
}

export const ResponsiveFormField: React.FC<ResponsiveFormFieldProps> = ({
  label,
  children,
  error,
  hint,
  required,
  className,
  layout = 'adaptive'
}) => {
  const layoutStyles = {
    stacked: 'space-y-2',
    horizontal: cn(
      'space-y-2',
      '@container/form-[min-width:_500px]:flex @container/form-[min-width:_500px]:items-start @container/form-[min-width:_500px]:space-y-0 @container/form-[min-width:_500px]:space-x-4'
    ),
    adaptive: cn(
      'space-y-2',
      '@container/form-[min-width:_600px]:flex @container/form-[min-width:_600px]:items-start @container/form-[min-width:_600px]:space-y-0 @container/form-[min-width:_600px]:space-x-4'
    )
  };

  const labelStyles = layout === 'stacked' 
    ? 'block text-sm font-medium text-foreground'
    : cn(
        'block text-sm font-medium text-foreground',
        '@container/form-[min-width:_500px]:w-1/3 @container/form-[min-width:_500px]:flex-shrink-0 @container/form-[min-width:_500px]:pt-2'
      );

  const fieldStyles = layout === 'stacked'
    ? ''
    : '@container/form-[min-width:_500px]:flex-1';

  return (
    <div className={cn('responsive-form-field', layoutStyles[layout], className)}>
      <label className={labelStyles}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <div className={cn('form-field-content', fieldStyles)}>
        {children}
        {hint && (
          <p className="form-field-hint text-xs text-muted-foreground mt-1">
            {hint}
          </p>
        )}
        {error && (
          <p className="form-field-error text-xs text-destructive mt-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

interface ResponsiveFormGroupProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
}

export const ResponsiveFormGroup: React.FC<ResponsiveFormGroupProps> = ({
  children,
  className,
  columns = 2
}) => {
  const columnStyles = {
    1: 'space-y-4',
    2: cn(
      'space-y-4',
      '@container/form-[min-width:_500px]:grid @container/form-[min-width:_500px]:grid-cols-2 @container/form-[min-width:_500px]:gap-4 @container/form-[min-width:_500px]:space-y-0'
    ),
    3: cn(
      'space-y-4',
      '@container/form-[min-width:_600px]:grid @container/form-[min-width:_600px]:grid-cols-2 @container/form-[min-width:_600px]:gap-4 @container/form-[min-width:_600px]:space-y-0',
      '@container/form-[min-width:_900px]:grid-cols-3'
    )
  };

  return (
    <div className={cn('responsive-form-group', columnStyles[columns], className)}>
      {children}
    </div>
  );
};

interface ResponsiveFormActionsProps {
  children: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'center' | 'right' | 'between';
  sticky?: boolean;
}

export const ResponsiveFormActions: React.FC<ResponsiveFormActionsProps> = ({
  children,
  className,
  alignment = 'right',
  sticky = false
}) => {
  const alignmentStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div className={cn(
      'responsive-form-actions',
      'flex items-center gap-3 pt-6 mt-6 border-t',
      // Responsive action layout
      'flex-col @container/form-[min-width:_400px]:flex-row',
      alignmentStyles[alignment],
      // Sticky positioning for mobile
      sticky && [
        'sticky bottom-0',
        'bg-background border-t',
        'p-4 -mx-4 -mb-4',
        '@container/form-[min-width:_400px]:static @container/form-[min-width:_400px]:bg-transparent @container/form-[min-width:_400px]:border-t-0 @container/form-[min-width:_400px]:p-0 @container/form-[min-width:_400px]:m-0'
      ],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const ResponsiveInput: React.FC<ResponsiveInputProps> = ({
  className,
  size = 'md',
  fullWidth = true,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm @container/form-[min-width:_400px]:px-4 @container/form-[min-width:_400px]:py-2.5',
    lg: 'px-4 py-3 text-base'
  };

  return (
    <input
      className={cn(
        'responsive-input',
        'border border-input bg-background',
        'rounded-md transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Touch-friendly sizing
        'min-h-[44px] @container/form-[min-width:_400px]:min-h-[40px]',
        fullWidth && 'w-full',
        sizeStyles[size],
        className
      )}
      {...props}
    />
  );
};

interface ResponsiveTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  autoResize?: boolean;
}

export const ResponsiveTextarea: React.FC<ResponsiveTextareaProps> = ({
  className,
  autoResize = false,
  ...props
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      const resizeTextarea = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      };
      
      textarea.addEventListener('input', resizeTextarea);
      resizeTextarea(); // Initial resize
      
      return () => textarea.removeEventListener('input', resizeTextarea);
    }
  }, [autoResize]);

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        'responsive-textarea',
        'w-full px-3 py-2 border border-input bg-background',
        'rounded-md transition-colors resize-vertical',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:cursor-not-allowed disabled:opacity-50',
        // Touch-friendly sizing
        'min-h-[88px] @container/form-[min-width:_400px]:min-h-[80px]',
        // Responsive padding
        '@container/form-[min-width:_400px]:px-4 @container/form-[min-width:_400px]:py-2.5',
        autoResize && 'resize-none',
        className
      )}
      {...props}
    />
  );
};
