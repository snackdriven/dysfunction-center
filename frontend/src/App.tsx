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
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { QueryProvider } from './providers/QueryProvider';

function App() {
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
            </Route>
          </Routes>
        </Router>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default App;