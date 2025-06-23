import { api } from "encore.dev/api";
import { moodDB } from "./encore.service";
import {
  MoodEntry,
  MoodStats,
  CreateMoodEntryRequest,
  CreateMoodEntryResponse,
  UpdateMoodEntryRequest,
  UpdateMoodEntryResponse,
  GetMoodEntryResponse,
  GetMoodEntriesRequest,
  GetMoodEntriesResponse,
  DeleteMoodEntryRequest,
  DeleteMoodEntryResponse,
  GetTodayMoodResponse,
  GetMoodAnalyticsRequest,
  GetMoodAnalyticsResponse
} from "./types";
import { 
  sanitizeString, 
  isValidDateString, 
  isValidMoodScore,
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

// Calculate mood statistics
async function calculateMoodStats(entries: MoodEntry[]): Promise<MoodStats> {
  if (entries.length === 0) {
    return {
      average_mood: 0,
      mood_trend: 'stable',
      best_day: getCurrentDateString(),
      worst_day: getCurrentDateString(),
      total_entries: 0
    };
  }

  // Calculate average
  const totalScore = entries.reduce((sum, entry) => sum + entry.mood_score, 0);
  const averageMood = Math.round((totalScore / entries.length) * 100) / 100;

  // Find best and worst days
  const sortedByScore = [...entries].sort((a, b) => b.mood_score - a.mood_score);
  const bestDay = sortedByScore[0]?.entry_date || getCurrentDateString();
  const worstDay = sortedByScore[sortedByScore.length - 1]?.entry_date || getCurrentDateString();

  // Calculate trend (simplified - compare first half to second half)
  const midPoint = Math.floor(entries.length / 2);
  const firstHalf = entries.slice(0, midPoint);
  const secondHalf = entries.slice(midPoint);
  
  const firstHalfAvg = firstHalf.length > 0 
    ? firstHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / firstHalf.length 
    : 0;
  const secondHalfAvg = secondHalf.length > 0 
    ? secondHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / secondHalf.length 
    : 0;

  let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
  const difference = secondHalfAvg - firstHalfAvg;
  
  if (difference > 0.3) {
    moodTrend = 'improving';
  } else if (difference < -0.3) {
    moodTrend = 'declining';
  }

  return {
    average_mood: averageMood,
    mood_trend: moodTrend,
    best_day: bestDay,
    worst_day: worstDay,
    total_entries: entries.length
  };
}

// Create a new mood entry
export const createMoodEntry = api(
  { method: "POST", path: "/mood", expose: true },
  async (req: CreateMoodEntryRequest): Promise<CreateMoodEntryResponse> => {
    try {
      // Validate required fields
      if (!isValidMoodScore(req.mood_score)) {
        throw new Error("Mood score must be between 1 and 5");
      }

      // Sanitize inputs
      const mood_score = req.mood_score;
      const mood_category = req.mood_category ? sanitizeString(req.mood_category, 50) : null;
      const notes = req.notes ? sanitizeString(req.notes, 1000) : null;
      const entry_date = req.entry_date || getCurrentDateString();

      // Validate entry date
      if (!isValidDateString(entry_date)) {
        throw new Error("Invalid entry date format. Use YYYY-MM-DD");      }

      // Check if entry already exists for this date (one entry per day)
      const existingGenerator = moodDB.query`
        SELECT id FROM mood_entries WHERE entry_date = ${entry_date}
      `;
      const existingResult = await collectResults(existingGenerator);

      if (existingResult.length > 0) {
        throw new Error("Mood entry already exists for this date. Use update instead.");
      }

      // Insert mood entry into database using database timestamps
      const generator = moodDB.query`
        INSERT INTO mood_entries (mood_score, mood_category, notes, entry_date, created_at, updated_at)
        VALUES (${mood_score}, ${mood_category}, ${notes}, ${entry_date}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        throw new Error("Failed to create mood entry");
      }

      const entryRow = result[0];
      const mood_entry: MoodEntry = {
        id: entryRow.id,
        mood_score: entryRow.mood_score,
        mood_category: entryRow.mood_category,
        notes: entryRow.notes,
        entry_date: entryRow.entry_date,
        created_at: entryRow.created_at,
        updated_at: entryRow.updated_at
      };

      return { mood_entry };
    } catch (error) {
      throw new Error(`Failed to create mood entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get all mood entries with optional filtering
export const getMoodEntries = api(
  { method: "GET", path: "/mood", expose: true },
  async (req: GetMoodEntriesRequest): Promise<GetMoodEntriesResponse> => {
    try {
      // Get all mood entries first, then filter in memory
      const generator = moodDB.query`
        SELECT * FROM mood_entries ORDER BY entry_date DESC
      `;
      const allEntries = await collectResults(generator);
      
      // Apply filters
      let filteredEntries = allEntries;
      
      if (req.start_date && isValidDateString(req.start_date)) {
        filteredEntries = filteredEntries.filter(entry => entry.entry_date >= req.start_date!);
      }
      
      if (req.end_date && isValidDateString(req.end_date)) {
        filteredEntries = filteredEntries.filter(entry => entry.entry_date <= req.end_date!);
      }
      
      if (req.mood_category) {
        const category = sanitizeString(req.mood_category, 50);
        filteredEntries = filteredEntries.filter(entry => entry.mood_category === category);
      }
      
      if (req.min_score !== undefined && isValidMoodScore(req.min_score)) {
        filteredEntries = filteredEntries.filter(entry => entry.mood_score >= req.min_score!);
      }
      
      if (req.max_score !== undefined && isValidMoodScore(req.max_score)) {
        filteredEntries = filteredEntries.filter(entry => entry.mood_score <= req.max_score!);
      }
      
      const mood_entries: MoodEntry[] = filteredEntries.map((row: any) => ({
        id: row.id,
        mood_score: row.mood_score,
        mood_category: row.mood_category,
        notes: row.notes,
        entry_date: row.entry_date,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      // Calculate stats if there are entries
      const stats = mood_entries.length > 0 ? await calculateMoodStats(mood_entries) : undefined;

      return { mood_entries, stats };
    } catch (error) {
      throw new Error(`Failed to get mood entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get a specific mood entry by ID
export const getMoodEntry = api(
  { method: "GET", path: "/mood/:id", expose: true },
  async ({ id }: { id: number }): Promise<GetMoodEntryResponse> => {
    try {
      const generator = moodDB.query`
        SELECT * FROM mood_entries WHERE id = ${id}
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        throw new Error("Mood entry not found");
      }

      const entryRow = result[0];
      const mood_entry: MoodEntry = {
        id: entryRow.id,
        mood_score: entryRow.mood_score,
        mood_category: entryRow.mood_category,
        notes: entryRow.notes,
        entry_date: entryRow.entry_date,
        created_at: entryRow.created_at,
        updated_at: entryRow.updated_at
      };

      return { mood_entry };
    } catch (error) {
      throw new Error(`Failed to get mood entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get today's mood entry
export const getTodayMood = api(
  { method: "GET", path: "/mood/today", expose: true },
  async (): Promise<GetTodayMoodResponse> => {
    try {
      const today = getCurrentDateString();
      
      const generator = moodDB.query`
        SELECT * FROM mood_entries WHERE entry_date = ${today}
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        return { has_entry: false };
      }

      const entryRow = result[0];
      const mood_entry: MoodEntry = {
        id: entryRow.id,
        mood_score: entryRow.mood_score,
        mood_category: entryRow.mood_category,
        notes: entryRow.notes,
        entry_date: entryRow.entry_date,
        created_at: entryRow.created_at,
        updated_at: entryRow.updated_at
      };

      return { mood_entry, has_entry: true };
    } catch (error) {
      throw new Error(`Failed to get today's mood: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Update a mood entry
export const updateMoodEntry = api(
  { method: "PUT", path: "/mood/:id", expose: true },
  async (req: UpdateMoodEntryRequest): Promise<UpdateMoodEntryResponse> => {
    try {
      const { id, ...updates } = req;

      // Check if mood entry exists
      const existingGenerator = moodDB.query`
        SELECT * FROM mood_entries WHERE id = ${id}
      `;

      const existingResult = await collectResults(existingGenerator);

      if (existingResult.length === 0) {
        throw new Error("Mood entry not found");
      }

      const existingEntry = existingResult[0];
      
      // Prepare update values
      const mood_score = updates.mood_score !== undefined ? updates.mood_score : existingEntry.mood_score;
      const mood_category = updates.mood_category !== undefined 
        ? (updates.mood_category ? sanitizeString(updates.mood_category, 50) : null)
        : existingEntry.mood_category;
      const notes = updates.notes !== undefined 
        ? (updates.notes ? sanitizeString(updates.notes, 1000) : null)
        : existingEntry.notes;
        // Validate mood score
      if (!isValidMoodScore(mood_score)) {
        throw new Error("Mood score must be between 1 and 5");
      }

      // Update mood entry in database using database timestamps
      const updateGenerator = moodDB.query`
        UPDATE mood_entries 
        SET mood_score = ${mood_score}, 
            mood_category = ${mood_category}, 
            notes = ${notes},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      const result = await collectResults(updateGenerator);
      const entryRow = result[0];
      
      const mood_entry: MoodEntry = {
        id: entryRow.id,
        mood_score: entryRow.mood_score,
        mood_category: entryRow.mood_category,
        notes: entryRow.notes,
        entry_date: entryRow.entry_date,
        created_at: entryRow.created_at,
        updated_at: entryRow.updated_at
      };

      return { mood_entry };
    } catch (error) {
      throw new Error(`Failed to update mood entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Delete a mood entry
export const deleteMoodEntry = api(
  { method: "DELETE", path: "/mood/:id", expose: true },
  async ({ id }: { id: number }): Promise<DeleteMoodEntryResponse> => {
    try {
      const generator = moodDB.query`
        DELETE FROM mood_entries WHERE id = ${id}
        RETURNING id
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        throw new Error("Mood entry not found");
      }

      return {
        success: true,
        message: "Mood entry deleted successfully"
      };
    } catch (error) {
      throw new Error(`Failed to delete mood entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get mood analytics
export const getMoodAnalytics = api(
  { method: "GET", path: "/mood/analytics", expose: true },
  async (req: GetMoodAnalyticsRequest): Promise<GetMoodAnalyticsResponse> => {
    try {
      const days = req.days || 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = getCurrentDateString();

      // Get entries for the specified period
      const generator = moodDB.query`
        SELECT * FROM mood_entries 
        WHERE entry_date >= ${startDateStr} AND entry_date <= ${endDateStr}
        ORDER BY entry_date ASC
      `;

      const entries = await collectResults(generator);
      
      const mood_entries: MoodEntry[] = entries.map((row: any) => ({
        id: row.id,
        mood_score: row.mood_score,
        mood_category: row.mood_category,
        notes: row.notes,
        entry_date: row.entry_date,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      // Calculate overall stats
      const stats = await calculateMoodStats(mood_entries);

      // Calculate daily averages (group by date)
      const dailyMap = new Map<string, { total: number; count: number }>();
      
      mood_entries.forEach(entry => {
        const existing = dailyMap.get(entry.entry_date) || { total: 0, count: 0 };
        dailyMap.set(entry.entry_date, {
          total: existing.total + entry.mood_score,
          count: existing.count + 1
        });
      });

      const daily_averages = Array.from(dailyMap.entries()).map(([date, data]) => ({
        date,
        average_mood: Math.round((data.total / data.count) * 100) / 100,
        entry_count: data.count
      }));

      // Calculate category breakdown
      const categoryMap = new Map<string, { total: number; count: number }>();
      
      mood_entries.forEach(entry => {
        const category = entry.mood_category || 'uncategorized';
        const existing = categoryMap.get(category) || { total: 0, count: 0 };
        categoryMap.set(category, {
          total: existing.total + entry.mood_score,
          count: existing.count + 1
        });
      });

      const category_breakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        count: data.count,
        average_mood: Math.round((data.total / data.count) * 100) / 100
      }));

      return {
        stats,
        daily_averages,
        category_breakdown
      };
    } catch (error) {
      throw new Error(`Failed to get mood analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);
