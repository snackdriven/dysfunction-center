import { api } from "encore.dev/api";
import { habitDB } from "./encore.service";
import {
  Habit,
  HabitCompletion,
  HabitWithCompletion,
  CreateHabitRequest,
  CreateHabitResponse,
  UpdateHabitRequest,
  UpdateHabitResponse,
  GetHabitResponse,
  GetHabitsRequest,
  GetHabitsResponse,
  DeleteHabitRequest,
  DeleteHabitResponse,
  LogHabitCompletionRequest,
  LogHabitCompletionResponse,
  GetHabitHistoryRequest,
  GetHabitHistoryResponse
} from "./types";
import { 
  sanitizeString, 
  isValidDateString, 
  isValidHabitCategory,
  getCurrentDateString,
  getCurrentAppDay,
  getAppDayForTimestamp,
  getAppDayBounds
} from "../shared/utils";

// Helper function to collect database results
async function collectResults<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const result of generator) {
    results.push(result);
  }
  return results;
}

// Get user's End of Day time setting from preferences
async function getEndOfDayTime(userId: string = 'default_user'): Promise<string> {
  try {
    // In a real implementation, we'd call the preferences service
    // For now, we'll use a direct database query to the preferences table
    const generator = habitDB.query`
      SELECT preference_value 
      FROM user_preferences 
      WHERE user_id = ${userId} AND preference_key = 'end_of_day_time'
    `;
    const result = await collectResults(generator);
    
    if (result.length > 0) {
      return result[0].preference_value;
    }
    
    return '23:59'; // Default End of Day time
  } catch (error) {
    console.warn('Could not fetch end_of_day_time preference, using default:', error);
    return '23:59';
  }
}

// Calculate streak for a habit using End of Day time logic
async function calculateStreak(habitId: number, userId: string = 'default_user', asOfDate?: string): Promise<number> {
  const endOfDayTime = await getEndOfDayTime(userId);
  const currentAppDay = asOfDate || getCurrentAppDay(endOfDayTime);
  
  const generator = habitDB.query`
    SELECT completion_date, completed, created_at
    FROM habit_completions 
    WHERE habit_id = ${habitId} AND completion_date <= ${currentAppDay}
    ORDER BY completion_date DESC
  `;
  
  const completions = await collectResults(generator);
  
  let streak = 0;
  let checkDate = currentAppDay;
  
  // Track completions by app day (considering End of Day time)
  const completionsByAppDay = new Map<string, boolean>();
  
  for (const completion of completions) {
    const appDay = getAppDayForTimestamp(completion.created_at, endOfDayTime);
    
    // For each app day, we only care if it was completed at least once
    if (!completionsByAppDay.has(appDay) || (!completionsByAppDay.get(appDay) && completion.completed)) {
      completionsByAppDay.set(appDay, completion.completed);
    }
  }
  
  // Calculate streak by checking consecutive days backward from current day
  let currentDate = new Date(checkDate);
  
  while (true) {
    const dateString = currentDate.toISOString().split('T')[0];
    const wasCompleted = completionsByAppDay.get(dateString);
    
    if (wasCompleted === true) {
      streak++;
      // Go to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (wasCompleted === false) {
      // Explicitly marked as not completed - streak breaks
      break;
    } else {
      // No entry for this day - could be before habit started or a missed day
      // Check if there are any completions before this date
      const hasEarlierCompletions = Array.from(completionsByAppDay.keys()).some(day => day < dateString);
      if (hasEarlierCompletions) {
        // This is a missed day - streak breaks
        break;
      } else {
        // No earlier completions - habit probably didn't exist yet
        break;
      }
    }
  }
  
  return streak;
}

// Calculate completion rate for last 30 days
async function calculateCompletionRate(habitId: number): Promise<number> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0];
  const endDate = getCurrentDateString();
  
  const generator = habitDB.query`
    SELECT COUNT(*) as total, 
           SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_count
    FROM habit_completions 
    WHERE habit_id = ${habitId} 
    AND completion_date >= ${startDate} 
    AND completion_date <= ${endDate}
  `;
  
  const result = await collectResults(generator);
  const stats = result[0];
  
  if (stats.total === 0) return 0;
  return Math.round((stats.completed_count / stats.total) * 100);
}

// Check if habit was completed in current app day
async function isCompletedToday(habitId: number, userId: string = 'default_user'): Promise<boolean> {
  const endOfDayTime = await getEndOfDayTime(userId);
  const currentAppDay = getCurrentAppDay(endOfDayTime);
  
  const generator = habitDB.query`
    SELECT completed 
    FROM habit_completions 
    WHERE habit_id = ${habitId} AND completion_date = ${currentAppDay}
  `;
  
  const result = await collectResults(generator);
  return result.length > 0 && result[0].completed;
}

