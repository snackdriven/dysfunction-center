import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { IntegratedCalendarView } from '../../components/calendar/IntegratedCalendarView';
import { UnifiedDashboard } from '../../components/dashboard/UnifiedDashboard';
import { DataExportImport } from '../../components/settings/DataExportImport';
import { ThemeCustomization } from '../../components/settings/ThemeCustomization';
import { integrationService } from '../../services/integration';
import { useAppStore } from '../../stores/useAppStore';
import { 
  DailyProductivityData, 
  CalendarDataOverlay, 
  ProductivityInsight,
  CustomTheme 
} from '../../../../shared/types';

// Mock data
const mockProductivityData: DailyProductivityData = {
  date: '2024-01-15',
  tasks: { total: 5, completed: 3, overdue: 1 },
  habits: { total: 4, completed: 2, streak_count: 7 },
  mood: { score: 4, energy_level: 3, stress_level: 2 },
  events: { total: 2, duration_minutes: 180 },
  journal: { entries_count: 2, word_count: 500, productivity_score: 80, tags: ['reflection', 'goals'] },
  productivity_score: 75,
};

const mockCalendarOverlay: CalendarDataOverlay = {
  date: '2024-01-15',
  task_deadlines: [
    { id: 1, title: 'Complete project', priority: 'high', completed: false },
    { id: 2, title: 'Review documents', priority: 'medium', completed: true },
  ],
  habit_completions: [
    { id: 1, name: 'Exercise', completed: true, streak_count: 7 },
    { id: 2, name: 'Read', completed: false, streak_count: 3 },
  ],
  mood_score: 4,
  mood_color: '#10b981',
  events: [
    { id: 1, title: 'Team meeting', start_time: '2024-01-15T09:00:00Z', end_time: '2024-01-15T10:00:00Z' },
  ],
};

const mockInsights: ProductivityInsight[] = [
  {
    id: 'insight1',
    type: 'positive',
    title: 'Great habit consistency!',
    description: 'You\'ve maintained a 7-day streak on exercise',
    priority: 'medium',
    action_items: ['Keep up the momentum', 'Consider adding a new habit'],
    related_domains: ['habits'],
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'insight2',
    type: 'warning',
    title: 'Task completion declining',
    description: 'Your task completion rate has dropped 20% this week',
    priority: 'high',
    action_items: ['Review task priorities', 'Break down large tasks'],
    related_domains: ['tasks'],
    created_at: '2024-01-15T11:00:00Z',
  },
];

// Mock server
const server = setupServer(
  // Productivity data endpoints
  http.get('/integration/productivity/:date', () => {
    return HttpResponse.json(mockProductivityData);
  }),
  
  http.get('/integration/calendar-overlay/:date', () => {
    return HttpResponse.json(mockCalendarOverlay);
  }),
  
  http.get('/integration/insights', () => {
    return HttpResponse.json(mockInsights);
  }),
  
  http.get('/integration/correlations', () => {
    return HttpResponse.json([]);
  }),
  
  // Export endpoints
  http.post('/export', () => {
    return HttpResponse.json({
      content: '{"test": "data"}',
      filename: 'test-export.json',
      contentType: 'application/json',
    });
  }),
  
  // Backup endpoints
  http.get('/integration/backups', () => {
    return HttpResponse.json([
      {
        id: 'backup1',
        created_at: '2024-01-14T12:00:00Z',
        size_bytes: 2048,
        domains: ['tasks', 'habits', 'mood'],
        version: '1.0',
        user_initiated: true,
      },
    ]);
  }),
  
  http.post('/integration/backup', () => {
    return HttpResponse.json({
      id: 'backup2',
      created_at: new Date().toISOString(),
      size_bytes: 1024,
      domains: ['tasks', 'habits', 'mood', 'calendar'],
      version: '1.0',
      user_initiated: true,
    });
  }),

  // Task scheduling
  http.post('/integration/schedule-task', () => {
    return HttpResponse.json({ eventId: 123 });
  }),

  // Individual domain endpoints
  http.get('/tasks', () => {
    return HttpResponse.json([
      { id: 1, title: 'Complete project', priority: 'high', completed: false, due_date: '2024-01-15' },
      { id: 2, title: 'Review documents', priority: 'medium', completed: true, due_date: '2024-01-15' },
    ]);
  }),

  http.get('/habits', () => {
    return HttpResponse.json([
      { id: 1, name: 'Exercise', current_streak: 7, completions: [{ date: '2024-01-15', completed: true }] },
      { id: 2, name: 'Read', current_streak: 3, completions: [{ date: '2024-01-15', completed: false }] },
    ]);
  }),

  http.get('/mood/today', () => {
    return HttpResponse.json({
      id: 1,
      date: '2024-01-15',
      primary_mood: 'happy',
      mood_score: 4,
      energy_level: 3,
      stress_level: 2,
    });
  }),

  http.get('/calendar/events', () => {
    return HttpResponse.json([
      {
        id: 1,
        title: 'Team meeting',
        start_datetime: '2024-01-15T09:00:00Z',
        end_datetime: '2024-01-15T10:00:00Z',
        is_all_day: false,
      },
    ]);
  }),
);

