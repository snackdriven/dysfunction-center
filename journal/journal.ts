import { api } from "encore.dev/api";
import { journalDB } from "./encore.service";
import {
  JournalEntry,
  JournalTemplate,
  CreateJournalEntryRequest,
  CreateJournalEntryResponse,
  UpdateJournalEntryRequest,
  UpdateJournalEntryResponse,
  GetJournalEntryResponse,
  GetJournalEntriesParams,
  GetJournalEntriesResponse,
  DeleteJournalEntryResponse,
  SearchJournalParams,
  SearchJournalResponse,
  AnalyticsParams,
  JournalAnalyticsResponse,
  ExportParams,
  ExportResponse,
  CreateJournalTemplateRequest,
  CreateJournalTemplateResponse,
  GetJournalTemplatesParams,
  GetJournalTemplatesResponse,
  UpdateJournalTemplateRequest,
  UpdateJournalTemplateResponse,
  DeleteJournalTemplateResponse
} from "./types";
import { 
  sanitizeString, 
  isValidDateString, 
  getCurrentDateString 
} from "../shared/utils";

// Helper function to collect database results
async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

// Validation helpers
function isValidPrivacyLevel(level: string): level is 'private' | 'shared' | 'public' {
  return ['private', 'shared', 'public'].includes(level);
}

function isValidProductivityScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 10;
}

function isValidTemplateCategory(category: string): category is 'reflection' | 'planning' | 'gratitude' | 'productivity' {
  return ['reflection', 'planning', 'gratitude', 'productivity'].includes(category);
}

// Core CRUD Operations

