import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { TimeDisplaySettings } from '../components/settings/TimeDisplaySettings';
import { useTheme } from '../hooks';
import { Button } from '../components/ui/Button';
import { 
  Settings as SettingsIcon,
  Palette,
  Bell,
  Eye,
  Sun,
  Moon
} from 'lucide-react';

const SimpleThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Color Theme</h4>
            <p className="text-sm text-muted-foreground">
              Switch between light and dark modes
            </p>
          </div>
          <Button
            onClick={toggleTheme}
            variant="outline"
            className="flex items-center gap-2"
          >
            {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Currently using <strong>{theme}</strong> theme
        </div>
      </CardContent>
    </Card>
  );
};

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Executive Dysfunction Center experience
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <GeneralSettings />
          <TimeDisplaySettings />
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6">
          <SimpleThemeToggle />
        </TabsContent>

        {/* Accessibility Settings */}
        <TabsContent value="accessibility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Accessibility Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">High Contrast Mode</h4>
                <p className="text-sm text-muted-foreground">
                  High contrast mode can be enabled through your operating system's accessibility settings.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Keyboard Navigation</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl + /</kbd> to show all keyboard shortcuts</p>
                  <p>• Use <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Alt + 1-8</kbd> to navigate between main sections</p>
                  <p>• Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl + K</kbd> for quick search</p>
                  <p>• Use <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Tab</kbd> to navigate between interactive elements</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Screen Reader Support</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>• Full ARIA labels and descriptions</p>
                  <p>• Semantic HTML structure</p>
                  <p>• Live regions for dynamic content</p>
                  <p>• Skip links for easy navigation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Browser Notifications</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coming soon - Push notifications for habit reminders and task deadlines.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coming soon - Email summaries and important updates.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Habit Reminders</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Set reminders for individual habits in the Habits section.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};