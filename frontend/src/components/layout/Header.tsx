import React from 'react';
import { Search, Bell, User, Sun, Moon, Monitor, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useNavigation, useTheme } from '../../hooks';

export const Header: React.FC = () => {
  const { isMobile, toggleSidebar } = useNavigation();
  const { theme, toggleTheme } = useTheme();

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Hamburger Menu for Desktop/Tablet Sidebar */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:inline-flex"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          {/* Logo for Mobile */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">EDC</span>
              </div>
              <span className="font-semibold text-lg">EDC</span>
            </div>
          )}

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, habits, or moods..."
                className="pl-10 bg-muted/50 border-0"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" title="Notifications">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <Button variant="ghost" size="icon" title="User menu">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};