import { api } from "encore.dev/api";
import { calendarDB } from "./encore.service";
import { taskDB } from "../tasks/encore.service";
import {
  CalendarDay,
  CalendarWeek,
  CalendarMonth,
  GetDayViewRequest,
  GetDayViewResponse,
  GetWeekViewRequest,
  GetWeekViewResponse,
  GetMonthViewRequest,
  GetMonthViewResponse,
  CalendarEventWithDetails
} from "./types";
import { isValidDateString, getCurrentDateString } from "../shared/utils";

async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

// Helper function to get events for a date range
async function getEventsForDateRange(startDate: string, endDate: string, includeTaskData = false): Promise<CalendarEventWithDetails[]> {
  const generator = calendarDB.query`
    SELECT * FROM calendar_events 
    WHERE DATE(start_datetime) >= ${startDate} 
    AND DATE(start_datetime) <= ${endDate}
    ORDER BY start_datetime ASC
  `;

  const eventRows = await collectResults(generator);

  return Promise.all(
    eventRows.map(async (eventRow: any) => {
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

      // Add task data if available and requested
      if (includeTaskData && eventRow.task_id) {
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

      return event;
    })
  );
}

// Helper function to get task deadlines for a date range
async function getTaskDeadlinesForDateRange(startDate: string, endDate: string) {
  try {
    const generator = taskDB.query`
      SELECT id, title, due_date, priority, completed 
      FROM tasks 
      WHERE due_date >= ${startDate} 
      AND due_date <= ${endDate}
      ORDER BY due_date ASC, priority DESC
    `;

    const taskRows = await collectResults(generator);
    return taskRows.map((row: any) => ({
      id: row.id,
      title: row.title,
      due_date: row.due_date,
      priority: row.priority,
      completed: row.completed
    }));
  } catch (error) {
    return [];
  }
}

export const getDayView = api(
  { method: "GET", path: "/calendar/events/day/:date", expose: true },
  async (req: GetDayViewRequest): Promise<GetDayViewResponse> => {
    try {
      if (!isValidDateString(req.date)) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }

      const today = getCurrentDateString();
      const events = await getEventsForDateRange(req.date, req.date, req.include_tasks);

      const day: CalendarDay = {
        date: req.date,
        events,
        is_today: req.date === today,
        is_current_month: true // Always true for single day view
      };

      let task_deadlines;
      if (req.include_tasks) {
        task_deadlines = await getTaskDeadlinesForDateRange(req.date, req.date);
      }

      return { day, task_deadlines };
    } catch (error) {
      throw new Error(`Failed to get day view: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const getWeekView = api(
  { method: "GET", path: "/calendar/events/week/:date", expose: true },
  async (req: GetWeekViewRequest): Promise<GetWeekViewResponse> => {
    try {
      if (!isValidDateString(req.date)) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }

      // Calculate week start (Monday) and end (Sunday)
      const date = new Date(req.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday start
      
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - daysToMonday);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      // Get all events for the week
      const allEvents = await getEventsForDateRange(weekStartStr, weekEndStr, req.include_tasks);
      const today = getCurrentDateString();

      // Create daily buckets
      const days: CalendarDay[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Filter events for this day
        const dayEvents = allEvents.filter(event => {
          const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
          return eventDate === dateStr;
        });

        days.push({
          date: dateStr,
          events: dayEvents,
          is_today: dateStr === today,
          is_current_month: true // We'll consider all days in week view as current month
        });
      }

      const week: CalendarWeek = {
        week_start: weekStartStr,
        week_end: weekEndStr,
        days
      };

      let task_deadlines;
      if (req.include_tasks) {
        task_deadlines = await getTaskDeadlinesForDateRange(weekStartStr, weekEndStr);
      }

      return { week, task_deadlines };
    } catch (error) {
      throw new Error(`Failed to get week view: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

export const getMonthView = api(
  { method: "GET", path: "/calendar/events/month/:year/:month", expose: true },
  async (req: GetMonthViewRequest): Promise<GetMonthViewResponse> => {
    try {
      if (req.year < 1900 || req.year > 2100) {
        throw new Error("Year must be between 1900 and 2100");
      }

      if (req.month < 1 || req.month > 12) {
        throw new Error("Month must be between 1 and 12");
      }

      // Calculate month boundaries
      const firstDayOfMonth = new Date(req.year, req.month - 1, 1);
      const lastDayOfMonth = new Date(req.year, req.month, 0);

      // Calculate calendar grid start (Monday of first week) and end (Sunday of last week)
      const firstDayOfWeek = firstDayOfMonth.getDay();
      const daysToFirstMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      
      const calendarStart = new Date(firstDayOfMonth);
      calendarStart.setDate(firstDayOfMonth.getDate() - daysToFirstMonday);

      const lastDayOfWeek = lastDayOfMonth.getDay();
      const daysToLastSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
      
      const calendarEnd = new Date(lastDayOfMonth);
      calendarEnd.setDate(lastDayOfMonth.getDate() + daysToLastSunday);

      const calendarStartStr = calendarStart.toISOString().split('T')[0];
      const calendarEndStr = calendarEnd.toISOString().split('T')[0];

      // Get all events for the calendar period
      const allEvents = await getEventsForDateRange(calendarStartStr, calendarEndStr, req.include_tasks);
      const today = getCurrentDateString();

      // Create week structure
      const weeks: CalendarWeek[] = [];
      const currentDate = new Date(calendarStart);

      while (currentDate <= calendarEnd) {
        const weekStart = new Date(currentDate);
        const weekEnd = new Date(currentDate);
        weekEnd.setDate(currentDate.getDate() + 6);

        const days: CalendarDay[] = [];

        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(currentDate);
          dayDate.setDate(currentDate.getDate() + i);
          const dateStr = dayDate.toISOString().split('T')[0];

          // Filter events for this day
          const dayEvents = allEvents.filter(event => {
            const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
            return eventDate === dateStr;
          });

          const isCurrentMonth = dayDate.getMonth() === req.month - 1;

          days.push({
            date: dateStr,
            events: dayEvents,
            is_today: dateStr === today,
            is_current_month: isCurrentMonth
          });
        }

        weeks.push({
          week_start: weekStart.toISOString().split('T')[0],
          week_end: weekEnd.toISOString().split('T')[0],
          days
        });

        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const month: CalendarMonth = {
        year: req.year,
        month: req.month,
        month_name: monthNames[req.month - 1],
        weeks
      };

      let task_deadlines;
      if (req.include_tasks) {
        const monthStartStr = firstDayOfMonth.toISOString().split('T')[0];
        const monthEndStr = lastDayOfMonth.toISOString().split('T')[0];
        task_deadlines = await getTaskDeadlinesForDateRange(monthStartStr, monthEndStr);
      }

      return { month, task_deadlines };
    } catch (error) {
      throw new Error(`Failed to get month view: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);