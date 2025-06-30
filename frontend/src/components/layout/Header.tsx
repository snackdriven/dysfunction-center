import React, { useState } from 'react';
import { Search, Bell, User, Sun, Moon, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useNavigation, useTheme } from '../../hooks';

export const Header: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useNavigation();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const ThemeIcon = theme === 'light' ? Sun : Moon;

  return (
    <header 
      className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      role="banner"
    >
      <div className="flex items-center justify-between h-full px-6">
        {/* Skip to main content link for keyboard users */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded"
        >
          Skip to main content
        </a>

        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          {/* Sidebar Toggle with proper ARIA */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar navigation"
            aria-expanded={isSidebarOpen}
            aria-controls="main-sidebar"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Button>

          {/* App Name - semantic heading */}
          <h1 className="font-bold text-xl">Executive Dysfunction Center</h1>
          
          {/* Search with proper labeling */}
          <div className="flex-1 max-w-md" role="search">
            <div className="relative">
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search tasks, habits, or moods..."
                className="pl-10 bg-muted/50 border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tasks, habits, and mood entries"
                role="searchbox"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle with descriptive ARIA */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
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