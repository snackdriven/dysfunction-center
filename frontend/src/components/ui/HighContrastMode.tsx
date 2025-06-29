import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';

interface HighContrastModeProps {
  className?: string;
}

// High contrast theme CSS variables
const highContrastStyles = `
  :root[data-high-contrast="true"] {
    /* High contrast color scheme */
    --color-background: #000000;
    --color-foreground: #ffffff;
    --color-primary: #ffffff;
    --color-primary-foreground: #000000;
    --color-secondary: #808080;
    --color-secondary-foreground: #ffffff;
    --color-border: #ffffff;
    --color-input-background: #000000;
    --color-input-border: #ffffff;
    --color-destructive: #ff0000;
    --color-destructive-foreground: #ffffff;
    --color-success: #00ff00;
    --color-success-foreground: #000000;
    --color-warning: #ffff00;
    --color-warning-foreground: #000000;
    
    /* Override Tailwind colors */
    --tw-color-gray-50: #000000;
    --tw-color-gray-100: #1a1a1a;
    --tw-color-gray-200: #333333;
    --tw-color-gray-300: #4d4d4d;
    --tw-color-gray-400: #666666;
    --tw-color-gray-500: #808080;
    --tw-color-gray-600: #999999;
    --tw-color-gray-700: #b3b3b3;
    --tw-color-gray-800: #cccccc;
    --tw-color-gray-900: #ffffff;
  }

  [data-high-contrast="true"] {
    /* Force high contrast styles */
    background-color: black !important;
    color: white !important;
  }

  [data-high-contrast="true"] .bg-white {
    background-color: black !important;
    color: white !important;
  }

  [data-high-contrast="true"] .bg-gray-50,
  [data-high-contrast="true"] .bg-gray-100 {
    background-color: black !important;
    color: white !important;
  }

  [data-high-contrast="true"] .text-gray-600,
  [data-high-contrast="true"] .text-gray-700,
  [data-high-contrast="true"] .text-gray-800,
  [data-high-contrast="true"] .text-gray-900 {
    color: white !important;
  }

  [data-high-contrast="true"] .text-gray-400,
  [data-high-contrast="true"] .text-gray-500 {
    color: #cccccc !important;
  }

  [data-high-contrast="true"] .border-gray-200,
  [data-high-contrast="true"] .border-gray-300 {
    border-color: white !important;
  }

  [data-high-contrast="true"] .bg-blue-500,
  [data-high-contrast="true"] .bg-blue-600 {
    background-color: white !important;
    color: black !important;
  }

  [data-high-contrast="true"] .text-blue-600 {
    color: white !important;
  }

  [data-high-contrast="true"] input,
  [data-high-contrast="true"] textarea,
  [data-high-contrast="true"] select {
    background-color: black !important;
    color: white !important;
    border-color: white !important;
  }

  [data-high-contrast="true"] button {
    border: 2px solid white !important;
  }

  /* Focus indicators in high contrast */
  [data-high-contrast="true"] *:focus {
    outline: 3px solid yellow !important;
    outline-offset: 2px !important;
  }

  /* Windows High Contrast Mode support */
  @media (prefers-contrast: high) {
    :root {
      --color-background: Canvas;
      --color-foreground: CanvasText;
      --color-primary: Highlight;
      --color-primary-foreground: HighlightText;
      --color-border: CanvasText;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    [data-high-contrast="true"] * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

// Hook for managing high contrast mode
export const useHighContrastMode = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('high-contrast-mode');
    if (saved) {
      const enabled = JSON.parse(saved);
      setIsHighContrast(enabled);
      document.documentElement.setAttribute('data-high-contrast', String(enabled));
    }

    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    if (mediaQuery.matches && !saved) {
      setIsHighContrast(true);
      document.documentElement.setAttribute('data-high-contrast', 'true');
    }

    // Listen for system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('high-contrast-mode')) {
        setIsHighContrast(e.matches);
        document.documentElement.setAttribute('data-high-contrast', String(e.matches));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    document.documentElement.setAttribute('data-high-contrast', String(newValue));
    localStorage.setItem('high-contrast-mode', JSON.stringify(newValue));
  };

  return { isHighContrast, toggleHighContrast };
};

// High contrast mode toggle component
export const HighContrastToggle: React.FC<HighContrastModeProps> = ({ className }) => {
  const { isHighContrast, toggleHighContrast } = useHighContrastMode();

  // Inject high contrast styles
  useEffect(() => {
    let styleElement = document.querySelector('#high-contrast-styles') as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'high-contrast-styles';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = highContrastStyles;
    
    return () => {
      // Don't remove styles on unmount as other components might be using them
    };
  }, []);

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={toggleHighContrast}
        aria-label={`${isHighContrast ? 'Disable' : 'Enable'} high contrast mode`}
        aria-pressed={isHighContrast}
        className="flex items-center space-x-2"
      >
        <span className="text-sm">
          {isHighContrast ? '🌑' : '⚫'}
        </span>
        <span>High Contrast</span>
        {isHighContrast && (
          <Badge variant="secondary" className="ml-1">
            ON
          </Badge>
        )}
      </Button>
    </div>
  );
};

// Component to display current contrast status
export const ContrastStatus: React.FC = () => {
  const { isHighContrast } = useHighContrastMode();
  const [systemPreference, setSystemPreference] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setSystemPreference(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center space-x-4">
        <div>
          <span className="font-medium">High Contrast:</span>
          <Badge 
            variant={isHighContrast ? "default" : "secondary"}
            className="ml-2"
          >
            {isHighContrast ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        <div>
          <span className="font-medium">System Preference:</span>
          <Badge 
            variant={systemPreference ? "default" : "secondary"}
            className="ml-2"
          >
            {systemPreference ? 'High Contrast' : 'Normal'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Color contrast checker utility
export const checkColorContrast = (foreground: string, background: string): number => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const contrast = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                   (Math.min(fgLuminance, bgLuminance) + 0.05);

  return Math.round(contrast * 100) / 100;
};

// Color contrast testing component
interface ColorContrastTesterProps {
  foregroundColor?: string;
  backgroundColor?: string;
}

export const ColorContrastTester: React.FC<ColorContrastTesterProps> = ({
  foregroundColor = '#000000',
  backgroundColor = '#ffffff'
}) => {
  const [fg, setFg] = useState(foregroundColor);
  const [bg, setBg] = useState(backgroundColor);
  
  const contrast = checkColorContrast(fg, bg);
  const meetsAA = contrast >= 4.5;
  const meetsAAA = contrast >= 7;

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 className="font-medium text-gray-900 dark:text-white mb-4">
        Color Contrast Tester
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Foreground Color
          </label>
          <input
            type="color"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
          />
          <input
            type="text"
            value={fg}
            onChange={(e) => setFg(e.target.value)}
            className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
            placeholder="#000000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Background Color
          </label>
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="w-full h-10 rounded border border-gray-300 dark:border-gray-600"
          />
          <input
            type="text"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Preview */}
      <div 
        className="p-4 rounded mb-4"
        style={{ backgroundColor: bg, color: fg }}
      >
        <h4 className="font-semibold mb-2">Sample Text</h4>
        <p>This is how your text will look with the selected colors.</p>
        <small>Small text example</small>
      </div>

      {/* Results */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="font-medium">Contrast Ratio:</span>
          <span className={`font-bold ${meetsAA ? 'text-green-600' : 'text-red-600'}`}>
            {contrast}:1
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 rounded text-center ${meetsAA ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <div className="font-medium">WCAG AA</div>
            <div className="text-sm">{meetsAA ? '✓ Pass' : '✗ Fail'}</div>
            <div className="text-xs">4.5:1 required</div>
          </div>
          
          <div className={`p-2 rounded text-center ${meetsAAA ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            <div className="font-medium">WCAG AAA</div>
            <div className="text-sm">{meetsAAA ? '✓ Pass' : '✗ Fail'}</div>
            <div className="text-xs">7:1 required</div>
          </div>
        </div>
      </div>
    </div>
  );
};
