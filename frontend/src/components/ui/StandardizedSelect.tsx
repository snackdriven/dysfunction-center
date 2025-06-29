import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "../../utils/cn";
import { FormComponentProps, ValidationProps, EventHandlerProps, LoadingStateProps } from "../../types/components";

const selectVariants = cva(
  "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-background text-foreground transition-colors",
  {
    variants: {
      variant: {
        default: "border-input hover:border-input/80 focus-visible:border-ring",
        error: "border-error focus-visible:ring-error hover:border-error/80",
        success: "border-success focus-visible:ring-success hover:border-success/80",
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

interface SelectOption {
  value: string | number;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface StandardizedSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'>,
    VariantProps<typeof selectVariants>,
    FormComponentProps,
    ValidationProps,
    EventHandlerProps,
    LoadingStateProps {
  /**
   * Select options
   */
  options: SelectOption[];
  /**
   * Selected value
   */
  value?: string | number;
  /**
   * Change handler with standardized signature
   */
  onChange?: (value: string | number, option: SelectOption, event: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  /**
   * Whether to show a search/filter input
   */
  searchable?: boolean;
  /**
   * Maximum height for the options dropdown
   */
  maxHeight?: number;
  /**
   * Whether to allow clearing the selection
   */
  clearable?: boolean;
  /**
   * Custom empty state text
   */
  emptyText?: string;
  /**
   * Whether to show option descriptions
   */
  showDescriptions?: boolean;
}

/**
 * Standardized Select component for choosing from a list of options.
 * 
 * @example
 * ```tsx
 * <StandardizedSelect 
 *   label="Priority Level" 
 *   options={[
 *     { value: 'low', label: 'Low Priority', description: 'Can wait' },
 *     { value: 'high', label: 'High Priority', description: 'Urgent' }
 *   ]}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */
export const StandardizedSelect = React.forwardRef<HTMLSelectElement, StandardizedSelectProps>(
  ({ 
    className, 
    variant, 
    size, 
    error, 
    label, 
    helperText, 
    options,
    value,
    onChange,
    placeholder = "Select an option...",
    searchable = false,
    clearable = false,
    emptyText = "No options available",
    showDescriptions = false,
    estimatedTime,
    complexity,
    examples,
    helpText,
    id,
    required,
    loading,
    loadingText,
    validationState,
    showRequired,
    'data-testid': dataTestId,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedby,
    'aria-labelledby': ariaLabelledby,
    difficulty,
    priority,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const selectId = React.useId();
    const listboxId = React.useId();
    
    const hasError = !!(error || validationState === 'invalid');
    const selectVariant = hasError ? "error" : validationState === 'valid' ? "success" : variant;

    const idToUse = id || selectId;
    const descriptionId = `${idToUse}-description`;
    const errorId = `${idToUse}-error`;

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
      if (!searchQuery) return options;
      return options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [options, searchQuery]);

    // Find selected option
    const selectedOption = options.find(option => option.value === value);

    // Handle option selection
    const handleSelect = React.useCallback((option: SelectOption) => {
      if (option.disabled) return;
      
      setIsOpen(false);
      setSearchQuery("");
      
      if (onChange) {
        const mockEvent = {
          target: { value: option.value }
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(option.value, option, mockEvent);
      }
    }, [onChange]);

    // Handle clear selection
    const handleClear = React.useCallback((event: React.MouseEvent) => {
      event.stopPropagation();
      setSearchQuery("");
      
      if (onChange) {
        const mockEvent = {
          target: { value: "" }
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange("", { value: "", label: "" }, mockEvent);
      }
    }, [onChange]);

    // Build aria-describedby
    const ariaDescribedByParts = [
      ariaDescribedby,
      (helperText || helpText || examples) && descriptionId,
      error && errorId
    ].filter(Boolean);
    
    const finalAriaDescribedBy = ariaDescribedByParts.length > 0 ? ariaDescribedByParts.join(' ') : undefined;

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(`[data-select-id="${idToUse}"]`)) {
          setIsOpen(false);
          setSearchQuery("");
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen, idToUse]);

    return (
      <div className="w-full" data-select-id={idToUse}>
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
            {(required || showRequired) && (
              <span className="text-red-500 ml-1" aria-hidden="true">*</span>
            )}
            {estimatedTime && (
              <span className="text-xs text-muted-foreground ml-2">
                ({estimatedTime}min)
              </span>
            )}
            {difficulty && (
              <span className={cn(
                "text-xs ml-2 px-1.5 py-0.5 rounded",
                difficulty === 'easy' && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                difficulty === 'medium' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
                difficulty === 'hard' && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
              )}>
                {difficulty}
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          {/* Select trigger */}
          <button
            type="button"
            id={idToUse}
            className={cn(
              selectVariants({ variant: selectVariant, size, className }),
              loading && "cursor-wait",
              complexity === 'complex' && "min-h-[3rem]",
              priority === 'high' && "border-orange-300 focus:border-orange-500 focus:ring-orange-500",
              priority === 'urgent' && "border-red-400 focus:border-red-600 focus:ring-red-600"
            )}
            onClick={() => !loading && !props.disabled && setIsOpen(!isOpen)}
            disabled={loading || props.disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={ariaLabelledby}
            aria-label={ariaLabel}
            aria-describedby={finalAriaDescribedBy}
            aria-invalid={hasError ? 'true' : undefined}
            aria-required={required ? 'true' : undefined}
            data-testid={dataTestId}
          >
            <span className={cn(
              "truncate",
              !selectedOption && "text-muted-foreground"
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            
            <div className="flex items-center gap-2">
              {loading && (
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
              )}
              
              {clearable && selectedOption && !loading && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Clear selection"
                >
                  ×
                </button>
              )}
              
              {!loading && (
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform",
                  isOpen && "rotate-180"
                )} />
              )}
            </div>
          </button>

          {/* Options dropdown */}
          {isOpen && !loading && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
              {searchable && (
                <div className="p-2 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search options..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1 text-sm bg-background border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}
              
              <div
                role="listbox"
                id={listboxId}
                aria-labelledby={idToUse}
              >
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {emptyText}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={option.value === value}
                      disabled={option.disabled}
                      onClick={() => handleSelect(option)}
                      className={cn(
                        "w-full px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none",
                        option.value === value && "bg-primary/10 text-primary",
                        option.disabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{option.label}</div>
                          {showDescriptions && option.description && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">
                              {option.description}
                            </div>
                          )}
                        </div>
                        {option.value === value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Helper content */}
        {(helperText || helpText || examples) && !error && (
          <div id={descriptionId} className="mt-1 space-y-1">
            {(helperText || helpText) && (
              <p className="text-xs text-muted-foreground">
                {helperText || helpText}
              </p>
            )}
            {examples && examples.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <span>Examples: </span>
                <span className="font-mono">{examples.join(', ')}</span>
              </div>
            )}
            {complexity === 'complex' && (
              <p className="text-xs text-blue-600 dark:text-blue-400">
                💡 Take your time with this selection. You can search to find options faster.
              </p>
            )}
          </div>
        )}
        
        {/* Error display */}
        {error && (
          <p id={errorId} className="mt-1 text-xs text-error" role="alert">
            {error}
          </p>
        )}
        
        {/* Loading text */}
        {loading && loadingText && (
          <p className="mt-1 text-xs text-muted-foreground">
            {loadingText}
          </p>
        )}
        
        {/* Hidden native select for form submission */}
        <select
          ref={ref}
          name={props.name}
          value={value || ""}
          onChange={() => {}} // Handled by custom dropdown
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

StandardizedSelect.displayName = "StandardizedSelect";

export default StandardizedSelect;