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
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} />
        
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] transition-all duration-200",
            isSidebarOpen ? "ml-64" : "ml-16"
          )}
        >
          <div className="container mx-auto p-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};