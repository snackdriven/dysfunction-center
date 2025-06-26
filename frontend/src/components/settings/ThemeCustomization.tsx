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
  Sun,
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
    name: 'Ocean Breeze',
    colors: {
      primary: '#0F7CDB',     // Blue 600 - high contrast
      secondary: '#64748B',   // Slate 500 - accessible gray
      accent: '#0EA5E9',      // Sky 500 - complementary blue
      background: '#FAFBFC',  // Very light blue-gray
      foreground: '#1E293B',  // Slate 800 - high contrast text
      muted: '#F1F5F9',      // Slate 100 - subtle background
      border: '#CBD5E1',     // Slate 300 - visible borders
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
    name: 'Emerald Focus',
    colors: {
      primary: '#059669',     // Emerald 600 - nature-inspired, calm
      secondary: '#6B7280',   // Gray 500 - neutral complement
      accent: '#10B981',      // Emerald 500 - consistent green family
      background: '#F9FAFB',  // Gray 50 - clean white
      foreground: '#111827',  // Gray 900 - maximum contrast
      muted: '#F3F4F6',      // Gray 100 - subtle distinction
      border: '#D1D5DB',     // Gray 300 - clear separation
    },
    font_size: 'medium',
    font_family: 'open-sans',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'warm-productivity',
    name: 'Warm Productivity',
    colors: {
      primary: '#DC2626',     // Red 600 - energizing, urgent
      secondary: '#78716C',   // Stone 500 - warm neutral
      accent: '#F59E0B',      // Amber 500 - motivating orange
      background: '#FFFBEB',  // Amber 50 - very light warm
      foreground: '#1C1917',  // Stone 900 - warm black
      muted: '#FEF3C7',      // Amber 100 - warm highlight
      border: '#F3E8FF',     // Purple 50 - subtle warm border
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
      primary: '#8B5CF6',     // Violet 500 - accessible on dark
      secondary: '#6B7280',   // Gray 500 - muted secondary
      accent: '#A78BFA',      // Violet 400 - lighter accent
      background: '#0F172A',  // Slate 900 - true dark
      foreground: '#F8FAFC',  // Slate 50 - high contrast white
      muted: '#1E293B',      // Slate 800 - subtle dark sections
      border: '#334155',     // Slate 700 - visible dark borders
    },
    font_size: 'medium',
    font_family: 'inter',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'high-contrast-light',
    name: 'High Contrast Light',
    colors: {
      primary: '#000000',     // Pure black - maximum contrast
      secondary: '#374151',   // Gray 700 - strong secondary
      accent: '#1F2937',      // Gray 800 - consistent dark theme
      background: '#FFFFFF',  // Pure white - maximum contrast
      foreground: '#000000',  // Pure black text
      muted: '#F9FAFB',      // Gray 50 - minimal difference
      border: '#000000',     // Black borders for clarity
    },
    font_size: 'large',
    font_family: 'open-sans',
    high_contrast: true,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'high-contrast-dark',
    name: 'High Contrast Dark',
    colors: {
      primary: '#FFFFFF',     // Pure white - maximum contrast on dark
      secondary: '#D1D5DB',   // Gray 300 - lighter secondary
      accent: '#F3F4F6',      // Gray 100 - consistent light theme
      background: '#000000',  // Pure black - maximum contrast
      foreground: '#FFFFFF',  // Pure white text
      muted: '#111827',      // Gray 900 - subtle distinction
      border: '#FFFFFF',     // White borders for clarity
    },
    font_size: 'large',
    font_family: 'open-sans',
    high_contrast: true,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'calm-focus',
    name: 'Calm Focus',
    colors: {
      primary: '#4338CA',     // Indigo 600 - calming, focused
      secondary: '#6B7280',   // Gray 500 - neutral
      accent: '#8B5CF6',      // Violet 500 - creative accent
      background: '#F8FAFC',  // Slate 50 - very light
      foreground: '#1E293B',  // Slate 800 - readable
      muted: '#E2E8F0',      // Slate 200 - soft muted areas
      border: '#CBD5E1',     // Slate 300 - gentle borders
    },
    font_size: 'medium',
    font_family: 'nunito',
    high_contrast: false,
    reduce_motion: true,    // Reduced motion for calmness
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'accessibility-first',
    name: 'Accessibility First',
    colors: {
      primary: '#1D4ED8',     // Blue 700 - WCAG AAA compliant
      secondary: '#4B5563',   // Gray 600 - accessible secondary
      accent: '#059669',      // Emerald 600 - color-blind friendly
      background: '#FFFFFF',  // Pure white
      foreground: '#111827',  // Gray 900 - maximum readability
      muted: '#F3F4F6',      // Gray 100 - subtle backgrounds
      border: '#6B7280',     // Gray 500 - clearly visible borders
    },
    font_size: 'large',
    font_family: 'dyslexic-friendly',
    high_contrast: true,
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
    const updatedTheme = {
      ...editingTheme,
      colors: {
        ...editingTheme.colors,
        [colorKey]: value,
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

  const applyTheme = (themeToApply: CustomTheme) => {
    setCustomTheme(themeToApply);
    setEditingTheme(themeToApply); // Update the editing theme to reflect the applied theme
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
    setCustomTheme(editingTheme);
    setPreviewMode(false);
    // The editingTheme is already up to date, no need to change it
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
    setEditingTheme(defaultTheme);
    applyTheme(defaultTheme);
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

  const generateHighContrastTheme = () => {
    const highContrastTheme: CustomTheme = {
      ...editingTheme,
      colors: {
        ...editingTheme.colors,
        background: '#000000',
        foreground: '#ffffff',
        muted: '#333333',
        border: '#666666',
      },
      high_contrast: true,
      name: `${editingTheme.name} (High Contrast)`,
    };
    setEditingTheme(highContrastTheme);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Theme Customization</h2>
          <p className="text-muted-foreground">
            Personalize your interface with custom colors, fonts, and accessibility options
          </p>
        </div>
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
                        {preset.id === 'high-contrast-light' && 'Maximum readability on light background'}
                        {preset.id === 'high-contrast-dark' && 'Maximum readability on dark background'}
                        {preset.id === 'calm-focus' && 'Reduced motion for sensitive users'}
                        {preset.id === 'accessibility-first' && 'Optimized for screen readers and disabilities'}
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTheme(preset);
                    }}
                  >
                    Apply Theme
                  </Button>
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
            <div className="space-y-4">
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
                      className="w-12 h-10 border rounded cursor-pointer"
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateHighContrastTheme}
                  className="w-full"
                >
                  <Contrast className="h-4 w-4 mr-2" />
                  Generate High Contrast
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const darkTheme = {
                      ...editingTheme,
                      colors: {
                        ...editingTheme.colors,
                        background: '#1a1a1a',
                        foreground: '#ffffff',
                        muted: '#2a2a2a',
                        border: '#404040',
                      },
                      name: `${editingTheme.name} (Dark)`,
                    };
                    setEditingTheme(darkTheme);
                  }}
                  className="w-full"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Make Dark Theme
                </Button>
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