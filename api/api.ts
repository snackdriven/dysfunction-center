import { api } from "encore.dev/api";
import { 
  DataExportRequest, 
  DataExportResponse, 
  DataImportRequest, 
  DataImportResponse,
  VersionedDataExport,
  VersionedTaskData,
  VersionedHabitData,
  VersionedMoodData,
  VersionedCalendarData,
  VersionedPreferenceData,
  VersionedJournalData
} from "../shared/types";
import { createVersionedExport, exportAsJson, exportAsMarkdown, validateImportData } from "./exportUtils";
/*
// Commented out until module resolution issue is fixed
import { tasks } from "~encore/clients";
import { habits } from "~encore/clients";
import { mood } from "~encore/clients";
import { calendar } from "~encore/clients";
import { preferences } from "~encore/clients";
import { journal } from "~encore/clients";
*/

// API Information and Health Check
export interface ApiInfoResponse {
  name: string;
  version: string;
  description: string;
  status: string;
  timestamp: string;
  services: string[];
  endpoints: {
    tasks: string[];
    habits: string[];
    mood: string[];
    preferences: string[];
    journal: string[];
  };
}

// Root endpoint - API information and health check
export const getApiInfo = api(
  { method: "GET", path: "/", expose: true },
  async (): Promise<ApiInfoResponse> => {    return {
      name: "Executive Dysfunction Center API",
      version: "0.1.0",
      description: "A productivity tracking application with task management, habit tracking, mood logging, journaling, and theme preferences",
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: ["tasks", "habits", "mood", "preferences", "journal"],
      endpoints: {
        tasks: [
          "GET /tasks - List all tasks with optional filtering",
          "POST /tasks - Create a new task",
          "GET /tasks/:id - Get a specific task",
          "PUT /tasks/:id - Update a task",
          "DELETE /tasks/:id - Delete a task"
        ],
        habits: [
          "GET /habits - List all habits with analytics",
          "POST /habits - Create a new habit",
          "GET /habits/:id - Get a specific habit",
          "PUT /habits/:id - Update a habit",
          "DELETE /habits/:id - Delete a habit",
          "POST /habits/:habit_id/completions - Log habit completion",
          "GET /habits/:habit_id/history - Get habit completion history"
        ],
        mood: [
          "GET /mood - List mood entries",
          "POST /mood - Create a mood entry",
          "GET /mood/:id - Get a specific mood entry",
          "PUT /mood/:id - Update a mood entry",
          "DELETE /mood/:id - Delete a mood entry",
          "GET /mood/analytics - Get mood analytics"
        ],
        preferences: [
          "GET /preferences/:key - Get a user preference",
          "POST /preferences - Set a user preference",
          "DELETE /preferences/:key - Delete a user preference",
          "GET /theme - Get theme preferences",
          "POST /theme - Set theme preferences",
          "GET /theme/system - Get system theme info"
        ],
        journal: [
          "GET /journal - List journal entries with filtering",
          "POST /journal - Create a new journal entry",
          "GET /journal/:id - Get a specific journal entry",
          "PUT /journal/:id - Update a journal entry",
          "DELETE /journal/:id - Delete a journal entry",
          "GET /journal/search - Search journal entries",
          "GET /journal/analytics - Get journal analytics and insights",
          "GET /journal/templates - List journal templates",
          "POST /journal/templates - Create a new journal template",
          "PUT /journal/templates/:id - Update a journal template",
          "DELETE /journal/templates/:id - Delete a journal template",
          "GET /journal/export - Export journal entries (future feature)"
        ]
      }
    };
  }
);

// Health check endpoint
export const healthCheck = api(
  { method: "GET", path: "/health", expose: true },
  async (): Promise<{ status: string; timestamp: string }> => {
    return {
      status: "healthy",
      timestamp: new Date().toISOString()
    };
  }
);