// Test utilities
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {component}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Cross-Domain Integration', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.getState().setSelectedDate('2024-01-15');
  });

  describe('Integrated Calendar View', () => {
    it('should display tasks, habits, and mood data on calendar days', async () => {
      const mockEvents = [
        {
          id: 1,
          title: 'Team meeting',
          start_datetime: '2024-01-15T09:00:00Z',
          end_datetime: '2024-01-15T10:00:00Z',
          is_all_day: false,
        },
      ];

      const mockTasks = [
        { id: 1, title: 'Complete project', priority: 'high', completed: false, due_date: '2024-01-15' },
      ];

      const mockHabits = [
        { id: 1, name: 'Exercise', current_streak: 7, completions: [{ date: '2024-01-15', completed: true }] },
      ];

      const mockMoodEntries = [
        { id: 1, date: '2024-01-15', primary_mood: 'happy', mood_score: 4 },
      ];

      renderWithProviders(
        <IntegratedCalendarView
          currentDate={new Date('2024-01-15')}
          viewType="month"
          events={mockEvents}
          tasks={mockTasks}
          habits={mockHabits}
          moodEntries={mockMoodEntries}
          isLoading={false}
        />
      );

      // Check for productivity score indicator
      await waitFor(() => {
        expect(screen.getByText('7')).toBeInTheDocument(); // Productivity score (70/10)
      });

      // Check for task indicator
      expect(screen.getByText('Complete project')).toBeInTheDocument();

      // Check for habit completion dots
      const habitDots = screen.getAllByRole('generic').filter(el => 
        el.className.includes('rounded-full') && el.className.includes('bg-green-500')
      );
      expect(habitDots.length).toBeGreaterThan(0);

      // Check for mood color indicator
      const dayCell = screen.getByText('15').closest('div');
      expect(dayCell).toHaveStyle({ borderLeftColor: '#10b981' });
    });

    it('should open day detail modal when clicking on a day', async () => {
      
      renderWithProviders(
        <IntegratedCalendarView
          currentDate={new Date('2024-01-15')}
          viewType="month"
          events={[]}
          tasks={[]}
          habits={[]}
          moodEntries={[]}
          isLoading={false}
        />
      );

      // Click on day 15
      const day15 = screen.getByText('15');
      await userEvent.click(day15);

      // Check modal appears
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Check date header in modal
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
    });

    it('should support drag and drop task scheduling', async () => {
      const mockTasks = [
        { id: 1, title: 'Complete project', priority: 'high', completed: false, due_date: '2024-01-16' },
      ];

      renderWithProviders(
        <IntegratedCalendarView
          currentDate={new Date('2024-01-15')}
          viewType="month"
          events={[]}
          tasks={mockTasks}
          habits={[]}
          moodEntries={[]}
          isLoading={false}
        />
      );

      // Find the task element
      const taskElement = screen.getByText('Complete project');
      expect(taskElement).toBeInTheDocument();

      // Note: Full drag and drop testing requires more complex setup
      // This test verifies the task element is draggable
      expect(taskElement.closest('[draggable="true"]')).toBeInTheDocument();
    });
  });

  describe('Unified Dashboard', () => {
    it('should display productivity score and insights', async () => {
      renderWithProviders(<UnifiedDashboard />);

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Daily Productivity Score')).toBeInTheDocument();
      });

      // Check productivity score
      expect(screen.getByText('75/100')).toBeInTheDocument();

      // Check insights section
      expect(screen.getByText('AI Insights & Recommendations')).toBeInTheDocument();
      expect(screen.getByText('Great habit consistency!')).toBeInTheDocument();
      expect(screen.getByText('Task completion declining')).toBeInTheDocument();
    });

    it('should show cross-domain data in today\'s focus', async () => {
      renderWithProviders(<UnifiedDashboard />);

      // Wait for tabs to be available
      await waitFor(() => {
        expect(screen.getByText('Today\'s Focus')).toBeInTheDocument();
      });

      // Check for different domain sections
      expect(screen.getByText('Priority Tasks')).toBeInTheDocument();
      expect(screen.getByText('Today\'s Habits')).toBeInTheDocument();
      expect(screen.getByText('Mood Check-in')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Events')).toBeInTheDocument();
    });

    it('should allow navigation between date ranges', async () => {
      renderWithProviders(<UnifiedDashboard />);

      // Find date input
      const dateInput = screen.getByDisplayValue('2024-01-15');
      expect(dateInput).toBeInTheDocument();

      // Change date
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, '2024-01-16');

      // Verify store is updated
      await waitFor(() => {
        expect(useAppStore.getState().selectedDate).toBe('2024-01-16');
      });
    });
  });

  describe('Data Export and Import', () => {
    it('should export data with selected domains and format', async () => {
      renderWithProviders(<DataExportImport />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByText('Export Data')).toBeInTheDocument();
      });

      // Select JSON format
      const formatSelect = screen.getByDisplayValue('JSON (Complete data with structure)');
      expect(formatSelect).toBeInTheDocument();

      // Uncheck some domains
      const habitsCheckbox = screen.getByLabelText('Habits');
      await userEvent.click(habitsCheckbox);

      // Set date range
      const startDateInput = screen.getByPlaceholderText('Start date');
      const endDateInput = screen.getByPlaceholderText('End date');
      await userEvent.type(startDateInput, '2024-01-01');
      await userEvent.type(endDateInput, '2024-01-31');

      // Click export button
      const exportButton = screen.getByText('Export Data');
      await userEvent.click(exportButton);

      // Wait for export to complete
      await waitFor(() => {
        expect(screen.getByText('Preparing Export...')).toBeInTheDocument();
      });
    });

    it('should create and manage backups', async () => {
      
      
      renderWithProviders(<DataExportImport />);

      // Switch to backup tab
      const backupTab = screen.getByText('Backup & Restore');
      await userEvent.click(backupTab);

      // Wait for backup list to load
      await waitFor(() => {
        expect(screen.getByText('Backup History')).toBeInTheDocument();
      });

      // Check existing backup
      expect(screen.getByText('Manual Backup')).toBeInTheDocument();

      // Create new backup
      const createBackupButton = screen.getByText('Create Backup');
      await userEvent.click(createBackupButton);

      // Wait for backup creation
      await waitFor(() => {
        expect(screen.getByText('Creating...')).toBeInTheDocument();
      });
    });

    it('should restore from backup with domain selection', async () => {
      
      
      renderWithProviders(<DataExportImport />);

      // Switch to backup tab
      const backupTab = screen.getByText('Backup & Restore');
      await userEvent.click(backupTab);

      // Wait for backup list
      await waitFor(() => {
        expect(screen.getByText('Manual Backup')).toBeInTheDocument();
      });

      // Click restore button
      const restoreButton = screen.getByText('Restore');
      await userEvent.click(restoreButton);

      // Wait for restore dialog
      await waitFor(() => {
        expect(screen.getByText('Restore Backup')).toBeInTheDocument();
      });

      // Check domain selection
      expect(screen.getByLabelText('Tasks')).toBeChecked();
      expect(screen.getByLabelText('Habits')).toBeChecked();
      expect(screen.getByLabelText('Mood')).toBeChecked();

      // Uncheck mood
      const moodCheckbox = screen.getByLabelText('Mood');
      await userEvent.click(moodCheckbox);

      // Click restore data button
      const restoreDataButton = screen.getByText('Restore Data');
      await userEvent.click(restoreDataButton);

      // Verify warning and confirmation
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });
  });

  describe('Theme Customization', () => {
    it('should apply preset themes', async () => {
      
      
      renderWithProviders(<ThemeCustomization />);

      // Wait for presets to load
      await waitFor(() => {
        expect(screen.getByText('Ocean Blue')).toBeInTheDocument();
      });

      // Click on ocean blue preset
      const oceanBlueTheme = screen.getByText('Ocean Blue');
      await userEvent.click(oceanBlueTheme);

      // Click apply theme
      const applyButton = within(oceanBlueTheme.closest('.p-3')!).getByText('Apply Theme');
      await userEvent.click(applyButton);

      // Verify theme is applied to store
      await waitFor(() => {
        const customTheme = useAppStore.getState().customTheme;
        expect(customTheme?.name).toBe('Ocean Blue');
        expect(customTheme?.colors.primary).toBe('#0ea5e9');
      });
    });

    it('should customize theme colors', async () => {
      
      
      renderWithProviders(<ThemeCustomization />);

      // Wait for color inputs
      await waitFor(() => {
        expect(screen.getByLabelText('Primary')).toBeInTheDocument();
      });

      // Change primary color
      const primaryColorInput = screen.getByLabelText('Primary').nextSibling as HTMLInputElement;
      await userEvent.clear(primaryColorInput);
      await userEvent.type(primaryColorInput, '#ff0000');

      // Preview theme
      const previewButton = screen.getByText('Preview Theme');
      await userEvent.click(previewButton);

      // Check preview mode badge
      expect(screen.getByText('Preview Mode Active')).toBeInTheDocument();

      // Save theme
      const saveButton = screen.getByText('Save Theme');
      await userEvent.click(saveButton);

      // Verify theme is saved
      await waitFor(() => {
        const customTheme = useAppStore.getState().customTheme;
        expect(customTheme?.colors.primary).toBe('#ff0000');
      });
    });

    it('should export and import themes', async () => {
      
      
      renderWithProviders(<ThemeCustomization />);

      // Wait for export button
      await waitFor(() => {
        expect(screen.getByText('Export Theme')).toBeInTheDocument();
      });

      // Note: File download testing requires additional setup
      // This test verifies the export button exists and is clickable
      const exportButton = screen.getByText('Export Theme');
      expect(exportButton).toBeInTheDocument();

      // Check import input exists
      const importInput = screen.getByDisplayValue('Import Theme').previousSibling as HTMLInputElement;
      expect(importInput).toHaveAttribute('type', 'file');
      expect(importInput).toHaveAttribute('accept', '.json');
    });

    it('should generate high contrast theme', async () => {
      
      
      renderWithProviders(<ThemeCustomization />);

      // Wait for high contrast button
      await waitFor(() => {
        expect(screen.getByText('Generate High Contrast')).toBeInTheDocument();
      });

      // Click generate high contrast
      const highContrastButton = screen.getByText('Generate High Contrast');
      await userEvent.click(highContrastButton);

      // Check high contrast checkbox is checked
      await waitFor(() => {
        const highContrastCheckbox = screen.getByLabelText('High Contrast Mode');
        expect(highContrastCheckbox).toBeChecked();
      });

      // Verify colors are high contrast
      const backgroundInput = screen.getByDisplayValue('#000000');
      const foregroundInput = screen.getByDisplayValue('#ffffff');
      expect(backgroundInput).toBeInTheDocument();
      expect(foregroundInput).toBeInTheDocument();
    });
  });

  describe('Integration Service', () => {
    it('should fetch daily productivity data', async () => {
      const data = await integrationService.getDailyProductivityData('2024-01-15');
      
      expect(data).toEqual(mockProductivityData);
      expect(data.productivity_score).toBe(75);
      expect(data.tasks.completed).toBe(3);
      expect(data.habits.streak_count).toBe(7);
    });

    it('should fetch calendar overlay data', async () => {
      const data = await integrationService.getCalendarOverlayData('2024-01-15');
      
      expect(data).toEqual(mockCalendarOverlay);
      expect(data.task_deadlines).toHaveLength(2);
      expect(data.habit_completions).toHaveLength(2);
      expect(data.mood_score).toBe(4);
    });

    it('should schedule tasks on calendar', async () => {
      const result = await integrationService.scheduleTaskOnCalendar(1, '2024-01-15T09:00:00Z', 60);
      
      expect(result.eventId).toBe(123);
    });

    it('should handle export operations', async () => {
      const exportRequest = {
        domains: ['tasks', 'habits'] as ('tasks' | 'habits' | 'mood' | 'calendar')[],
        format: 'json' as 'json' | 'csv' | 'markdown',
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      };

      const result = await integrationService.createExport(exportRequest);
      
      expect(result.content).toBe('{\"test\": \"data\"}');
      expect(result.filename).toBe('test-export.json');
      expect(result.contentType).toBe('application/json');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error
      server.use(
        http.get('/integration/productivity/:date', () => {
          return new HttpResponse(null, {
            status: 500,
            statusText: 'Failed to connect',
          })
        })
      );

      renderWithProviders(<UnifiedDashboard />);

      // Should show loading state initially
      expect(screen.getByText('Loading productivity dashboard...')).toBeInTheDocument();

      // Should handle error gracefully
      await waitFor(() => {
        // Component should still render, possibly with error state
        expect(screen.queryByText('Loading productivity dashboard...')).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should handle validation errors in forms', async () => {
      

      // Mock validation error
      server.use(
        http.post('/integration/export', () => {
          return HttpResponse.json(
            {
              message: 'Validation failed',
              errors: [
                { field: 'domains', message: 'At least one domain must be selected' }
              ]
            },
            { status: 400 }
          );
        })
      );

      renderWithProviders(<DataExportImport />);

      // Uncheck all domains to trigger validation error
      const tasksCheckbox = screen.getByLabelText('Tasks');
      const habitsCheckbox = screen.getByLabelText('Habits');
      const moodCheckbox = screen.getByLabelText('Mood');
      const calendarCheckbox = screen.getByLabelText('Calendar');

      await userEvent.click(tasksCheckbox);
      await userEvent.click(habitsCheckbox);
      await userEvent.click(moodCheckbox);
      await userEvent.click(calendarCheckbox);

      // Try to export
      const exportButton = screen.getByText('Export Data');
      await userEvent.click(exportButton);

      // Should handle validation error
      await waitFor(() => {
        expect(exportButton).not.toBeDisabled();
      });
    });
  });
});

