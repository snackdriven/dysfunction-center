import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Button } from './Button';
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  CheckSquare, 
  BarChart3, 
  Settings,
  Plus,
  Search,
  Bell,
  User,
  ChevronDown
} from 'lucide-react';

interface ResponsiveNavigationProps {
  className?: string;
  variant?: 'desktop' | 'mobile' | 'adaptive';
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  className,
  variant = 'adaptive'
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
    { id: 'habits', label: 'Habits', icon: BarChart3, path: '/habits' },
    { id: 'mood', label: 'Mood', icon: User, path: '/mood' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  const isActive = (path: string) => location.pathname === path;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (variant === 'desktop') {
    return <DesktopNavigation navigationItems={navigationItems} isActive={isActive} navigate={navigate} />;
  }

  if (variant === 'mobile') {
    return (
      <MobileNavigation 
        navigationItems={navigationItems} 
        isActive={isActive} 
        navigate={navigate} 
      />
    );
  }

  return (
    <nav className={cn(
      'responsive-navigation',
      'container-type-inline-size',
      'bg-background border-b sticky top-0 z-50',
      className
    )}>
      {/* Desktop Navigation - Hidden on mobile */}
      <div className={cn(
        'desktop-nav hidden',
        '@container/nav-[min-width:_768px]:block'
      )}>
        <DesktopNavigation navigationItems={navigationItems} isActive={isActive} navigate={navigate} />
      </div>

      {/* Mobile Navigation - Hidden on desktop */}
      <div className={cn(
        'mobile-nav block',
        '@container/nav-[min-width:_768px]:hidden'
      )}>
        <MobileNavigationHeader 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
        />
        
        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <MobileMenuOverlay 
            navigationItems={navigationItems}
            isActive={isActive}
            navigate={navigate}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className={cn(
        'bottom-nav fixed bottom-0 left-0 right-0 z-40',
        'bg-background border-t',
        'block @container/nav-[min-width:_768px]:hidden'
      )}>
        <BottomNavigation navigationItems={navigationItems} isActive={isActive} navigate={navigate} />
      </div>
    </nav>
  );
};

interface DesktopNavigationProps {
  navigationItems: any[];
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
}

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  navigationItems,
  isActive,
  navigate
}) => {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center space-x-8">
        <div className="font-bold text-xl">EDC</div>
        <nav className="flex space-x-4">
          {navigationItems.slice(0, 5).map((item) => (
            <Button
              key={item.id}
              variant={isActive(item.path) ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2"
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{item.label}</span>
            </Button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface MobileNavigationHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const MobileNavigationHeader: React.FC<MobileNavigationHeaderProps> = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isSearchOpen,
  setIsSearchOpen
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
        className="touch-target-44"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      
      <div className="font-bold text-lg">EDC</div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          aria-label="Search"
          className="touch-target-44"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Notifications"
          className="touch-target-44"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

interface MobileMenuOverlayProps {
  navigationItems: any[];
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
  onClose: () => void;
}

const MobileMenuOverlay: React.FC<MobileMenuOverlayProps> = ({
  navigationItems,
  isActive,
  navigate,
  onClose
}) => {
  return (
    <div className="absolute top-full left-0 right-0 bg-background border-b shadow-lg">
      <div className="px-4 py-2 space-y-1">
        {navigationItems.map((item) => (
          <Button
            key={item.id}
            variant={isActive(item.path) ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
            className="w-full justify-start touch-target-44"
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

interface BottomNavigationProps {
  navigationItems: any[];
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  navigationItems,
  isActive,
  navigate
}) => {
  const primaryItems = navigationItems.slice(0, 4);
  const quickActionItem = { id: 'add', label: 'Add', icon: Plus, path: '/add' };

  return (
    <div className="flex items-center justify-around px-2 py-2 bg-background">
      {primaryItems.map((item) => (
        <Button
          key={item.id}
          variant="ghost"
          size="sm"
          onClick={() => navigate(item.path)}
          className={cn(
            'flex flex-col items-center justify-center',
            'min-h-[44px] min-w-[44px] px-2',
            'touch-target-44',
            isActive(item.path) && 'text-primary'
          )}
        >
          <item.icon className="h-5 w-5 mb-1" />
          <span className="text-xs">{item.label}</span>
        </Button>
      ))}
      
      {/* Quick Action Button */}
      <Button
        variant="primary"
        size="sm"
        onClick={() => navigate('/add')}
        className={cn(
          'flex flex-col items-center justify-center',
          'min-h-[44px] min-w-[44px] px-2',
          'rounded-full',
          'touch-target-44'
        )}
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
};

interface MobileNavigationProps {
  navigationItems: any[];
  isActive: (path: string) => boolean;
  navigate: (path: string) => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  navigationItems,
  isActive,
  navigate
}) => {
  return (
    <>
      <ResponsiveNavigation variant="adaptive" />
      <BottomNavigation navigationItems={navigationItems} isActive={isActive} navigate={navigate} />
    </>
  );
};