/*
// Data Export Endpoints - Moved to api/encore.service.ts
export const exportData = api(
  { method: "POST", path: "/export", expose: true },
  async (req: DataExportRequest): Promise<{ content: string; filename: string; contentType: string }> => {
    const exportData: {
      tasks?: VersionedTaskData[];
      habits?: VersionedHabitData[];
      mood?: VersionedMoodData[];
      calendar?: VersionedCalendarData[];
      preferences?: VersionedPreferenceData[];
      journal?: VersionedJournalData[];
    } = {};

    // Collect data from requested domains
    for (const domain of req.domains) {
      try {
        switch (domain) {
          case 'tasks':
            const tasksResponse = await tasks.getTasks({});
            exportData.tasks = tasksResponse.tasks.map(task => ({
              id: task.id,
              title: task.title,
              description: task.description,
              priority: task.priority,
              due_date: task.due_date,
              completed: task.completed,
              completed_at: task.completed_at,
              created_at: task.created_at,
              updated_at: task.updated_at,
              category_id: task.category_id,
              category_name: task.category?.name,
              notes: task.notes,
              estimated_minutes: task.estimated_minutes,
              actual_minutes: task.actual_minutes,
              parent_task_id: task.parent_task_id,
              tags: task.tags?.map(tag => tag.name),
              time_entries: task.time_entries?.map(entry => ({
                id: entry.id,
                start_time: entry.start_time,
                end_time: entry.end_time,
                description: entry.description
              })),
              subtasks: task.subtasks?.map(subtask => ({
                id: subtask.id,
                title: subtask.title,
                description: subtask.description,
                priority: subtask.priority,
                due_date: subtask.due_date,
                completed: subtask.completed,
                completed_at: subtask.completed_at,
                created_at: subtask.created_at,
                updated_at: subtask.updated_at,
                category_id: subtask.category_id,
                category_name: subtask.category?.name,
                notes: subtask.notes,
                estimated_minutes: subtask.estimated_minutes,
                actual_minutes: subtask.actual_minutes,
                parent_task_id: subtask.parent_task_id,
                tags: subtask.tags?.map(tag => tag.name)
              }))
            }));
            break;

          case 'habits':
            const habitsResponse = await habits.getHabits({});
            const habitPromises = habitsResponse.habits.map(async habit => {
              const historyResponse = await habits.getHabitHistory({ habit_id: habit.id });
              return {
                id: habit.id,
                name: habit.name,
                description: habit.description,
                category: habit.category,
                target_frequency: habit.target_frequency,
                active: habit.active,
                created_at: habit.created_at,
                updated_at: habit.updated_at,
                target_type: habit.target_type,
                completion_type: habit.completion_type,
                target_value: habit.target_value,
                unit: habit.unit,
                template_id: habit.template_id,
                template_name: habit.template?.name,
                reminder_enabled: habit.reminder_enabled,
                reminder_time: habit.reminder_time,
                completions: historyResponse.completions.map(completion => ({
                  id: completion.id,
                  completion_date: completion.completion_date,
                  completed: completion.completed,
                  completion_value: completion.completion_value,
                  notes: completion.notes,
                  created_at: completion.created_at
                }))
              };
            });
            exportData.habits = await Promise.all(habitPromises);
            break;

          case 'mood':
            const moodResponse = await mood.getMoodEntries({});
            exportData.mood = moodResponse.mood_entries.map(entry => ({
              id: entry.id,
              mood_score: entry.mood_score,
              mood_category: entry.mood_category,
              secondary_mood: entry.secondary_mood,
              energy_level: entry.energy_level,
              stress_level: entry.stress_level,
              location: entry.location,
              weather: entry.weather,
              notes: entry.notes,
              entry_date: entry.entry_date,
              created_at: entry.created_at,
              updated_at: entry.updated_at,
              context_tags: entry.context_tags,
              triggers: entry.triggers?.map(trigger => ({
                id: trigger.id,
                name: trigger.name,
                category: trigger.category
              }))
            }));
            break;

          case 'calendar':
            const calendarResponse = await calendar.getEvents({});
            exportData.calendar = calendarResponse.events.map(event => ({
              id: event.id,
              title: event.title,
              description: event.description,
              start_datetime: event.start_datetime,
              end_datetime: event.end_datetime,
              is_all_day: event.is_all_day,
              location: event.location,
              color: event.color,
              recurrence_rule: event.recurrence_rule,
              task_id: event.task_id,
              task_title: event.task?.title,
              created_at: event.created_at,
              updated_at: event.updated_at
            }));
            break;

          case 'preferences':
            const preferencesResponse = await preferences.getAllPreferences({});
            exportData.preferences = Object.entries(preferencesResponse.preferences).map(([key, value]) => ({
              id: 0,
              user_id: 'default',
              preference_key: key,
              preference_value: value,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
            break;

          case 'journal':
            const journalResponse = await journal.getJournalEntries({});
            exportData.journal = journalResponse.journal_entries.map(entry => ({
              id: entry.id,
              title: entry.title,
              content: entry.content,
              mood_reference: entry.mood_reference,
              tags: entry.tags,
              privacy_level: entry.privacy_level,
              created_at: entry.created_at,
              updated_at: entry.updated_at,
              related_tasks: entry.related_tasks,
              related_habits: entry.related_habits,
              productivity_score: entry.productivity_score
            }));
            break;
        }
      } catch (error) {
        console.error(`Error exporting ${domain}:`, error);
      }
    }

    // Create versioned export
    const versionedExport = createVersionedExport(
      exportData,
      req.domains,
      req.start_date && req.end_date ? { start_date: req.start_date, end_date: req.end_date } : undefined
    );

    // Format based on requested format
    let content: string;
    let filename: string;
    let contentType: string;

    if (req.format === 'markdown') {
      content = exportAsMarkdown(versionedExport);
      filename = `executive-dysfunction-center-export-${new Date().toISOString().split('T')[0]}.md`;
      contentType = 'text/markdown';
    } else {
      content = exportAsJson(versionedExport);
      filename = `executive-dysfunction-center-export-${new Date().toISOString().split('T')[0]}.json`;
      contentType = 'application/json';
    }

    return { content, filename, contentType };
  }
);
*/

