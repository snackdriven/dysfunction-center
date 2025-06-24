import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "shadow-sm",
        elevated: "shadow-md",
        outline: "border-2",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * Whether the card should be interactive (hover effects)
   */
  interactive?: boolean;
}

/**
 * Card component for content containers.
 * 
 * @example
 * ```tsx
 * <Card variant="elevated" padding="lg">
 *   <CardHeader>
 *     <CardTitle>Title</CardTitle>
 *   </CardHeader>
 *   <CardContent>
 *     Content goes here
 *   </CardContent>
 * </Card>
 * ```
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding }),
        interactive && "cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Card header section with consistent spacing.
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * The heading level
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Card title with proper typography.
 */
const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, level = 3, children, ...props }, ref) => {
    const Component = `h${level}` as const;
    
    return (
      <Component
        ref={ref}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight",
          {
            "text-2xl": level === 1,
            "text-xl": level === 2,
            "text-lg": level === 3,
            "text-base": level === 4,
            "text-sm": level === 5,
            "text-xs": level === 6,
          },
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * Card description with muted text styling.
 */
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Card content area with consistent spacing.
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("pt-0", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Card footer section with consistent spacing.
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center pt-0", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};