// Create a new habit
export const createHabit = api(
  { method: "POST", path: "/habits", expose: true },
  async (req: CreateHabitRequest): Promise<CreateHabitResponse> => {
    try {
      // Validate required fields
      if (!req.name || req.name.trim() === '') {
        throw new Error("Habit name is required");
      }

      // Sanitize inputs
      const name = sanitizeString(req.name, 255);
      const description = req.description ? sanitizeString(req.description, 1000) : null;
      const category = req.category || 'personal';
      const target_frequency = req.target_frequency || 1;
      
      // Validate category
      if (!isValidHabitCategory(category)) {
        throw new Error("Invalid category. Must be 'health', 'productivity', or 'personal'");
      }

      // Validate target frequency
      if (target_frequency < 1 || target_frequency > 10) {
        throw new Error("Target frequency must be between 1 and 10");      }

      // Insert habit into database using database timestamps
      const generator = habitDB.query`
        INSERT INTO habits (name, description, category, target_frequency, created_at, updated_at)
        VALUES (${name}, ${description}, ${category}, ${target_frequency}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        throw new Error("Failed to create habit");
      }

      const habitRow = result[0];
      const habit: Habit = {
        id: habitRow.id,
        name: habitRow.name,
        description: habitRow.description,
        category: habitRow.category,
        target_frequency: habitRow.target_frequency,
        active: habitRow.active,
        created_at: habitRow.created_at,
        updated_at: habitRow.updated_at,
        target_type: habitRow.target_type || 'daily',
        completion_type: habitRow.completion_type || 'boolean',
        target_value: (typeof habitRow.target_value === 'number') ? habitRow.target_value :
          (typeof habitRow.target_value === 'string') ? parseFloat(habitRow.target_value) :
          (habitRow.target_value && typeof habitRow.target_value.value === 'string') ? parseFloat(habitRow.target_value.value) :
          (habitRow.target_value && typeof habitRow.target_value.value === 'number') ? habitRow.target_value.value :
          1,
        unit: habitRow.unit,
        template_id: habitRow.template_id,
        reminder_enabled: habitRow.reminder_enabled || false,
        reminder_time: habitRow.reminder_time
      };

      return { habit };
    } catch (error) {
      throw new Error(`Failed to create habit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get all habits with completion data
export const getHabits = api(
  { method: "GET", path: "/habits", expose: true },
  async (req: GetHabitsRequest): Promise<GetHabitsResponse> => {
    try {
      // Get habits with filters
      const generator = habitDB.query`SELECT * FROM habits ORDER BY created_at DESC`;
      const allHabits = await collectResults(generator);
      
      // Apply in-memory filters
      let filteredHabits = allHabits;
      
      if (req.active !== undefined) {
        filteredHabits = filteredHabits.filter(habit => habit.active === req.active);
      }
      
      if (req.category && isValidHabitCategory(req.category)) {
        filteredHabits = filteredHabits.filter(habit => habit.category === req.category);
      }
      
      // Enrich with completion data
      const habits: HabitWithCompletion[] = await Promise.all(
        filteredHabits.map(async (habitRow: any) => {
          const todayCompleted = req.include_today ? await isCompletedToday(habitRow.id) : false;
          const currentStreak = await calculateStreak(habitRow.id);
          const completionRate = await calculateCompletionRate(habitRow.id);
          
          return {
            id: habitRow.id,
            name: habitRow.name,
            description: habitRow.description,
            category: habitRow.category,
            target_frequency: habitRow.target_frequency,
            active: habitRow.active,
            created_at: habitRow.created_at,
            updated_at: habitRow.updated_at,
            target_type: habitRow.target_type || 'daily',
            completion_type: habitRow.completion_type || 'boolean',
            target_value: (typeof habitRow.target_value === 'number') ? habitRow.target_value :
              (typeof habitRow.target_value === 'string') ? parseFloat(habitRow.target_value) :
              (habitRow.target_value && typeof habitRow.target_value.value === 'string') ? parseFloat(habitRow.target_value.value) :
              (habitRow.target_value && typeof habitRow.target_value.value === 'number') ? habitRow.target_value.value :
              1,
            unit: habitRow.unit,
            template_id: habitRow.template_id,
            reminder_enabled: habitRow.reminder_enabled || false,
            reminder_time: habitRow.reminder_time,
            today_completed: todayCompleted,
            current_streak: currentStreak,
            completion_rate: completionRate,
            longest_streak: currentStreak,
            consistency_score: Math.min(100, completionRate)
          };
        })
      );

      return { habits };
    } catch (error) {
      throw new Error(`Failed to get habits: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get a specific habit by ID
export const getHabit = api(
  { method: "GET", path: "/habits/:id", expose: true },
  async ({ id }: { id: number }): Promise<GetHabitResponse> => {
    try {
      const generator = habitDB.query`
        SELECT * FROM habits WHERE id = ${id}
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        throw new Error("Habit not found");
      }

      const habitRow = result[0];
      
      // Get completion data
      const todayCompleted = await isCompletedToday(id);
      const currentStreak = await calculateStreak(id);
      const completionRate = await calculateCompletionRate(id);

      const habit: HabitWithCompletion = {
        id: habitRow.id,
        name: habitRow.name,
        description: habitRow.description,
        category: habitRow.category,
        target_frequency: habitRow.target_frequency,
        active: habitRow.active,
        created_at: habitRow.created_at,
        updated_at: habitRow.updated_at,
        target_type: habitRow.target_type || 'daily',
        completion_type: habitRow.completion_type || 'boolean',
        target_value: (typeof habitRow.target_value === 'number') ? habitRow.target_value :
          (typeof habitRow.target_value === 'string') ? parseFloat(habitRow.target_value) :
          (habitRow.target_value && typeof habitRow.target_value.value === 'string') ? parseFloat(habitRow.target_value.value) :
          (habitRow.target_value && typeof habitRow.target_value.value === 'number') ? habitRow.target_value.value :
          1,
        unit: habitRow.unit,
        template_id: habitRow.template_id,
        reminder_enabled: habitRow.reminder_enabled || false,
        reminder_time: habitRow.reminder_time,
        today_completed: todayCompleted,
        current_streak: currentStreak,
        completion_rate: completionRate,
        longest_streak: currentStreak,
        consistency_score: Math.min(100, completionRate)
      };

      return { habit };
    } catch (error) {
      throw new Error(`Failed to get habit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Update a habit
export const updateHabit = api(
  { method: "PUT", path: "/habits/:id", expose: true },
  async (req: UpdateHabitRequest): Promise<UpdateHabitResponse> => {
    try {
      const { id, ...updates } = req;

      // Check if habit exists
      const existingGenerator = habitDB.query`
        SELECT * FROM habits WHERE id = ${id}
      `;

      const existingResult = await collectResults(existingGenerator);

      if (existingResult.length === 0) {
        throw new Error("Habit not found");
      }

      const existingHabit = existingResult[0];
      
      // Prepare update values
      const name = updates.name ? sanitizeString(updates.name, 255) : existingHabit.name;
      const description = updates.description !== undefined 
        ? (updates.description ? sanitizeString(updates.description, 1000) : null)
        : existingHabit.description;
      const category = updates.category || existingHabit.category;
      const target_frequency = updates.target_frequency !== undefined ? updates.target_frequency : existingHabit.target_frequency;
      const active = updates.active !== undefined ? updates.active : existingHabit.active;
      
      // Validate category
      if (!isValidHabitCategory(category)) {
        throw new Error("Invalid category. Must be 'health', 'productivity', or 'personal'");
      }

      // Validate target frequency
      if (target_frequency < 1 || target_frequency > 10) {
        throw new Error("Target frequency must be between 1 and 10");
      }      // Update habit in database using database timestamps
      const updateGenerator = habitDB.query`
        UPDATE habits 
        SET name = ${name}, 
            description = ${description}, 
            category = ${category},
            target_frequency = ${target_frequency},
            active = ${active},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      const result = await collectResults(updateGenerator);
      const habitRow = result[0];
      
      const habit: Habit = {
        id: habitRow.id,
        name: habitRow.name,
        description: habitRow.description,
        category: habitRow.category,
        target_frequency: habitRow.target_frequency,
        active: habitRow.active,
        created_at: habitRow.created_at,
        updated_at: habitRow.updated_at,
        target_type: habitRow.target_type || 'daily',
        completion_type: habitRow.completion_type || 'boolean',
        target_value: (typeof habitRow.target_value === 'number') ? habitRow.target_value :
          (typeof habitRow.target_value === 'string') ? parseFloat(habitRow.target_value) :
          (habitRow.target_value && typeof habitRow.target_value.value === 'string') ? parseFloat(habitRow.target_value.value) :
          (habitRow.target_value && typeof habitRow.target_value.value === 'number') ? habitRow.target_value.value :
          1,
        unit: habitRow.unit,
        template_id: habitRow.template_id,
        reminder_enabled: habitRow.reminder_enabled || false,
        reminder_time: habitRow.reminder_time
      };

      return { habit };
    } catch (error) {
      throw new Error(`Failed to update habit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Delete a habit
export const deleteHabit = api(
  { method: "DELETE", path: "/habits/:id", expose: true },
  async ({ id }: { id: number }): Promise<DeleteHabitResponse> => {
    try {
      const generator = habitDB.query`
        DELETE FROM habits WHERE id = ${id}
        RETURNING id
      `;

      const result = await collectResults(generator);

      if (result.length === 0) {
        throw new Error("Habit not found");
      }

      return {
        success: true,
        message: "Habit deleted successfully"
      };
    } catch (error) {
      throw new Error(`Failed to delete habit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Log habit completion
export const logHabitCompletion = api(
  { method: "POST", path: "/habits/:habit_id/completions", expose: true },
  async (req: LogHabitCompletionRequest): Promise<LogHabitCompletionResponse> => {
    try {
      const habit_id = req.habit_id;
      const completion_date = req.completion_date || getCurrentDateString();
      const completed = req.completed !== undefined ? req.completed : true;
      const notes = req.notes ? sanitizeString(req.notes, 500) : null;

      // Validate completion date
      if (!isValidDateString(completion_date)) {
        throw new Error("Invalid completion date format. Use YYYY-MM-DD");
      }

      // Check if habit exists
      const habitGenerator = habitDB.query`
        SELECT id FROM habits WHERE id = ${habit_id} AND active = true
      `;
      const habitResult = await collectResults(habitGenerator);
      
      if (habitResult.length === 0) {        throw new Error("Habit not found or inactive");
      }

      // Insert or update completion record using database timestamps
      const upsertGenerator = habitDB.query`
        INSERT INTO habit_completions (habit_id, completion_date, completed, notes, created_at)
        VALUES (${habit_id}, ${completion_date}, ${completed}, ${notes}, CURRENT_TIMESTAMP)
        ON CONFLICT (habit_id, completion_date) 
        DO UPDATE SET completed = ${completed}, notes = ${notes}
        RETURNING *
      `;

      const result = await collectResults(upsertGenerator);
      const completionRow = result[0];

      const completion: HabitCompletion = {
        id: completionRow.id,
        habit_id: completionRow.habit_id,
        completion_date: completionRow.completion_date,
        completed: completionRow.completed,
        notes: completionRow.notes,
        created_at: completionRow.created_at,
        completion_value: completionRow.completion_value || 1
      };

      // Calculate updated streak
      const updatedStreak = await calculateStreak(habit_id, completion_date);

      return { 
        completion,
        updated_streak: updatedStreak
      };
    } catch (error) {
      throw new Error(`Failed to log habit completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get habit completion history
export const getHabitHistory = api(
  { method: "GET", path: "/habits/:habit_id/history", expose: true },
  async (req: GetHabitHistoryRequest): Promise<GetHabitHistoryResponse> => {
    try {
      const { habit_id, start_date, end_date } = req;

      // Check if habit exists
      const habitGenerator = habitDB.query`
        SELECT id FROM habits WHERE id = ${habit_id}
      `;
      const habitResult = await collectResults(habitGenerator);
      
      if (habitResult.length === 0) {
        throw new Error("Habit not found");
      }

      // Build query for completions
      let completionsQuery = `
        SELECT * FROM habit_completions 
        WHERE habit_id = ${habit_id}
      `;

      if (start_date && isValidDateString(start_date)) {
        completionsQuery += ` AND completion_date >= '${start_date}'`;
      }

      if (end_date && isValidDateString(end_date)) {
        completionsQuery += ` AND completion_date <= '${end_date}'`;
      }

      completionsQuery += ` ORDER BY completion_date DESC`;

      const generator = habitDB.query`
        SELECT * FROM habit_completions 
        WHERE habit_id = ${habit_id}
        ORDER BY completion_date DESC
      `;

      const allCompletions = await collectResults(generator);

      // Apply date filters in memory for now
      let filteredCompletions = allCompletions;
      
      if (start_date && isValidDateString(start_date)) {
        filteredCompletions = filteredCompletions.filter(c => c.completion_date >= start_date);
      }
      
      if (end_date && isValidDateString(end_date)) {
        filteredCompletions = filteredCompletions.filter(c => c.completion_date <= end_date);
      }

      const completions: HabitCompletion[] = filteredCompletions.map((row: any) => ({
        id: row.id,
        habit_id: row.habit_id,
        completion_date: row.completion_date,
        completed: row.completed,
        notes: row.notes,
        created_at: row.created_at,
        completion_value: row.completion_value || 1
      }));

      // Calculate streak data
      const currentStreak = await calculateStreak(habit_id);
      const completionRate = await calculateCompletionRate(habit_id);
      
      // Calculate longest streak (simplified for now)
      let longestStreak = 0;
      let tempStreak = 0;
      
      for (const completion of allCompletions.reverse()) {
        if (completion.completed) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      return {
        completions,
        streak_data: {
          current_streak: currentStreak,
          longest_streak: longestStreak,
          completion_rate: completionRate,
          consistency_score: Math.min(100, completionRate)
        },
        streaks: []
      };
    } catch (error) {
      throw new Error(`Failed to get habit history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);
