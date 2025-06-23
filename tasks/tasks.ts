import { api } from "encore.dev/api";
import { taskDB } from "./encore.service";
import {
  Task,
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
  UpdateTaskResponse,
  GetTaskResponse,
  GetTasksRequest,
  GetTasksResponse,
  DeleteTaskRequest,
  DeleteTaskResponse
} from "./types";
import { 
  sanitizeString, 
  isValidDateString, 
  isValidPriority, 
  createErrorResponse,
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

// Create a new task
export const createTask = api(
  { method: "POST", path: "/tasks", expose: true },
  async (req: CreateTaskRequest): Promise<CreateTaskResponse> => {
    try {
      // Validate required fields
      if (!req.title || req.title.trim() === '') {
        throw new Error("Task title is required");
      }      // Sanitize inputs
      const title = sanitizeString(req.title, 255);
      const description = req.description ? sanitizeString(req.description, 1000) : '';
      const priority = req.priority || 'medium';
      
      // Validate priority
      if (!isValidPriority(priority)) {
        throw new Error("Invalid priority. Must be 'high', 'medium', or 'low'");
      }

      // Validate due_date if provided
      if (req.due_date && !isValidDateString(req.due_date)) {
        throw new Error("Invalid due date format. Use YYYY-MM-DD");
      }      const due_date = req.due_date || null;

      // Insert task into database using database functions for timestamps
      const insertResult = taskDB.query`
        INSERT INTO tasks (title, description, priority, due_date, completed, created_at, updated_at)
        VALUES (${title}, ${description}, ${priority}, ${due_date}, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await collectResults(insertResult);

      if (result.length === 0) {
        throw new Error("Failed to create task");
      }

      const taskRow = result[0];
      const task: Task = {
        id: taskRow.id,
        title: taskRow.title,
        description: taskRow.description,
        priority: taskRow.priority,
        due_date: taskRow.due_date,
        completed: taskRow.completed,
        completed_at: taskRow.completed_at,
        created_at: taskRow.created_at,
        updated_at: taskRow.updated_at
      };

      return { task };
    } catch (error) {
      throw new Error(`Failed to create task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get all tasks with optional filtering
export const getTasks = api(
  { method: "GET", path: "/tasks", expose: true },
  async (req: GetTasksRequest): Promise<GetTasksResponse> => {
    try {
      // Build query using template literal for complex filtering
      let baseQuery = 'SELECT * FROM tasks WHERE 1=1';
      
      if (req.completed !== undefined) {
        baseQuery += ` AND completed = ${req.completed}`;
      }

      if (req.priority && isValidPriority(req.priority)) {
        baseQuery += ` AND priority = '${req.priority}'`;
      }

      if (req.due_before && isValidDateString(req.due_before)) {
        baseQuery += ` AND due_date <= '${req.due_before}'`;
      }

      if (req.due_after && isValidDateString(req.due_after)) {
        baseQuery += ` AND due_date >= '${req.due_after}'`;
      }

      baseQuery += ' ORDER BY created_at DESC';
      
      // Use simple query for now, parameterized queries need different approach
      const generator = taskDB.query`SELECT * FROM tasks ORDER BY created_at DESC`;
      const allTasks = await collectResults(generator);
      
      // Apply filters in memory for now (can be optimized later)
      let filteredTasks = allTasks;
      
      if (req.completed !== undefined) {
        filteredTasks = filteredTasks.filter(task => task.completed === req.completed);
      }
      
      if (req.priority && isValidPriority(req.priority)) {
        filteredTasks = filteredTasks.filter(task => task.priority === req.priority);
      }
      
      if (req.due_before && isValidDateString(req.due_before)) {
        filteredTasks = filteredTasks.filter(task => 
          task.due_date && task.due_date <= req.due_before!
        );
      }
      
      if (req.due_after && isValidDateString(req.due_after)) {
        filteredTasks = filteredTasks.filter(task => 
          task.due_date && task.due_date >= req.due_after!
        );
      }
      
      const tasks: Task[] = filteredTasks.map((row: any) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        priority: row.priority,
        due_date: row.due_date,
        completed: row.completed,
        completed_at: row.completed_at,
        created_at: row.created_at,
        updated_at: row.updated_at
      }));

      return { tasks };
    } catch (error) {
      throw new Error(`Failed to get tasks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get a specific task by ID
export const getTask = api(
  { method: "GET", path: "/tasks/:id", expose: true },
  async ({ id }: { id: number }): Promise<GetTaskResponse> => {
    try {
      const generator = taskDB.query`
        SELECT * FROM tasks WHERE id = ${id}
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        throw new Error("Task not found");
      }

      const taskRow = result[0];
      const task: Task = {
        id: taskRow.id,
        title: taskRow.title,
        description: taskRow.description,
        priority: taskRow.priority,
        due_date: taskRow.due_date,
        completed: taskRow.completed,
        completed_at: taskRow.completed_at,
        created_at: taskRow.created_at,
        updated_at: taskRow.updated_at
      };

      return { task };
    } catch (error) {
      throw new Error(`Failed to get task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Update a task
export const updateTask = api(
  { method: "PUT", path: "/tasks/:id", expose: true },
  async (req: UpdateTaskRequest): Promise<UpdateTaskResponse> => {
    try {
      const { id, ...updates } = req;

      // Check if task exists
      const existingGenerator = taskDB.query`
        SELECT * FROM tasks WHERE id = ${id}
      `;

      const existingResult = await collectResults(existingGenerator);

      if (existingResult.length === 0) {
        throw new Error("Task not found");
      }

      const existingTask = existingResult[0];
      
      // Prepare update values
      const title = updates.title ? sanitizeString(updates.title, 255) : existingTask.title;
      const description = updates.description !== undefined 
        ? (updates.description ? sanitizeString(updates.description, 1000) : null)
        : existingTask.description;
      const priority = updates.priority || existingTask.priority;
      const due_date = updates.due_date !== undefined ? updates.due_date : existingTask.due_date;
      
      // Validate priority
      if (!isValidPriority(priority)) {
        throw new Error("Invalid priority. Must be 'high', 'medium', or 'low'");
      }

      // Validate due_date if provided
      if (due_date && !isValidDateString(due_date)) {
        throw new Error("Invalid due date format. Use YYYY-MM-DD");
      }      // Handle completion status
      let completed = updates.completed !== undefined ? updates.completed : existingTask.completed;
      
      // Update task in database using conditional SQL for completed_at
      let updateGenerator;
      if (updates.completed !== undefined) {
        if (updates.completed && !existingTask.completed) {
          // Task is being marked as completed - set completed_at to now
          updateGenerator = taskDB.query`
            UPDATE tasks 
            SET title = ${title}, 
                description = ${description}, 
                priority = ${priority},
                due_date = ${due_date},
                completed = ${completed},
                completed_at = CURRENT_TIMESTAMP,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
          `;
        } else if (!updates.completed && existingTask.completed) {
          // Task is being marked as incomplete - clear completed_at
          updateGenerator = taskDB.query`
            UPDATE tasks 
            SET title = ${title}, 
                description = ${description}, 
                priority = ${priority},
                due_date = ${due_date},
                completed = ${completed},
                completed_at = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
          `;
        } else {
          // Completion status unchanged
          updateGenerator = taskDB.query`
            UPDATE tasks 
            SET title = ${title}, 
                description = ${description}, 
                priority = ${priority},
                due_date = ${due_date},
                completed = ${completed},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING *
          `;
        }
      } else {
        // No completion status change
        updateGenerator = taskDB.query`
          UPDATE tasks 
          SET title = ${title}, 
              description = ${description}, 
              priority = ${priority},
              due_date = ${due_date},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `;
      }

      const result = await collectResults(updateGenerator);
      const taskRow = result[0];
      const task: Task = {
        id: taskRow.id,
        title: taskRow.title,
        description: taskRow.description,
        priority: taskRow.priority,
        due_date: taskRow.due_date,
        completed: taskRow.completed,
        completed_at: taskRow.completed_at,
        created_at: taskRow.created_at,
        updated_at: taskRow.updated_at
      };

      return { task };
    } catch (error) {
      throw new Error(`Failed to update task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Delete a task
export const deleteTask = api(
  { method: "DELETE", path: "/tasks/:id", expose: true },
  async ({ id }: { id: number }): Promise<DeleteTaskResponse> => {
    try {
      const generator = taskDB.query`
        DELETE FROM tasks WHERE id = ${id}
        RETURNING id
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        throw new Error("Task not found");
      }

      return {
        success: true,
        message: "Task deleted successfully"
      };
    } catch (error) {
      throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);
