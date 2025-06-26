import { CustomTheme } from '../../../shared/types';

/**
 * Validates if a hex color is valid
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex);
}

/**
 * Validates if a theme object is complete and valid
 */
export function validateTheme(theme: CustomTheme): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!theme.id) errors.push('Theme ID is required');
  if (!theme.name) errors.push('Theme name is required');
  
  // Validate colors
  const requiredColors = ['primary', 'secondary', 'accent', 'background', 'foreground', 'muted', 'border'];
  for (const colorKey of requiredColors) {
    const color = theme.colors[colorKey as keyof typeof theme.colors];
    if (!color) {
      errors.push(`Color ${colorKey} is required`);
    } else if (!isValidHexColor(color)) {
      errors.push(`Color ${colorKey} must be a valid hex color`);
    }
  }
  
  // Validate font size
  const validFontSizes = ['small', 'medium', 'large', 'extra-large'];
  if (!validFontSizes.includes(theme.font_size)) {
    errors.push('Invalid font size');
  }
  
  // Validate font family
  const validFontFamilies = ['system', 'serif', 'monospace', 'inter', 'roboto', 'open-sans', 'poppins', 'source-sans', 'lato', 'nunito', 'dyslexic-friendly'];
  if (!validFontFamilies.includes(theme.font_family)) {
    errors.push('Invalid font family');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Applies a theme immediately to the DOM
 */
export function applyThemeToDOM(theme: CustomTheme): void {
  const root = document.documentElement;
  
  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Apply font settings
  const fontSizes = {
    'small': '14px',
    'medium': '16px', 
    'large': '18px',
    'extra-large': '20px'
  };
  root.style.setProperty('--base-font-size', fontSizes[theme.font_size]);
  
  const fontFamilies = {
    'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    'serif': 'Georgia, "Times New Roman", Times, serif',
    'monospace': 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    'inter': '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    'roboto': '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif',
    'open-sans': '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    'poppins': '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif',
    'source-sans': '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif',
    'lato': '"Lato", -apple-system, BlinkMacSystemFont, sans-serif',
    'nunito': '"Nunito", -apple-system, BlinkMacSystemFont, sans-serif',
    'dyslexic-friendly': '"OpenDyslexic", "Comic Sans MS", cursive, sans-serif'
  };
  root.style.setProperty('--base-font-family', fontFamilies[theme.font_family]);
  
  // Apply accessibility settings
  if (theme.high_contrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
  
  if (theme.reduce_motion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
}

/**
 * Removes all theme-related CSS variables and classes
 */
export function clearThemeFromDOM(): void {
  const root = document.documentElement;
  
  // Remove color variables
  const colorKeys = ['primary', 'secondary', 'accent', 'background', 'foreground', 'muted', 'border'];
  colorKeys.forEach(key => {
    root.style.removeProperty(`--color-${key}`);
  });
  
  // Remove font variables
  root.style.removeProperty('--base-font-size');
  root.style.removeProperty('--base-font-family');
  
  // Remove accessibility classes
  root.classList.remove('high-contrast', 'reduce-motion');
}

/**
 * Gets the current theme values from the DOM
 */
export function getThemeFromDOM(): Record<string, string> {
  const root = document.documentElement;
  const computedStyles = getComputedStyle(root);
  
  const themeVars = [
    '--color-primary',
    '--color-secondary',
    '--color-accent', 
    '--color-background',
    '--color-foreground',
    '--color-muted',
    '--color-border',
    '--base-font-size',
    '--base-font-family'
  ];
  
  const values: Record<string, string> = {};
  themeVars.forEach(varName => {
    values[varName] = computedStyles.getPropertyValue(varName);
  });
  
  return values;
}