describe('Store Integration', () => {
  it('should synchronize selected date across components', () => {
    const { setSelectedDate, selectedDate } = useAppStore.getState();
    
    // Initial date
    expect(selectedDate).toBe('2024-01-15');
    
    // Change date
    setSelectedDate('2024-01-20');
    expect(useAppStore.getState().selectedDate).toBe('2024-01-20');
  });

  it('should manage productivity data cache', () => {
    const { setDailyProductivityData, dailyProductivityData } = useAppStore.getState();
    
    // Add productivity data
    setDailyProductivityData('2024-01-15', mockProductivityData);
    
    // Verify data is stored
    expect(useAppStore.getState().dailyProductivityData.get('2024-01-15')).toEqual(mockProductivityData);
  });

  it('should manage custom theme state', () => {
    const { setCustomTheme, customTheme } = useAppStore.getState();
    
    const testTheme: CustomTheme = {
      id: 'test',
      name: 'Test Theme',
      colors: {
        primary: '#ff0000',
        secondary: '#00ff00',
        accent: '#0000ff',
        background: '#ffffff',
        foreground: '#000000',
        muted: '#f0f0f0',
        border: '#e0e0e0',
      },
      font_size: 'medium',
      font_family: 'system',
      high_contrast: false,
      reduce_motion: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
    };
    
    // Set custom theme
    setCustomTheme(testTheme);
    
    // Verify theme is stored
    expect(useAppStore.getState().customTheme).toEqual(testTheme);
  });
});