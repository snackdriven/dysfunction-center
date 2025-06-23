# Frontend Phase 1: Foundation Setup Implementation Prompt

## 🎯 Phase 1 Objective

Establish the complete frontend foundation for Executive Dysfunction Center with modern tooling, design system implementation, layout structure, and basic API integration. This phase creates the solid foundation for all subsequent feature development.

## 📋 Phase 1 Implementation Checklist

### 1.1 Project Setup & Configuration
- [ ] Initialize React 18 + TypeScript project with Vite
- [ ] Configure Tailwind CSS with custom design tokens
- [ ] Set up Radix UI primitives integration
- [ ] Install and configure state management (Zustand + React Query)
- [ ] Set up routing with React Router DOM
- [ ] Configure build tools and development environment
- [ ] Set up testing framework (Vitest + React Testing Library)
- [ ] Configure ESLint, Prettier, and TypeScript strict mode

### 1.2 Design System Implementation
- [ ] Implement CSS custom properties for theme system
- [ ] Create utility functions for class name management
- [ ] Set up responsive breakpoint system
- [ ] Implement dark/light theme switching logic
- [ ] Create animation and transition utilities
- [ ] Set up icon system with Lucide React
- [ ] Configure font loading (Inter + JetBrains Mono)

### 1.3 Base Component Library
- [ ] Implement Button component with all variants
- [ ] Create Input component with validation states
- [ ] Build Card component system
- [ ] Implement Badge and Label components
- [ ] Create Checkbox and Radio components
- [ ] Build Select and Dropdown components
- [ ] Implement Modal and Dialog components
- [ ] Create Progress and Slider components
- [ ] Build Tooltip and Popover components

### 1.4 Layout & Navigation Structure
- [ ] Create App Shell layout component
- [ ] Implement responsive sidebar navigation
- [ ] Build header with search and user menu
- [ ] Create breadcrumb navigation system
- [ ] Implement mobile navigation (bottom tabs + slide-out menu)
- [ ] Build page layout templates
- [ ] Create loading states and skeleton screens
- [ ] Implement error boundary components

### 1.5 API Integration Foundation
- [ ] Set up Axios with interceptors for Encore.ts backend
- [ ] Create API service layer with type safety
- [ ] Implement React Query configuration
- [ ] Set up optimistic updates pattern
- [ ] Create error handling middleware
- [ ] Implement API response caching strategy
- [ ] Set up development proxy for local API calls
- [ ] Create mock data for development

### 1.6 State Management Setup
- [ ] Create global app state structure
- [ ] Implement theme state management
- [ ] Set up user preferences state
- [ ] Create navigation state management
- [ ] Build loading and error state patterns
- [ ] Implement local storage persistence
- [ ] Set up state devtools integration

## 🚀 Detailed Implementation Instructions

### Project Initialization

