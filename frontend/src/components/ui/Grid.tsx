import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { LayoutComponentProps, AnimationProps, ThemeProps } from "../../types/components";

const gridVariants = cva(
  "grid w-full",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
        12: "grid-cols-12",
        auto: "grid-cols-[repeat(auto-fit,minmax(250px,1fr))]",
        'auto-sm': "grid-cols-[repeat(auto-fit,minmax(200px,1fr))]",
        'auto-lg': "grid-cols-[repeat(auto-fit,minmax(300px,1fr))]",
      },
      gap: {
        none: "gap-0",
        xs: "gap-1",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
      responsive: {
        true: "",
        false: "",
      },
    },
    defaultVariants: {
      cols: "auto",
      gap: "md",
      responsive: true,
    },
  }
);

const responsiveGridVariants = cva("", {
  variants: {
    smCols: {
      1: "sm:grid-cols-1",
      2: "sm:grid-cols-2",
      3: "sm:grid-cols-3",
      4: "sm:grid-cols-4",
      6: "sm:grid-cols-6",
      12: "sm:grid-cols-12",
    },
    mdCols: {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
      4: "md:grid-cols-4",
      6: "md:grid-cols-6",
      12: "md:grid-cols-12",
    },
    lgCols: {
      1: "lg:grid-cols-1",
      2: "lg:grid-cols-2",
      3: "lg:grid-cols-3",
      4: "lg:grid-cols-4",
      6: "lg:grid-cols-6",
      12: "lg:grid-cols-12",
    },
    xlCols: {
      1: "xl:grid-cols-1",
      2: "xl:grid-cols-2",
      3: "xl:grid-cols-3",
      4: "xl:grid-cols-4",
      6: "xl:grid-cols-6",
      12: "xl:grid-cols-12",
    },
  },
});

export interface GridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof gridVariants>,
    VariantProps<typeof responsiveGridVariants>,
    LayoutComponentProps,
    AnimationProps,
    ThemeProps {
  /**
   * Grid items - can be any React nodes
   */
  children?: React.ReactNode;
  
  /**
   * Whether grid items should have equal heights
   */
  equalHeight?: boolean;
  
  /**
   * Minimum item width for auto-fit columns
   */
  minItemWidth?: string;
  
  /**
   * Maximum item width for auto-fit columns
   */
  maxItemWidth?: string;
  
  /**
   * Whether to use CSS container queries for responsiveness
   */
  useContainerQuery?: boolean;
  
  /**
   * Executive dysfunction optimization: reduce visual complexity
   */
  simplifyLayout?: boolean;
  
  /**
   * Executive dysfunction optimization: add visual separators
   */
  showSeparators?: boolean;
}

/**
 * Responsive Grid component with executive dysfunction optimizations.
 * 
 * @example
 * ```tsx
 * <Grid cols={3} gap="lg" responsive>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 * ```
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({
    className,
    cols,
    gap,
    responsive,
    smCols,
    mdCols,
    lgCols,
    xlCols,
    children,
    equalHeight = false,
    minItemWidth,
    maxItemWidth,
    useContainerQuery = false,
    simplifyLayout = false,
    showSeparators = false,
    padding,
    margin,
    animated = false,
    animationDuration = 200,
    respectReducedMotion = true,
    'data-testid': dataTestId,
    style,
    ...props
  }, ref) => {
    // Build custom grid template if custom widths are specified
    const customGridTemplate = React.useMemo(() => {
      if (minItemWidth && !maxItemWidth) {
        return `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`;
      }
      if (minItemWidth && maxItemWidth) {
        return `repeat(auto-fit, minmax(${minItemWidth}, ${maxItemWidth}))`;
      }
      return undefined;
    }, [minItemWidth, maxItemWidth]);

    // Apply executive dysfunction optimizations
    const edOptimizations = React.useMemo(() => {
      const classes: string[] = [];
      
      if (simplifyLayout) {
        classes.push("space-y-4"); // Add vertical spacing for cleaner separation
      }
      
      if (showSeparators) {
        classes.push("divide-y divide-border"); // Add visual separators
      }
      
      return classes.join(" ");
    }, [simplifyLayout, showSeparators]);

    // Handle container query classes
    const containerQueryClasses = useContainerQuery ? "container-dashboard" : "";

    // Build responsive classes
    const responsiveClasses = responsive 
      ? responsiveGridVariants({ smCols, mdCols, lgCols, xlCols })
      : "";

    // Build inline styles
    const inlineStyles: React.CSSProperties = {
      ...style,
      ...(customGridTemplate && { gridTemplateColumns: customGridTemplate }),
      ...(padding && { padding: `var(--spacing-${padding}-element, 1rem)` }),
      ...(margin && { margin: `var(--spacing-${margin}-element, 1rem)` }),
      ...(animated && respectReducedMotion && {
        transition: `all ${animationDuration}ms ease-in-out`,
      }),
    };

    // Apply reduced motion preferences
    const shouldAnimate = animated && (
      !respectReducedMotion || 
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );

    return (
      <div
        ref={ref}
        className={cn(
          gridVariants({ cols, gap, responsive }),
          responsiveClasses,
          containerQueryClasses,
          equalHeight && "items-stretch",
          edOptimizations,
          shouldAnimate && "transition-all duration-200 ease-in-out",
          className
        )}
        style={inlineStyles}
        data-testid={dataTestId}
        role="grid"
        {...props}
      >
        {children}
      </div>
    );
  }
);

Grid.displayName = "Grid";

// Grid Item component for enhanced control
export interface GridItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    LayoutComponentProps {
  /**
   * Column span (how many columns this item should occupy)
   */
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 12 | 'full';
  
  /**
   * Row span (how many rows this item should occupy)
   */
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full';
  
  /**
   * Column start position
   */
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  
  /**
   * Row start position
   */
  rowStart?: 1 | 2 | 3 | 4 | 5 | 6;
  
  /**
   * Executive dysfunction: highlight this item
   */
  highlighted?: boolean;
  
  /**
   * Executive dysfunction: mark as primary/important
   */
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

