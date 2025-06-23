import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../../../pages/Dashboard';

// Mock the child components to avoid testing their implementation details
jest.mock('../../../components/dashboard/widgets/TodaysFocusWidget', () => ({
  TodaysFocusWidget: () => <div data-testid="todays-focus-widget">Today's Focus Widget</div>
}));

jest.mock('../../../components/dashboard/widgets/HabitTrackerWidget', () => ({
  HabitTrackerWidget: () => <div data-testid="habit-tracker-widget">Habit Tracker Widget</div>
}));

jest.mock('../../../components/dashboard/widgets/MoodCheckinWidget', () => ({
  MoodCheckinWidget: () => <div data-testid="mood-checkin-widget">Mood Check-in Widget</div>
}));

jest.mock('../../../components/dashboard/widgets/UpcomingEventsWidget', () => ({
  UpcomingEventsWidget: () => <div data-testid="upcoming-events-widget">Upcoming Events Widget</div>
}));

jest.mock('../../../components/dashboard/widgets/WeeklyProgressWidget', () => ({
  WeeklyProgressWidget: () => <div data-testid="weekly-progress-widget">Weekly Progress Widget</div>
}));

jest.mock('../../../components/dashboard/widgets/QuickActionsWidget', () => ({
  QuickActionsWidget: () => <div data-testid="quick-actions-widget">Quick Actions Widget</div>
}));

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
  it('renders main heading', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('Good morning!')).toBeInTheDocument();
  });

  it('renders dashboard subtitle', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText(/Let's make today productive and positive/)).toBeInTheDocument();
  });

  it('renders all dashboard widgets', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByTestId('todays-focus-widget')).toBeInTheDocument();
    expect(screen.getByTestId('habit-tracker-widget')).toBeInTheDocument();
    expect(screen.getByTestId('mood-checkin-widget')).toBeInTheDocument();
    expect(screen.getByTestId('upcoming-events-widget')).toBeInTheDocument();
    expect(screen.getByTestId('weekly-progress-widget')).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions-widget')).toBeInTheDocument();
  });
});