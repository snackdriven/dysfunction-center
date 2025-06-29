/**
 * Fluid Typography and Adaptive Spacing System
 * Designed for desktop executive dysfunction optimization
 */

export const typography = {
  // Fluid font sizes that scale with viewport width
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',     // 12-14px
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',       // 14-16px
    base: 'clamp(1rem, 0.875rem + 0.625vw, 1.125rem)',   // 16-18px
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',      // 18-20px
    xl: 'clamp(1.25rem, 1.125rem + 0.625vw, 1.5rem)',    // 20-24px
    '2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',      // 24-32px
    '3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',  // 30-40px
    '4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3rem)',      // 36-48px
    '5xl': 'clamp(3rem, 2rem + 5vw, 4rem)',              // 48-64px
  },

  // Line heights for executive dysfunction readability
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',        // Primary for body text
    relaxed: '1.625',     // For complex information
    loose: '2',           // For high cognitive load content
  },

  // Letter spacing for improved readability
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',      // For executive dysfunction optimization
    wider: '0.05em',
    widest: '0.1em',
  },

  // Font weights with semantic naming
  fontWeight: {
    light: '300',
    normal: '400',        // Primary body weight
    medium: '500',        // For subtle emphasis
    semibold: '600',      // For headers and important text
    bold: '700',          // For strong emphasis
  },

  // Executive dysfunction-friendly font stacks
  fontFamily: {
    system: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(', '),
    
    // High readability fonts
    readability: [
      '"Inter"',
      '"Source Sans Pro"',
      '"Open Sans"',
      'system-ui',
      'sans-serif'
    ].join(', '),
    
    // Dyslexia-friendly option
    dyslexic: [
      '"OpenDyslexic"',
      '"Comic Sans MS"',
      'cursive',
      'sans-serif'
    ].join(', '),
    
    // Monospace for code/data
    mono: [
      '"JetBrains Mono"',
      '"Fira Code"',
      'Monaco',
      'Consolas',
      '"Courier New"',
      'monospace'
    ].join(', '),
  },
};

export const spacing = {
  // Fluid spacing that adapts to viewport
  fluid: {
    xs: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem)',    // 4-6px
    sm: 'clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)',       // 8-12px
    md: 'clamp(1rem, 0.8rem + 1vw, 1.5rem)',            // 16-24px
    lg: 'clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)',       // 24-36px
    xl: 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',            // 32-48px
    '2xl': 'clamp(2.5rem, 2rem + 2.5vw, 4rem)',         // 40-64px
    '3xl': 'clamp(3rem, 2rem + 5vw, 6rem)',             // 48-96px
  },

  // Fixed spacing for precise control
  fixed: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  // Executive dysfunction spacing
  cognitive: {
    // Minimal cognitive load
    tight: {
      section: 'clamp(1rem, 0.8rem + 1vw, 1.5rem)',
      element: 'clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)',
      text: 'clamp(0.25rem, 0.2rem + 0.25vw, 0.375rem)',
    },
    
    // Standard cognitive load
    normal: {
      section: 'clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)',
      element: 'clamp(1rem, 0.8rem + 1vw, 1.5rem)',
      text: 'clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)',
    },
    
    // High cognitive load (more breathing room)
    relaxed: {
      section: 'clamp(2rem, 1.5rem + 2.5vw, 3rem)',
      element: 'clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)',
      text: 'clamp(1rem, 0.8rem + 1vw, 1.5rem)',
    },
  },
};

// Utility functions for applying typography
export const getFluidFontSize = (size: keyof typeof typography.fontSize) => {
  return typography.fontSize[size];
};

export const getFluidSpacing = (size: keyof typeof spacing.fluid) => {
  return spacing.fluid[size];
};

export const getCognitiveSpacing = (
  load: 'tight' | 'normal' | 'relaxed',
  type: 'section' | 'element' | 'text'
) => {
  return spacing.cognitive[load][type];
};

// CSS custom properties for dynamic theming
export const generateTypographyCSS = () => {
  const cssVars: Record<string, string> = {};
  
  // Font sizes
  Object.entries(typography.fontSize).forEach(([key, value]) => {
    cssVars[`--font-size-${key}`] = value;
  });
  
  // Line heights
  Object.entries(typography.lineHeight).forEach(([key, value]) => {
    cssVars[`--line-height-${key}`] = value;
  });
  
  // Letter spacing
  Object.entries(typography.letterSpacing).forEach(([key, value]) => {
    cssVars[`--letter-spacing-${key}`] = value;
  });
  
  // Fluid spacing
  Object.entries(spacing.fluid).forEach(([key, value]) => {
    cssVars[`--spacing-fluid-${key}`] = value;
  });
  
  // Cognitive spacing
  Object.entries(spacing.cognitive).forEach(([loadKey, loadValue]) => {
    Object.entries(loadValue).forEach(([typeKey, typeValue]) => {
      cssVars[`--spacing-${loadKey}-${typeKey}`] = typeValue;
    });
  });
  
  return cssVars;
};

// Executive dysfunction-specific typography scales
export const edTypography = {
  // Task-related typography
  task: {
    title: {
      fontSize: typography.fontSize.lg,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.semibold,
      letterSpacing: typography.letterSpacing.wide,
    },
    description: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.relaxed,
      fontWeight: typography.fontWeight.normal,
    },
    metadata: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
    },
  },
  
  // Form typography
  form: {
    label: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
    input: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.normal,
    },
    help: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.relaxed,
      fontWeight: typography.fontWeight.normal,
    },
    error: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
    },
  },
  
  // Dashboard typography
  dashboard: {
    widget: {
      title: {
        fontSize: typography.fontSize.lg,
        lineHeight: typography.lineHeight.tight,
        fontWeight: typography.fontWeight.semibold,
      },
      stat: {
        fontSize: typography.fontSize['2xl'],
        lineHeight: typography.lineHeight.none,
        fontWeight: typography.fontWeight.bold,
      },
      label: {
        fontSize: typography.fontSize.sm,
        lineHeight: typography.lineHeight.normal,
        fontWeight: typography.fontWeight.normal,
      },
    },
  },
  
  // Navigation typography
  navigation: {
    primary: {
      fontSize: typography.fontSize.base,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.medium,
    },
    secondary: {
      fontSize: typography.fontSize.sm,
      lineHeight: typography.lineHeight.normal,
      fontWeight: typography.fontWeight.normal,
    },
  },
};

export default {
  typography,
  spacing,
  edTypography,
  getFluidFontSize,
  getFluidSpacing,
  getCognitiveSpacing,
  generateTypographyCSS,
};