const gridItemVariants = cva(
  "relative",
  {
    variants: {
      colSpan: {
        1: "col-span-1",
        2: "col-span-2",
        3: "col-span-3",
        4: "col-span-4",
        5: "col-span-5",
        6: "col-span-6",
        12: "col-span-12",
        full: "col-span-full",
      },
      rowSpan: {
        1: "row-span-1",
        2: "row-span-2",
        3: "row-span-3",
        4: "row-span-4",
        5: "row-span-5",
        6: "row-span-6",
        full: "row-span-full",
      },
      colStart: {
        1: "col-start-1",
        2: "col-start-2",
        3: "col-start-3",
        4: "col-start-4",
        5: "col-start-5",
        6: "col-start-6",
        7: "col-start-7",
        8: "col-start-8",
        9: "col-start-9",
        10: "col-start-10",
        11: "col-start-11",
        12: "col-start-12",
      },
      rowStart: {
        1: "row-start-1",
        2: "row-start-2",
        3: "row-start-3",
        4: "row-start-4",
        5: "row-start-5",
        6: "row-start-6",
      },
      priority: {
        low: "ring-1 ring-green-200 bg-green-50/50 dark:ring-green-800 dark:bg-green-950/20",
        medium: "ring-1 ring-yellow-200 bg-yellow-50/50 dark:ring-yellow-800 dark:bg-yellow-950/20",
        high: "ring-2 ring-orange-300 bg-orange-50/50 dark:ring-orange-700 dark:bg-orange-950/20",
        urgent: "ring-2 ring-red-400 bg-red-50/50 dark:ring-red-700 dark:bg-red-950/20",
      },
    },
  }
);

/**
 * Grid Item component for enhanced grid control.
 * 
 * @example
 * ```tsx
 * <Grid cols={6}>
 *   <GridItem colSpan={2} priority="high">
 *     Important content
 *   </GridItem>
 *   <GridItem colSpan={4}>
 *     Regular content
 *   </GridItem>
 * </Grid>
 * ```
 */
export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({
    className,
    colSpan,
    rowSpan,
    colStart,
    rowStart,
    highlighted = false,
    priority,
    padding,
    margin,
    children,
    'data-testid': dataTestId,
    style,
    ...props
  }, ref) => {
    // Build inline styles
    const inlineStyles: React.CSSProperties = {
      ...style,
      ...(padding && { padding: `var(--spacing-${padding}-element, 1rem)` }),
      ...(margin && { margin: `var(--spacing-${margin}-element, 1rem)` }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          gridItemVariants({ colSpan, rowSpan, colStart, rowStart, priority }),
          highlighted && "ring-2 ring-primary bg-primary/5",
          className
        )}
        style={inlineStyles}
        data-testid={dataTestId}
        role="gridcell"
        {...props}
      >
        {priority === 'urgent' && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" 
               aria-label="Urgent priority indicator" />
        )}
        {children}
      </div>
    );
  }
);

