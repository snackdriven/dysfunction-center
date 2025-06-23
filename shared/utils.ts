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