// Data Import Endpoint
export const importData = api(
  { method: "POST", path: "/import", expose: true },
  async (req: DataImportRequest): Promise<DataImportResponse> => {
    let parsedData: any;
    
    try {
      // Parse the import data
      if (req.format === 'json') {
        parsedData = JSON.parse(req.file_content);
      } else {
        return {
          success: false,
          imported_count: 0,
          skipped_count: 0,
          error_count: 1,
          errors: ['Markdown import format is not yet supported. Please use JSON format.']
        };
      }

      // Validate the data structure
      const validation = validateImportData(parsedData);
      if (!validation.valid && !req.validate_only) {
        return {
          success: false,
          imported_count: 0,
          skipped_count: 0,
          error_count: validation.errors.length,
          errors: validation.errors,
          validation_warnings: validation.warnings
        };
      }

      // If validation only, return validation results
      if (req.validate_only) {
        return {
          success: validation.valid,
          imported_count: 0,
          skipped_count: 0,
          error_count: validation.errors.length,
          errors: validation.errors,
          validation_warnings: validation.warnings
        };
      }

      let importedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Import data for each requested domain
      const domains = req.domains || ['tasks', 'habits', 'mood', 'calendar', 'preferences', 'journal'];
      
      for (const domain of domains) {
        if (!parsedData.data[domain]) continue;

        try {
          switch (domain) {
            case 'tasks':
              // Note: This is a simplified import - in production you'd want more sophisticated merging logic
              for (const taskData of parsedData.data.tasks) {
                try {
                  if (req.import_mode === 'replace') {
                    // Replace existing task if it exists
                    await tasks.updateTask({
                      id: taskData.id,
                      title: taskData.title,
                      description: taskData.description,
                      priority: taskData.priority,
                      due_date: taskData.due_date,
                      completed: taskData.completed
                    });
                  } else {
                    // Create new task (append mode)
                    await tasks.createTask({
                      title: taskData.title,
                      description: taskData.description,
                      priority: taskData.priority,
                      due_date: taskData.due_date
                    });
                  }
                  importedCount++;
                } catch (error) {
                  errorCount++;
                  errors.push(`Failed to import task "${taskData.title}": ${error}`);
                }
              }
              break;

            case 'habits':
              for (const habitData of parsedData.data.habits) {
                try {
                  if (req.import_mode === 'replace') {
                    await habits.updateHabit({
                      id: habitData.id,
                      name: habitData.name,
                      description: habitData.description,
                      category: habitData.category,
                      target_frequency: habitData.target_frequency,
                      active: habitData.active
                    });
                  } else {
                    await habits.createHabit({
                      name: habitData.name,
                      description: habitData.description,
                      category: habitData.category,
                      target_frequency: habitData.target_frequency
                    });
                  }
                  importedCount++;
                } catch (error) {
                  errorCount++;
                  errors.push(`Failed to import habit "${habitData.name}": ${error}`);
                }
              }
              break;

            case 'mood':
              for (const moodData of parsedData.data.mood) {
                try {
                  if (req.import_mode === 'replace') {
                    await mood.updateMoodEntry({
                      id: moodData.id,
                      mood_score: moodData.mood_score,
                      mood_category: moodData.mood_category,
                      notes: moodData.notes
                    });
                  } else {
                    await mood.createMoodEntry({
                      mood_score: moodData.mood_score,
                      mood_category: moodData.mood_category,
                      notes: moodData.notes,
                      entry_date: moodData.entry_date
                    });
                  }
                  importedCount++;
                } catch (error) {
                  errorCount++;
                  errors.push(`Failed to import mood entry for ${moodData.entry_date}: ${error}`);
                }
              }
              break;

            case 'journal':
              for (const journalData of parsedData.data.journal) {
                try {
                  if (req.import_mode === 'replace') {
                    await journal.updateJournalEntry(journalData.id, {
                      title: journalData.title,
                      content: journalData.content,
                      tags: journalData.tags,
                      privacy_level: journalData.privacy_level
                    });
                  } else {
                    await journal.createJournalEntry({
                      title: journalData.title,
                      content: journalData.content,
                      tags: journalData.tags,
                      privacy_level: journalData.privacy_level
                    });
                  }
                  importedCount++;
                } catch (error) {
                  errorCount++;
                  errors.push(`Failed to import journal entry "${journalData.title}": ${error}`);
                }
              }
              break;

            // Add other domains as needed...
          }
        } catch (domainError) {
          errorCount++;
          errors.push(`Failed to import ${domain} data: ${domainError}`);
        }
      }

      return {
        success: errorCount === 0,
        imported_count: importedCount,
        skipped_count: skippedCount,
        error_count: errorCount,
        errors: errors.length > 0 ? errors : undefined,
        validation_warnings: validation.warnings.length > 0 ? validation.warnings : undefined
      };

    } catch (error) {
      return {
        success: false,
        imported_count: 0,
        skipped_count: 0,
        error_count: 1,
        errors: [`Failed to process import data: ${error}`]
      };
    }
  }
);
