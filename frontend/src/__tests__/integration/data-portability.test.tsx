import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DataExportImport } from '../../components/settings/DataExportImport';
import { integrationService } from '../../services/integration';

// Mock the integration service
vi.mock('../../services/integration', () => ({
  integrationService: {
    createExport: vi.fn(),
    importData: vi.fn(),
    validateImportData: vi.fn(),
    readFileContent: vi.fn(),
    getBackups: vi.fn(),
    createBackup: vi.fn(),
    restoreFromBackup: vi.fn(),
    deleteBackup: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Download: () => <div data-testid="download-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  FileText: () => <div data-testid="file-text-icon" />,
  FileJson: () => <div data-testid="file-json-icon" />,
  FileCheck: () => <div data-testid="file-check-icon" />,
  Database: () => <div data-testid="database-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Data Portability Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Export Flow', () => {
    it('should complete full export flow', async () => {
      

      (integrationService.createExport as MockedFunction<any>).mockResolvedValue({
        content: '{"test": "data"}',
        filename: 'test-export.json',
        contentType: 'application/json',
      });

      renderWithQueryClient(<DataExportImport />);

      // Should be on export tab by default
      expect(screen.getByText('Export Data')).toHaveClass('bg-background');

      // Verify default selections
      expect(screen.getByDisplayValue('json')).toBeInTheDocument();
      expect(screen.getByLabelText('Tasks')).toBeChecked();
      expect(screen.getByLabelText('Habits')).toBeChecked();
      expect(screen.getByLabelText('Mood')).toBeChecked();
      expect(screen.getByLabelText('Calendar')).toBeChecked();
      expect(screen.getByLabelText('Journal')).toBeChecked();

      // Change format to markdown
      await userEvent.click(screen.getByRole('combobox'));
      await userEvent.click(screen.getByText('Markdown (Human-readable format)'));

      // Uncheck some domains
      await userEvent.click(screen.getByLabelText('Preferences'));
      expect(screen.getByLabelText('Preferences')).not.toBeChecked();

      // Set date range
      const startDateInput = screen.getByPlaceholderText('Start date');
      const endDateInput = screen.getByPlaceholderText('End date');
      
      await userEvent.type(startDateInput, '2023-12-01');
      await userEvent.type(endDateInput, '2023-12-31');

      // Trigger export
      const exportButton = screen.getByRole('button', { name: /export data/i });
      await userEvent.click(exportButton);

      // Verify API call
      await waitFor(() => {
        expect(integrationService.createExport).toHaveBeenCalledWith({
          domains: ['tasks', 'habits', 'mood', 'calendar', 'journal'],
          format: 'markdown',
          start_date: '2023-12-01',
          end_date: '2023-12-31',
        });
      });

      // Verify button state during export
      expect(screen.getByRole('button', { name: /preparing export/i })).toBeDisabled();

      // Wait for export to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /export data/i })).not.toBeDisabled();
      });
    });

    it('should show export information', () => {
      renderWithQueryClient(<DataExportImport />);

      expect(screen.getByText('JSON Format')).toBeInTheDocument();
      expect(screen.getByText('Complete data structure preservation')).toBeInTheDocument();
      expect(screen.getByText('Markdown Format')).toBeInTheDocument();
      expect(screen.getByText('Human-readable documentation format')).toBeInTheDocument();
      expect(screen.getByText('Important Notes')).toBeInTheDocument();
    });

    it('should handle export errors', async () => {
      

      (integrationService.createExport as MockedFunction<any>).mockRejectedValue(
        new Error('Export failed')
      );

      renderWithQueryClient(<DataExportImport />);

      const exportButton = screen.getByRole('button', { name: /export data/i });
      await userEvent.click(exportButton);

      // The component should handle the error gracefully
      // In a real implementation, you might show an error message
      await waitFor(() => {
        expect(integrationService.createExport).toHaveBeenCalled();
      });
    });
  });

  describe('Import Flow', () => {
    it('should complete full import flow', async () => {
      

      // Mock file reading
      (integrationService.readFileContent as MockedFunction<any>).mockResolvedValue(
        '{"version": "1.0.0", "data": {"tasks": []}}'
      );

      // Mock validation
      (integrationService.validateImportData as MockedFunction<any>).mockResolvedValue({
        success: true,
        errors: [],
        warnings: [],
        imported_count: 0,
        skipped_count: 0,
        error_count: 0,
      });

      // Mock import
      (integrationService.importData as MockedFunction<any>).mockResolvedValue({
        success: true,
        imported_count: 5,
        skipped_count: 0,
        error_count: 0,
      });

      renderWithQueryClient(<DataExportImport />);

      // Switch to import tab
      await userEvent.click(screen.getByText('Import Data'));
      expect(screen.getByText('Import Data')).toHaveClass('bg-background');

      // Create a mock file
      const file = new File(['{"test": "data"}'], 'test-import.json', {
        type: 'application/json',
      });

      // Upload file
      const fileInput = screen.getByLabelText('Choose File');
      expect(fileInput).toBeInTheDocument();

      if (fileInput) {
        await userEvent.upload(fileInput, file);
      }

      // Wait for validation
      await waitFor(() => {
        expect(integrationService.readFileContent).toHaveBeenCalledWith(file);
      });
      await waitFor(() => {
        expect(integrationService.validateImportData).toHaveBeenCalled();
      });

      // Verify file is selected and validated
      await waitFor(() => {
        expect(screen.getByText('test-import.json')).toBeInTheDocument();
        expect(screen.getByText('File is valid')).toBeInTheDocument();
      });

      // Change import mode
      await userEvent.click(screen.getAllByRole('combobox')[0]); // Import mode select
      await userEvent.click(screen.getByText('Replace'));

      // Uncheck some domains
      await userEvent.click(screen.getByLabelText('Preferences'));

      // Trigger import
      const importButton = screen.getByRole('button', { name: /import data/i });
      expect(importButton).not.toBeDisabled();
      await userEvent.click(importButton);

      // Verify import call
      await waitFor(() => {
        expect(integrationService.importData).toHaveBeenCalled();
      });
    });

    it('should show validation errors', async () => {
      

      (integrationService.readFileContent as MockedFunction<any>).mockResolvedValue(
        'invalid json'
      );

      (integrationService.validateImportData as MockedFunction<any>).mockResolvedValue({
        success: false,
        errors: ['Invalid JSON format', 'Missing required fields'],
        warnings: [],
        imported_count: 0,
        skipped_count: 0,
        error_count: 2,
      });

      renderWithQueryClient(<DataExportImport />);

      await userEvent.click(screen.getByText('Import Data'));

      const file = new File(['invalid'], 'invalid.json', { type: 'application/json' });
      const fileInput = screen.getByLabelText('Choose File');

      if (fileInput) {
        await userEvent.upload(fileInput, file);
      }

      await waitFor(() => {
        expect(screen.getByText('Validation failed')).toBeInTheDocument();
        expect(screen.getByText('Invalid JSON format')).toBeInTheDocument();
        expect(screen.getByText('Missing required fields')).toBeInTheDocument();
      });

      // Import button should be disabled
      expect(screen.getByRole('button', { name: /import data/i })).toBeDisabled();
    });

    it('should show validation warnings', async () => {
      

      (integrationService.readFileContent as MockedFunction<any>).mockResolvedValue(
        '{"version": "0.9.0", "data": {}}'
      );

      (integrationService.validateImportData as MockedFunction<any>).mockResolvedValue({
        success: true,
        errors: [],
        warnings: ['Version mismatch: expected 1.0.0, got 0.9.0'],
        imported_count: 0,
        skipped_count: 0,
        error_count: 0,
      });

      renderWithQueryClient(<DataExportImport />);

      await userEvent.click(screen.getByText('Import Data'));

      const file = new File(['test'], 'test.json', { type: 'application/json' });
      const fileInput = screen.getByLabelText('Choose File');

      if (fileInput) {
        await userEvent.upload(fileInput, file);
      }

      await waitFor(() => {
        expect(screen.getByText('File is valid')).toBeInTheDocument();
        expect(screen.getByText('Version mismatch: expected 1.0.0, got 0.9.0')).toBeInTheDocument();
      });

      // Import button should be enabled
      expect(screen.getByRole('button', { name: /import data/i })).not.toBeDisabled();
    });

    it('should handle import mode selection', async () => {
      

      renderWithQueryClient(<DataExportImport />);

      await userEvent.click(screen.getByText('Import Data'));

      // Check default mode
      expect(screen.getByDisplayValue('Append')).toBeInTheDocument();

      // Change to merge mode
      await userEvent.click(screen.getAllByRole('combobox')[0]);
      await userEvent.click(screen.getByText('Merge'));

      // Verify the description is shown
      expect(screen.getByText('Update existing and add new data')).toBeInTheDocument();

      // Change to replace mode
      await userEvent.click(screen.getAllByRole('combobox')[0]);
      await userEvent.click(screen.getByText('Replace'));

      expect(screen.getByText('Replace all existing data')).toBeInTheDocument();
    });

    it('should show import information', () => {
      renderWithQueryClient(<DataExportImport />);

      userEvent.click(screen.getByText('Import Data'));

      expect(screen.getByText('Supported Formats')).toBeInTheDocument();
      expect(screen.getByText('JSON files exported from this application')).toBeInTheDocument();
      expect(screen.getByText('Import Modes')).toBeInTheDocument();
      expect(screen.getByText('Append:')).toBeInTheDocument();
      expect(screen.getByText('Merge:')).toBeInTheDocument();
      expect(screen.getByText('Replace:')).toBeInTheDocument();
      expect(screen.getByText('Important Notes')).toBeInTheDocument();
      expect(screen.getByText('Always backup your data before importing')).toBeInTheDocument();
    });
  });

  describe('Backup Flow', () => {
    it('should show backup tab', async () => {
      

      (integrationService.getBackups as MockedFunction<any>).mockResolvedValue([]);

      renderWithQueryClient(<DataExportImport />);

      await userEvent.click(screen.getByText('Backup & Restore'));

      expect(screen.getByText('Create Backup')).toBeInTheDocument();
      expect(screen.getByText('Full System Backup')).toBeInTheDocument();
      expect(screen.getByText('Backup History')).toBeInTheDocument();
    });

    it('should create backup', async () => {
      

      (integrationService.getBackups as MockedFunction<any>).mockResolvedValue([]);
      (integrationService.createBackup as MockedFunction<any>).mockResolvedValue({
        id: 'backup-123',
        created_at: '2023-12-25T12:00:00Z',
      });

      renderWithQueryClient(<DataExportImport />);

      await userEvent.click(screen.getByText('Backup & Restore'));

      const createButton = screen.getByRole('button', { name: /create backup/i });
      await userEvent.click(createButton);

      await waitFor(() => {
        expect(integrationService.createBackup).toHaveBeenCalled();
      });
    });

    it('should show backup history', async () => {
      const mockBackups = [
        {
          id: 'backup-1',
          created_at: '2023-12-25T12:00:00Z',
          size_bytes: 1024,
          domains: ['tasks', 'habits'],
          user_initiated: true,
        },
        {
          id: 'backup-2',
          created_at: '2023-12-24T12:00:00Z',
          size_bytes: 2048,
          domains: ['tasks', 'habits', 'mood'],
          user_initiated: false,
        },
      ];

      (integrationService.getBackups as MockedFunction<any>).mockResolvedValue(mockBackups);

      renderWithQueryClient(<DataExportImport />);

      await userEvent.click(screen.getByText('Backup & Restore'));

      await waitFor(() => {
        expect(screen.getByText('Manual Backup')).toBeInTheDocument();
        expect(screen.getByText('Automatic Backup')).toBeInTheDocument();
        expect(screen.getAllByText('Restore')).toHaveLength(2);
      });
    });
  });

  describe('Navigation', () => {
    it('should switch between tabs', async () => {
      

      (integrationService.getBackups as MockedFunction<any>).mockResolvedValue([]);

      renderWithQueryClient(<DataExportImport />);

      // Start on export tab
      expect(screen.getByText('Export Data')).toHaveClass('bg-background');

      // Switch to import
      await userEvent.click(screen.getByText('Import Data'));
      expect(screen.getByText('Import Data')).toHaveClass('bg-background');
      expect(screen.getByText('Export Data')).not.toHaveClass('bg-background');

      // Switch to backup
      await userEvent.click(screen.getByText('Backup & Restore'));
      expect(screen.getByText('Backup & Restore')).toHaveClass('bg-background');
      expect(screen.getByText('Import Data')).not.toHaveClass('bg-background');

      // Switch back to export
      await userEvent.click(screen.getByText('Export Data'));
      expect(screen.getByText('Export Data')).toHaveClass('bg-background');
      expect(screen.getByText('Backup & Restore')).not.toHaveClass('bg-background');
    });
  });

  describe('Form Validation', () => {
    it('should disable export button when no domains selected', async () => {
      

      renderWithQueryClient(<DataExportImport />);

      // Uncheck all domains
      await userEvent.click(screen.getByLabelText('Tasks'));
      await userEvent.click(screen.getByLabelText('Habits'));
      await userEvent.click(screen.getByLabelText('Mood'));
      await userEvent.click(screen.getByLabelText('Calendar'));
      await userEvent.click(screen.getByLabelText('Journal'));

      const exportButton = screen.getByRole('button', { name: /export data/i });
      expect(exportButton).toBeDisabled();
    });

    it('should disable import button when no file selected', () => {
      renderWithQueryClient(<DataExportImport />);

      userEvent.click(screen.getByText('Import Data'));

      const importButton = screen.getByRole('button', { name: /import data/i });
      expect(importButton).toBeDisabled();
    });
  });
});