GridItem.displayName = "GridItem";

// Stack component for simple vertical layouts
export interface StackProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    LayoutComponentProps,
    AnimationProps {
  /**
   * Stack items
   */
  children?: React.ReactNode;
  
  /**
   * Whether to reverse the stack order
   */
  reverse?: boolean;
  
  /**
   * Whether to divide items with separators
   */
  divided?: boolean;
  
  /**
   * Executive dysfunction: reduce visual noise
   */
  minimal?: boolean;
}

const stackVariants = cva(
  "flex w-full",
  {
    variants: {
      direction: {
        row: "flex-row",
        column: "flex-col",
      },
      gap: {
        none: "gap-0",
        xs: "gap-1",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8",
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
        baseline: "items-baseline",
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly",
      },
    },
    defaultVariants: {
      direction: "column",
      gap: "md",
      align: "stretch",
      justify: "start",
    },
  }
);

/**
 * Stack component for simple linear layouts.
 * 
 * @example
 * ```tsx
 * <Stack gap="lg" align="center">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stack>
 * ```
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({
    className,
    children,
    direction = "column",
    gap = "md",
    align = "stretch",
    justify = "start",
    reverse = false,
    divided = false,
    minimal = false,
    padding,
    margin,
    animated = false,
    animationDuration = 200,
    'data-testid': dataTestId,
    style,
    ...props
  }, ref) => {
    // Build inline styles
    const inlineStyles: React.CSSProperties = {
      ...style,
      ...(padding && { padding: `var(--spacing-${padding}-element, 1rem)` }),
      ...(margin && { margin: `var(--spacing-${margin}-element, 1rem)` }),
      ...(animated && {
        transition: `all ${animationDuration}ms ease-in-out`,
      }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          stackVariants({ direction, gap, align, justify }),
          reverse && direction === "row" && "flex-row-reverse",
          reverse && direction === "column" && "flex-col-reverse",
          divided && direction === "column" && "divide-y divide-border",
          divided && direction === "row" && "divide-x divide-border",
          minimal && "space-y-2", // Reduced spacing for minimal mode
          className
        )}
        style={inlineStyles}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = "Stack";

// Container component with responsive behavior
export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    LayoutComponentProps,
    ThemeProps {
  /**
   * Maximum width constraint
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  
  /**
   * Whether to center the container
   */
  centered?: boolean;
  
  /**
   * Whether to add responsive padding
   */
  fluid?: boolean;
  
  /**
   * Executive dysfunction: reduce visual clutter
   */
  clean?: boolean;
}

const containerVariants = cva(
  "w-full",
  {
    variants: {
      maxWidth: {
        xs: "max-w-xs",
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        '2xl': "max-w-2xl",
        '3xl': "max-w-3xl",
        '4xl': "max-w-4xl",
        '5xl': "max-w-5xl",
        '6xl': "max-w-6xl",
        '7xl': "max-w-7xl",
        full: "max-w-full",
      },
      centered: {
        true: "mx-auto",
        false: "",
      },
      fluid: {
        true: "px-4 sm:px-6 lg:px-8",
        false: "",
      },
    },
    defaultVariants: {
      maxWidth: "7xl",
      centered: true,
      fluid: true,
    },
  }
);

/**
 * Container component for content width management.
 * 
 * @example
 * ```tsx
 * <Container maxWidth="lg" clean>
 *   <h1>Content</h1>
 * </Container>
 * ```
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({
    className,
    maxWidth = "7xl",
    centered = true,
    fluid = true,
    clean = false,
    padding,
    margin,
    children,
    'data-testid': dataTestId,
    style,
    ...props
  }, ref) => {
    // Build inline styles
    const inlineStyles: React.CSSProperties = {
      ...style,
      ...(padding && { padding: `var(--spacing-${padding}-element, 1rem)` }),
      ...(margin && { margin: `var(--spacing-${margin}-element, 1rem)` }),
    };

    return (
      <div
        ref={ref}
        className={cn(
          containerVariants({ maxWidth, centered, fluid }),
          clean && "bg-background border border-border/50 rounded-lg shadow-sm",
          className
        )}
        style={inlineStyles}
        data-testid={dataTestId}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";

export default { Grid, GridItem, Stack, Container };