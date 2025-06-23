import { api } from "encore.dev/api";
import { taskDB } from "./encore.service";
import {
  TaskTimeEntry,
  StartTimeEntryRequest,
  StartTimeEntryResponse,
  StopTimeEntryRequest,
  StopTimeEntryResponse,
  GetTimeEntriesRequest,
  GetTimeEntriesResponse
} from "./types";
import { sanitizeString, isValidDateString } from "../shared/utils";

async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

export const startTimeEntry = api(
  { method: "POST", path: "/tasks/:task_id/time-entries", expose: true },
  async (req: StartTimeEntryRequest): Promise<StartTimeEntryResponse> => {
    try {
      const { task_id, description } = req;

      // Verify task exists
      const taskGenerator = taskDB.query`
        SELECT id FROM tasks WHERE id = ${task_id}
      `;
      const taskResult = await collectResults(taskGenerator);
      
      if (taskResult.length === 0) {
        throw new Error("Task not found");
      }

      // Check if there's already an active time entry for this task
      const activeGenerator = taskDB.query`
        SELECT id FROM task_time_entries 
        WHERE task_id = ${task_id} AND end_time IS NULL
      `;
      const activeEntries = await collectResults(activeGenerator);
      
      if (activeEntries.length > 0) {
        throw new Error("There is already an active time entry for this task");
      }

      const cleanDescription = description ? sanitizeString(description, 500) : null;

      const generator = taskDB.query`
        INSERT INTO task_time_entries (task_id, start_time, description, created_at)
        VALUES (${task_id}, CURRENT_TIMESTAMP, ${cleanDescription}, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await collectResults(generator);
      if (result.length === 0) {
        throw new Error("Failed to start time entry");
      }

      const entryRow = result[0];
      const time_entry: TaskTimeEntry = {
        id: entryRow.id,
        task_id: entryRow.task_id,
        start_time: entryRow.start_time,
        end_time: entryRow.end_time,
        description: entryRow.description,
        created_at: entryRow.created_at
      };

      return { time_entry };
    } catch (error) {
      throw new Error(`Failed to start time entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const stopTimeEntry = api(
  { method: "PUT", path: "/tasks/time-entries/:id/stop", expose: true },
  async (req: StopTimeEntryRequest): Promise<StopTimeEntryResponse> => {
    try {
      const { id } = req;

      // Get the time entry
      const existingGenerator = taskDB.query`
        SELECT * FROM task_time_entries WHERE id = ${id}
      `;
      const existing = await collectResults(existingGenerator);

      if (existing.length === 0) {
        throw new Error("Time entry not found");
      }

      const entry = existing[0];
      if (entry.end_time) {
        throw new Error("Time entry is already stopped");
      }

      const generator = taskDB.query`
        UPDATE task_time_entries 
        SET end_time = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      const result = await collectResults(generator);
      const entryRow = result[0];

      const time_entry: TaskTimeEntry = {
        id: entryRow.id,
        task_id: entryRow.task_id,
        start_time: entryRow.start_time,
        end_time: entryRow.end_time,
        description: entryRow.description,
        created_at: entryRow.created_at
      };

      // Calculate duration in minutes
      const startTime = new Date(entryRow.start_time);
      const endTime = new Date(entryRow.end_time);
      const duration_minutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

      // Update task's actual minutes
      const updateTaskGenerator = taskDB.query`
        UPDATE tasks 
        SET actual_minutes = COALESCE(actual_minutes, 0) + ${duration_minutes}
        WHERE id = ${entryRow.task_id}
      `;
      await collectResults(updateTaskGenerator);

      return { time_entry, duration_minutes };
    } catch (error) {
      throw new Error(`Failed to stop time entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const getTimeEntries = api(
  { method: "GET", path: "/tasks/time-entries", expose: true },
  async (req: GetTimeEntriesRequest): Promise<GetTimeEntriesResponse> => {
    try {
      let baseQuery = 'SELECT * FROM task_time_entries WHERE 1=1';
      const params: any[] = [];

      if (req.task_id) {
        baseQuery += ' AND task_id = $' + (params.length + 1);
        params.push(req.task_id);
      }

      if (req.start_date && isValidDateString(req.start_date)) {
        baseQuery += ' AND DATE(start_time) >= $' + (params.length + 1);
        params.push(req.start_date);
      }

      if (req.end_date && isValidDateString(req.end_date)) {
        baseQuery += ' AND DATE(start_time) <= $' + (params.length + 1);
        params.push(req.end_date);
      }

      baseQuery += ' ORDER BY start_time DESC';

      // For simplicity, using the basic query approach
      const generator = taskDB.query`
        SELECT * FROM task_time_entries ORDER BY start_time DESC
      `;
      const allEntries = await collectResults(generator);

      // Apply filters in memory
      let filteredEntries = allEntries;

      if (req.task_id) {
        filteredEntries = filteredEntries.filter(entry => entry.task_id === req.task_id);
      }

      if (req.start_date && isValidDateString(req.start_date)) {
        filteredEntries = filteredEntries.filter(entry => {
          const entryDate = new Date(entry.start_time).toISOString().split('T')[0];
          return entryDate >= req.start_date!;
        });
      }

      if (req.end_date && isValidDateString(req.end_date)) {
        filteredEntries = filteredEntries.filter(entry => {
          const entryDate = new Date(entry.start_time).toISOString().split('T')[0];
          return entryDate <= req.end_date!;
        });
      }

      const time_entries: TaskTimeEntry[] = filteredEntries.map((row: any) => ({
        id: row.id,
        task_id: row.task_id,
        start_time: row.start_time,
        end_time: row.end_time,
        description: row.description,
        created_at: row.created_at
      }));

      // Calculate total minutes for completed entries
      const total_minutes = time_entries.reduce((total, entry) => {
        if (entry.end_time) {
          const startTime = new Date(entry.start_time);
          const endTime = new Date(entry.end_time);
          const minutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
          return total + minutes;
        }
        return total;
      }, 0);

      return { time_entries, total_minutes };
    } catch (error) {
      throw new Error(`Failed to get time entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const getActiveTimeEntry = api(
  { method: "GET", path: "/tasks/:task_id/time-entries/active", expose: true },
  async ({ task_id }: { task_id: number }): Promise<{ time_entry?: TaskTimeEntry; has_active: boolean }> => {
    try {
      const generator = taskDB.query`
        SELECT * FROM task_time_entries 
        WHERE task_id = ${task_id} AND end_time IS NULL
        ORDER BY start_time DESC
        LIMIT 1
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        return { has_active: false };
      }

      const entryRow = result[0];
      const time_entry: TaskTimeEntry = {
        id: entryRow.id,
        task_id: entryRow.task_id,
        start_time: entryRow.start_time,
        end_time: entryRow.end_time,
        description: entryRow.description,
        created_at: entryRow.created_at
      };

      return { time_entry, has_active: true };
    } catch (error) {
      throw new Error(`Failed to get active time entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);