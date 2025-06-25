// Shared utility functions

/**
 * Validates if a date string is in YYYY-MM-DD format and is a valid date
 */
export function isValidDateString(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime()) && 
         date.toISOString().split('T')[0] === dateString;
}

/**
 * Gets the current date in YYYY-MM-DD format
 */
export function getCurrentDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validates if a priority is valid
 */
export function isValidPriority(priority: string): priority is 'high' | 'medium' | 'low' {
  return ['high', 'medium', 'low'].includes(priority);
}

/**
 * Validates if a habit category is valid
 */
export function isValidHabitCategory(category: string): category is 'health' | 'productivity' | 'personal' {
  return ['health', 'productivity', 'personal'].includes(category);
}

/**
 * Validates if a mood score is valid (1-5)
 */
export function isValidMoodScore(score: number): boolean {
  return Number.isInteger(score) && score >= 1 && score <= 5;
}

/**
 * Sanitizes string input by trimming and limiting length
 */
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input.trim().substring(0, maxLength);
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(error: string, details?: string, code?: string) {
  return {
    error,
    details,
    code
  };
}

/**
 * Gets the current "app day" based on End of Day time setting
 * If current time is before end of day, returns today's date
 * If current time is after end of day, returns tomorrow's date
 */
export function getCurrentAppDay(endOfDayTime: string = '23:59'): string {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // If current time is after end of day, the app day is tomorrow
  if (currentTime > endOfDayTime) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  return now.toISOString().split('T')[0];
}

/**
 * Gets the app day for a given timestamp considering End of Day time
 */
export function getAppDayForTimestamp(timestamp: string, endOfDayTime: string = '23:59'): string {
  const date = new Date(timestamp);
  const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  
  // If time is after end of day, the app day is tomorrow
  if (timeString > endOfDayTime) {
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  }
  
  return date.toISOString().split('T')[0];
}

/**
 * Checks if a given date/time falls within the current app day
 */
export function isWithinCurrentAppDay(timestamp: string, endOfDayTime: string = '23:59'): boolean {
  const appDay = getAppDayForTimestamp(timestamp, endOfDayTime);
  const currentAppDay = getCurrentAppDay(endOfDayTime);
  return appDay === currentAppDay;
}

/**
 * Gets the start and end timestamps for a given app day
 */
export function getAppDayBounds(appDay: string, endOfDayTime: string = '23:59'): { start: string; end: string } {
  const [hours, minutes] = endOfDayTime.split(':').map(Number);
  
  // App day starts at (end of day + 1 minute) of previous calendar day
  const startDate = new Date(appDay);
  startDate.setDate(startDate.getDate() - 1);
  startDate.setHours(hours, minutes + 1, 0, 0);
  
  // App day ends at end of day time of the current calendar day
  const endDate = new Date(appDay);
  endDate.setHours(hours, minutes, 59, 999);
  
  return {
    start: startDate.toISOString(),
    end: endDate.toISOString()
  };
}
