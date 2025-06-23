import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Habits } from './pages/Habits';
import { Mood } from './pages/Mood';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="habits" element={<Habits />} />
          <Route path="mood" element={<Mood />} />
          <Route path="calendar" element={<div>Calendar (Coming Soon)</div>} />
          <Route path="analytics" element={<div>Analytics (Coming Soon)</div>} />
          <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;