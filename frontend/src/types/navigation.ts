import { ComponentType, SVGAttributes } from 'react';

type IconProps = SVGAttributes<SVGElement> & {
  size?: string | number;
  color?: string;
  strokeWidth?: string | number;
};

export interface NavigationItem {
  path: string;
  label: string;
  icon: ComponentType<IconProps>;
  description?: string;
  badge?: number;
  color?: string;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export const navigationConfig = {
  main: [
    { path: '/dashboard', label: 'Dashboard', icon: 'Home', description: 'Overview and quick actions', color: 'blue' },
    { path: '/tasks', label: 'Tasks', icon: 'CheckSquare', description: 'Manage your to-dos', color: 'red' },
    { path: '/habits', label: 'Habits', icon: 'Target', description: 'Track daily habits', color: 'green' },
    { path: '/mood', label: 'Mood', icon: 'Heart', description: 'Log your feelings', color: 'purple' },
    { path: '/calendar', label: 'Calendar', icon: 'Calendar', description: 'Schedule and events', color: 'orange' },
    { path: '/journal', label: 'Journal', icon: 'BookOpen', description: 'Daily reflections', color: 'indigo' }
  ],
  secondary: [
    { path: '/settings', label: 'Settings', icon: 'Settings', description: 'App preferences' },
    { path: '/help', label: 'Help', icon: 'HelpCircle', description: 'Support and guides' }
  ]
} as const;