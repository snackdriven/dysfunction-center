import * as React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'prominent';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Priority level for attention management (executive dysfunction support) */
  priority?: 'high' | 'urgent';
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
    variant = 'default',
    size = 'md',
    loading = false,
    priority,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    // Simple variant classes
    const variantClasses = {
      default: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-600 text-white hover:bg-gray-700",
      outline: "border border-gray-300 bg-white hover:bg-gray-50",
      ghost: "bg-transparent hover:bg-gray-100 text-gray-900",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      link: "bg-transparent text-blue-600 underline hover:text-blue-800 px-0 py-0 min-w-0 min-h-0",
      prominent: "bg-yellow-400 text-black font-bold shadow hover:bg-yellow-500",
    };

    // Simple size classes
    const sizeClasses = {
      sm: "h-9 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-base",
      icon: "h-9 w-9 p-0 flex items-center justify-center",
    };
    
    return (
      <button
        {...props}
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
          // Variant styles
          variantClasses[variant],
          // Size styles
          sizeClasses[size],
          // Priority styles (executive dysfunction support)
          priority === 'high' && "ring-2 ring-orange-400",
          priority === 'urgent' && "ring-2 ring-red-500",
          className
        )}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin border-2 border-gray-300 border-t-current rounded-full" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };