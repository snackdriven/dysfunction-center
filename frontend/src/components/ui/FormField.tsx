import React from 'react';
import { cn } from '../../utils/cn';
import { AlertCircle, HelpCircle, Clock, Zap } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  estimatedTime?: number;
  complexity?: 'simple' | 'moderate' | 'complex';
  helpText?: string;
  examples?: string[];
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const ComplexityIndicator: React.FC<{ 
  complexity?: 'simple' | 'moderate' | 'complex';
  estimatedTime?: number;
}> = ({ complexity, estimatedTime }) => {
  if (!complexity && !estimatedTime) return null;

  const complexityConfig = {
    simple: { 
      color: 'text-green-600 bg-green-50 border-green-200', 
      icon: '●', 
      label: 'Simple'
    },
    moderate: { 
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
      icon: '●●', 
      label: 'Moderate'
    },
    complex: { 
      color: 'text-red-600 bg-red-50 border-red-200', 
      icon: '●●●', 
      label: 'Complex'
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs">
      {complexity && (
        <span className={cn(
          'inline-flex items-center px-2 py-1 rounded-full border font-medium',
          complexityConfig[complexity].color
        )}>
          <span aria-hidden="true" className="mr-1">
            {complexityConfig[complexity].icon}
          </span>
          {complexityConfig[complexity].label}
        </span>
      )}
      {estimatedTime && (
        <span className="inline-flex items-center text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
          ~{estimatedTime} min
        </span>
      )}
    </div>
  );
};

const FieldDescription: React.FC<{ 
  description?: string;
  helpText?: string;
  examples?: string[];
  id: string;
}> = ({ description, helpText, examples, id }) => {
  if (!description && !helpText && (!examples || examples.length === 0)) {
    return null;
  }

  return (
    <div id={id} className="space-y-2 text-sm text-muted-foreground">
      {description && (
        <p>{description}</p>
      )}
      
      {helpText && (
        <div className="flex items-start gap-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
          <HelpCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-blue-700 dark:text-blue-300">{helpText}</p>
        </div>
      )}

      {examples && examples.length > 0 && (
        <div className="space-y-1">
          <p className="font-medium text-muted-foreground">Examples:</p>
          <ul className="space-y-1 ml-4">
            {examples.map((example, index) => (
              <li key={index} className="text-muted-foreground list-disc">
                "{example}"
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const FieldError: React.FC<{ error?: string; id: string }> = ({ error, id }) => {
  if (!error) return null;

  return (
    <div 
      id={id}
      className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-2"
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
};

const FormField: React.FC<FormFieldProps> = ({
  label,
  description,
  error,
  required = false,
  estimatedTime,
  complexity,
  helpText,
  examples,
  children,
  className,
  id: providedId
}) => {
  const fieldId = providedId || `field-${Math.random().toString(36).substr(2, 9)}`;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;

  // Clone children to add accessibility props
  const enhancedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const childProps: any = {
        id: fieldId,
        'aria-describedby': [
          (description || helpText || examples) && descriptionId,
          error && errorId
        ].filter(Boolean).join(' ') || undefined,
        'aria-invalid': error ? 'true' : undefined,
        'aria-required': required ? 'true' : undefined,
      };

      // Ensure touch target compliance for input elements
      if (['input', 'textarea', 'select', 'button'].includes(
        (child.type as any)?.toLowerCase?.() || child.type as string
      )) {
        childProps.className = cn(
          child.props.className,
          'min-h-[44px]' // Touch target compliance
        );
      }

      return React.cloneElement(child, childProps);
    }
    return child;
  });

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label and metadata */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <label 
            htmlFor={fieldId}
            className="block text-sm font-medium text-foreground mb-2"
          >
            {label}
            {required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
          
          <ComplexityIndicator 
            complexity={complexity} 
            estimatedTime={estimatedTime} 
          />
        </div>

        {(complexity === 'complex' || (estimatedTime && estimatedTime > 10)) && (
          <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
            <Zap className="h-3 w-3" aria-hidden="true" />
            Take your time
          </div>
        )}
      </div>

      {/* Description and help text */}
      <FieldDescription
        description={description}
        helpText={helpText}
        examples={examples}
        id={descriptionId}
      />

      {/* Form control */}
      <div className="space-y-1">
        {enhancedChildren}
        <FieldError error={error} id={errorId} />
      </div>

      {/* Executive dysfunction support */}
      {complexity === 'complex' && (
        <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded border">
          <p className="font-medium mb-1">💡 Executive Dysfunction Tip:</p>
          <p>
            This field might take some thinking. Feel free to save a draft and come back to it later if needed.
          </p>
        </div>
      )}
    </div>
  );
};

// Export individual components for flexibility
export { FormField, FieldDescription, FieldError, ComplexityIndicator };
export default FormField;