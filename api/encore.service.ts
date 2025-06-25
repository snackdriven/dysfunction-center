import { Service } from "encore.dev/service";
import { api } from "encore.dev/api";
import { Task } from "../tasks/types";
import { Habit } from "../habits/types";
import { JournalEntry } from "../journal/types";
import { MoodEntry } from "../mood/types";
import { exportAsMarkdown, exportAsJson, exportAsCSV, createVersionedExport } from "./exportUtils";
import { DataExportRequest } from "../shared/types";

export default new Service("api");

// Export endpoint that uses real data from other services
export const exportData = api(
  { method: "POST", path: "/export", expose: true },
  async (req: DataExportRequest): Promise<{ content: string; filename: string; contentType: string }> => {
    const exportData: any = {};
    
    // Collect data from requested domains using internal HTTP calls
    for (const domain of req.domains) {
      try {
        switch (domain) {
          case 'tasks':
            // Call tasks service
            const tasksResponse = await fetch('http://localhost:4000/tasks');
            if (tasksResponse.ok) {
              const tasksData = await tasksResponse.json() as any;
              exportData.tasks = tasksData.tasks || [];
            }
            break;

          case 'habits':
            // Call habits service
            const habitsResponse = await fetch('http://localhost:4000/habits');
            if (habitsResponse.ok) {
              const habitsData = await habitsResponse.json() as any;
              exportData.habits = habitsData.habits || [];
            }
            break;

          case 'mood':
            // Call mood service
            const moodResponse = await fetch('http://localhost:4000/mood');
            if (moodResponse.ok) {
              const moodData = await moodResponse.json() as any;
              exportData.mood = moodData.mood_entries || [];
            }
            break;

          case 'calendar':
            // Call calendar service
            const calendarResponse = await fetch('http://localhost:4000/calendar/events');
            if (calendarResponse.ok) {
              const calendarData = await calendarResponse.json() as any;
              exportData.calendar = calendarData.events || [];
            }
            break;

          case 'journal':
            // Call journal service
            const journalResponse = await fetch('http://localhost:4000/journal');
            if (journalResponse.ok) {
              const journalData = await journalResponse.json() as any;
              exportData.journal = journalData.journal_entries || [];
            }
            break;

          case 'preferences':
            // Call preferences service
            const preferencesResponse = await fetch('http://localhost:4000/preferences');
            if (preferencesResponse.ok) {
              const preferencesData = await preferencesResponse.json() as any;
              exportData.preferences = Object.entries(preferencesData.preferences || {}).map(([key, value]) => ({
                preference_key: key,
                preference_value: value,
              }));
            }
            break;
        }
      } catch (error) {
        console.error(`Error exporting ${domain}:`, error);
        // Initialize empty array if error occurs
        exportData[domain] = [];
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
    } else if (req.format === 'csv') {
      content = exportAsCSV(versionedExport);
      filename = `executive-dysfunction-center-export-${new Date().toISOString().split('T')[0]}.csv`;
      contentType = 'text/csv';
    } else {
      content = exportAsJson(versionedExport);
      filename = `executive-dysfunction-center-export-${new Date().toISOString().split('T')[0]}.json`;
      contentType = 'application/json';
    }

    return { content, filename, contentType };
  }
);
