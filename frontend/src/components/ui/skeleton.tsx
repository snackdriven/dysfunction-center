import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        default: "",
        rounded: "rounded-full",
        text: "rounded-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {}

/**
 * Skeleton component for loading state placeholders.
 * 
 * @example
 * ```tsx
 * <Skeleton className="h-4 w-[250px]" />
 * <Skeleton variant="rounded" className="h-12 w-12" />
 * ```
 */
function Skeleton({ className, variant, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