```bash
# Initialize project
npm create vite@latest executive-dysfunction-center-frontend -- --template react-ts
cd executive-dysfunction-center-frontend

# Install core dependencies
npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast @radix-ui/react-tooltip

# Install state management and data fetching
npm install zustand @tanstack/react-query @tanstack/react-query-devtools

# Install routing and forms
npm install react-router-dom react-hook-form @hookform/resolvers zod

# Install styling and animations
npm install tailwindcss autoprefixer postcss class-variance-authority clsx tailwind-merge framer-motion

# Install icons and utilities
npm install lucide-react date-fns axios

# Install development dependencies
npm install -D @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-plugin-react-hooks eslint-plugin-react-refresh prettier eslint-config-prettier vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### Tailwind Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#4C566A", // Nord3
        input: "#434C5E", // Nord2
        ring: "#88C0D0", // Nord8
        background: "#2E3440", // Nord0
        foreground: "#D8DEE9", // Nord4
        primary: {
          DEFAULT: "#81A1C1", // Nord9
          foreground: "#ECEFF4", // Nord6
        },
        secondary: {
          DEFAULT: "#8FBCBB", // Nord7
          foreground: "#D8DEE9", // Nord4
        },
        destructive: {
          DEFAULT: "#BF616A", // Nord11
          foreground: "#ECEFF4", // Nord6
        },
        muted: {
          DEFAULT: "#434C5E", // Nord2
          foreground: "#D8DEE9", // Nord4
        },
        accent: {
          DEFAULT: "#5E81AC", // Nord10
          foreground: "#ECEFF4", // Nord6
        },
        popover: {
          DEFAULT: "#3B4252", // Nord1
          foreground: "#D8DEE9", // Nord4
        },
        card: {
          DEFAULT: "#3B4252", // Nord1
          foreground: "#D8DEE9", // Nord4
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Global CSS Setup

```css
/* src/styles/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Color System */
    --primary-50: #eef2ff;
    --primary-100: #e0e7ff;
    --primary-500: #6366f1;
    --primary-600: #5855eb;
    --primary-700: #4338ca;
    --primary-900: #312e81;

    /* Semantic Colors */
    --success-50: #ecfdf5;
    --success-500: #10b981;
    --success-600: #059669;
    
    --warning-50: #fffbeb;
    --warning-500: #f59e0b;
    --warning-600: #d97706;
    
    --error-50: #fef2f2;
    --error-500: #ef4444;
    --error-600: #dc2626;

    /* Light Theme */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  [data-theme="dark"] {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### App Shell Structure

```typescript
// src/components/layout/AppShell.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const AppShell: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar />}
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobile && <MobileNav />}
    </div>
  );
};
```

### Sidebar Navigation

```typescript
// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Smile, 
  Calendar, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview and quick actions'
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    description: 'Manage your tasks'
  },
  {
    name: 'Habits',
    href: '/habits',
    icon: Target,
    description: 'Track your habits'
  },
  {
    name: 'Mood',
    href: '/mood',
    icon: Smile,
    description: 'Log your mood'
  },
  {
    name: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'View your schedule'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'View insights'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App preferences'
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col w-64 bg-card border-r border-border">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg">Executive Dysfunction Center</h1>
            <p className="text-xs text-muted-foreground">Productivity Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <item.icon className="h-5 w-5" />
              <div className="flex-1">
                <div>{item.name}</div>
                <div className={cn(
                  'text-xs',
                  isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {item.description}
                </div>
              </div>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
```

### Header Component

```typescript
// src/components/layout/Header.tsx
import React from 'react';
import { Search, Bell, User, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { useTheme } from '@/hooks/useTheme';

export const Header: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, habits, or moods..."
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === 'light' && <Sun className="h-4 w-4" />}
                {theme === 'dark' && <Moon className="h-4 w-4" />}
                {theme === 'system' && <Monitor className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
```

### State Management Setup

```typescript
// src/stores/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme
  theme: 'light' | 'dark' | 'system' | 'nord';
  setTheme: (theme: 'light' | 'dark' | 'system' | 'nord') => void;

  // Navigation
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // UI State
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
          document.documentElement.setAttribute('data-theme', 'light');
        } else if (theme === 'nord') {
          document.documentElement.setAttribute('data-theme', 'nord');
        } else {
          // System theme
          const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light');
        }
      },

      // Navigation
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // UI State
      loading: false,
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'executive-dysfunction-center-app-store',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
```

### API Service Layer

```typescript
// src/services/api.ts
import axios from 'axios';

// Base API configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth-token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Tasks
  tasks: {
    list: '/tasks',
    create: '/tasks',
    get: (id: string) => `/tasks/${id}`,
    update: (id: string) => `/tasks/${id}`,
    delete: (id: string) => `/tasks/${id}`,
    categories: '/tasks/categories',
    tags: '/tasks/tags',
    timeEntries: '/tasks/time-entries',
    analytics: '/tasks/analytics',
  },
  
  // Habits
  habits: {
    list: '/habits',
    create: '/habits',
    get: (id: string) => `/habits/${id}`,
    update: (id: string) => `/habits/${id}`,
    delete: (id: string) => `/habits/${id}`,
    completions: (id: string) => `/habits/${id}/completions`,
    templates: '/habits/templates',
    analytics: '/habits/analytics',
  },
  
  // Mood
  mood: {
    list: '/mood',
    create: '/mood',
    get: (id: string) => `/mood/${id}`,
    update: (id: string) => `/mood/${id}`,
    delete: (id: string) => `/mood/${id}`,
    today: '/mood/today',
    patterns: '/mood/patterns',
    triggers: '/mood/triggers',
  },
  
  // Calendar
  calendar: {
    events: '/calendar/events',
    create: '/calendar/events',
    get: (id: string) => `/calendar/events/${id}`,
    update: (id: string) => `/calendar/events/${id}`,
    delete: (id: string) => `/calendar/events/${id}`,
    day: (date: string) => `/calendar/events/day/${date}`,
    week: (date: string) => `/calendar/events/week/${date}`,
    month: (year: number, month: number) => `/calendar/events/month/${year}/${month}`,
  },
  
  // Preferences
  preferences: {
    get: (key: string) => `/preferences/${key}`,
    set: '/preferences',
    theme: '/theme',
  },
  
  // API Info
  api: {
    info: '/api/info',
    health: '/api/health',
  },
};
```

### React Query Setup

```typescript
// src/providers/QueryProvider.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 404) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
```

## 🧪 Testing Strategy

### Component Testing Template

```typescript
// src/components/ui/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-error-500');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

## ✅ Phase 1 Success Criteria

### Functional Requirements
- [ ] Complete project setup with all dependencies
- [ ] Fully functional design system with theme switching
- [ ] Responsive layout structure working on all devices
- [ ] Navigation working with proper routing
- [ ] Base components library with comprehensive coverage
- [ ] API integration layer with error handling
- [ ] State management working with persistence
- [ ] Development environment optimized for productivity

### Technical Requirements
- [ ] TypeScript strict mode with no errors
- [ ] ESLint and Prettier configured and passing
- [ ] Build process optimized for development and production
- [ ] Test framework setup with initial tests passing
- [ ] Git hooks configured for code quality
- [ ] Documentation updated with setup instructions

### Quality Assurance
- [ ] All components accessible (WCAG compliant)
- [ ] Responsive design tested on multiple devices
- [ ] Theme switching working correctly
- [ ] Performance optimized (no unnecessary re-renders)
- [ ] Error boundaries catching and displaying errors properly
- [ ] Loading states implemented throughout

## 🔄 Phase 1 Deliverables

1. **Complete Development Environment**: Ready for feature development
2. **Design System**: Fully implemented with theme support
3. **Component Library**: Base components ready for composition
4. **Layout Structure**: App shell with navigation
5. **API Foundation**: Service layer ready for data integration
6. **State Management**: Global state with persistence
7. **Testing Framework**: Ready for TDD approach
8. **Documentation**: Setup and development guides

Upon completion of Phase 1, the frontend foundation will be solid, scalable, and ready for rapid feature development in subsequent phases.