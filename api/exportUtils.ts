import { Task } from "../tasks/types";
import { Habit } from "../habits/types";
import { JournalEntry } from "../journal/types";
import { MoodEntry } from "../mood/types";

export function exportAsMarkdown<T extends { id: number }>(items: T[], type: string): string {
  return `# Exported ${type}\n\n` +
    items.map(item => `## ${type} ID: ${item.id}\n\n
${JSON.stringify(item, null, 2)}\n`).join('\n');
}

export function exportAsJson<T>(items: T[]): string {
  return JSON.stringify(items, null, 2);
}
