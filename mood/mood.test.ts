import { describe, it, expect, beforeEach } from "vitest";
import { 
  createMoodEntry, 
  getMoodEntries, 
  getMoodEntry, 
  getTodayMood,
  updateMoodEntry, 
  deleteMoodEntry,
  getMoodAnalytics
} from "./mood";
import type { 
  CreateMoodEntryRequest, 
  UpdateMoodEntryRequest,
  GetMoodEntriesRequest,
  GetMoodAnalyticsRequest
} from "./types";

describe("Mood Management", () => {
  describe("createMoodEntry", () => {
    it("should create a mood entry with required fields", async () => {
      const req: CreateMoodEntryRequest = {
        mood_score: 4
      };

      const response = await createMoodEntry(req);
      
      expect(response.mood_entry).toBeDefined();
      expect(response.mood_entry.mood_score).toBe(4);
      expect(response.mood_entry.entry_date).toBeDefined();
      expect(response.mood_entry.id).toBeGreaterThan(0);
    });

    it("should create a mood entry with all fields", async () => {
      const req: CreateMoodEntryRequest = {
        mood_score: 5,
        mood_category: "work",
        notes: "Great day at work!",
        entry_date: "2025-06-20"
      };

      const response = await createMoodEntry(req);
      
      expect(response.mood_entry.mood_score).toBe(5);
      expect(response.mood_entry.mood_category).toBe("work");
      expect(response.mood_entry.notes).toBe("Great day at work!");
      expect(response.mood_entry.entry_date).toBe("2025-06-20");
    });

    it("should throw error for invalid mood score", async () => {
      const req: CreateMoodEntryRequest = {
        mood_score: 6
      };

      await expect(createMoodEntry(req)).rejects.toThrow("Mood score must be between 1 and 5");
    });

    it("should throw error for invalid entry date", async () => {
      const req: CreateMoodEntryRequest = {
        mood_score: 4,
        entry_date: "invalid-date"
      };

      await expect(createMoodEntry(req)).rejects.toThrow("Invalid entry date format");
    });

    it("should throw error for duplicate entry date", async () => {
      const req: CreateMoodEntryRequest = {
        mood_score: 4,
        entry_date: "2025-06-19"
      };

      // Create first entry
      await createMoodEntry(req);

      // Try to create second entry for same date
      await expect(createMoodEntry(req)).rejects.toThrow("already exists for this date");
    });
  });

  describe("getMoodEntries", () => {
    it("should get all mood entries", async () => {
      const response = await getMoodEntries({});
      
      expect(response.mood_entries).toBeDefined();
      expect(Array.isArray(response.mood_entries)).toBe(true);
    });

    it("should filter mood entries by date range", async () => {
      const req: GetMoodEntriesRequest = {
        start_date: "2025-06-01",
        end_date: "2025-06-30"
      };

      const response = await getMoodEntries(req);
      
      expect(response.mood_entries).toBeDefined();
      response.mood_entries.forEach(entry => {
        expect(entry.entry_date >= "2025-06-01").toBe(true);
        expect(entry.entry_date <= "2025-06-30").toBe(true);
      });
    });

    it("should filter mood entries by mood category", async () => {
      const req: GetMoodEntriesRequest = {
        mood_category: "work"
      };

      const response = await getMoodEntries(req);
      
      expect(response.mood_entries).toBeDefined();
      response.mood_entries.forEach(entry => {
        expect(entry.mood_category).toBe("work");
      });
    });

    it("should filter mood entries by score range", async () => {
      const req: GetMoodEntriesRequest = {
        min_score: 3,
        max_score: 5
      };

      const response = await getMoodEntries(req);
      
      expect(response.mood_entries).toBeDefined();
      response.mood_entries.forEach(entry => {
        expect(entry.mood_score >= 3).toBe(true);
        expect(entry.mood_score <= 5).toBe(true);
      });
    });

    it("should include statistics when entries exist", async () => {
      // First create some entries
      await createMoodEntry({ mood_score: 4, entry_date: "2025-06-18" });
      
      const response = await getMoodEntries({});
      
      if (response.mood_entries.length > 0) {
        expect(response.stats).toBeDefined();
        expect(response.stats!.average_mood).toBeGreaterThan(0);
        expect(response.stats!.total_entries).toBeGreaterThan(0);
      }
    });
  });

  describe("getMoodEntry", () => {
    it("should get a specific mood entry by ID", async () => {
      // First create a mood entry
      const createResponse = await createMoodEntry({ 
        mood_score: 3, 
        entry_date: "2025-06-17" 
      });
      const entryId = createResponse.mood_entry.id;

      const response = await getMoodEntry({ id: entryId });
      
      expect(response.mood_entry).toBeDefined();
      expect(response.mood_entry.id).toBe(entryId);
      expect(response.mood_entry.mood_score).toBe(3);
      expect(response.mood_entry.entry_date).toBe("2025-06-17");
    });

    it("should throw error for non-existent mood entry", async () => {
      await expect(getMoodEntry({ id: 99999 })).rejects.toThrow("Mood entry not found");
    });
  });

  describe("getTodayMood", () => {
    it("should return has_entry false when no mood entry for today", async () => {
      const response = await getTodayMood();
      
      expect(response.has_entry).toBeDefined();
      expect(typeof response.has_entry).toBe("boolean");
      
      if (!response.has_entry) {
        expect(response.mood_entry).toBeUndefined();
      }
    });

    it("should return mood entry when exists for today", async () => {
      // Create mood entry for today
      const today = new Date().toISOString().split('T')[0];
      await createMoodEntry({ 
        mood_score: 4, 
        entry_date: today 
      });

      const response = await getTodayMood();
      
      expect(response.has_entry).toBe(true);
      expect(response.mood_entry).toBeDefined();
      expect(response.mood_entry!.entry_date).toBe(today);
    });
  });

  describe("updateMoodEntry", () => {
    it("should update mood entry score", async () => {
      // First create a mood entry
      const createResponse = await createMoodEntry({ 
        mood_score: 2, 
        entry_date: "2025-06-16" 
      });
      const entryId = createResponse.mood_entry.id;

      const updateReq: UpdateMoodEntryRequest = {
        id: entryId,
        mood_score: 4
      };

      const response = await updateMoodEntry(updateReq);
      
      expect(response.mood_entry.mood_score).toBe(4);
      expect(response.mood_entry.id).toBe(entryId);
    });

    it("should update mood entry notes", async () => {
      // First create a mood entry
      const createResponse = await createMoodEntry({ 
        mood_score: 3, 
        entry_date: "2025-06-15" 
      });
      const entryId = createResponse.mood_entry.id;

      const updateReq: UpdateMoodEntryRequest = {
        id: entryId,
        notes: "Updated notes"
      };

      const response = await updateMoodEntry(updateReq);
      
      expect(response.mood_entry.notes).toBe("Updated notes");
    });

    it("should throw error for non-existent mood entry", async () => {
      const updateReq: UpdateMoodEntryRequest = {
        id: 99999,
        mood_score: 4
      };

      await expect(updateMoodEntry(updateReq)).rejects.toThrow("Mood entry not found");
    });
  });

  describe("deleteMoodEntry", () => {
    it("should delete a mood entry", async () => {
      // First create a mood entry
      const createResponse = await createMoodEntry({ 
        mood_score: 3, 
        entry_date: "2025-06-14" 
      });
      const entryId = createResponse.mood_entry.id;

      const response = await deleteMoodEntry({ id: entryId });
      
      expect(response.success).toBe(true);
      expect(response.message).toBe("Mood entry deleted successfully");

      // Verify mood entry is deleted
      await expect(getMoodEntry({ id: entryId })).rejects.toThrow("Mood entry not found");
    });

    it("should throw error for non-existent mood entry", async () => {
      await expect(deleteMoodEntry({ id: 99999 })).rejects.toThrow("Mood entry not found");
    });
  });

  describe("getMoodAnalytics", () => {
    it("should get mood analytics for default period", async () => {
      const response = await getMoodAnalytics({});
      
      expect(response.stats).toBeDefined();
      expect(response.daily_averages).toBeDefined();
      expect(response.category_breakdown).toBeDefined();
      expect(Array.isArray(response.daily_averages)).toBe(true);
      expect(Array.isArray(response.category_breakdown)).toBe(true);
    });

    it("should get mood analytics for custom period", async () => {
      const req: GetMoodAnalyticsRequest = {
        days: 7
      };

      const response = await getMoodAnalytics(req);
      
      expect(response.stats).toBeDefined();
      expect(response.daily_averages).toBeDefined();
      expect(response.category_breakdown).toBeDefined();
    });

    it("should calculate statistics correctly", async () => {
      // Create some test entries
      await createMoodEntry({ mood_score: 5, entry_date: "2025-06-13", mood_category: "work" });
      await createMoodEntry({ mood_score: 3, entry_date: "2025-06-12", mood_category: "personal" });
      
      const response = await getMoodAnalytics({});
      
      expect(response.stats.total_entries).toBeGreaterThanOrEqual(2);
      expect(response.stats.average_mood).toBeGreaterThan(0);
      expect(response.stats.average_mood).toBeLessThanOrEqual(5);
      
      // Check that category breakdown includes our categories
      const categories = response.category_breakdown.map(c => c.category);
      expect(categories).toContain("work");
      expect(categories).toContain("personal");
    });
  });
});
