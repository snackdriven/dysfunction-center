import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { LayoutProps } from "../../types/components";

const layoutVariants = cva(
  "w-full",
  {
    variants: {
      layout: {
        flex: "flex",
        grid: "grid",
      },
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-2", 
        3: "grid-cols-3",
        4: "grid-cols-4",
        6: "grid-cols-6",
        12: "grid-cols-12",
      },
      gap: {
        sm: "gap-2",
        md: "gap-4", 
        lg: "gap-6",
      },
      width: {
        sm: "max-w-sm mx-auto",
        md: "max-w-md mx-auto",
        lg: "max-w-4xl mx-auto",
        xl: "max-w-6xl mx-auto",
        full: "max-w-full",
      },
      centered: {
        true: "mx-auto",
        false: "",
      },
    },
    defaultVariants: {
      layout: "flex",
      gap: "md",
      width: "full",
      centered: false,
    },
  }
);

/**
 * Simplified Layout component for essential layout patterns.
 * Replaces the over-engineered Grid, GridItem, Stack, and Container components.
 * 
 * @example
 * ```tsx
 * // Grid layout
 * <Layout layout="grid" cols={3} gap="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Layout>
 * 
 * // Flex layout (default)
 * <Layout gap="md" width="lg">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 * </Layout>
 * 
 * // Container
 * <Layout width="lg" centered>
 *   <h1>Centered Content</h1>
 * </Layout>
 * ```
 */
export const Layout = React.forwardRef<HTMLDivElement, LayoutProps>(
  ({
    className,
    children,
    layout = "flex",
    cols,
    gap = "md",
    width = "full",
    centered = false,
    'data-testid': dataTestId,
    style,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          layoutVariants({ layout, cols, gap, width, centered }),
          layout === "flex" && "flex-col", // Default flex direction
          className
        )}
        style={style}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Layout.displayName = "Layout";

export { layoutVariants };