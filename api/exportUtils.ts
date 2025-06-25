import { 
  VersionedDataExport, 
  VersionedTaskData, 
  VersionedHabitData, 
  VersionedJournalData, 
  VersionedMoodData,
  VersionedCalendarData,
  VersionedPreferenceData,
  DateString,
  TimestampString
} from "../shared/types";

const EXPORT_VERSION = "1.0.0";

export function createVersionedExport(
  data: {
    tasks?: VersionedTaskData[];
    habits?: VersionedHabitData[];
    mood?: VersionedMoodData[];
    calendar?: VersionedCalendarData[];
    preferences?: VersionedPreferenceData[];
    journal?: VersionedJournalData[];
  },
  domains: string[],
  dateRange?: { start_date: DateString; end_date: DateString }
): VersionedDataExport {
  const totalRecords = Object.values(data).reduce((sum, items) => sum + (items?.length || 0), 0);
  
  return {
    version: EXPORT_VERSION,
    export_date: new Date().toISOString(),
    metadata: {
      total_records: totalRecords,
      domains,
      date_range: dateRange
    },
    data
  };
}

export function exportAsJson(versionedData: VersionedDataExport): string {
  return JSON.stringify(versionedData, null, 2);
}

export function exportAsMarkdown(versionedData: VersionedDataExport): string {
  let markdown = `# Data Export - Executive Dysfunction Center\n\n`;
  markdown += `**Export Date:** ${new Date(versionedData.export_date).toLocaleString()}\n`;
  markdown += `**Version:** ${versionedData.version}\n`;
  markdown += `**Total Records:** ${versionedData.metadata.total_records}\n`;
  markdown += `**Domains:** ${versionedData.metadata.domains.join(', ')}\n\n`;

  if (versionedData.metadata.date_range) {
    markdown += `**Date Range:** ${versionedData.metadata.date_range.start_date} to ${versionedData.metadata.date_range.end_date}\n\n`;
  }

  // Export Tasks
  if (versionedData.data.tasks && versionedData.data.tasks.length > 0) {
    markdown += `## Tasks (${versionedData.data.tasks.length})\n\n`;
    versionedData.data.tasks.forEach(task => {
      markdown += `### ${task.title}\n`;
      markdown += `- **ID:** ${task.id}\n`;
      markdown += `- **Priority:** ${task.priority}\n`;
      markdown += `- **Status:** ${task.completed ? '✅ Completed' : '⏳ Pending'}\n`;
      if (task.due_date) markdown += `- **Due Date:** ${task.due_date}\n`;
      if (task.category_name) markdown += `- **Category:** ${task.category_name}\n`;
      if (task.tags && task.tags.length > 0) markdown += `- **Tags:** ${task.tags.join(', ')}\n`;
      if (task.description) markdown += `- **Description:** ${task.description}\n`;
      if (task.notes) markdown += `- **Notes:** ${task.notes}\n`;
      if (task.estimated_minutes) markdown += `- **Estimated Time:** ${task.estimated_minutes} minutes\n`;
      if (task.actual_minutes) markdown += `- **Actual Time:** ${task.actual_minutes} minutes\n`;
      markdown += `- **Created:** ${new Date(task.created_at).toLocaleString()}\n`;
      if (task.completed_at) markdown += `- **Completed:** ${new Date(task.completed_at).toLocaleString()}\n`;
      
      if (task.subtasks && task.subtasks.length > 0) {
        markdown += `- **Subtasks:**\n`;
        task.subtasks.forEach(subtask => {
          markdown += `  - ${subtask.completed ? '✅' : '⏳'} ${subtask.title}\n`;
        });
      }
      
      if (task.time_entries && task.time_entries.length > 0) {
        markdown += `- **Time Entries:**\n`;
        task.time_entries.forEach(entry => {
          const duration = entry.end_time ? 
            Math.round((new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 60000) : 
            'In Progress';
          markdown += `  - ${new Date(entry.start_time).toLocaleString()}${entry.end_time ? ' - ' + new Date(entry.end_time).toLocaleString() : ''} (${duration}${typeof duration === 'number' ? ' min' : ''})\n`;
          if (entry.description) markdown += `    ${entry.description}\n`;
        });
      }
      
      markdown += `\n`;
    });
  }

  // Export Habits
  if (versionedData.data.habits && versionedData.data.habits.length > 0) {
    markdown += `## Habits (${versionedData.data.habits.length})\n\n`;
    versionedData.data.habits.forEach(habit => {
      markdown += `### ${habit.name}\n`;
      markdown += `- **ID:** ${habit.id}\n`;
      markdown += `- **Category:** ${habit.category}\n`;
      markdown += `- **Status:** ${habit.active ? '🟢 Active' : '🔴 Inactive'}\n`;
      markdown += `- **Target:** ${habit.target_value} ${habit.unit || ''} ${habit.target_type}\n`;
      markdown += `- **Completion Type:** ${habit.completion_type}\n`;
      if (habit.template_name) markdown += `- **Template:** ${habit.template_name}\n`;
      if (habit.reminder_enabled && habit.reminder_time) markdown += `- **Reminder:** ${habit.reminder_time}\n`;
      if (habit.description) markdown += `- **Description:** ${habit.description}\n`;
      markdown += `- **Created:** ${new Date(habit.created_at).toLocaleString()}\n`;
      
      if (habit.completions.length > 0) {
        markdown += `- **Recent Completions:**\n`;
        habit.completions.slice(-10).forEach(completion => {
          markdown += `  - ${completion.completion_date}: ${completion.completed ? '✅' : '❌'} (${completion.completion_value})\n`;
          if (completion.notes) markdown += `    ${completion.notes}\n`;
        });
      }
      
      markdown += `\n`;
    });
  }

  // Export Mood Entries
  if (versionedData.data.mood && versionedData.data.mood.length > 0) {
    markdown += `## Mood Entries (${versionedData.data.mood.length})\n\n`;
    versionedData.data.mood.forEach(mood => {
      markdown += `### ${mood.entry_date}\n`;
      markdown += `- **ID:** ${mood.id}\n`;
      markdown += `- **Mood Score:** ${mood.mood_score}/5 ⭐\n`;
      if (mood.mood_category) markdown += `- **Category:** ${mood.mood_category}\n`;
      if (mood.secondary_mood) markdown += `- **Secondary Mood:** ${mood.secondary_mood}\n`;
      if (mood.energy_level) markdown += `- **Energy Level:** ${mood.energy_level}/10 🔋\n`;
      if (mood.stress_level) markdown += `- **Stress Level:** ${mood.stress_level}/10 😰\n`;
      if (mood.location) markdown += `- **Location:** ${mood.location}\n`;
      if (mood.weather) markdown += `- **Weather:** ${mood.weather}\n`;
      if (mood.notes) markdown += `- **Notes:** ${mood.notes}\n`;
      
      if (mood.triggers && mood.triggers.length > 0) {
        markdown += `- **Triggers:** ${mood.triggers.map(t => t.name).join(', ')}\n`;
      }
      
      if (mood.context_tags) {
        if (mood.context_tags.activities?.length) markdown += `- **Activities:** ${mood.context_tags.activities.join(', ')}\n`;
        if (mood.context_tags.people?.length) markdown += `- **People:** ${mood.context_tags.people.join(', ')}\n`;
        if (mood.context_tags.emotions?.length) markdown += `- **Emotions:** ${mood.context_tags.emotions.join(', ')}\n`;
        if (mood.context_tags.locations?.length) markdown += `- **Locations:** ${mood.context_tags.locations.join(', ')}\n`;
      }
      
      markdown += `- **Created:** ${new Date(mood.created_at).toLocaleString()}\n\n`;
    });
  }

  // Export Calendar Events
  if (versionedData.data.calendar && versionedData.data.calendar.length > 0) {
    markdown += `## Calendar Events (${versionedData.data.calendar.length})\n\n`;
    versionedData.data.calendar.forEach(event => {
      markdown += `### ${event.title}\n`;
      markdown += `- **ID:** ${event.id}\n`;
      markdown += `- **Start:** ${new Date(event.start_datetime).toLocaleString()}\n`;
      if (event.end_datetime) markdown += `- **End:** ${new Date(event.end_datetime).toLocaleString()}\n`;
      markdown += `- **All Day:** ${event.is_all_day ? 'Yes' : 'No'}\n`;
      if (event.location) markdown += `- **Location:** ${event.location}\n`;
      if (event.description) markdown += `- **Description:** ${event.description}\n`;
      if (event.task_title) markdown += `- **Related Task:** ${event.task_title}\n`;
      if (event.recurrence_rule) markdown += `- **Recurrence:** ${event.recurrence_rule}\n`;
      markdown += `- **Created:** ${new Date(event.created_at).toLocaleString()}\n\n`;
    });
  }

  // Export Journal Entries
  if (versionedData.data.journal && versionedData.data.journal.length > 0) {
    markdown += `## Journal Entries (${versionedData.data.journal.length})\n\n`;
    versionedData.data.journal.forEach(entry => {
      markdown += `### ${entry.title}\n`;
      markdown += `- **ID:** ${entry.id}\n`;
      markdown += `- **Privacy:** ${entry.privacy_level}\n`;
      if (entry.tags.length > 0) markdown += `- **Tags:** ${entry.tags.join(', ')}\n`;
      if (entry.productivity_score) markdown += `- **Productivity Score:** ${entry.productivity_score}/10\n`;
      if (entry.mood_reference) markdown += `- **Mood Reference:** ${entry.mood_reference}\n`;
      markdown += `- **Created:** ${new Date(entry.created_at).toLocaleString()}\n\n`;
      markdown += `${entry.content}\n\n---\n\n`;
    });
  }

  // Export Preferences
  if (versionedData.data.preferences && versionedData.data.preferences.length > 0) {
    markdown += `## User Preferences (${versionedData.data.preferences.length})\n\n`;
    versionedData.data.preferences.forEach(pref => {
      markdown += `- **${pref.preference_key}:** ${pref.preference_value}\n`;
    });
    markdown += `\n`;
  }

  return markdown;
}

export function validateImportData(data: any): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data has version and required structure
  if (!data.version) {
    errors.push("Missing version information in import data");
  } else if (data.version !== EXPORT_VERSION) {
    warnings.push(`Version mismatch: expected ${EXPORT_VERSION}, got ${data.version}`);
  }

  if (!data.export_date) {
    warnings.push("Missing export date in import data");
  }

  if (!data.metadata) {
    errors.push("Missing metadata in import data");
  }

  if (!data.data) {
    errors.push("Missing data section in import file");
  }

  // Validate data structure for each domain
  if (data.data) {
    if (data.data.tasks) {
      if (!Array.isArray(data.data.tasks)) {
        errors.push("Tasks data must be an array");
      } else {
        data.data.tasks.forEach((task: any, index: number) => {
          if (!task.id || !task.title) {
            errors.push(`Task at index ${index} missing required fields (id, title)`);
          }
        });
      }
    }

    if (data.data.habits) {
      if (!Array.isArray(data.data.habits)) {
        errors.push("Habits data must be an array");
      } else {
        data.data.habits.forEach((habit: any, index: number) => {
          if (!habit.id || !habit.name) {
            errors.push(`Habit at index ${index} missing required fields (id, name)`);
          }
        });
      }
    }

    if (data.data.mood) {
      if (!Array.isArray(data.data.mood)) {
        errors.push("Mood data must be an array");
      } else {
        data.data.mood.forEach((mood: any, index: number) => {
          if (!mood.id || !mood.mood_score) {
            errors.push(`Mood entry at index ${index} missing required fields (id, mood_score)`);
          }
        });
      }
    }

    if (data.data.journal) {
      if (!Array.isArray(data.data.journal)) {
        errors.push("Journal data must be an array");
      } else {
        data.data.journal.forEach((entry: any, index: number) => {
          if (!entry.id || !entry.title || !entry.content) {
            errors.push(`Journal entry at index ${index} missing required fields (id, title, content)`);
          }
        });
      }
    }

    if (data.data.calendar) {
      if (!Array.isArray(data.data.calendar)) {
        errors.push("Calendar data must be an array");
      } else {
        data.data.calendar.forEach((event: any, index: number) => {
          if (!event.id || !event.title || !event.start_datetime) {
            errors.push(`Calendar event at index ${index} missing required fields (id, title, start_datetime)`);
          }
        });
      }
    }

    if (data.data.preferences) {
      if (!Array.isArray(data.data.preferences)) {
        errors.push("Preferences data must be an array");
      } else {
        data.data.preferences.forEach((pref: any, index: number) => {
          if (!pref.preference_key || !pref.preference_value) {
            errors.push(`Preference at index ${index} missing required fields (preference_key, preference_value)`);
          }
        });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

export function getExportVersion(): string {
  return EXPORT_VERSION;
}