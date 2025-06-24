import { describe, test, beforeEach, expect } from "vitest";
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  searchJournalEntries,
  getJournalAnalytics,
  getJournalTemplates,
  createJournalTemplate,
  updateJournalTemplate,
  deleteJournalTemplate
} from "./journal";

describe("Journal Service", () => {
  describe("Journal Entry CRUD Operations", () => {
    test("createJournalEntry - should create a journal entry with minimal data", async () => {
      const request = {
        title: "Test Entry",
        content: "This is a test journal entry."
      };

      const response = await createJournalEntry(request);

      expect(response.success).toBe(true);
      expect(response.journal_entry).toBeDefined();
      expect(response.journal_entry.title).toBe(request.title);
      expect(response.journal_entry.content).toBe(request.content);
      expect(response.journal_entry.privacy_level).toBe('private');
      expect(response.journal_entry.tags).toEqual([]);
    });

    test("createJournalEntry - should create a journal entry with all fields", async () => {
      const request = {
        title: "Complete Test Entry",
        content: "This is a complete test journal entry with all fields.",
        mood_reference: 1,
        tags: ["test", "complete"],
        privacy_level: "shared" as const,
        related_tasks: [1, 2],
        related_habits: [3, 4],
        productivity_score: 8
      };

      const response = await createJournalEntry(request);

      expect(response.success).toBe(true);
      expect(response.journal_entry.title).toBe(request.title);
      expect(response.journal_entry.content).toBe(request.content);
      expect(response.journal_entry.mood_reference).toBe(request.mood_reference);
      expect(response.journal_entry.tags).toEqual(request.tags);
      expect(response.journal_entry.privacy_level).toBe(request.privacy_level);
      expect(response.journal_entry.related_tasks).toEqual(request.related_tasks);
      expect(response.journal_entry.related_habits).toEqual(request.related_habits);
      expect(response.journal_entry.productivity_score).toBe(request.productivity_score);
    });

    test("createJournalEntry - should reject entry without title", async () => {
      const request = {
        title: "",
        content: "Content without title"
      };

      await expect(createJournalEntry(request)).rejects.toThrow("Journal entry title is required");
    });

    test("createJournalEntry - should reject entry without content", async () => {
      const request = {
        title: "Title without content",
        content: ""
      };

      await expect(createJournalEntry(request)).rejects.toThrow("Journal entry content is required");
    });

    test("createJournalEntry - should reject invalid privacy level", async () => {
      const request = {
        title: "Test Entry",
        content: "Test content",
        privacy_level: "invalid" as any
      };

      await expect(createJournalEntry(request)).rejects.toThrow("Invalid privacy level");
    });

    test("createJournalEntry - should reject invalid productivity score", async () => {
      const request = {
        title: "Test Entry",
        content: "Test content",
        productivity_score: 15
      };

      await expect(createJournalEntry(request)).rejects.toThrow("Productivity score must be an integer between 1 and 10");
    });

    test("getJournalEntries - should return entries with default pagination", async () => {
      // Create a test entry first
      await createJournalEntry({
        title: "Test Entry for Listing",
        content: "Content for listing test"
      });

      const response = await getJournalEntries({});

      expect(response.journal_entries).toBeDefined();
      expect(Array.isArray(response.journal_entries)).toBe(true);
      expect(response.total).toBeGreaterThanOrEqual(1);
      expect(typeof response.has_more).toBe('boolean');
    });

    test("getJournalEntries - should filter by privacy level", async () => {
      // Create entries with different privacy levels
      await createJournalEntry({
        title: "Private Entry",
        content: "Private content",
        privacy_level: "private"
      });

      await createJournalEntry({
        title: "Public Entry",
        content: "Public content",
        privacy_level: "public"
      });

      const privateResponse = await getJournalEntries({ privacy_level: "private" });
      const publicResponse = await getJournalEntries({ privacy_level: "public" });

      expect(privateResponse.journal_entries.every(entry => entry.privacy_level === "private")).toBe(true);
      expect(publicResponse.journal_entries.every(entry => entry.privacy_level === "public")).toBe(true);
    });

    test("getJournalEntry - should return specific entry", async () => {
      const createResponse = await createJournalEntry({
        title: "Specific Entry",
        content: "Specific content"
      });

      const response = await getJournalEntry({ id: createResponse.journal_entry.id.toString() });

      expect(response.journal_entry).toBeDefined();
      expect(response.journal_entry.id).toBe(createResponse.journal_entry.id);
      expect(response.journal_entry.title).toBe("Specific Entry");
    });

    test("getJournalEntry - should reject invalid ID", async () => {
      await expect(getJournalEntry({ id: "invalid" })).rejects.toThrow("Invalid journal entry ID");
    });

    test("getJournalEntry - should reject non-existent entry", async () => {
      await expect(getJournalEntry({ id: "99999" })).rejects.toThrow("Journal entry not found");
    });

    test("updateJournalEntry - should update entry fields", async () => {
      const createResponse = await createJournalEntry({
        title: "Original Title",
        content: "Original content"
      });

      const updateRequest = {
        id: createResponse.journal_entry.id.toString(),
        title: "Updated Title",
        content: "Updated content",
        productivity_score: 7
      };

      const response = await updateJournalEntry(updateRequest);

      expect(response.success).toBe(true);
      expect(response.journal_entry.title).toBe("Updated Title");
      expect(response.journal_entry.content).toBe("Updated content");
      expect(response.journal_entry.productivity_score).toBe(7);
    });

    test("deleteJournalEntry - should delete entry", async () => {
      const createResponse = await createJournalEntry({
        title: "Entry to Delete",
        content: "Content to delete"
      });

      const response = await deleteJournalEntry({ id: createResponse.journal_entry.id.toString() });

      expect(response.success).toBe(true);

      // Verify entry is deleted
      await expect(getJournalEntry({ id: createResponse.journal_entry.id.toString() }))
        .rejects.toThrow("Journal entry not found");
    });
  });

  describe("Search and Analytics", () => {
    test("searchJournalEntries - should find entries by content", async () => {
      await createJournalEntry({
        title: "Searchable Entry",
        content: "This entry contains searchable keywords"
      });

      const response = await searchJournalEntries({ query: "searchable" });

      expect(response.journal_entries.length).toBeGreaterThan(0);
      expect(response.journal_entries.some(entry => 
        entry.title.toLowerCase().includes("searchable") || 
        entry.content.toLowerCase().includes("searchable")
      )).toBe(true);
    });

    test("searchJournalEntries - should require search query", async () => {
      await expect(searchJournalEntries({ query: "" })).rejects.toThrow("Search query is required");
    });

    test("getJournalAnalytics - should return analytics data", async () => {
      // Create some test entries
      await createJournalEntry({
        title: "Analytics Test 1",
        content: "First test entry for analytics",
        productivity_score: 5,
        tags: ["test", "analytics"]
      });

      await createJournalEntry({
        title: "Analytics Test 2",
        content: "Second test entry for analytics",
        productivity_score: 8,
        tags: ["test", "data"]
      });

      const response = await getJournalAnalytics({});

      expect(response.total_entries).toBeGreaterThanOrEqual(2);
      expect(response.entries_this_week).toBeGreaterThanOrEqual(2);
      expect(response.entries_this_month).toBeGreaterThanOrEqual(2);
      expect(typeof response.writing_streak).toBe('number');
      expect(typeof response.average_words_per_entry).toBe('number');
      expect(typeof response.total_words).toBe('number');
      expect(Array.isArray(response.most_used_tags)).toBe(true);
      expect(response.productivity_correlation).toBeDefined();
      expect(response.writing_patterns).toBeDefined();
    });
  });

  describe("Template Management", () => {
    test("getJournalTemplates - should return default templates", async () => {
      const response = await getJournalTemplates({});

      expect(response.templates).toBeDefined();
      expect(Array.isArray(response.templates)).toBe(true);
      expect(response.templates.length).toBeGreaterThan(0);
      
      // Check for some default templates
      const templateNames = response.templates.map(t => t.name);
      expect(templateNames).toContain("Daily Reflection");
      expect(templateNames).toContain("Morning Intentions");
    });

    test("getJournalTemplates - should filter by category", async () => {
      const response = await getJournalTemplates({ category: "reflection" });

      expect(response.templates.every(template => template.category === "reflection")).toBe(true);
    });

    test("createJournalTemplate - should create new template", async () => {
      const request = {
        name: "Custom Test Template",
        description: "A template for testing",
        prompts: ["What did you test today?", "How did the test go?"],
        category: "planning" as const
      };

      const response = await createJournalTemplate(request);

      expect(response.success).toBe(true);
      expect(response.template.name).toBe(request.name);
      expect(response.template.description).toBe(request.description);
      expect(response.template.prompts).toEqual(request.prompts);
      expect(response.template.category).toBe(request.category);
      expect(response.template.is_active).toBe(true);
    });

    test("createJournalTemplate - should reject template without name", async () => {
      const request = {
        name: "",
        prompts: ["Test prompt"],
        category: "reflection" as const
      };

      await expect(createJournalTemplate(request)).rejects.toThrow("Template name is required");
    });

    test("createJournalTemplate - should reject template without prompts", async () => {
      const request = {
        name: "Test Template",
        prompts: [],
        category: "reflection" as const
      };

      await expect(createJournalTemplate(request)).rejects.toThrow("Template prompts are required");
    });

    test("updateJournalTemplate - should update template", async () => {
      const createResponse = await createJournalTemplate({
        name: "Original Template",
        prompts: ["Original prompt"],
        category: "reflection"
      });

      const updateRequest = {
        id: createResponse.template.id.toString(),
        name: "Updated Template",
        description: "Updated description",
        is_active: false
      };

      const response = await updateJournalTemplate(updateRequest);

      expect(response.success).toBe(true);
      expect(response.template.name).toBe("Updated Template");
      expect(response.template.description).toBe("Updated description");
      expect(response.template.is_active).toBe(false);
    });

    test("deleteJournalTemplate - should delete template", async () => {
      const createResponse = await createJournalTemplate({
        name: "Template to Delete",
        prompts: ["Test prompt"],
        category: "reflection"
      });

      const response = await deleteJournalTemplate({ id: createResponse.template.id.toString() });

      expect(response.success).toBe(true);
    });
  });
});
