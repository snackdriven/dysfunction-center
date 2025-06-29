import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 active:transition-transform select-none min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 hover-lift",
        secondary: "bg-gray-100 text-gray-900 border border-gray-200 shadow-sm hover:bg-gray-200 hover:shadow-md hover-lift dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md hover:shadow-lg hover:from-red-700 hover:to-red-800 hover-lift",
        outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 shadow-sm hover:shadow-md hover-lift dark:bg-gray-900 dark:border-gray-600 dark:hover:bg-gray-800",
        ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100 hover-lift",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 focus-visible:ring-1 min-h-auto min-w-auto",
        success: "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-md hover:shadow-lg hover:from-green-700 hover:to-green-800 hover-lift",
        warning: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-md hover:shadow-lg hover:from-yellow-600 hover:to-yellow-700 hover-lift",
        prominent: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200 font-semibold border-2 border-indigo-400",
      },
      size: {
        sm: "h-10 rounded-md px-3 text-xs",
        md: "h-12 px-4 py-2",
        lg: "h-14 rounded-md px-8 text-base",
        icon: "h-12 w-12",
      },
      difficulty: {
        easy: "border-l-4 border-green-500",
        medium: "border-l-4 border-yellow-500",
        hard: "border-l-4 border-red-500",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * If true, the button will be rendered as a child within the component.
   * This child component must be a valid React component.
   */
  asChild?: boolean;
  /**
   * If true, the button will show a loading state
   */
  loading?: boolean;
  /**
   * Accessible label for screen readers
   */
  ariaLabel?: string;
  /**
   * ID of element that describes this button
   */
  ariaDescribedBy?: string;
  /**
   * Estimated time to complete action (in minutes)
   */
  estimatedTime?: number;
  /**
   * Difficulty level for executive dysfunction support
   */
  difficulty?: 'easy' | 'medium' | 'hard';
  /**
   * Indicates if button has a popup (menu, listbox, tree, grid, dialog)
   */
  ariaHasPopup?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  /**
   * ID of element(s) this button controls
   */
  ariaControls?: string;
  /**
   * Indicates if button is pressed (for toggle buttons)
   */
  ariaPressed?: boolean;
  /**
   * Indicates if expandable content is expanded
   */
  ariaExpanded?: boolean;
}

/**
 * Button component for user interactions.
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md">
 *   Click me
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    difficulty,
    asChild = false, 
    loading = false,
    disabled,
    ariaLabel,
    ariaDescribedBy,
    estimatedTime,
    ariaHasPopup,
    ariaControls,
    ariaPressed,
    ariaExpanded,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const isDisabled = disabled || loading;
    
    // Generate ARIA description for screen readers
    const getAriaDescription = () => {
      const parts = [];
      if (estimatedTime) {
        parts.push(`Estimated time: ${estimatedTime} minutes`);
      }
      if (difficulty) {
        parts.push(`Difficulty: ${difficulty}`);
      }
      return parts.length > 0 ? parts.join(', ') : undefined;
    };
    
    const ariaDescription = getAriaDescription();
    const buttonId = props.id || `button-${Math.random().toString(36).substr(2, 9)}`;
    
    return (
      <>
        <Comp
          className={cn(buttonVariants({ variant, size, difficulty, className }))}
          ref={ref}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy || (ariaDescription ? `${buttonId}-description` : undefined)}
          aria-haspopup={ariaHasPopup}
          aria-controls={ariaControls}
          aria-pressed={ariaPressed}
          aria-expanded={ariaExpanded}
          data-difficulty={difficulty}
          data-estimated-time={estimatedTime}
          id={buttonId}
          {...props}
        >
          {loading && (
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {children}
        </Comp>
        {ariaDescription && (
          <span 
            id={`${buttonId}-description`} 
            className="sr-only"
          >
            {ariaDescription}
          </span>
        )}
      </>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };