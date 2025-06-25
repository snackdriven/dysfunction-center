import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Habits } from './pages/Habits';
import { Mood } from './pages/Mood';
import { Journal } from './pages/Journal';
import { Calendar } from './pages/Calendar';
import { Settings } from './pages/Settings';
import { UIDemo } from './pages/UIDemo';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastContainer } from './components/common/Toast';
import { QueryProvider } from './providers/QueryProvider';
import { useThemeInitializer } from './hooks/useThemeInitializer';

function App() {
  // Initialize theme on app load
  useThemeInitializer();

  return (
    <ErrorBoundary>
      <QueryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="habits" element={<Habits />} />
              <Route path="mood" element={<Mood />} />
              <Route path="journal" element={<Journal />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="analytics" element={<div>Analytics (Coming Soon)</div>} />
              <Route path="settings" element={<Settings />} />
              <Route path="ui-demo" element={<UIDemo />} />
            </Route>
          </Routes>
        </Router>
        <ToastContainer />
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;