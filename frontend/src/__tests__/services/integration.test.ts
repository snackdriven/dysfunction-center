import { describe, it, expect, beforeEach, vi, MockedFunction } from 'vitest';
import { integrationService, IntegrationService } from '../../services/integration';
import { api } from '../../services/api';
import { DataExportRequest, DataImportRequest } from '../../../../shared/types';

// Mock the api service
vi.mock('../../services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock DOM methods for file download
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-url'),
    revokeObjectURL: vi.fn(),
  },
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: vi.fn(),
  })),
});

Object.defineProperty(document.body, 'appendChild', {
  value: vi.fn(),
});

Object.defineProperty(document.body, 'removeChild', {
  value: vi.fn(),
});

describe('IntegrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createExport', () => {
    it('should create export and trigger download', async () => {
      const mockResponse = {
        data: {
          content: '{"test": "data"}',
          filename: 'test-export.json',
          contentType: 'application/json',
        },
      };

      (api.post as MockedFunction<any>).mockResolvedValue(mockResponse);

      const request: DataExportRequest = {
        domains: ['tasks', 'habits'],
        format: 'json',
      };

      const result = await integrationService.createExport(request);

      expect(api.post).toHaveBeenCalledWith('/export', request);
      expect(result).toEqual(mockResponse.data);
      
      // Verify download was triggered
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle export with markdown format', async () => {
      const mockResponse = {
        data: {
          content: '# Test Export\n\nTest content',
          filename: 'test-export.md',
          contentType: 'text/markdown',
        },
      };

      (api.post as MockedFunction<any>).mockResolvedValue(mockResponse);

      const request: DataExportRequest = {
        domains: ['journal'],
        format: 'markdown',
        start_date: '2023-12-01',
        end_date: '2023-12-31',
      };

      const result = await integrationService.createExport(request);

      expect(api.post).toHaveBeenCalledWith('/export', request);
      expect(result.contentType).toBe('text/markdown');
      expect(result.filename).toBe('test-export.md');
    });

    it('should handle export errors', async () => {
      (api.post as MockedFunction<any>).mockRejectedValue(new Error('Export failed'));

      const request: DataExportRequest = {
        domains: ['tasks'],
        format: 'json',
      };

      await expect(integrationService.createExport(request)).rejects.toThrow('Export failed');
    });
  });

  describe('importData', () => {
    it('should import data successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          imported_count: 5,
          skipped_count: 0,
          error_count: 0,
        },
      };

      (api.post as MockedFunction<any>).mockResolvedValue(mockResponse);

      const request: DataImportRequest = {
        file_content: '{"test": "data"}',
        format: 'json',
        domains: ['tasks'],
        import_mode: 'append',
        validate_only: false,
      };

      const result = await integrationService.importData(request);

      expect(api.post).toHaveBeenCalledWith('/import', request);
      expect(result).toEqual(mockResponse.data);
      expect(result.success).toBe(true);
      expect(result.imported_count).toBe(5);
    });

    it('should handle import validation errors', async () => {
      const mockResponse = {
        data: {
          success: false,
          imported_count: 0,
          skipped_count: 0,
          error_count: 2,
          errors: ['Invalid data format', 'Missing required field'],
        },
      };

      (api.post as MockedFunction<any>).mockResolvedValue(mockResponse);

      const request: DataImportRequest = {
        file_content: 'invalid json',
        format: 'json',
        domains: ['tasks'],
        import_mode: 'replace',
        validate_only: false,
      };

      const result = await integrationService.importData(request);

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Invalid data format', 'Missing required field']);
    });

    it('should handle import with warnings', async () => {
      const mockResponse = {
        data: {
          success: true,
          imported_count: 3,
          skipped_count: 1,
          error_count: 0,
          validation_warnings: ['Version mismatch detected'],
        },
      };

      (api.post as MockedFunction<any>).mockResolvedValue(mockResponse);

      const request: DataImportRequest = {
        file_content: '{"version": "0.9.0", "data": {}}',
        format: 'json',
        domains: ['habits', 'mood'],
        import_mode: 'merge',
        validate_only: false,
      };

      const result = await integrationService.importData(request);

      expect(result.success).toBe(true);
      expect(result.validation_warnings).toEqual(['Version mismatch detected']);
    });
  });

  describe('validateImportData', () => {
    it('should validate data without importing', async () => {
      const mockResponse = {
        data: {
          success: true,
          imported_count: 0,
          skipped_count: 0,
          error_count: 0,
        },
      };

      (api.post as MockedFunction<any>).mockResolvedValue(mockResponse);

      const result = await integrationService.validateImportData('{"test": "data"}', 'json');

      expect(api.post).toHaveBeenCalledWith('/import', {
        file_content: '{"test": "data"}',
        format: 'json',
        import_mode: 'append',
        validate_only: true,
      });
      expect(result.success).toBe(true);
    });

    it('should return validation errors', async () => {
      const mockResponse = {
        data: {
          success: false,
          imported_count: 0,
          skipped_count: 0,
          error_count: 1,
          errors: ['Invalid JSON format'],
        },
      };

      (api.post as MockedFunction<any>).mockResolvedValue(mockResponse);

      const result = await integrationService.validateImportData('invalid json', 'json');

      expect(result.success).toBe(false);
      expect(result.errors).toEqual(['Invalid JSON format']);
    });

    it('should validate markdown format', async () => {
      const mockResponse = {
        data: {
          success: false,
          imported_count: 0,
          skipped_count: 0,
          error_count: 1,
          errors: ['Markdown import format is not yet supported. Please use JSON format.'],
        },
      };

      (api.post as MockedFunction<any>).mockResolvedValue(mockResponse);

      const result = await integrationService.validateImportData('# Markdown content', 'markdown');

      expect(api.post).toHaveBeenCalledWith('/import', {
        file_content: '# Markdown content',
        format: 'markdown',
        import_mode: 'append',
        validate_only: true,
      });
      expect(result.errors).toContain('Markdown import format is not yet supported. Please use JSON format.');
    });
  });

  describe('readFileContent', () => {
    it('should read file content as text', async () => {
      const mockFile = new File(['{"test": "content"}'], 'test.json', { type: 'application/json' });
      
      // Mock FileReader
      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        result: '{"test": "content"}',
        readAsText: vi.fn(function(this: any) {
          setTimeout(() => {
            if (this.onload) {
              this.onload({ target: { result: '{"test": "content"}' } });
            }
          }, 0);
        }),
      };

      // Mock FileReader constructor
      global.FileReader = vi.fn(() => mockFileReader) as any;

      const result = await integrationService.readFileContent(mockFile);

      expect(result).toBe('{"test": "content"}');
      expect(mockFileReader.readAsText).toHaveBeenCalledWith(mockFile);
    });

    it('should handle file read errors', async () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      
      const mockFileReader = {
        onload: null as any,
        onerror: null as any,
        result: null,
        readAsText: vi.fn(function(this: any) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('File read error'));
            }
          }, 0);
        }),
      };

      global.FileReader = vi.fn(() => mockFileReader) as any;

      await expect(integrationService.readFileContent(mockFile)).rejects.toThrow('Failed to read file');
    });

    it('should read different file types', async () => {
      const testCases = [
        { file: new File(['{}'], 'data.json', { type: 'application/json' }), content: '{}' },
        { file: new File(['# Test'], 'notes.md', { type: 'text/markdown' }), content: '# Test' },
        { file: new File(['plain text'], 'file.txt', { type: 'text/plain' }), content: 'plain text' },
      ];

      for (const testCase of testCases) {
        const mockFileReader = {
          onload: null as any,
          onerror: null as any,
          result: testCase.content,
          readAsText: vi.fn(function(this: any) {
            setTimeout(() => {
              if (this.onload) {
                this.onload({ target: { result: testCase.content } });
              }
            }, 0);
          }),
        };

        global.FileReader = vi.fn(() => mockFileReader) as any;

        const result = await integrationService.readFileContent(testCase.file);
        expect(result).toBe(testCase.content);
      }
    });
  });

  describe('Cross-domain operations', () => {
    it('should get daily productivity data', async () => {
      const mockResponse = {
        data: {
          date: '2023-12-25',
          tasks: { total: 5, completed: 3, overdue: 1 },
          habits: { total: 3, completed: 2, streak_count: 7 },
          mood: { score: 4, energy_level: 7, stress_level: 3 },
          productivity_score: 75,
        },
      };

      (api.get as MockedFunction<any>).mockResolvedValue(mockResponse);

      const result = await integrationService.getDailyProductivityData('2023-12-25');

      expect(api.get).toHaveBeenCalledWith('/integration/productivity/2023-12-25');
      expect(result).toEqual(mockResponse.data);
    });

    it('should get productivity data range', async () => {
      const mockResponse = {
        data: [
          { date: '2023-12-24', productivity_score: 70 },
          { date: '2023-12-25', productivity_score: 75 },
        ],
      };

      (api.get as MockedFunction<any>).mockResolvedValue(mockResponse);

      const result = await integrationService.getProductivityDataRange('2023-12-24', '2023-12-25');

      expect(api.get).toHaveBeenCalledWith('/integration/productivity/range', {
        params: { start_date: '2023-12-24', end_date: '2023-12-25' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get correlations', async () => {
      const mockResponse = {
        data: [
          {
            type: 'task_mood',
            factor: 'completion_rate',
            strength: 0.7,
            confidence: 0.85,
            description: 'Higher task completion correlates with better mood',
            data_points: 30,
          },
        ],
      };

      (api.get as MockedFunction<any>).mockResolvedValue(mockResponse);

      const result = await integrationService.getCorrelations(30);

      expect(api.get).toHaveBeenCalledWith('/integration/correlations', {
        params: { days: 30 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get insights with default parameters', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            type: 'positive',
            title: 'Great progress!',
            description: 'You\'ve been completing tasks consistently',
            priority: 'high',
            action_items: ['Keep up the good work'],
            related_domains: ['tasks'],
            created_at: '2023-12-25T12:00:00Z',
          },
        ],
      };

      (api.get as MockedFunction<any>).mockResolvedValue(mockResponse);

      const result = await integrationService.getInsights();

      expect(api.get).toHaveBeenCalledWith('/integration/insights', {
        params: { days: 30 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should dismiss insight', async () => {
      (api.delete as MockedFunction<any>).mockResolvedValue({});

      await integrationService.dismissInsight('insight-123');

      expect(api.delete).toHaveBeenCalledWith('/integration/insights/insight-123');
    });
  });

  describe('Error handling', () => {
    it('should handle network errors in export', async () => {
      (api.post as MockedFunction<any>).mockRejectedValue(new Error('Network error'));

      const request: DataExportRequest = {
        domains: ['tasks'],
        format: 'json',
      };

      await expect(integrationService.createExport(request)).rejects.toThrow('Network error');
    });

    it('should handle API errors in import', async () => {
      (api.post as MockedFunction<any>).mockRejectedValue({
        response: {
          status: 400,
          data: { error: 'Bad request' },
        },
      });

      const request: DataImportRequest = {
        file_content: '{}',
        format: 'json',
        domains: ['tasks'],
        import_mode: 'append',
        validate_only: false,
      };

      await expect(integrationService.importData(request)).rejects.toThrow();
    });

    it('should handle validation API errors', async () => {
      (api.post as MockedFunction<any>).mockRejectedValue(new Error('Validation service unavailable'));

      await expect(integrationService.validateImportData('{}', 'json')).rejects.toThrow('Validation service unavailable');
    });
  });

  describe('Integration service instantiation', () => {
    it('should create integration service instance', () => {
      expect(integrationService).toBeInstanceOf(IntegrationService);
    });

    it('should have all required methods', () => {
      const requiredMethods = [
        'createExport',
        'importData',
        'validateImportData',
        'readFileContent',
        'getDailyProductivityData',
        'getProductivityDataRange',
        'getCorrelations',
        'getInsights',
        'dismissInsight',
      ];

      requiredMethods.forEach(method => {
        expect(typeof (integrationService as any)[method]).toBe('function');
      });
    });
  });
});