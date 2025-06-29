/**
 * Executive Dysfunction Center Design Token System
 * Design tokens for consistent styling
 */

export const tokens = {
  // Spacing Scale - Based on 4px increments for consistency
  spacing: {
    none: '0',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },

  // Typography Scale - Responsive and accessible
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.875rem + 0.625vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
    '3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
  },

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
    loose: '1.8',
  },

  // Border Radius Scale
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '9999px',
  },

  // Shadow Scale for Depth
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },

  // Executive Dysfunction-Friendly Color System
  color: {
    // Task Priority Colors - Carefully chosen for cognitive accessibility
    task: {
      low: 'hsl(158.1 64.4% 51.6%)',      // Calming green - reduces anxiety
      medium: 'hsl(32.1 94.6% 43.7%)',    // Warm amber - attention without alarm
      high: 'hsl(0 84.2% 60.2%)',         // Alert red - clear urgency
    },

    // Mood Colors - Emotionally intuitive
    mood: {
      positive: 'hsl(158.1 64.4% 51.6%)', // Green for positive
      neutral: 'hsl(215.4 16.3% 46.9%)',  // Gray for neutral
      negative: 'hsl(0 84.2% 60.2%)',     // Red for negative
    },

    // Focus and Flow State Colors
    focus: {
      primary: 'hsl(238.7 83.5% 66.7%)',   // Calming purple-blue
      secondary: 'hsl(266.7 83.5% 71.8%)', // Softer purple
      accent: 'hsl(197 100% 50%)',          // Energizing cyan
    },

    // Habit and Routine Colors
    habit: {
      streak: 'hsl(266.7 83.5% 71.8%)',    // Achievement purple
      completed: 'hsl(158.1 64.4% 51.6%)', // Success green
      missed: 'hsl(25 95% 53%)',            // Warning orange
    },

    // Calendar and Time Colors
    calendar: {
      event: 'hsl(238.7 83.5% 66.7%)',     // Blue for events
      deadline: 'hsl(0 84.2% 60.2%)',      // Red for deadlines
      reminder: 'hsl(32.1 94.6% 43.7%)',   // Amber for reminders
    },

    // Semantic Colors - WCAG AA Compliant
    semantic: {
      success: 'hsl(158.1 64.4% 51.6%)',
      warning: 'hsl(32.1 94.6% 43.7%)',
      error: 'hsl(0 84.2% 60.2%)',
      info: 'hsl(238.7 83.5% 66.7%)',
    },

    // Background Colors for Different Contexts
    background: {
      primary: 'hsl(0 0% 100%)',           // Pure white
      secondary: 'hsl(210 40% 98%)',       // Off-white
      muted: 'hsl(210 40% 96%)',           // Light gray
      accent: 'hsl(210 40% 94%)',          // Slightly darker gray
    },

    // Text Colors with High Contrast
    text: {
      primary: 'hsl(222.2 84% 4.9%)',      // Dark slate
      secondary: 'hsl(215.4 16.3% 46.9%)', // Medium gray
      muted: 'hsl(215.4 16.3% 65.1%)',     // Light gray
      inverse: 'hsl(210 40% 98%)',         // Near white
    },
  },

  // Animation Durations - Executive Dysfunction Considerations
  duration: {
    instant: '0ms',
    fast: '150ms',      // Quick feedback
    normal: '200ms',    // Standard transitions
    slow: '300ms',      // Deliberate transitions
    slower: '500ms',    // For reduced motion preferences
  },

  // Animation Easing
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Breakpoints for Responsive Design
  breakpoint: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Container Sizes
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%',
  },

  // Z-Index Scale
  zIndex: {
    base: '0',
    raised: '10',
    floating: '20',
    overlay: '30',
    modal: '40',
    popover: '50',
    tooltip: '60',
    notification: '70',
    max: '9999',
  },

  // Touch Target Sizes for Accessibility
  touchTarget: {
    minimum: '44px',    // WCAG AA minimum
    comfortable: '48px', // Recommended
    large: '56px',      // For important actions
  },
} as const;

// Type-safe token access
export type TokenKey = keyof typeof tokens;
export type SpacingToken = keyof typeof tokens.spacing;
export type ColorToken = keyof typeof tokens.color;
export type FontSizeToken = keyof typeof tokens.fontSize;

// Utility functions for token access
export const getToken = (category: TokenKey, key: string): string => {
  const tokenCategory = tokens[category] as Record<string, any>;
  return tokenCategory[key] || '';
};

export const getSpacing = (key: SpacingToken): string => {
  return tokens.spacing[key];
};

export const getFontSize = (key: FontSizeToken): string => {
  return tokens.fontSize[key];
};

// CSS Custom Property Generator
export const generateCSSVars = () => {
  const cssVars: Record<string, string> = {};
  
  Object.entries(tokens).forEach(([category, values]) => {
    if (typeof values === 'object') {
      Object.entries(values).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            cssVars[`--token-${category}-${key}-${subKey}`] = String(subValue);
          });
        } else {
          cssVars[`--token-${category}-${key}`] = String(value);
        }
      });
    }
  });
  
  return cssVars;
};

// Export specific token categories for convenience
export const spacing = tokens.spacing;
export const fontSize = tokens.fontSize;
export const color = tokens.color;
export const borderRadius = tokens.borderRadius;
export const shadow = tokens.shadow;