import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const progressVariants = cva(
  "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        success: "bg-success/20",
        warning: "bg-warning/20",
        error: "bg-error/20",
      },
      size: {
        sm: "h-2",
        md: "h-4",
        lg: "h-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-success",
        warning: "bg-warning",
        error: "bg-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  /**
   * The progress value (0-100)
   */
  value?: number;
  /**
   * Whether to show the percentage text
   */
  showValue?: boolean;
  /**
   * Custom indicator class name
   */
  indicatorClassName?: string;
}

/**
 * Progress component with animations and variants.
 * 
 * @example
 * ```tsx
 * <Progress value={75} variant="success" size="lg" showValue />
 * ```
 */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, variant, size, value, showValue, indicatorClassName, ...props }, ref) => (
  <div className="relative">
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(progressVariants({ variant, size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          progressIndicatorVariants({ variant }),
          indicatorClassName
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
    
    {showValue && (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-foreground/80">
          {Math.round(value || 0)}%
        </span>      </div>
    )}
  </div>
));

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress, progressVariants };