// Create a new journal entry
export const createJournalEntry = api(
  { method: "POST", path: "/journal", expose: true },
  async (req: CreateJournalEntryRequest): Promise<CreateJournalEntryResponse> => {
    try {
      // Validate required fields
      if (!req.title || req.title.trim() === '') {
        throw new Error("Journal entry title is required");
      }

      if (!req.content || req.content.trim() === '') {
        throw new Error("Journal entry content is required");
      }

      // Sanitize inputs
      const title = sanitizeString(req.title, 255);
      const content = sanitizeString(req.content, 50000); // Allow longer content for journal entries
      const privacy_level = req.privacy_level || 'private';
      
      // Validate privacy level
      if (!isValidPrivacyLevel(privacy_level)) {
        throw new Error("Invalid privacy level. Must be 'private', 'shared', or 'public'");
      }

      // Validate productivity score if provided
      if (req.productivity_score !== undefined && !isValidProductivityScore(req.productivity_score)) {
        throw new Error("Productivity score must be an integer between 1 and 10");
      }

      // Validate and prepare arrays
      const tags = req.tags ? req.tags.filter(tag => tag.trim().length > 0).map(tag => sanitizeString(tag, 50)) : [];
      const related_tasks = req.related_tasks || [];
      const related_habits = req.related_habits || [];

      // Insert the journal entry
      const generator = journalDB.query`
        INSERT INTO journal_entries (
          title, content, mood_reference, tags, privacy_level, 
          related_tasks, related_habits, productivity_score
        ) VALUES (
          ${title}, ${content}, ${req.mood_reference || null}, ${JSON.stringify(tags)}, ${privacy_level},
          ${JSON.stringify(related_tasks)}, ${JSON.stringify(related_habits)}, ${req.productivity_score || null}
        ) RETURNING *
      `;

      const results = await collectResults(generator);
      if (results.length === 0) {
        throw new Error("Failed to create journal entry");
      }

      const journalEntry = results[0] as JournalEntry;

      return {
        journal_entry: journalEntry,
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to create journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get journal entries with filtering
export const getJournalEntries = api(
  { method: "GET", path: "/journal", expose: true },
  async (params: GetJournalEntriesParams): Promise<GetJournalEntriesResponse> => {
    try {
      const limit = params.limit || 20;
      const offset = params.offset || 0;

      // Get all entries first (following existing pattern)
      const generator = journalDB.query`
        SELECT * FROM journal_entries ORDER BY created_at DESC
      `;
      const allEntries = await collectResults(generator) as JournalEntry[];

      // Apply filters in memory
      let filteredEntries = allEntries;

      if (params.start_date) {
        if (!isValidDateString(params.start_date)) {
          throw new Error("Invalid start_date format");
        }
        const startDate = params.start_date + ' 00:00:00';
        filteredEntries = filteredEntries.filter(entry => entry.created_at >= startDate);
      }

      if (params.end_date) {
        if (!isValidDateString(params.end_date)) {
          throw new Error("Invalid end_date format");
        }
        const endDate = params.end_date + ' 23:59:59';
        filteredEntries = filteredEntries.filter(entry => entry.created_at <= endDate);
      }

      if (params.privacy_level) {
        if (!isValidPrivacyLevel(params.privacy_level)) {
          throw new Error("Invalid privacy_level");
        }
        filteredEntries = filteredEntries.filter(entry => entry.privacy_level === params.privacy_level);
      }

      if (params.mood_reference) {
        filteredEntries = filteredEntries.filter(entry => entry.mood_reference === params.mood_reference);
      }

      if (params.has_related_tasks) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.related_tasks && entry.related_tasks.length > 0
        );
      }

      if (params.has_related_habits) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.related_habits && entry.related_habits.length > 0
        );
      }

      if (params.productivity_score_min) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.productivity_score && entry.productivity_score >= params.productivity_score_min!
        );
      }

      if (params.productivity_score_max) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.productivity_score && entry.productivity_score <= params.productivity_score_max!
        );
      }

      if (params.tags && params.tags.length > 0) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.tags && entry.tags.some(tag => params.tags!.includes(tag))
        );
      }

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredEntries = filteredEntries.filter(entry => 
          entry.title.toLowerCase().includes(searchLower) || 
          entry.content.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const total = filteredEntries.length;
      const paginatedEntries = filteredEntries.slice(offset, offset + limit);

      return {
        journal_entries: paginatedEntries,
        total,
        has_more: offset + paginatedEntries.length < total
      };
    } catch (error) {
      throw new Error(`Failed to get journal entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get a specific journal entry
export const getJournalEntry = api(
  { method: "GET", path: "/journal/:id", expose: true },
  async ({ id }: { id: string }): Promise<GetJournalEntryResponse> => {
    try {
      const entryId = parseInt(id);
      if (isNaN(entryId)) {
        throw new Error("Invalid journal entry ID");
      }

      const generator = journalDB.query`
        SELECT * FROM journal_entries WHERE id = ${entryId}
      `;

      const results = await collectResults(generator);
      if (results.length === 0) {
        throw new Error("Journal entry not found");
      }

      return {
        journal_entry: results[0] as JournalEntry
      };
    } catch (error) {
      throw new Error(`Failed to get journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Update a journal entry
export const updateJournalEntry = api(
  { method: "PUT", path: "/journal/:id", expose: true },
  async (req: UpdateJournalEntryRequest & { id: string }): Promise<UpdateJournalEntryResponse> => {
    try {
      const entryId = parseInt(req.id);
      if (isNaN(entryId)) {
        throw new Error("Invalid journal entry ID");
      }

      // Check if entry exists first
      const checkGenerator = journalDB.query`
        SELECT * FROM journal_entries WHERE id = ${entryId}
      `;
      const checkResults = await collectResults(checkGenerator);
      if (checkResults.length === 0) {
        throw new Error("Journal entry not found");
      }

      const currentEntry = checkResults[0] as JournalEntry;

      // Prepare update values
      const title = req.title !== undefined ? sanitizeString(req.title, 255) : currentEntry.title;
      const content = req.content !== undefined ? sanitizeString(req.content, 50000) : currentEntry.content;
      const privacy_level = req.privacy_level !== undefined ? req.privacy_level : currentEntry.privacy_level;
      const mood_reference = req.mood_reference !== undefined ? req.mood_reference : currentEntry.mood_reference;
      const productivity_score = req.productivity_score !== undefined ? req.productivity_score : currentEntry.productivity_score;
      const tags = req.tags !== undefined ? req.tags.filter(tag => tag.trim().length > 0).map(tag => sanitizeString(tag, 50)) : currentEntry.tags;
      const related_tasks = req.related_tasks !== undefined ? req.related_tasks : currentEntry.related_tasks;
      const related_habits = req.related_habits !== undefined ? req.related_habits : currentEntry.related_habits;

      // Validate privacy level
      if (!isValidPrivacyLevel(privacy_level)) {
        throw new Error("Invalid privacy level");
      }

      // Validate productivity score
      if (productivity_score !== null && productivity_score !== undefined && !isValidProductivityScore(productivity_score)) {
        throw new Error("Productivity score must be an integer between 1 and 10");
      }

      // Update the entry
      const generator = journalDB.query`
        UPDATE journal_entries 
        SET 
          title = ${title},
          content = ${content},
          privacy_level = ${privacy_level},
          mood_reference = ${mood_reference},
          productivity_score = ${productivity_score},
          tags = ${JSON.stringify(tags)},
          related_tasks = ${JSON.stringify(related_tasks)},
          related_habits = ${JSON.stringify(related_habits)},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${entryId}
        RETURNING *
      `;

      const results = await collectResults(generator);

      return {
        journal_entry: results[0] as JournalEntry,
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to update journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Delete a journal entry
export const deleteJournalEntry = api(
  { method: "DELETE", path: "/journal/:id", expose: true },
  async ({ id }: { id: string }): Promise<DeleteJournalEntryResponse> => {
    try {
      const entryId = parseInt(id);
      if (isNaN(entryId)) {
        throw new Error("Invalid journal entry ID");
      }

      const generator = journalDB.query`
        DELETE FROM journal_entries WHERE id = ${entryId} RETURNING id
      `;

      const results = await collectResults(generator);
      if (results.length === 0) {
        throw new Error("Journal entry not found");
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete journal entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Advanced Features

// Search journal entries
export const searchJournalEntries = api(
  { method: "GET", path: "/journal/search", expose: true },
  async (params: SearchJournalParams): Promise<SearchJournalResponse> => {
    try {
      if (!params.query || params.query.trim() === '') {
        throw new Error("Search query is required");
      }

      const limit = params.limit || 20;
      const offset = params.offset || 0;

      // Get all entries and filter in memory
      const generator = journalDB.query`
        SELECT * FROM journal_entries ORDER BY created_at DESC
      `;
      const allEntries = await collectResults(generator) as JournalEntry[];

      // Apply search filters
      const searchLower = params.query.toLowerCase();
      let filteredEntries = allEntries.filter(entry => 
        entry.title.toLowerCase().includes(searchLower) || 
        entry.content.toLowerCase().includes(searchLower)
      );

      // Apply additional filters
      if (params.start_date) {
        if (!isValidDateString(params.start_date)) {
          throw new Error("Invalid start_date format");
        }
        const startDate = params.start_date + ' 00:00:00';
        filteredEntries = filteredEntries.filter(entry => entry.created_at >= startDate);
      }

      if (params.end_date) {
        if (!isValidDateString(params.end_date)) {
          throw new Error("Invalid end_date format");
        }
        const endDate = params.end_date + ' 23:59:59';
        filteredEntries = filteredEntries.filter(entry => entry.created_at <= endDate);
      }

      if (params.privacy_level) {
        if (!isValidPrivacyLevel(params.privacy_level)) {
          throw new Error("Invalid privacy_level");
        }
        filteredEntries = filteredEntries.filter(entry => entry.privacy_level === params.privacy_level);
      }

      if (params.tags && params.tags.length > 0) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.tags && entry.tags.some(tag => params.tags!.includes(tag))
        );
      }

      // Apply pagination
      const total = filteredEntries.length;
      const paginatedEntries = filteredEntries.slice(offset, offset + limit);

      return {
        journal_entries: paginatedEntries,
        total,
        has_more: offset + paginatedEntries.length < total
      };
    } catch (error) {
      throw new Error(`Failed to search journal entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get journal analytics
export const getJournalAnalytics = api(
  { method: "GET", path: "/journal/analytics", expose: true },
  async (params: AnalyticsParams): Promise<JournalAnalyticsResponse> => {
    try {
      // Get all entries and calculate analytics in memory for simplicity
      const generator = journalDB.query`
        SELECT * FROM journal_entries ORDER BY created_at DESC
      `;
      const allEntries = await collectResults(generator) as JournalEntry[];

      // Apply date filters if provided
      let filteredEntries = allEntries;
      
      if (params.start_date) {
        if (!isValidDateString(params.start_date)) {
          throw new Error("Invalid start_date format");
        }
        const startDate = params.start_date + ' 00:00:00';
        filteredEntries = filteredEntries.filter(entry => entry.created_at >= startDate);
      }

      if (params.end_date) {
        if (!isValidDateString(params.end_date)) {
          throw new Error("Invalid end_date format");
        }
        const endDate = params.end_date + ' 23:59:59';
        filteredEntries = filteredEntries.filter(entry => entry.created_at <= endDate);
      }

      // Calculate basic metrics
      const total_entries = filteredEntries.length;
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const entries_this_week = filteredEntries.filter(entry => 
        new Date(entry.created_at) >= weekAgo
      ).length;

      const entries_this_month = filteredEntries.filter(entry => 
        new Date(entry.created_at) >= monthAgo
      ).length;

      // Calculate word counts
      const totalWords = filteredEntries.reduce((total, entry) => {
        const wordCount = entry.content ? entry.content.split(/\s+/).length : 0;
        return total + wordCount;
      }, 0);

      const avgWordsPerEntry = total_entries > 0 ? Math.round(totalWords / total_entries) : 0;

      // Calculate writing streak (simplified)
      const dailyEntries = new Map<string, number>();
      allEntries.forEach(entry => {
        const date = entry.created_at.split('T')[0]; // Get date part
        dailyEntries.set(date, (dailyEntries.get(date) || 0) + 1);
      });

      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = checkDate.toISOString().split('T')[0];
        if (dailyEntries.has(dateStr)) {
          streak++;
        } else {
          break;
        }
      }

      // Calculate most used tags
      const tagCounts = new Map<string, number>();
      filteredEntries.forEach(entry => {
        if (entry.tags) {
          entry.tags.forEach(tag => {
            tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
          });
        }
      });

      const most_used_tags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));

      // Calculate productivity correlation
      const productivityEntries = filteredEntries.filter(entry => entry.productivity_score !== null && entry.productivity_score !== undefined);
      const avgProductivityScore = productivityEntries.length > 0 
        ? productivityEntries.reduce((sum, entry) => sum + (entry.productivity_score || 0), 0) / productivityEntries.length
        : 0;

      const entriesByScore = new Map<number, number>();
      productivityEntries.forEach(entry => {
        const score = entry.productivity_score!;
        entriesByScore.set(score, (entriesByScore.get(score) || 0) + 1);
      });

      const productivityDistribution = Array.from(entriesByScore.entries())
        .map(([score, count]) => ({ score, count }))
        .sort((a, b) => a.score - b.score);

      // Calculate writing patterns
      const dayOfWeekCounts = new Map<string, number>();
      const hourCounts = new Map<number, number>();

      filteredEntries.forEach(entry => {
        const date = new Date(entry.created_at);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
        const hour = date.getHours();

        dayOfWeekCounts.set(dayOfWeek, (dayOfWeekCounts.get(dayOfWeek) || 0) + 1);
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      });

      const entriesByDayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        .map(day => ({ day, count: dayOfWeekCounts.get(day) || 0 }));

      const entriesByHour = Array.from(hourCounts.entries())
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour);

      return {
        total_entries,
        entries_this_week,
        entries_this_month,
        writing_streak: streak,
        average_words_per_entry: avgWordsPerEntry,
        total_words: totalWords,
        most_used_tags,
        productivity_correlation: {
          average_productivity_score: Number(avgProductivityScore.toFixed(2)),
          entries_by_score: productivityDistribution
        },
        writing_patterns: {
          entries_by_day_of_week: entriesByDayOfWeek,
          entries_by_hour: entriesByHour
        }
      };
    } catch (error) {
      throw new Error(`Failed to get journal analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Template Management

// Get journal templates
export const getJournalTemplates = api(
  { method: "GET", path: "/journal/templates", expose: true },
  async (params: GetJournalTemplatesParams): Promise<GetJournalTemplatesResponse> => {
    try {
      // Get all templates and filter in memory
      const generator = journalDB.query`
        SELECT * FROM journal_templates ORDER BY category, name
      `;
      const allTemplates = await collectResults(generator) as JournalTemplate[];

      let filteredTemplates = allTemplates;

      if (params.category) {
        if (!isValidTemplateCategory(params.category)) {
          throw new Error("Invalid template category");
        }
        filteredTemplates = filteredTemplates.filter(template => template.category === params.category);
      }

      if (params.is_active !== undefined) {
        filteredTemplates = filteredTemplates.filter(template => template.is_active === params.is_active);
      }

      return { templates: filteredTemplates };
    } catch (error) {
      throw new Error(`Failed to get journal templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Create a journal template
export const createJournalTemplate = api(
  { method: "POST", path: "/journal/templates", expose: true },
  async (req: CreateJournalTemplateRequest): Promise<CreateJournalTemplateResponse> => {
    try {
      // Validate required fields
      if (!req.name || req.name.trim() === '') {
        throw new Error("Template name is required");
      }

      if (!req.prompts || req.prompts.length === 0) {
        throw new Error("Template prompts are required");
      }

      if (!isValidTemplateCategory(req.category)) {
        throw new Error("Invalid template category");
      }

      // Sanitize inputs
      const name = sanitizeString(req.name, 255);
      const description = req.description ? sanitizeString(req.description, 1000) : null;
      const prompts = req.prompts.map(prompt => sanitizeString(prompt, 500));

      const generator = journalDB.query`
        INSERT INTO journal_templates (name, description, prompts, category)
        VALUES (${name}, ${description}, ${JSON.stringify(prompts)}, ${req.category})
        RETURNING *
      `;

      const results = await collectResults(generator);
      if (results.length === 0) {
        throw new Error("Failed to create journal template");
      }

      return {
        template: results[0] as JournalTemplate,
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to create journal template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Update a journal template
export const updateJournalTemplate = api(
  { method: "PUT", path: "/journal/templates/:id", expose: true },
  async (req: UpdateJournalTemplateRequest & { id: string }): Promise<UpdateJournalTemplateResponse> => {
    try {
      const templateId = parseInt(req.id);
      if (isNaN(templateId)) {
        throw new Error("Invalid template ID");
      }

      // Check if template exists first
      const checkGenerator = journalDB.query`
        SELECT * FROM journal_templates WHERE id = ${templateId}
      `;
      const checkResults = await collectResults(checkGenerator);
      if (checkResults.length === 0) {
        throw new Error("Template not found");
      }

      const currentTemplate = checkResults[0] as JournalTemplate;

      // Prepare update values
      const name = req.name !== undefined ? sanitizeString(req.name, 255) : currentTemplate.name;
      const description = req.description !== undefined ? (req.description ? sanitizeString(req.description, 1000) : null) : currentTemplate.description;
      const prompts = req.prompts !== undefined ? req.prompts.map(prompt => sanitizeString(prompt, 500)) : currentTemplate.prompts;
      const category = req.category !== undefined ? req.category : currentTemplate.category;
      const is_active = req.is_active !== undefined ? req.is_active : currentTemplate.is_active;

      // Validate category
      if (!isValidTemplateCategory(category)) {
        throw new Error("Invalid template category");
      }

      // Update the template
      const generator = journalDB.query`
        UPDATE journal_templates 
        SET 
          name = ${name},
          description = ${description},
          prompts = ${JSON.stringify(prompts)},
          category = ${category},
          is_active = ${is_active},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${templateId}
        RETURNING *
      `;

      const results = await collectResults(generator);

      return {
        template: results[0] as JournalTemplate,
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to update journal template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Delete a journal template
export const deleteJournalTemplate = api(
  { method: "DELETE", path: "/journal/templates/:id", expose: true },
  async ({ id }: { id: string }): Promise<DeleteJournalTemplateResponse> => {
    try {
      const templateId = parseInt(id);
      if (isNaN(templateId)) {
        throw new Error("Invalid template ID");
      }

      const generator = journalDB.query`
        DELETE FROM journal_templates WHERE id = ${templateId} RETURNING id
      `;

      const results = await collectResults(generator);
      if (results.length === 0) {
        throw new Error("Template not found");
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete journal template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Export journal entries (placeholder for future implementation)
export const exportJournalEntries = api(
  { method: "GET", path: "/journal/export", expose: true },
  async (params: ExportParams): Promise<ExportResponse> => {
    // This is a placeholder implementation
    // In a real implementation, you would generate the file and upload it to a storage service
    throw new Error("Export functionality not yet implemented");
  }
);
