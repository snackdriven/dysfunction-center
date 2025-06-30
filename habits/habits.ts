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
  GetHabitHistoryResponse,
  GetDailyCompletionsRequest,
  GetDailyCompletionsResponse,
  LogMultipleCompletionsRequest,
  LogMultipleCompletionsResponse,
  GetTodayCompletionsAllResponse
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
  // Try to call the preferences service if available
  try {
    // Note: This import might not be available in all environments
    // Skip preferences service for now
    throw new Error("Preferences service not available");
  } catch (serviceError) {
    // If preferences service is not available, try to get from shared database
    try {
      const generator = habitDB.query`
        SELECT preference_value 
        FROM user_preferences 
        WHERE user_id = ${userId} AND preference_key = 'end_of_day_time'
      `;
      const result = await collectResults(generator);
      
      if (result.length > 0) {
        return result[0].preference_value;
      }
    } catch (dbError) {
      // Database table might not exist yet, that's okay
    }
    
    // Fall back to default - this is expected during initial setup
    return '23:59'; // Default End of Day time
  }
}

// Calculate streak for a habit using End of Day time logic and target completion
async function calculateStreak(habitId: number, userId: string = 'default_user', asOfDate?: string): Promise<number> {
  const endOfDayTime = await getEndOfDayTime(userId);
  const currentAppDay = asOfDate || getCurrentAppDay(endOfDayTime);
  
  // Get habit details to check target value and type
  const habitGenerator = habitDB.query`
    SELECT target_value, target_type, completion_type
    FROM habits 
    WHERE id = ${habitId}
  `;
  const habitResult = await collectResults(habitGenerator);
  
  if (habitResult.length === 0) return 0;
  
  const habit = habitResult[0];
  const targetValue = habit.target_value || 1;
  
  // Get all completions for this habit
  const generator = habitDB.query`
    SELECT completion_date, completed, completion_value, completion_timestamp
    FROM habit_completions 
    WHERE habit_id = ${habitId} AND completion_date <= ${currentAppDay}
    ORDER BY completion_date DESC, completion_timestamp DESC
  `;
  
  const completions = await collectResults(generator);
  
  let streak = 0;
  let checkDate = currentAppDay;
  
  // Track daily completion status considering multiple completions and target values
  const dailyCompletionStatus = new Map<string, { completed: boolean; totalValue: number }>();
  
  // Process completions and aggregate by day
  for (const completion of completions) {
    const appDay = getAppDayForTimestamp(completion.completion_timestamp || completion.created_at, endOfDayTime);
    
    if (!dailyCompletionStatus.has(appDay)) {
      dailyCompletionStatus.set(appDay, { completed: false, totalValue: 0 });
    }
    
    const dayData = dailyCompletionStatus.get(appDay)!;
    
    if (completion.completed) {
      dayData.totalValue += completion.completion_value || 1;
      // Check if target is met for this day
      dayData.completed = dayData.totalValue >= targetValue;
    }
  }
  
  // Calculate streak by checking consecutive days backward from current day
  let currentDate = new Date(checkDate);
  
  while (true) {
    const dateString = currentDate.toISOString().split('T')[0];
    const dayData = dailyCompletionStatus.get(dateString);
    
    if (dayData?.completed === true) {
      streak++;
      // Go to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (dayData !== undefined) {
      // Day has completions but target not met - streak breaks
      break;
    } else {
      // No completions for this day - check if habit existed
      const hasEarlierCompletions = Array.from(dailyCompletionStatus.keys()).some(day => day < dateString);
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

// Check if habit target was met in current app day (considering multiple completions)
async function isCompletedToday(habitId: number, userId: string = 'default_user'): Promise<boolean> {
  const endOfDayTime = await getEndOfDayTime(userId);
  const currentAppDay = getCurrentAppDay(endOfDayTime);
  
  // Get habit target value
  const habitGenerator = habitDB.query`
    SELECT target_value
    FROM habits 
    WHERE id = ${habitId}
  `;
  const habitResult = await collectResults(habitGenerator);
  
  if (habitResult.length === 0) return false;
  
  const targetValue = habitResult[0].target_value || 1;
  
  // Get all completions for today
  const generator = habitDB.query`
    SELECT completed, completion_value
    FROM habit_completions 
    WHERE habit_id = ${habitId} AND completion_date = ${currentAppDay}
  `;
  
  const completions = await collectResults(generator);
  
  if (completions.length === 0) return false;
  
  // Calculate total completion value for today
  let totalValue = 0;
  for (const completion of completions) {
    if (completion.completed) {
      totalValue += completion.completion_value || 1;
    }
  }
  
  return totalValue >= targetValue;
}

// Get today's completions for a habit
async function getTodayCompletions(habitId: number, userId: string = 'default_user'): Promise<HabitCompletion[]> {
  const endOfDayTime = await getEndOfDayTime(userId);
  const currentAppDay = getCurrentAppDay(endOfDayTime);
  
  const generator = habitDB.query`
    SELECT *
    FROM habit_completions 
    WHERE habit_id = ${habitId} AND completion_date = ${currentAppDay}
    ORDER BY completion_timestamp DESC
  `;
  
  const result = await collectResults(generator);
  
  return result.map((row: any) => ({
    id: row.id,
    habit_id: row.habit_id,
    completion_date: row.completion_date,
    completed: row.completed,
    notes: row.notes,
    created_at: row.created_at,
    completion_value: row.completion_value || 1,
    completion_timestamp: row.completion_timestamp || row.created_at
  }));
}

// Calculate today's total completion value
async function getTodayTotalValue(habitId: number, userId: string = 'default_user'): Promise<number> {
  const completions = await getTodayCompletions(habitId, userId);
  
  return completions.reduce((total, completion) => {
    return total + (completion.completed ? completion.completion_value : 0);
  }, 0);
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
          
          // Get today's completions and total value for multi-completion support
          const todayCompletions = req.include_today ? await getTodayCompletions(habitRow.id) : [];
          const todayTotalValue = req.include_today ? await getTodayTotalValue(habitRow.id) : 0;
          
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
            consistency_score: Math.min(100, completionRate),
            // Multi-completion support
            today_completions: req.include_today ? todayCompletions : undefined,
            today_total_value: req.include_today ? todayTotalValue : undefined
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

// Log habit completion (supports multiple completions per day)
export const logHabitCompletion = api(
  { method: "POST", path: "/habits/:habit_id/completions", expose: true },
  async (req: LogHabitCompletionRequest): Promise<LogHabitCompletionResponse> => {
    try {
      const habit_id = req.habit_id;
      const completion_date = req.completion_date || getCurrentDateString();
      const completed = req.completed !== undefined ? req.completed : true;
      const notes = req.notes ? sanitizeString(req.notes, 500) : null;
      const completion_value = req.completion_value || 1;
      const completion_timestamp = req.completion_timestamp || new Date().toISOString();

      // Validate completion date
      if (!isValidDateString(completion_date)) {
        throw new Error("Invalid completion date format. Use YYYY-MM-DD");
      }

      // Check if habit exists and get target value
      const habitGenerator = habitDB.query`
        SELECT id, target_value FROM habits WHERE id = ${habit_id} AND active = true
      `;
      const habitResult = await collectResults(habitGenerator);
      
      if (habitResult.length === 0) {
        throw new Error("Habit not found or inactive");
      }

      const habit = habitResult[0];
      const targetValue = habit.target_value || 1;

      // Insert new completion record (no conflict handling - allow multiple per day)
      const insertGenerator = habitDB.query`
        INSERT INTO habit_completions (
          habit_id, 
          completion_date, 
          completed, 
          notes, 
          completion_value,
          completion_timestamp,
          created_at
        )
        VALUES (
          ${habit_id}, 
          ${completion_date}, 
          ${completed}, 
          ${notes}, 
          ${completion_value},
          ${completion_timestamp},
          CURRENT_TIMESTAMP
        )
        RETURNING *
      `;

      const result = await collectResults(insertGenerator);
      const completionRow = result[0];

      const completion: HabitCompletion = {
        id: completionRow.id,
        habit_id: completionRow.habit_id,
        completion_date: completionRow.completion_date,
        completed: completionRow.completed,
        notes: completionRow.notes,
        created_at: completionRow.created_at,
        completion_value: completionRow.completion_value || 1,
        completion_timestamp: completionRow.completion_timestamp
      };

      // Calculate daily total and progress
      const dailyTotalValue = await getTodayTotalValue(habit_id);
      const targetProgress = Math.round((dailyTotalValue / targetValue) * 100);

      // Calculate updated streak
      const updatedStreak = await calculateStreak(habit_id, 'default_user', completion_date);

      return { 
        completion,
        updated_streak: updatedStreak,
        daily_total_value: dailyTotalValue,
        target_progress: targetProgress
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
        completion_value: row.completion_value || 1,
        completion_timestamp: row.completion_timestamp || row.created_at
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

// Get today's completions across all habits
export const getTodayCompletionsAll = api(
  { method: "GET", path: "/habits/completions/today", expose: true },
  async (req: { date?: string }): Promise<GetTodayCompletionsAllResponse> => {
    try {
      const targetDate = req.date || getCurrentDateString();

      // Validate date
      if (!isValidDateString(targetDate)) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }

      // Get all completions for the specified date across all habits
      const generator = habitDB.query`
        SELECT *
        FROM habit_completions 
        WHERE completion_date = ${targetDate}
        ORDER BY completion_timestamp DESC
      `;

      const result = await collectResults(generator);
      
      const completions: HabitCompletion[] = result.map((row: any) => ({
        id: row.id,
        habit_id: row.habit_id,
        completion_date: row.completion_date,
        completed: row.completed,
        notes: row.notes,
        created_at: row.created_at,
        completion_value: row.completion_value || 1,
        completion_timestamp: row.completion_timestamp || row.created_at
      }));

      return { completions };
    } catch (error) {
      throw new Error(`Failed to get today's completions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Get daily completions for a habit
export const getDailyCompletions = api(
  { method: "GET", path: "/habits/:habit_id/daily-completions", expose: true },
  async (req: GetDailyCompletionsRequest): Promise<GetDailyCompletionsResponse> => {
    try {
      const { habit_id, date } = req;
      const targetDate = date || getCurrentDateString();

      // Validate date
      if (!isValidDateString(targetDate)) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }

      // Check if habit exists and get target value
      const habitGenerator = habitDB.query`
        SELECT id, target_value FROM habits WHERE id = ${habit_id}
      `;
      const habitResult = await collectResults(habitGenerator);
      
      if (habitResult.length === 0) {
        throw new Error("Habit not found");
      }

      const habit = habitResult[0];
      const targetValue = habit.target_value || 1;

      // Get all completions for the specified date
      const generator = habitDB.query`
        SELECT *
        FROM habit_completions 
        WHERE habit_id = ${habit_id} AND completion_date = ${targetDate}
        ORDER BY completion_timestamp DESC
      `;

      const result = await collectResults(generator);
      
      const completions: HabitCompletion[] = result.map((row: any) => ({
        id: row.id,
        habit_id: row.habit_id,
        completion_date: row.completion_date,
        completed: row.completed,
        notes: row.notes,
        created_at: row.created_at,
        completion_value: row.completion_value || 1,
        completion_timestamp: row.completion_timestamp || row.created_at
      }));

      // Calculate total value
      const totalValue = completions.reduce((total, completion) => {
        return total + (completion.completed ? completion.completion_value : 0);
      }, 0);

      const progressPercentage = Math.round((totalValue / targetValue) * 100);
      const isTargetMet = totalValue >= targetValue;

      return {
        completions,
        total_value: totalValue,
        target_value: targetValue,
        progress_percentage: progressPercentage,
        is_target_met: isTargetMet
      };
    } catch (error) {
      throw new Error(`Failed to get daily completions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Log multiple completions at once (for bulk operations)
export const logMultipleCompletions = api(
  { method: "POST", path: "/habits/:habit_id/multiple-completions", expose: true },
  async (req: LogMultipleCompletionsRequest): Promise<LogMultipleCompletionsResponse> => {
    try {
      const { habit_id, completions: completionRequests, completion_date } = req;
      const targetDate = completion_date || getCurrentDateString();

      // Validate date
      if (!isValidDateString(targetDate)) {
        throw new Error("Invalid date format. Use YYYY-MM-DD");
      }

      // Check if habit exists and get target value
      const habitGenerator = habitDB.query`
        SELECT id, target_value FROM habits WHERE id = ${habit_id} AND active = true
      `;
      const habitResult = await collectResults(habitGenerator);
      
      if (habitResult.length === 0) {
        throw new Error("Habit not found or inactive");
      }

      const habit = habitResult[0];
      const targetValue = habit.target_value || 1;

      const insertedCompletions: HabitCompletion[] = [];

      // Insert each completion
      for (const completionReq of completionRequests) {
        const completion_value = completionReq.completion_value || 1;
        const notes = completionReq.notes ? sanitizeString(completionReq.notes, 500) : null;
        const completion_timestamp = completionReq.completion_timestamp || new Date().toISOString();

        const insertGenerator = habitDB.query`
          INSERT INTO habit_completions (
            habit_id, 
            completion_date, 
            completed, 
            notes, 
            completion_value,
            completion_timestamp,
            created_at
          )
          VALUES (
            ${habit_id}, 
            ${targetDate}, 
            ${true}, 
            ${notes}, 
            ${completion_value},
            ${completion_timestamp},
            CURRENT_TIMESTAMP
          )
          RETURNING *
        `;

        const result = await collectResults(insertGenerator);
        const completionRow = result[0];

        insertedCompletions.push({
          id: completionRow.id,
          habit_id: completionRow.habit_id,
          completion_date: completionRow.completion_date,
          completed: completionRow.completed,
          notes: completionRow.notes,
          created_at: completionRow.created_at,
          completion_value: completionRow.completion_value || 1,
          completion_timestamp: completionRow.completion_timestamp
        });
      }

      // Calculate daily total and progress
      const dailyTotalValue = await getTodayTotalValue(habit_id);
      const targetProgress = Math.round((dailyTotalValue / targetValue) * 100);

      // Calculate updated streak
      const updatedStreak = await calculateStreak(habit_id, 'default_user', targetDate);

      return {
        completions: insertedCompletions,
        daily_total_value: dailyTotalValue,
        updated_streak: updatedStreak,
        target_progress: targetProgress
      };
    } catch (error) {
      throw new Error(`Failed to log multiple completions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Delete individual completion
export const deleteCompletion = api(
  { method: "DELETE", path: "/habits/completions/:completion_id", expose: true },
  async (req: { completion_id: number }): Promise<{ success: boolean; message: string }> => {
    try {
      const { completion_id } = req;

      // Check if completion exists
      const checkGenerator = habitDB.query`
        SELECT id, habit_id FROM habit_completions WHERE id = ${completion_id}
      `;
      const checkResult = await collectResults(checkGenerator);
      
      if (checkResult.length === 0) {
        throw new Error("Completion not found");
      }

      // Delete the completion
      const deleteGenerator = habitDB.query`
        DELETE FROM habit_completions WHERE id = ${completion_id}
      `;
      await collectResults(deleteGenerator);

      return {
        success: true,
        message: "Completion deleted successfully"
      };
    } catch (error) {
      throw new Error(`Failed to delete completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);

// Update individual completion
export const updateCompletion = api(
  { method: "PUT", path: "/habits/completions/:completion_id", expose: true },
  async (req: { 
    completion_id: number; 
    completion_value?: number; 
    notes?: string; 
    completion_timestamp?: string 
  }): Promise<{ completion: HabitCompletion }> => {
    try {
      const { completion_id, completion_value, notes, completion_timestamp } = req;

      // Check if completion exists
      const checkGenerator = habitDB.query`
        SELECT * FROM habit_completions WHERE id = ${completion_id}
      `;
      const checkResult = await collectResults(checkGenerator);
      
      if (checkResult.length === 0) {
        throw new Error("Completion not found");
      }

      const existing = checkResult[0];

      // Prepare update values
      const updatedValue = completion_value !== undefined ? completion_value : existing.completion_value;
      const updatedNotes = notes !== undefined ? sanitizeString(notes, 500) : existing.notes;
      const updatedTimestamp = completion_timestamp !== undefined ? completion_timestamp : existing.completion_timestamp;

      // Update the completion
      const updateGenerator = habitDB.query`
        UPDATE habit_completions 
        SET 
          completion_value = ${updatedValue},
          notes = ${updatedNotes},
          completion_timestamp = ${updatedTimestamp},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${completion_id}
        RETURNING *
      `;
      const updateResult = await collectResults(updateGenerator);
      const updatedRow = updateResult[0];

      const completion: HabitCompletion = {
        id: updatedRow.id,
        habit_id: updatedRow.habit_id,
        completion_date: updatedRow.completion_date,
        completed: updatedRow.completed,
        notes: updatedRow.notes,
        created_at: updatedRow.created_at,
        completion_value: updatedRow.completion_value || 1,
        completion_timestamp: updatedRow.completion_timestamp
      };

      return { completion };
    } catch (error) {
      throw new Error(`Failed to update completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
);
