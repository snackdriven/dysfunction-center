import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { DataExportImport } from '../components/settings/DataExportImport';
import { ThemeCustomization } from '../components/settings/ThemeCustomization';
import { GeneralSettings } from '../components/settings/GeneralSettings';
import { OfflineSyncManager } from '../components/common/OfflineSyncManager';
import { 
  Settings as SettingsIcon,
  Palette,  Download,
  // User, // Commented out as unused
  Bell,
  Shield,
  // Database // Commented out as unused
} from 'lucide-react';

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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="sync">Sync</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <GeneralSettings />
        </TabsContent>

        {/* Theme Settings */}
        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Customization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeCustomization />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DataExportImport />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Settings */}
        <TabsContent value="sync" className="space-y-6">
          <OfflineSyncManager />
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

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Data Storage</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    All your data is stored locally and securely. We do not collect or share personal information.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Data Backup</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use the Data Management tab to create backups of your information.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Account Security</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Coming soon - User authentication and account management features.
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