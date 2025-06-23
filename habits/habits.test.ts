import { describe, it, expect, beforeEach } from "vitest";
import { 
  createHabit, 
  getHabits, 
  getHabit, 
  updateHabit, 
  deleteHabit,
  logHabitCompletion,
  getHabitHistory
} from "./habits";
import type { 
  CreateHabitRequest, 
  UpdateHabitRequest,
  LogHabitCompletionRequest 
} from "./types";

describe("Habit Management", () => {
  describe("createHabit", () => {
    it("should create a habit with required fields", async () => {
      const req: CreateHabitRequest = {
        name: "Test Habit"
      };

      const response = await createHabit(req);
      
      expect(response.habit).toBeDefined();
      expect(response.habit.name).toBe("Test Habit");
      expect(response.habit.category).toBe("personal");
      expect(response.habit.target_frequency).toBe(1);
      expect(response.habit.active).toBe(true);
      expect(response.habit.id).toBeGreaterThan(0);
    });

    it("should create a habit with all fields", async () => {
      const req: CreateHabitRequest = {
        name: "Exercise Daily",
        description: "30 minutes of exercise",
        category: "health",
        target_frequency: 1
      };

      const response = await createHabit(req);
      
      expect(response.habit.name).toBe("Exercise Daily");
      expect(response.habit.description).toBe("30 minutes of exercise");
      expect(response.habit.category).toBe("health");
      expect(response.habit.target_frequency).toBe(1);
    });

    it("should throw error for empty name", async () => {
      const req: CreateHabitRequest = {
        name: ""
      };

      await expect(createHabit(req)).rejects.toThrow("Habit name is required");
    });

    it("should throw error for invalid category", async () => {
      const req: any = {
        name: "Test Habit",
        category: "invalid"
      };

      await expect(createHabit(req)).rejects.toThrow("Invalid category");
    });
  });

  describe("getHabits", () => {
    it("should get all habits", async () => {
      const response = await getHabits({});
      
      expect(response.habits).toBeDefined();
      expect(Array.isArray(response.habits)).toBe(true);
    });

    it("should filter habits by active status", async () => {
      const response = await getHabits({ active: true });
      
      expect(response.habits).toBeDefined();
      response.habits.forEach(habit => {
        expect(habit.active).toBe(true);
      });
    });

    it("should filter habits by category", async () => {
      const response = await getHabits({ category: "health" });
      
      expect(response.habits).toBeDefined();
      response.habits.forEach(habit => {
        expect(habit.category).toBe("health");
      });
    });

    it("should include today completion status when requested", async () => {
      const response = await getHabits({ include_today: true });
      
      expect(response.habits).toBeDefined();
      response.habits.forEach(habit => {
        expect(typeof habit.today_completed).toBe("boolean");
        expect(typeof habit.current_streak).toBe("number");
        expect(typeof habit.completion_rate).toBe("number");
      });
    });
  });

  describe("getHabit", () => {
    it("should get a specific habit by ID", async () => {
      // First create a habit
      const createResponse = await createHabit({ name: "Test Habit for Get" });
      const habitId = createResponse.habit.id;

      const response = await getHabit({ id: habitId });
      
      expect(response.habit).toBeDefined();
      expect(response.habit.id).toBe(habitId);
      expect(response.habit.name).toBe("Test Habit for Get");
      expect(typeof response.habit.today_completed).toBe("boolean");
      expect(typeof response.habit.current_streak).toBe("number");
      expect(typeof response.habit.completion_rate).toBe("number");
    });

    it("should throw error for non-existent habit", async () => {
      await expect(getHabit({ id: 99999 })).rejects.toThrow("Habit not found");
    });
  });

  describe("updateHabit", () => {
    it("should update habit name", async () => {
      // First create a habit
      const createResponse = await createHabit({ name: "Original Name" });
      const habitId = createResponse.habit.id;

      const updateReq: UpdateHabitRequest = {
        id: habitId,
        name: "Updated Name"
      };

      const response = await updateHabit(updateReq);
      
      expect(response.habit.name).toBe("Updated Name");
      expect(response.habit.id).toBe(habitId);
    });

    it("should deactivate habit", async () => {
      // First create a habit
      const createResponse = await createHabit({ name: "Habit to Deactivate" });
      const habitId = createResponse.habit.id;

      const updateReq: UpdateHabitRequest = {
        id: habitId,
        active: false
      };

      const response = await updateHabit(updateReq);
      
      expect(response.habit.active).toBe(false);
    });

    it("should throw error for non-existent habit", async () => {
      const updateReq: UpdateHabitRequest = {
        id: 99999,
        name: "Non-existent"
      };

      await expect(updateHabit(updateReq)).rejects.toThrow("Habit not found");
    });
  });

  describe("deleteHabit", () => {
    it("should delete a habit", async () => {
      // First create a habit
      const createResponse = await createHabit({ name: "Habit to Delete" });
      const habitId = createResponse.habit.id;

      const response = await deleteHabit({ id: habitId });
      
      expect(response.success).toBe(true);
      expect(response.message).toBe("Habit deleted successfully");

      // Verify habit is deleted
      await expect(getHabit({ id: habitId })).rejects.toThrow("Habit not found");
    });

    it("should throw error for non-existent habit", async () => {
      await expect(deleteHabit({ id: 99999 })).rejects.toThrow("Habit not found");
    });
  });

  describe("logHabitCompletion", () => {
    it("should log habit completion for today", async () => {
      // First create a habit
      const createResponse = await createHabit({ name: "Habit for Completion" });
      const habitId = createResponse.habit.id;

      const req: LogHabitCompletionRequest = {
        habit_id: habitId,
        completed: true
      };

      const response = await logHabitCompletion(req);
      
      expect(response.completion).toBeDefined();
      expect(response.completion.habit_id).toBe(habitId);
      expect(response.completion.completed).toBe(true);
      expect(response.updated_streak).toBeGreaterThanOrEqual(0);
    });

    it("should log habit completion for specific date", async () => {
      // First create a habit
      const createResponse = await createHabit({ name: "Habit for Date Completion" });
      const habitId = createResponse.habit.id;

      const req: LogHabitCompletionRequest = {
        habit_id: habitId,
        completion_date: "2025-06-20",
        completed: true,
        notes: "Completed early in the day"
      };

      const response = await logHabitCompletion(req);
      
      expect(response.completion.habit_id).toBe(habitId);
      expect(response.completion.completion_date).toBe("2025-06-20");
      expect(response.completion.completed).toBe(true);
      expect(response.completion.notes).toBe("Completed early in the day");
    });

    it("should throw error for non-existent habit", async () => {
      const req: LogHabitCompletionRequest = {
        habit_id: 99999,
        completed: true
      };

      await expect(logHabitCompletion(req)).rejects.toThrow("Habit not found");
    });
  });

  describe("getHabitHistory", () => {
    it("should get habit completion history", async () => {
      // First create a habit and log some completions
      const createResponse = await createHabit({ name: "Habit for History" });
      const habitId = createResponse.habit.id;

      // Log a few completions
      await logHabitCompletion({ habit_id: habitId, completion_date: "2025-06-20", completed: true });
      await logHabitCompletion({ habit_id: habitId, completion_date: "2025-06-21", completed: false });
      await logHabitCompletion({ habit_id: habitId, completion_date: "2025-06-22", completed: true });

      const response = await getHabitHistory({ habit_id: habitId });
      
      expect(response.completions).toBeDefined();
      expect(Array.isArray(response.completions)).toBe(true);
      expect(response.completions.length).toBeGreaterThanOrEqual(3);
      
      expect(response.streak_data).toBeDefined();
      expect(typeof response.streak_data.current_streak).toBe("number");
      expect(typeof response.streak_data.longest_streak).toBe("number");
      expect(typeof response.streak_data.completion_rate).toBe("number");
    });

    it("should filter history by date range", async () => {
      // First create a habit
      const createResponse = await createHabit({ name: "Habit for Date Range" });
      const habitId = createResponse.habit.id;

      const response = await getHabitHistory({ 
        habit_id: habitId,
        start_date: "2025-06-01",
        end_date: "2025-06-30"
      });
      
      expect(response.completions).toBeDefined();
      response.completions.forEach(completion => {
        expect(completion.completion_date >= "2025-06-01").toBe(true);
        expect(completion.completion_date <= "2025-06-30").toBe(true);
      });
    });

    it("should throw error for non-existent habit", async () => {
      await expect(getHabitHistory({ habit_id: 99999 })).rejects.toThrow("Habit not found");
    });
  });
});
