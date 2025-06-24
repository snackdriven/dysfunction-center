import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Slider } from '../ui/Slider';
import { 
  Palette, 
  Type, 
  Eye, 
  Monitor, 
  Smartphone, 
  Save,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  Contrast,
  Accessibility
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { CustomTheme } from '../../../../shared/types';
import { cn } from '../../utils/cn';

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
    id: 'ocean',
    name: 'Ocean Blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      background: '#f8fafc',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      border: '#cbd5e1',
    },
    font_size: 'medium',
    font_family: 'system',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'forest',
    name: 'Forest Green',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#f9fafb',
      foreground: '#111827',
      muted: '#f3f4f6',
      border: '#d1d5db',
    },
    font_size: 'medium',
    font_family: 'system',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    colors: {
      primary: '#ea580c',
      secondary: '#dc2626',
      accent: '#f59e0b',
      background: '#fffbeb',
      foreground: '#1c1917',
      muted: '#fef3c7',
      border: '#fde68a',
    },
    font_size: 'medium',
    font_family: 'system',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'midnight',
    name: 'Midnight Purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#a855f7',
      background: '#0f0f23',
      foreground: '#f8fafc',
      muted: '#1e1b4b',
      border: '#312e81',
    },
    font_size: 'medium',
    font_family: 'system',
    high_contrast: false,
    reduce_motion: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const ThemeCustomization: React.FC = () => {
  const { theme, setTheme, customTheme, setCustomTheme } = useAppStore();
  const [editingTheme, setEditingTheme] = useState<CustomTheme>(
    customTheme || {
      id: 'custom',
      name: 'Custom Theme',
      colors: defaultColors,
      font_size: 'medium',
      font_family: 'system',
      high_contrast: false,
      reduce_motion: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );
  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (colorKey: string, value: string) => {
    setEditingTheme({
      ...editingTheme,
      colors: {
        ...editingTheme.colors,
        [colorKey]: value,
      },
      updated_at: new Date().toISOString(),
    });
  };

  const handlePropertyChange = (property: keyof CustomTheme, value: any) => {
    setEditingTheme({
      ...editingTheme,
      [property]: value,
      updated_at: new Date().toISOString(),
    });
  };

  const applyTheme = (themeToApply: CustomTheme) => {
    setCustomTheme(themeToApply);
    // Re-apply current theme mode to trigger CSS updates
    setTheme(theme);
  };

  const previewTheme = () => {
    if (previewMode) {
      // Restore original theme
      applyTheme(customTheme || editingTheme);
      setPreviewMode(false);
    } else {
      // Apply preview
      applyTheme(editingTheme);
      setPreviewMode(true);
    }
  };

  const saveTheme = () => {
    applyTheme(editingTheme);
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
        setEditingTheme(importedTheme);
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
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setEditingTheme(preset)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{preset.name}</h4>
                    <div className="flex gap-1">
                      {Object.values(preset.colors).slice(0, 3).map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                      ))}
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
                    <SelectItem value="serif">Serif (Georgia)</SelectItem>
                    <SelectItem value="monospace">Monospace (Monaco)</SelectItem>
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
                  <Moon className="h-4 w-4 mr-2" />
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
              }}
            >
              <h3 className="text-lg font-semibold mb-3">Theme Preview</h3>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: editingTheme.colors.primary }}
                  >
                    Primary Button
                  </div>
                  <div
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: editingTheme.colors.secondary }}
                  >
                    Secondary Button
                  </div>
                  <div
                    className="px-3 py-1 rounded text-white text-sm"
                    style={{ backgroundColor: editingTheme.colors.accent }}
                  >
                    Accent Button
                  </div>
                </div>
                <div
                  className="p-3 rounded"
                  style={{ backgroundColor: editingTheme.colors.muted }}
                >
                  <p className="text-sm">
                    This is how muted content will appear with your custom theme.
                    Notice how the colors work together harmoniously.
                  </p>
                </div>
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
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                />
                <Button variant="outline" as="span">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Theme
                </Button>
              </label>
              <Button onClick={resetToDefault} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Default
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
    </div>
  );
};