import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { 
  Palette, 
  Type, 
  Eye, 
  Save,
  Download,
  Upload,
  RotateCcw,
  Contrast,
  Bug
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { CustomTheme } from '../../../../shared/types';
import { ThemeDebugPanel } from './ThemeDebugPanel';

const defaultColors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  background: '#ffffff',
  foreground: '#0f172a',
  muted: '#f1f5f9',
  border: '#e2e8f0',
};

const presetThemes: CustomTheme[] = [
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze Dark',
    colors: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b',
      border: '#334155',
    },
    font_size: 'medium',
    font_family: 'inter',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'emerald-focus',
    name: 'Emerald Focus Dark',
    colors: {
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#34d399',
      background: '#111827',
      foreground: '#f9fafb',
      muted: '#1f2937',
      border: '#374151',
    },
    font_size: 'medium',
    font_family: 'roboto',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'warm-productivity',
    name: 'Warm Productivity Dark',
    colors: {
      primary: '#f59e0b',
      secondary: '#78716c',
      accent: '#fb923c',
      background: '#1c1917',
      foreground: '#fafaf9',
      muted: '#292524',
      border: '#44403c',
    },
    font_size: 'medium',
    font_family: 'poppins',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'deep-night',
    name: 'Deep Night',
    colors: {
      primary: '#8B5CF6',
      secondary: '#6B7280',
      accent: '#A78BFA',
      background: '#0F172A',
      foreground: '#F8FAFC',
      muted: '#1E293B',
      border: '#334155',
    },
    font_size: 'medium',
    font_family: 'inter',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'calm-focus',
    name: 'Calm Focus Dark',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      background: '#1e293b',
      foreground: '#f8fafc',
      muted: '#334155',
      border: '#475569',
    },
    font_size: 'medium',
    font_family: 'lato',
    high_contrast: false,
    reduce_motion: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const ThemeCustomization: React.FC = () => {
  const { customTheme, setCustomTheme, previewCustomTheme, clearThemePreview } = useAppStore();
  // const { theme, setTheme } = useAppStore(); // Commented out as unused
  const [editingTheme, setEditingTheme] = useState<CustomTheme>(
    customTheme || {
      id: crypto.randomUUID(),
      name: 'Custom Theme',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b', 
        accent: '#f59e42',
        background: '#f8fafc',
        foreground: '#0f172a',
        muted: '#e2e8f0',
        border: '#cbd5e1',
      },
      font_size: 'medium',
      font_family: 'system',
      high_contrast: false,
      reduce_motion: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );
  const [previewMode, setPreviewMode] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleColorChange = (colorKey: string, value: string) => {
    // Clean and validate the hex color value
    let cleanValue = value.trim();
    
    // Ensure it starts with #
    if (!cleanValue.startsWith('#')) {
      cleanValue = '#' + cleanValue.replace(/^#+/, '');
    }
    
    // Remove any non-hex characters (except #)
    cleanValue = cleanValue.replace(/[^#0-9A-Fa-f]/g, '');
    
    // Ensure proper length (either #RGB or #RRGGBB)
    if (cleanValue.length > 7) {
      cleanValue = cleanValue.substring(0, 7);
    }
    
    const updatedTheme = {
      ...editingTheme,
      colors: {
        ...editingTheme.colors,
        [colorKey]: cleanValue,
      },
      updated_at: new Date().toISOString(),
    };
    setEditingTheme(updatedTheme);
    
    // Live preview as user types/changes colors
    previewCustomTheme(updatedTheme);
  };

  const handlePropertyChange = (property: keyof CustomTheme, value: any) => {
    const updatedTheme = {
      ...editingTheme,
      [property]: value,
      updated_at: new Date().toISOString(),
    };
    setEditingTheme(updatedTheme);
    
    // Live preview property changes
    previewCustomTheme(updatedTheme);
  };

  const cleanTheme = (theme: CustomTheme): CustomTheme => {
    const cleanedColors: any = {};
    
    // Clean all color values
    Object.entries(theme.colors).forEach(([key, value]) => {
      let cleanValue = String(value).trim();
      
      // Ensure it starts with #
      if (!cleanValue.startsWith('#')) {
        cleanValue = '#' + cleanValue.replace(/^#+/, '');
      }
      
      // Remove any non-hex characters (except #)
      cleanValue = cleanValue.replace(/[^#0-9A-Fa-f]/g, '');
      
      // Ensure proper length
      if (cleanValue.length > 7) {
        cleanValue = cleanValue.substring(0, 7);
      } else if (cleanValue.length < 4) {
        // If too short, use a fallback
        cleanValue = '#000000';
      } else if (cleanValue.length === 4) {
        // Convert #RGB to #RRGGBB
        const r = cleanValue[1];
        const g = cleanValue[2];
        const b = cleanValue[3];
        cleanValue = `#${r}${r}${g}${g}${b}${b}`;
      }
      
      cleanedColors[key] = cleanValue;
    });

    return {
      ...theme,
      colors: cleanedColors,
      updated_at: new Date().toISOString(),
    };
  };

  const applyTheme = (themeToApply: CustomTheme) => {
    const cleanedTheme = cleanTheme(themeToApply);
    setCustomTheme(cleanedTheme);
    setEditingTheme(cleanedTheme); // Update the editing theme to reflect the applied theme
    setPreviewMode(false);
  };

  const previewTheme = () => {
    if (previewMode) {
      // Clear preview and restore saved theme
      clearThemePreview();
      setPreviewMode(false);
    } else {
      // Start preview mode
      previewCustomTheme(editingTheme);
      setPreviewMode(true);
    }
  };

  const saveTheme = () => {
    const cleanedTheme = cleanTheme(editingTheme);
    setCustomTheme(cleanedTheme);
    setEditingTheme(cleanedTheme); // Update to the cleaned version
    setPreviewMode(false);
  };

  const resetToDefault = () => {
    const defaultTheme: CustomTheme = {
      id: 'default',
      name: 'Default Theme',
      colors: defaultColors,
      font_size: 'medium',
      font_family: 'system',
      high_contrast: false,
      reduce_motion: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const cleanedTheme = cleanTheme(defaultTheme);
    setEditingTheme(cleanedTheme);
    applyTheme(cleanedTheme);
  };

  const exportTheme = () => {
    const themeJson = JSON.stringify(editingTheme, null, 2);
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editingTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string) as CustomTheme;
        // Update the imported theme's timestamps
        importedTheme.updated_at = new Date().toISOString();
        setEditingTheme(importedTheme);
        // Automatically preview the imported theme
        previewCustomTheme(importedTheme);
        setPreviewMode(true);
      } catch (error) {
        alert('Invalid theme file format');
      }
    };
    reader.readAsText(file);
  };

  // Function to determine if a color is light or dark
  const isLightColor = (hexColor: string): boolean => {
    try {
      const hex = hexColor.replace('#', '');
      if (hex.length !== 6) return false; // Default to dark text if invalid
      
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5;
    } catch (error) {
      console.warn('Invalid color format:', hexColor);
      return false; // Default to dark text if invalid
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Theme Customization</h2>
        {previewMode && (
          <Badge variant="secondary" className="animate-pulse">
            Preview Mode Active
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme Presets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Preset Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {presetThemes.map((preset) => (
                <div
                  key={preset.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    customTheme?.id === preset.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setEditingTheme(preset)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {preset.id === 'ocean-breeze' && 'Calming blue tones for focus'}
                        {preset.id === 'emerald-focus' && 'Nature-inspired greens for productivity'}
                        {preset.id === 'warm-productivity' && 'Energizing warm colors for motivation'}
                        {preset.id === 'deep-night' && 'Easy on the eyes for dark environments'}
                        {preset.id === 'calm-focus' && 'Reduced motion for sensitive users'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Object.values(preset.colors).slice(0, 3).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      {customTheme?.id === preset.id && (
                        <Badge variant="default" className="text-xs">Applied</Badge>
                      )}
                    </div>
                  </div>
                  <button
                    className="w-full h-9 px-3 text-xs font-medium rounded-md border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: preset.colors.primary,
                      color: isLightColor(preset.colors.primary) ? '#000000' : '#FFFFFF',
                      borderColor: preset.colors.border,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTheme(preset);
                    }}
                  >
                    Apply Theme
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(editingTheme.colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium capitalize">
                    {key.replace('_', ' ')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="w-12 h-10 border rounded cursor-pointer flex-shrink-0"
                    />
                    <Input
                      value={value}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography & Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography & Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Font Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Font Size</label>
                <Select
                  value={editingTheme.font_size}
                  onValueChange={(value) => handlePropertyChange('font_size', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (14px)</SelectItem>
                    <SelectItem value="medium">Medium (16px)</SelectItem>
                    <SelectItem value="large">Large (18px)</SelectItem>
                    <SelectItem value="extra-large">Extra Large (20px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Font Family</label>
                <Select
                  value={editingTheme.font_family}
                  onValueChange={(value) => handlePropertyChange('font_family', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System Default</SelectItem>
                    <SelectItem value="inter">Inter (Modern)</SelectItem>
                    <SelectItem value="roboto">Roboto (Clean)</SelectItem>
                    <SelectItem value="open-sans">Open Sans (Friendly)</SelectItem>
                    <SelectItem value="poppins">Poppins (Rounded)</SelectItem>
                    <SelectItem value="source-sans">Source Sans Pro (Professional)</SelectItem>
                    <SelectItem value="lato">Lato (Humanist)</SelectItem>
                    <SelectItem value="nunito">Nunito (Soft)</SelectItem>
                    <SelectItem value="serif">Serif (Traditional)</SelectItem>
                    <SelectItem value="monospace">Monospace (Code)</SelectItem>
                    <SelectItem value="dyslexic-friendly">OpenDyslexic (Accessibility)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Accessibility Options */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="high-contrast"
                    checked={editingTheme.high_contrast}
                    onCheckedChange={(checked) => handlePropertyChange('high_contrast', checked)}
                  />
                  <label htmlFor="high-contrast" className="text-sm font-medium cursor-pointer">
                    High Contrast Mode
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reduce-motion"
                    checked={editingTheme.reduce_motion}
                    onCheckedChange={(checked) => handlePropertyChange('reduce_motion', checked)}
                  />
                  <label htmlFor="reduce-motion" className="text-sm font-medium cursor-pointer">
                    Reduce Motion & Animations
                  </label>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">

              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Theme Preview & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Theme Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview Area */}
            <div 
              className="p-6 border rounded-lg"
              style={{
                backgroundColor: editingTheme.colors.background,
                color: editingTheme.colors.foreground,
                borderColor: editingTheme.colors.border,
                fontSize: editingTheme.font_size === 'small' ? '14px' : 
                         editingTheme.font_size === 'large' ? '18px' :
                         editingTheme.font_size === 'extra-large' ? '20px' : '16px',
                fontFamily: editingTheme.font_family === 'serif' ? 'Georgia, "Times New Roman", Times, serif' :
                           editingTheme.font_family === 'monospace' ? 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace' :
                           editingTheme.font_family === 'inter' ? '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' :
                           editingTheme.font_family === 'roboto' ? '"Roboto", -apple-system, BlinkMacSystemFont, sans-serif' :
                           editingTheme.font_family === 'open-sans' ? '"Open Sans", -apple-system, BlinkMacSystemFont, sans-serif' :
                           editingTheme.font_family === 'poppins' ? '"Poppins", -apple-system, BlinkMacSystemFont, sans-serif' :
                           editingTheme.font_family === 'source-sans' ? '"Source Sans Pro", -apple-system, BlinkMacSystemFont, sans-serif' :
                           editingTheme.font_family === 'lato' ? '"Lato", -apple-system, BlinkMacSystemFont, sans-serif' :
                           editingTheme.font_family === 'nunito' ? '"Nunito", -apple-system, BlinkMacSystemFont, sans-serif' :
                           editingTheme.font_family === 'dyslexic-friendly' ? '"OpenDyslexic", "Comic Sans MS", cursive, sans-serif' :
                           '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                filter: editingTheme.high_contrast ? 'contrast(150%)' : 'none',
              }}
            >
              <h3 className="text-lg font-semibold mb-3">Theme Preview</h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Color Palette:</p>
                  <div className="flex gap-2 flex-wrap">
                    <div
                      className="px-3 py-2 rounded text-white text-sm font-medium shadow-sm"
                      style={{ backgroundColor: editingTheme.colors.primary }}
                    >
                      Primary Action
                    </div>
                    <div
                      className="px-3 py-2 rounded text-white text-sm font-medium shadow-sm"
                      style={{ backgroundColor: editingTheme.colors.secondary }}
                    >
                      Secondary
                    </div>
                    <div
                      className="px-3 py-2 rounded text-white text-sm font-medium shadow-sm"
                      style={{ backgroundColor: editingTheme.colors.accent }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
                
                <div
                  className="p-3 rounded border"
                  style={{ 
                    backgroundColor: editingTheme.colors.muted,
                    borderColor: editingTheme.colors.border
                  }}
                >
                  <p className="text-sm font-medium mb-1">Content Card Example</p>
                  <p className="text-sm opacity-75">
                    This shows how cards and muted content will appear. 
                    The {editingTheme.font_family.replace('-', ' ')} font family provides excellent readability.
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="text-lg font-bold">Heading Example</div>
                  <div className="text-base">Regular body text for reading content</div>
                  <div className="text-sm opacity-75">Muted text for secondary information</div>
                </div>
                
                {editingTheme.high_contrast && (
                  <div className="p-2 bg-yellow-100 border border-yellow-400 rounded text-sm">
                    <strong>High Contrast Mode:</strong> Enhanced visibility for better accessibility
                  </div>
                )}
                
                {editingTheme.reduce_motion && (
                  <div className="p-2 bg-blue-100 border border-blue-400 rounded text-sm">
                    <strong>Reduced Motion:</strong> Animations minimized for comfort
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={previewTheme} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Exit Preview' : 'Preview Theme'}
              </Button>
              <Button onClick={saveTheme}>
                <Save className="h-4 w-4 mr-2" />
                Save Theme
              </Button>
              <Button onClick={exportTheme} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Theme
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importTheme}
                className="hidden"
                ref={fileInputRef}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Theme
              </Button>
              <Button onClick={resetToDefault} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
              </Button>
              <Button 
                onClick={() => {
                  const cleanedTheme = cleanTheme(editingTheme);
                  setEditingTheme(cleanedTheme);
                  previewCustomTheme(cleanedTheme);
                }} 
                variant="outline"
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clean Colors
              </Button>
              <Button 
                onClick={() => setShowDebug(!showDebug)} 
                variant="outline"
                size="sm"
              >
                <Bug className="h-4 w-4 mr-2" />
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </Button>
            </div>

            {/* Theme Information */}
            <div className="text-xs text-muted-foreground">
              <p>Theme Name: {editingTheme.name}</p>
              <p>Last Modified: {new Date(editingTheme.updated_at).toLocaleString()}</p>
              <p>Accessibility: {editingTheme.high_contrast ? 'High Contrast' : 'Standard'}, 
                 {editingTheme.reduce_motion ? 'Reduced Motion' : 'Full Animations'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Debug Panel */}
      {showDebug && <ThemeDebugPanel />}
    </div>
  );
};