import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Route to breadcrumb mapping
const routeBreadcrumbs: Record<string, BreadcrumbItem[]> = {
  '/': [
    { label: 'Dashboard', path: '/', icon: Home }
  ],
  '/dashboard': [
    { label: 'Dashboard', path: '/dashboard', icon: Home }
  ],
  '/tasks': [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Tasks', path: '/tasks' }
  ],
  '/habits': [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Habits', path: '/habits' }
  ],
  '/mood': [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Mood', path: '/mood' }
  ],
  '/journal': [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Journal', path: '/journal' }
  ],
  '/calendar': [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Calendar', path: '/calendar' }
  ],
  '/analytics': [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Analytics', path: '/analytics' }
  ],
  '/settings': [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Settings', path: '/settings' }
  ]
};

interface BreadcrumbNavigationProps {
  className?: string;
  /** Custom breadcrumb items to override route-based ones */
  customBreadcrumbs?: BreadcrumbItem[];
  /** Hide the breadcrumb on specific routes */
  hideOnRoutes?: string[];
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  className,
  customBreadcrumbs,
  hideOnRoutes = []
}) => {
  const location = useLocation();
  
  // Don't show breadcrumbs on routes that should hide them
  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  const breadcrumbs = customBreadcrumbs || routeBreadcrumbs[location.pathname] || [
    { label: 'Dashboard', path: '/dashboard', icon: Home }
  ];

  // Don't show if only one item (current page)
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className={cn("mb-4", className)}
    >
      <ol
        className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
        role="list"
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = item.icon;
          
          return (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className="h-4 w-4 mx-2 text-gray-400" 
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span
                  className="flex items-center font-medium text-gray-900 dark:text-gray-100"
                  aria-current="page"
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" aria-hidden="true" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-1"
                  aria-label={`Go to ${item.label}`}
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" aria-hidden="true" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Context breadcrumb for complex navigation hierarchies
interface BreadcrumbContextProps {
  children: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
}

const BreadcrumbContext = React.createContext<BreadcrumbItem[]>([]);

export const BreadcrumbProvider: React.FC<BreadcrumbContextProps> = ({
  children,
  breadcrumbs
}) => {
  return (
    <BreadcrumbContext.Provider value={breadcrumbs}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = () => {
  return React.useContext(BreadcrumbContext);
};

// Page title with breadcrumbs
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
  breadcrumbs,
  className
}) => {
  return (
    <div className={cn("mb-6", className)}>
      <BreadcrumbNavigation customBreadcrumbs={breadcrumbs} />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        
        {children && (
          <div className="flex items-center gap-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
