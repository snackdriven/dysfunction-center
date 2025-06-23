import { api } from "encore.dev/api";
import { calendarDB } from "./encore.service";
import { taskDB } from "../tasks/encore.service";
import {
  CalendarEvent,
  CalendarEventWithDetails,
  CreateEventRequest,
  CreateEventResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  GetEventResponse,
  GetEventsRequest,
  GetEventsResponse,
  DeleteEventRequest,
  DeleteEventResponse,
  ConflictCheckRequest,
  ConflictCheckResponse
} from "./types";
import { sanitizeString, isValidDateString, getCurrentDateString } from "../shared/utils";

async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

// Helper function to validate datetime format
function isValidDatetime(datetime: string): boolean {
  const date = new Date(datetime);
  return !isNaN(date.getTime());
}

export const createEvent = api(
  { method: "POST", path: "/calendar/events", expose: true },
  async (req: CreateEventRequest): Promise<CreateEventResponse> => {
    try {
      if (!req.title || req.title.trim() === '') {
        throw new Error("Event title is required");
      }

      if (!isValidDatetime(req.start_datetime)) {
        throw new Error("Invalid start datetime format");
      }

      if (req.end_datetime && !isValidDatetime(req.end_datetime)) {
        throw new Error("Invalid end datetime format");
      }

      // Validate that end time is after start time
      if (req.end_datetime && new Date(req.end_datetime) <= new Date(req.start_datetime)) {
        throw new Error("End datetime must be after start datetime");
      }

      const title = sanitizeString(req.title, 200);
      const description = req.description ? sanitizeString(req.description, 1000) : null;
      const location = req.location ? sanitizeString(req.location, 200) : null;
      const color = req.color ? sanitizeString(req.color, 7) : null;
      const recurrence_rule = req.recurrence_rule ? sanitizeString(req.recurrence_rule, 255) : null;
      const is_all_day = req.is_all_day || false;

      // Verify task exists if task_id is provided
      if (req.task_id) {
        const taskGenerator = taskDB.query`
          SELECT id FROM tasks WHERE id = ${req.task_id}
        `;
        const taskResult = await collectResults(taskGenerator);
        if (taskResult.length === 0) {
          throw new Error("Referenced task not found");
        }
      }

      const generator = calendarDB.query`
        INSERT INTO calendar_events (
          title, description, start_datetime, end_datetime, is_all_day,
          location, color, recurrence_rule, task_id, created_at, updated_at
        )
        VALUES (
          ${title}, ${description}, ${req.start_datetime}, ${req.end_datetime}, ${is_all_day},
          ${location}, ${color}, ${recurrence_rule}, ${req.task_id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING *
      `;

      const result = await collectResults(generator);
      if (result.length === 0) {
        throw new Error("Failed to create event");
      }

      const eventRow = result[0];
      const event: CalendarEvent = {
        id: eventRow.id,
        title: eventRow.title,
        description: eventRow.description,
        start_datetime: eventRow.start_datetime,
        end_datetime: eventRow.end_datetime,
        is_all_day: eventRow.is_all_day,
        location: eventRow.location,
        color: eventRow.color,
        recurrence_rule: eventRow.recurrence_rule,
        task_id: eventRow.task_id,
        created_at: eventRow.created_at,
        updated_at: eventRow.updated_at
      };

      return { event };
    } catch (error) {
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const getEvents = api(
  { method: "GET", path: "/calendar/events", expose: true },
  async (req: GetEventsRequest): Promise<GetEventsResponse> => {
    try {
      // Get events with optional date filtering
      const generator = calendarDB.query`
        SELECT * FROM calendar_events ORDER BY start_datetime ASC
      `;
      const allEvents = await collectResults(generator);

      // Apply filters in memory
      let filteredEvents = allEvents;

      if (req.start_date && isValidDateString(req.start_date)) {
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
          return eventDate >= req.start_date!;
        });
      }

      if (req.end_date && isValidDateString(req.end_date)) {
        filteredEvents = filteredEvents.filter(event => {
          const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
          return eventDate <= req.end_date!;
        });
      }

      if (req.task_id) {
        filteredEvents = filteredEvents.filter(event => event.task_id === req.task_id);
      }

      // Enrich with task data if requested
      const events: CalendarEventWithDetails[] = await Promise.all(
        filteredEvents.map(async (eventRow: any) => {
          const baseEvent: CalendarEventWithDetails = {
            id: eventRow.id,
            title: eventRow.title,
            description: eventRow.description,
            start_datetime: eventRow.start_datetime,
            end_datetime: eventRow.end_datetime,
            is_all_day: eventRow.is_all_day,
            location: eventRow.location,
            color: eventRow.color,
            recurrence_rule: eventRow.recurrence_rule,
            task_id: eventRow.task_id,
            created_at: eventRow.created_at,
            updated_at: eventRow.updated_at,
            is_recurring: !!eventRow.recurrence_rule
          };

          // Add task data if available and requested
          if (req.include_tasks && eventRow.task_id) {
            try {
              const taskGenerator = taskDB.query`
                SELECT id, title, completed, priority FROM tasks WHERE id = ${eventRow.task_id}
              `;
              const taskResult = await collectResults(taskGenerator);
              if (taskResult.length > 0) {
                const taskRow = taskResult[0];
                baseEvent.task = {
                  id: taskRow.id,
                  title: taskRow.title,
                  completed: taskRow.completed,
                  priority: taskRow.priority
                };
              }
            } catch (error) {
              // Task lookup failed, continue without task data
            }
          }

          return baseEvent;
        })
      );

      return { events };
    } catch (error) {
      throw new Error(`Failed to get events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const getEvent = api(
  { method: "GET", path: "/calendar/events/:id", expose: true },
  async ({ id }: { id: number }): Promise<GetEventResponse> => {
    try {
      const generator = calendarDB.query`
        SELECT * FROM calendar_events WHERE id = ${id}
      `;

      const result = await collectResults(generator);
      if (result.length === 0) {
        throw new Error("Event not found");
      }

      const eventRow = result[0];
      const event: CalendarEventWithDetails = {
        id: eventRow.id,
        title: eventRow.title,
        description: eventRow.description,
        start_datetime: eventRow.start_datetime,
        end_datetime: eventRow.end_datetime,
        is_all_day: eventRow.is_all_day,
        location: eventRow.location,
        color: eventRow.color,
        recurrence_rule: eventRow.recurrence_rule,
        task_id: eventRow.task_id,
        created_at: eventRow.created_at,
        updated_at: eventRow.updated_at,
        is_recurring: !!eventRow.recurrence_rule
      };

      // Add task data if available
      if (eventRow.task_id) {
        try {
          const taskGenerator = taskDB.query`
            SELECT id, title, completed, priority FROM tasks WHERE id = ${eventRow.task_id}
          `;
          const taskResult = await collectResults(taskGenerator);
          if (taskResult.length > 0) {
            const taskRow = taskResult[0];
            event.task = {
              id: taskRow.id,
              title: taskRow.title,
              completed: taskRow.completed,
              priority: taskRow.priority
            };
          }
        } catch (error) {
          // Task lookup failed, continue without task data
        }
      }

      return { event };
    } catch (error) {
      throw new Error(`Failed to get event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const updateEvent = api(
  { method: "PUT", path: "/calendar/events/:id", expose: true },
  async (req: UpdateEventRequest): Promise<UpdateEventResponse> => {
    try {
      const { id, ...updates } = req;

      // Check if event exists
      const existingGenerator = calendarDB.query`
        SELECT * FROM calendar_events WHERE id = ${id}
      `;
      const existing = await collectResults(existingGenerator);

      if (existing.length === 0) {
        throw new Error("Event not found");
      }

      const existingEvent = existing[0];

      // Prepare update values
      const title = updates.title ? sanitizeString(updates.title, 200) : existingEvent.title;
      const description = updates.description !== undefined 
        ? (updates.description ? sanitizeString(updates.description, 1000) : null)
        : existingEvent.description;
      const start_datetime = updates.start_datetime || existingEvent.start_datetime;
      const end_datetime = updates.end_datetime !== undefined ? updates.end_datetime : existingEvent.end_datetime;
      const is_all_day = updates.is_all_day !== undefined ? updates.is_all_day : existingEvent.is_all_day;
      const location = updates.location !== undefined 
        ? (updates.location ? sanitizeString(updates.location, 200) : null)
        : existingEvent.location;
      const color = updates.color !== undefined 
        ? (updates.color ? sanitizeString(updates.color, 7) : null)
        : existingEvent.color;
      const recurrence_rule = updates.recurrence_rule !== undefined 
        ? (updates.recurrence_rule ? sanitizeString(updates.recurrence_rule, 255) : null)
        : existingEvent.recurrence_rule;
      const task_id = updates.task_id !== undefined ? updates.task_id : existingEvent.task_id;

      // Validate datetime formats
      if (!isValidDatetime(start_datetime)) {
        throw new Error("Invalid start datetime format");
      }

      if (end_datetime && !isValidDatetime(end_datetime)) {
        throw new Error("Invalid end datetime format");
      }

      // Validate that end time is after start time
      if (end_datetime && new Date(end_datetime) <= new Date(start_datetime)) {
        throw new Error("End datetime must be after start datetime");
      }

      // Verify task exists if task_id is provided
      if (task_id) {
        const taskGenerator = taskDB.query`
          SELECT id FROM tasks WHERE id = ${task_id}
        `;
        const taskResult = await collectResults(taskGenerator);
        if (taskResult.length === 0) {
          throw new Error("Referenced task not found");
        }
      }

      const updateGenerator = calendarDB.query`
        UPDATE calendar_events 
        SET title = ${title}, 
            description = ${description}, 
            start_datetime = ${start_datetime},
            end_datetime = ${end_datetime},
            is_all_day = ${is_all_day},
            location = ${location},
            color = ${color},
            recurrence_rule = ${recurrence_rule},
            task_id = ${task_id},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      const result = await collectResults(updateGenerator);
      const eventRow = result[0];

      const event: CalendarEvent = {
        id: eventRow.id,
        title: eventRow.title,
        description: eventRow.description,
        start_datetime: eventRow.start_datetime,
        end_datetime: eventRow.end_datetime,
        is_all_day: eventRow.is_all_day,
        location: eventRow.location,
        color: eventRow.color,
        recurrence_rule: eventRow.recurrence_rule,
        task_id: eventRow.task_id,
        created_at: eventRow.created_at,
        updated_at: eventRow.updated_at
      };

      return { event };
    } catch (error) {
      throw new Error(`Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const deleteEvent = api(
  { method: "DELETE", path: "/calendar/events/:id", expose: true },
  async (req: DeleteEventRequest): Promise<DeleteEventResponse> => {
    try {
      const { id } = req;

      const generator = calendarDB.query`
        DELETE FROM calendar_events WHERE id = ${id}
        RETURNING id
      `;

      const result = await collectResults(generator);
      if (result.length === 0) {
        throw new Error("Event not found");
      }

      return {
        success: true,
        message: "Event deleted successfully"
      };
    } catch (error) {
      throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const checkConflicts = api(
  { method: "POST", path: "/calendar/conflicts", expose: true },
  async (req: ConflictCheckRequest): Promise<ConflictCheckResponse> => {
    try {
      if (!isValidDatetime(req.start_datetime)) {
        throw new Error("Invalid start datetime format");
      }

      if (req.end_datetime && !isValidDatetime(req.end_datetime)) {
        throw new Error("Invalid end datetime format");
      }

      const startTime = new Date(req.start_datetime);
      const endTime = req.end_datetime ? new Date(req.end_datetime) : startTime;

      // Find overlapping events
      let generator;
      if (req.exclude_event_id) {
        generator = calendarDB.query`
          SELECT * FROM calendar_events 
          WHERE id != ${req.exclude_event_id}
          AND (
            (start_datetime <= ${req.start_datetime} AND end_datetime > ${req.start_datetime}) OR
            (start_datetime < ${req.end_datetime || req.start_datetime} AND end_datetime >= ${req.end_datetime || req.start_datetime}) OR
            (start_datetime >= ${req.start_datetime} AND start_datetime < ${req.end_datetime || req.start_datetime})
          )
        `;
      } else {
        generator = calendarDB.query`
          SELECT * FROM calendar_events 
          WHERE (
            (start_datetime <= ${req.start_datetime} AND end_datetime > ${req.start_datetime}) OR
            (start_datetime < ${req.end_datetime || req.start_datetime} AND end_datetime >= ${req.end_datetime || req.start_datetime}) OR
            (start_datetime >= ${req.start_datetime} AND start_datetime < ${req.end_datetime || req.start_datetime})
          )
        `;
      }

      const conflictingEvents = await collectResults(generator);

      const conflicts = conflictingEvents.map((eventRow: any) => {
        const eventStart = new Date(eventRow.start_datetime);
        const eventEnd = new Date(eventRow.end_datetime || eventRow.start_datetime);

        // Calculate overlap
        const overlapStart = new Date(Math.max(startTime.getTime(), eventStart.getTime()));
        const overlapEnd = new Date(Math.min(endTime.getTime(), eventEnd.getTime()));
        const overlapMinutes = Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));

        return {
          event: {
            id: eventRow.id,
            title: eventRow.title,
            description: eventRow.description,
            start_datetime: eventRow.start_datetime,
            end_datetime: eventRow.end_datetime,
            is_all_day: eventRow.is_all_day,
            location: eventRow.location,
            color: eventRow.color,
            recurrence_rule: eventRow.recurrence_rule,
            task_id: eventRow.task_id,
            created_at: eventRow.created_at,
            updated_at: eventRow.updated_at
          },
          overlap_start: overlapStart.toISOString(),
          overlap_end: overlapEnd.toISOString(),
          overlap_minutes: Math.round(overlapMinutes)
        };
      });

      return {
        has_conflicts: conflicts.length > 0,
        conflicts
      };
    } catch (error) {
      throw new Error(`Failed to check conflicts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);