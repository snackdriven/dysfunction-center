import React from 'react';
import { DashboardTabs } from '../components/dashboard/DashboardTabs';

/**
 * Main dashboard page with simplified, tabbed interface
 * Replaces the information-heavy UnifiedDashboard with progressive disclosure
 */
export const Dashboard: React.FC = () => {
  return <DashboardTabs />;
};