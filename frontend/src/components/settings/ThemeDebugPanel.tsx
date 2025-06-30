import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useAppStore } from '../../stores/appStore';
import { validateTheme, getThemeFromDOM, applyThemeToDOM } from '../../utils/themeUtils';

export const ThemeDebugPanel: React.FC = () => {
  const { customTheme } = useAppStore();
  
  // Get current theme validation
  const validation = customTheme ? validateTheme(customTheme) : null;
  
  // Get current DOM theme values
  const domThemeValues = getThemeFromDOM();
  
  const cssVars = [
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

  const handleForceApplyTheme = () => {
    if (customTheme) {
      applyThemeToDOM(customTheme);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Theme Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Theme Validation */}
        {validation && (
          <div>
            <h4 className="font-medium mb-2">Theme Validation</h4>
            <div className="p-3 bg-muted rounded">
              <Badge variant={validation.valid ? 'default' : 'destructive'}>
                {validation.valid ? 'Valid' : 'Invalid'}
              </Badge>
              {!validation.valid && (
                <ul className="mt-2 text-sm text-red-600">
                  {validation.errors.map((error, i) => (
                    <li key={i}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        
        <div>
          <h4 className="font-medium mb-2">Current Theme Object</h4>
          <div className="p-3 bg-muted rounded text-sm font-mono max-h-48 overflow-y-auto">
            <pre>{JSON.stringify(customTheme, null, 2)}</pre>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Applied CSS Variables</h4>
          <div className="grid grid-cols-1 gap-2">
            {cssVars.map(varName => {
              const value = domThemeValues[varName];
              return (
                <div key={varName} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <code className="font-mono text-xs">{varName}</code>
                  <div className="flex items-center gap-2">
                    {varName.includes('color') && value && (
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: value }}
                      />
                    )}
                    <Badge variant={value ? 'default' : 'destructive'} className="text-xs">
                      {value || 'Not Set'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">CSS Classes Applied to Document</h4>
          <div className="p-3 bg-muted rounded text-sm">
            <code>classList: {document.documentElement.classList.toString() || 'None'}</code>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Theme Test Elements</h4>
          <div className="space-y-2">
            <div className="p-3 bg-custom-primary text-white rounded">
              Primary Background (--color-primary)
            </div>
            <div className="p-3 bg-custom-secondary text-white rounded">
              Secondary Background (--color-secondary)
            </div>
            <div className="p-3 bg-custom-accent text-white rounded">
              Accent Background (--color-accent)
            </div>
            <div className="p-3 bg-custom-muted rounded">
              Muted Background (--color-muted)
            </div>
            <div className="text-custom-primary font-bold">
              Primary Text Color (--color-primary)
            </div>
            <div style={{ fontSize: 'var(--base-font-size, 16px)', fontFamily: 'var(--base-font-family, inherit)' }}>
              This text uses the theme font size and family settings
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Debug Actions</h4>
          <div className="flex gap-2">
            <Button 
              onClick={handleForceApplyTheme}
              variant="outline"
              size="sm"
              disabled={!customTheme}
            >
              Force Apply Theme
            </Button>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
            >
              Reload Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
