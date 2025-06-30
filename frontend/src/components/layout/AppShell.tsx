import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useNavigation } from '../../hooks';
import { cn } from '../../utils/cn';

export const AppShell: React.FC = () => {
  const { isSidebarOpen } = useNavigation();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        {/* Sidebar with proper ID for ARIA controls */}
        <Sidebar id="main-sidebar" isOpen={isSidebarOpen} />
        
        {/* Main Content with skip link target */}
        <main 
          id="main-content"
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-200",
            isSidebarOpen ? "ml-0" : "ml-0"
          )}
          style={{
            marginLeft: isSidebarOpen ? '16rem' : '4rem'
          }}
          tabIndex={-1}
        >
          <div className="container mx-auto p-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};