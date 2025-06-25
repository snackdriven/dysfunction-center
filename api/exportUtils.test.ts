import { describe, it, expect, vi } from 'vitest';
import {
  createVersionedExport,
  exportAsJson,
  exportAsMarkdown,
  validateImportData,
  getExportVersion,
} from './exportUtils';
import {
  VersionedTaskData,
  VersionedHabitData,
  VersionedMoodData,
  VersionedCalendarData,
  VersionedPreferenceData,
  VersionedJournalData,
} from '../shared/types';

describe('Export Utils', () => {
  describe('createVersionedExport', () => {
    it('should create a properly formatted versioned export', () => {
      const mockDate = '2023-12-25T12:00:00.000Z';
      vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(mockDate);

      const tasks: VersionedTaskData[] = [
        {
          id: 1,
          title: 'Test Task',
          description: 'Test Description',
          priority: 'high',
          completed: false,
          created_at: '2023-12-25T10:00:00Z',
          updated_at: '2023-12-25T10:00:00Z',
          tags: ['work', 'urgent'],
        },
      ];

      const habits: VersionedHabitData[] = [
        {
          id: 1,
          name: 'Exercise',
          description: 'Daily exercise',
          category: 'health',
          target_frequency: 1,
          active: true,
          created_at: '2023-12-25T09:00:00Z',
          updated_at: '2023-12-25T09:00:00Z',
          target_type: 'daily',
          completion_type: 'boolean',
          target_value: 1,
          reminder_enabled: true,
          reminder_time: '07:00',
          completions: [
            {
              id: 1,
              completion_date: '2023-12-25',
              completed: true,
              completion_value: 1,
              created_at: '2023-12-25T07:30:00Z',
            },
          ],
        },
      ];

      const data = { tasks, habits };
      const domains = ['tasks', 'habits'];
      const dateRange = {
        start_date: '2023-12-01',
        end_date: '2023-12-31',
      };

      const result = createVersionedExport(data, domains, dateRange);

      expect(result).toEqual({
        version: '1.0.0',
        export_date: mockDate,
        metadata: {
          total_records: 2,
          domains,
          date_range: dateRange,
        },
        data,
      });

      vi.restoreAllMocks();
    });

    it('should handle empty data', () => {
      const result = createVersionedExport({}, []);

      expect(result.metadata.total_records).toBe(0);
      expect(result.metadata.domains).toEqual([]);
      expect(result.data).toEqual({});
    });

    it('should handle data without date range', () => {
      const tasks: VersionedTaskData[] = [
        {
          id: 1,
          title: 'Test Task',
          priority: 'medium',
          completed: false,
          created_at: '2023-12-25T10:00:00Z',
          updated_at: '2023-12-25T10:00:00Z',
        },
      ];

      const result = createVersionedExport({ tasks }, ['tasks']);

      expect(result.metadata.date_range).toBeUndefined();
      expect(result.metadata.total_records).toBe(1);
    });
  });

  describe('exportAsJson', () => {
    it('should export data as formatted JSON', () => {
      const versionedData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['tasks'],
        },
        data: {
          tasks: [
            {
              id: 1,
              title: 'Test Task',
              priority: 'high',
              completed: false,
              created_at: '2023-12-25T10:00:00Z',
              updated_at: '2023-12-25T10:00:00Z',
            },
          ],
        },
      };

      const result = exportAsJson(versionedData);

      expect(result).toBe(JSON.stringify(versionedData, null, 2));
      expect(() => JSON.parse(result)).not.toThrow();
    });
  });

  describe('exportAsMarkdown', () => {
    it('should export minimal data as markdown', () => {
      const versionedData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 0,
          domains: [],
        },
        data: {},
      };

      const result = exportAsMarkdown(versionedData);

      expect(result).toContain('# Data Export - Executive Dysfunction Center');
      expect(result).toContain('**Export Date:**');
      expect(result).toContain('**Version:** 1.0.0');
      expect(result).toContain('**Total Records:** 0');
    });

    it('should export tasks as markdown', () => {
      const versionedData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['tasks'],
        },
        data: {
          tasks: [
            {
              id: 1,
              title: 'Complete Project',
              description: 'Finish the important project',
              priority: 'high',
              completed: false,
              due_date: '2023-12-31',
              category_name: 'Work',
              tags: ['urgent', 'project'],
              estimated_minutes: 120,
              actual_minutes: 90,
              created_at: '2023-12-25T10:00:00Z',
              updated_at: '2023-12-25T10:00:00Z',
              subtasks: [
                {
                  id: 2,
                  title: 'Research',
                  completed: true,
                  priority: 'medium',
                  created_at: '2023-12-25T09:00:00Z',
                  updated_at: '2023-12-25T09:30:00Z',
                },
              ],
              time_entries: [
                {
                  id: 1,
                  start_time: '2023-12-25T14:00:00Z',
                  end_time: '2023-12-25T15:30:00Z',
                  description: 'Initial work session',
                },
              ],
            },
          ],
        },
      };

      const result = exportAsMarkdown(versionedData);

      expect(result).toContain('## Tasks (1)');
      expect(result).toContain('### Complete Project');
      expect(result).toContain('- **Priority:** high');
      expect(result).toContain('- **Status:** ⏳ Pending');
      expect(result).toContain('- **Due Date:** 2023-12-31');
      expect(result).toContain('- **Category:** Work');
      expect(result).toContain('- **Tags:** urgent, project');
      expect(result).toContain('- **Description:** Finish the important project');
      expect(result).toContain('- **Estimated Time:** 120 minutes');
      expect(result).toContain('- **Actual Time:** 90 minutes');
      expect(result).toContain('- **Subtasks:**');
      expect(result).toContain('  - ✅ Research');
      expect(result).toContain('- **Time Entries:**');
      expect(result).toContain('(90 min)');
    });

    it('should export habits as markdown', () => {
      const versionedData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['habits'],
        },
        data: {
          habits: [
            {
              id: 1,
              name: 'Morning Exercise',
              description: 'Daily morning workout routine',
              category: 'health',
              target_frequency: 1,
              active: true,
              created_at: '2023-12-01T10:00:00Z',
              updated_at: '2023-12-01T10:00:00Z',
              target_type: 'daily',
              completion_type: 'duration',
              target_value: 30,
              unit: 'minutes',
              template_name: 'Exercise Template',
              reminder_enabled: true,
              reminder_time: '07:00',
              completions: [
                {
                  id: 1,
                  completion_date: '2023-12-25',
                  completed: true,
                  completion_value: 35,
                  notes: 'Great workout today!',
                  created_at: '2023-12-25T07:30:00Z',
                },
                {
                  id: 2,
                  completion_date: '2023-12-24',
                  completed: false,
                  completion_value: 0,
                  created_at: '2023-12-24T08:00:00Z',
                },
              ],
            },
          ],
        },
      };

      const result = exportAsMarkdown(versionedData);

      expect(result).toContain('## Habits (1)');
      expect(result).toContain('### Morning Exercise');
      expect(result).toContain('- **Category:** health');
      expect(result).toContain('- **Status:** 🟢 Active');
      expect(result).toContain('- **Target:** 30 minutes daily');
      expect(result).toContain('- **Completion Type:** duration');
      expect(result).toContain('- **Template:** Exercise Template');
      expect(result).toContain('- **Reminder:** 07:00');
      expect(result).toContain('- **Description:** Daily morning workout routine');
      expect(result).toContain('- **Recent Completions:**');
      expect(result).toContain('  - 2023-12-25: ✅ (35)');
      expect(result).toContain('    Great workout today!');
      expect(result).toContain('  - 2023-12-24: ❌ (0)');
    });

    it('should export mood entries as markdown', () => {
      const versionedData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['mood'],
        },
        data: {
          mood: [
            {
              id: 1,
              mood_score: 4,
              mood_category: 'happy',
              secondary_mood: 'excited',
              energy_level: 8,
              stress_level: 3,
              location: 'Home',
              weather: 'Sunny',
              notes: 'Had a great day with family',
              entry_date: '2023-12-25',
              created_at: '2023-12-25T20:00:00Z',
              updated_at: '2023-12-25T20:00:00Z',
              context_tags: {
                activities: ['family time', 'cooking'],
                people: ['family', 'friends'],
                emotions: ['joy', 'contentment'],
                locations: ['home', 'kitchen'],
              },
              triggers: [
                {
                  id: 1,
                  name: 'Family gathering',
                  category: 'social',
                },
              ],
            },
          ],
        },
      };

      const result = exportAsMarkdown(versionedData);

      expect(result).toContain('## Mood Entries (1)');
      expect(result).toContain('### 2023-12-25');
      expect(result).toContain('- **Mood Score:** 4/5 ⭐');
      expect(result).toContain('- **Category:** happy');
      expect(result).toContain('- **Secondary Mood:** excited');
      expect(result).toContain('- **Energy Level:** 8/10 🔋');
      expect(result).toContain('- **Stress Level:** 3/10 😰');
      expect(result).toContain('- **Location:** Home');
      expect(result).toContain('- **Weather:** Sunny');
      expect(result).toContain('- **Notes:** Had a great day with family');
      expect(result).toContain('- **Triggers:** Family gathering');
      expect(result).toContain('- **Activities:** family time, cooking');
      expect(result).toContain('- **People:** family, friends');
      expect(result).toContain('- **Emotions:** joy, contentment');
      expect(result).toContain('- **Locations:** home, kitchen');
    });

    it('should export calendar events as markdown', () => {
      const versionedData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['calendar'],
        },
        data: {
          calendar: [
            {
              id: 1,
              title: 'Team Meeting',
              description: 'Weekly team standup',
              start_datetime: '2023-12-25T14:00:00Z',
              end_datetime: '2023-12-25T15:00:00Z',
              is_all_day: false,
              location: 'Conference Room A',
              task_title: 'Prepare meeting agenda',
              recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
              created_at: '2023-12-20T10:00:00Z',
              updated_at: '2023-12-20T10:00:00Z',
            },
          ],
        },
      };

      const result = exportAsMarkdown(versionedData);

      expect(result).toContain('## Calendar Events (1)');
      expect(result).toContain('### Team Meeting');
      expect(result).toContain('- **All Day:** No');
      expect(result).toContain('- **Location:** Conference Room A');
      expect(result).toContain('- **Description:** Weekly team standup');
      expect(result).toContain('- **Related Task:** Prepare meeting agenda');
      expect(result).toContain('- **Recurrence:** FREQ=WEEKLY;BYDAY=MO');
    });

    it('should export journal entries as markdown', () => {
      const versionedData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['journal'],
        },
        data: {
          journal: [
            {
              id: 1,
              title: 'Reflecting on the Year',
              content: 'This year has been full of growth and learning. I\'ve accomplished many of my goals and learned valuable lessons along the way.',
              tags: ['reflection', 'growth', 'goals'],
              privacy_level: 'private',
              productivity_score: 8,
              mood_reference: 1,
              created_at: '2023-12-25T21:00:00Z',
              updated_at: '2023-12-25T21:00:00Z',
            },
          ],
        },
      };

      const result = exportAsMarkdown(versionedData);

      expect(result).toContain('## Journal Entries (1)');
      expect(result).toContain('### Reflecting on the Year');
      expect(result).toContain('- **Privacy:** private');
      expect(result).toContain('- **Tags:** reflection, growth, goals');
      expect(result).toContain('- **Productivity Score:** 8/10');
      expect(result).toContain('- **Mood Reference:** 1');
      expect(result).toContain('This year has been full of growth and learning');
      expect(result).toContain('---');
    });

    it('should export preferences as markdown', () => {
      const versionedData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 3,
          domains: ['preferences'],
        },
        data: {
          preferences: [
            {
              id: 1,
              user_id: 'default',
              preference_key: 'theme',
              preference_value: 'dark',
              created_at: '2023-12-01T10:00:00Z',
              updated_at: '2023-12-01T10:00:00Z',
            },
            {
              id: 2,
              user_id: 'default',
              preference_key: 'notifications',
              preference_value: 'enabled',
              created_at: '2023-12-01T10:00:00Z',
              updated_at: '2023-12-01T10:00:00Z',
            },
          ],
        },
      };

      const result = exportAsMarkdown(versionedData);

      expect(result).toContain('## User Preferences (2)');
      expect(result).toContain('- **theme:** dark');
      expect(result).toContain('- **notifications:** enabled');
    });

    it('should include date range in header when provided', () => {
      const versionedData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 0,
          domains: [],
          date_range: {
            start_date: '2023-12-01',
            end_date: '2023-12-31',
          },
        },
        data: {},
      };

      const result = exportAsMarkdown(versionedData);

      expect(result).toContain('**Date Range:** 2023-12-01 to 2023-12-31');
    });
  });

  describe('validateImportData', () => {
    it('should validate correct data structure', () => {
      const validData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['tasks'],
        },
        data: {
          tasks: [
            {
              id: 1,
              title: 'Test Task',
            },
          ],
        },
      };

      const result = validateImportData(validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
    });

    it('should detect missing version', () => {
      const invalidData = {
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['tasks'],
        },
        data: {
          tasks: [],
        },
      };

      const result = validateImportData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing version information in import data');
    });

    it('should detect version mismatch', () => {
      const invalidData = {
        version: '2.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['tasks'],
        },
        data: {
          tasks: [],
        },
      };

      const result = validateImportData(invalidData);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Version mismatch: expected 1.0.0, got 2.0.0');
    });

    it('should detect missing metadata', () => {
      const invalidData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        data: {
          tasks: [],
        },
      };

      const result = validateImportData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing metadata in import data');
    });

    it('should detect missing data section', () => {
      const invalidData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['tasks'],
        },
      };

      const result = validateImportData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing data section in import file');
    });

    it('should validate tasks array structure', () => {
      const invalidData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['tasks'],
        },
        data: {
          tasks: 'not an array',
        },
      };

      const result = validateImportData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tasks data must be an array');
    });

    it('should validate individual task structure', () => {
      const invalidData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 1,
          domains: ['tasks'],
        },
        data: {
          tasks: [
            {
              // Missing id and title
              description: 'Task without required fields',
            },
          ],
        },
      };

      const result = validateImportData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Task at index 0 missing required fields (id, title)');
    });

    it('should validate all data types', () => {
      const invalidData = {
        version: '1.0.0',
        export_date: '2023-12-25T12:00:00.000Z',
        metadata: {
          total_records: 4,
          domains: ['tasks', 'habits', 'mood', 'journal'],
        },
        data: {
          tasks: [{ description: 'incomplete task' }],
          habits: [{ description: 'incomplete habit' }],
          mood: [{ notes: 'incomplete mood' }],
          journal: [{ content: 'incomplete journal' }],
        },
      };

      const result = validateImportData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Task at index 0 missing required fields (id, title)');
      expect(result.errors).toContain('Habit at index 0 missing required fields (id, name)');
      expect(result.errors).toContain('Mood entry at index 0 missing required fields (id, mood_score)');
      expect(result.errors).toContain('Journal entry at index 0 missing required fields (id, title, content)');
    });

    it('should warn about missing export date', () => {
      const dataWithoutDate = {
        version: '1.0.0',
        metadata: {
          total_records: 0,
          domains: [],
        },
        data: {},
      };

      const result = validateImportData(dataWithoutDate);

      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Missing export date in import data');
    });
  });

  describe('getExportVersion', () => {
    it('should return the current export version', () => {
      expect(getExportVersion()).toBe('1.0.0');
    });
  });
});