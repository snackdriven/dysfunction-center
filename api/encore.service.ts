import { Service } from "encore.dev/service";
import { api } from "encore.dev/api";
import { Task } from "../tasks/types";
import { Habit } from "../habits/types";
import { JournalEntry } from "../journal/types";
import { MoodEntry } from "../mood/types";
import { exportAsMarkdown, exportAsJson, exportAsCSV, createVersionedExport } from "./exportUtils";
import { DataExportRequest } from "../shared/types";

export default new Service("api");

// Simple export endpoint that works with mock data for now
export const exportData = api(
  { method: "POST", path: "/export", expose: true },
  async (req: DataExportRequest): Promise<{ content: string; filename: string; contentType: string }> => {
    // For now, create mock data structure
    const exportData: any = {};
    
    // Mock data for testing - replace with actual API calls later
    if (req.domains.includes('tasks')) {
      exportData.tasks = [
        {
          id: 1,
          title: "Sample Task",
          description: "This is a sample task for export testing",
          priority: "medium",
          completed: false,
          created_at: new Date().toISOString()
        }
      ];
    }
    
    if (req.domains.includes('habits')) {
      exportData.habits = [
        {
          id: 1,
          name: "Sample Habit",
          description: "This is a sample habit for export testing",
          category: "health",
          active: true,
          created_at: new Date().toISOString()
        }
      ];
    }
    
    if (req.domains.includes('mood')) {
      exportData.mood = [
        {
          id: 1,
          mood_score: 7,
          mood_category: "happy",
          entry_date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString()
        }
      ];
    }
    
    if (req.domains.includes('journal')) {
      exportData.journal = [
        {
          id: 1,
          title: "Sample Journal Entry",
          content: "This is a sample journal entry for export testing",
          created_at: new Date().toISOString()
        }
      ];
    }
    
    if (req.domains.includes('calendar')) {
      exportData.calendar = [
        {
          id: 1,
          title: "Sample Event",
          description: "This is a sample calendar event for export testing",
          start_datetime: new Date().toISOString(),
          end_datetime: new Date(Date.now() + 3600000).toISOString(),
          created_at: new Date().toISOString()
        }
      ];
    }
    
    if (req.domains.includes('preferences')) {
      exportData.preferences = [
        {
          preference_key: "theme",
          preference_value: "dark"
        }
      ];
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
