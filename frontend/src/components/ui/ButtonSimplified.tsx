import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 select-none min-h-[44px] min-w-[44px]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline min-h-auto min-w-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
   * Loading text to show when loading is true
   */
  loadingText?: string;
  /**
   * Icon to show at the start of the button
   */
  startIcon?: React.ReactNode;
  /**
   * Icon to show at the end of the button
   */
  endIcon?: React.ReactNode;
  /**
   * Priority level for executive dysfunction support
   */
  priority?: 'high' | 'urgent';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    startIcon,
    endIcon,
    priority,
    disabled,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Determine if button should be disabled
    const isDisabled = disabled || loading;
    
    // Handle priority styling
    const priorityClasses = cn(
      priority === 'high' && "ring-2 ring-red-400 ring-offset-2",
      priority === 'urgent' && "ring-2 ring-red-600 ring-offset-2 font-semibold"
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), priorityClasses)}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {!loading && startIcon && (
          <span className="mr-2">{startIcon}</span>
        )}
        
        {loading && loadingText ? loadingText : children}
        
        {!loading && endIcon && (
          <span className="ml-2">{endIcon}</span>
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
