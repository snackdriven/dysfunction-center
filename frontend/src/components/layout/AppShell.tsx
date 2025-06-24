import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { useNavigation, useResponsive } from '../../hooks';
import { cn } from '../../utils/cn';

export const AppShell: React.FC = () => {
  const { isSidebarOpen, isMobile } = useNavigation();
  
  // Initialize responsive hook to set up mobile detection
  useResponsive();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {/* Desktop/Tablet Sidebar */}
        {!isMobile && (
          <Sidebar 
            isOpen={isSidebarOpen}
            className="hidden lg:block"
          />
        )}
        
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-200",
            !isMobile && isSidebarOpen && "lg:ml-64",
            !isMobile && !isSidebarOpen && "lg:ml-16"
          )}
        >
          <div className="container mx-auto p-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Navigation */}
      {isMobile && <MobileNavigation />}
    </div>
  );
};