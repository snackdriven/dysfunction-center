import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { BreadcrumbNavigation } from '../ui/BreadcrumbNavigation';
// AccessibilityTestSuite removed as non-critical testing feature

export const AppShell: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Skip Navigation Links */}
      <a 
        href="#main-content" 
        className="skip-link"
        onFocus={(e) => e.currentTarget.focus()}
      >
        Skip to main content
      </a>
      <a 
        href="#navigation" 
        className="skip-link"
        onFocus={(e) => e.currentTarget.focus()}
      >
        Skip to navigation
      </a>
      
      <div className="flex h-screen">
        {/* Sidebar */}
        <nav id="navigation" aria-label="Main navigation" role="navigation">
          <AppSidebar isOpen={isMobileMenuOpen} onClose={handleMenuClose} />
        </nav>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col lg:ml-0 overflow-hidden">
          {/* Header */}
          <AppHeader 
            onMenuToggle={handleMenuToggle} 
            isMobileMenuOpen={isMobileMenuOpen} 
          />
          
          {/* Main content */}
          <main 
            id="main-content" 
            className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900"
            role="main"
            aria-label="Main content area"
            tabIndex={-1}
          >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in max-w-7xl">
              <BreadcrumbNavigation />
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      {/* Non-critical testing components removed */}
    </div>
  );
};