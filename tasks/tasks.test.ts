import { describe, it, expect, beforeEach } from "vitest";
import { createTask, getTasks, getTask, updateTask, deleteTask } from "./tasks";
import type { CreateTaskRequest, UpdateTaskRequest } from "./types";

describe("Task Management", () => {
  describe("createTask", () => {
    it("should create a task with required fields", async () => {
      const req: CreateTaskRequest = {
        title: "Test Task"
      };

      const response = await createTask(req);
      
      expect(response.task).toBeDefined();
      expect(response.task.title).toBe("Test Task");
      expect(response.task.priority).toBe("medium");
      expect(response.task.completed).toBe(false);
      expect(response.task.id).toBeGreaterThan(0);
    });

    it("should create a task with all fields", async () => {
      const req: CreateTaskRequest = {
        title: "Complete Task",
        description: "A task with all details",
        priority: "high",
        due_date: "2025-12-31"
      };

      const response = await createTask(req);
      
      expect(response.task.title).toBe("Complete Task");
      expect(response.task.description).toBe("A task with all details");
      expect(response.task.priority).toBe("high");
      expect(response.task.due_date).toBe("2025-12-31");
    });

    it("should throw error for empty title", async () => {
      const req: CreateTaskRequest = {
        title: ""
      };

      await expect(createTask(req)).rejects.toThrow("Task title is required");
    });

    it("should throw error for invalid priority", async () => {
      const req: any = {
        title: "Test Task",
        priority: "invalid"
      };

      await expect(createTask(req)).rejects.toThrow("Invalid priority");
    });

    it("should throw error for invalid due date", async () => {
      const req: CreateTaskRequest = {
        title: "Test Task",
        due_date: "invalid-date"
      };

      await expect(createTask(req)).rejects.toThrow("Invalid due date format");
    });
  });

  describe("getTasks", () => {
    it("should get all tasks", async () => {
      const response = await getTasks({});
      
      expect(response.tasks).toBeDefined();
      expect(Array.isArray(response.tasks)).toBe(true);
    });

    it("should filter tasks by completion status", async () => {
      const response = await getTasks({ completed: false });
      
      expect(response.tasks).toBeDefined();
      response.tasks.forEach(task => {
        expect(task.completed).toBe(false);
      });
    });

    it("should filter tasks by priority", async () => {
      const response = await getTasks({ priority: "high" });
      
      expect(response.tasks).toBeDefined();
      response.tasks.forEach(task => {
        expect(task.priority).toBe("high");
      });
    });
  });

  describe("getTask", () => {
    it("should get a specific task by ID", async () => {
      // First create a task
      const createResponse = await createTask({ title: "Test Task for Get" });
      const taskId = createResponse.task.id;

      const response = await getTask({ id: taskId });
      
      expect(response.task).toBeDefined();
      expect(response.task.id).toBe(taskId);
      expect(response.task.title).toBe("Test Task for Get");
    });

    it("should throw error for non-existent task", async () => {
      await expect(getTask({ id: 99999 })).rejects.toThrow("Task not found");
    });
  });

  describe("updateTask", () => {
    it("should update task title", async () => {
      // First create a task
      const createResponse = await createTask({ title: "Original Title" });
      const taskId = createResponse.task.id;

      const updateReq: UpdateTaskRequest = {
        id: taskId,
        title: "Updated Title"
      };

      const response = await updateTask(updateReq);
      
      expect(response.task.title).toBe("Updated Title");
      expect(response.task.id).toBe(taskId);
    });

    it("should mark task as completed", async () => {
      // First create a task
      const createResponse = await createTask({ title: "Task to Complete" });
      const taskId = createResponse.task.id;

      const updateReq: UpdateTaskRequest = {
        id: taskId,
        completed: true
      };

      const response = await updateTask(updateReq);
      
      expect(response.task.completed).toBe(true);
      expect(response.task.completed_at).toBeDefined();
    });

    it("should mark completed task as incomplete", async () => {
      // First create and complete a task
      const createResponse = await createTask({ title: "Task to Uncomplete" });
      const taskId = createResponse.task.id;

      await updateTask({ id: taskId, completed: true });
      
      const updateReq: UpdateTaskRequest = {
        id: taskId,
        completed: false
      };

      const response = await updateTask(updateReq);
      
      expect(response.task.completed).toBe(false);
      expect(response.task.completed_at).toBeNull();
    });

    it("should throw error for non-existent task", async () => {
      const updateReq: UpdateTaskRequest = {
        id: 99999,
        title: "Non-existent"
      };

      await expect(updateTask(updateReq)).rejects.toThrow("Task not found");
    });
  });

  describe("deleteTask", () => {
    it("should delete a task", async () => {
      // First create a task
      const createResponse = await createTask({ title: "Task to Delete" });
      const taskId = createResponse.task.id;

      const response = await deleteTask({ id: taskId });
      
      expect(response.success).toBe(true);
      expect(response.message).toBe("Task deleted successfully");

      // Verify task is deleted
      await expect(getTask({ id: taskId })).rejects.toThrow("Task not found");
    });

    it("should throw error for non-existent task", async () => {
      await expect(deleteTask({ id: 99999 })).rejects.toThrow("Task not found");
    });
  });
});
