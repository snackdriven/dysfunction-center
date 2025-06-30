/**
 * Shared utilities for dashboard components
 * Eliminates code duplication and provides semantic naming
 */

// Semantic constants to replace magic numbers throughout the application
export const DASHBOARD_CONSTANTS = {
  WIDGET_ITEMS_LIMIT: 4,        // Replace .slice(0, 4) in widgets
  RECENT_ITEMS_DISPLAY: 5,      // Replace .slice(-5) for recent lists
  INSIGHTS_DISPLAY_LIMIT: 3,    // Replace .slice(0, 3) for insights
  MAX_DAILY_TABS: 10,           // Limit for tab overflow
  PRODUCTIVITY_SCORE_THRESHOLDS: {
    EXCELLENT: 80,
    GOOD: 60,
    FAIR: 40
  },
  MOOD_SCORE_THRESHOLDS: {
    GREAT: 4,
    GOOD: 3,
    OKAY: 2
  },
  HABIT_STREAK_MILESTONES: {
    MASTER: 30,
    CHAMPION: 14,
    BUILDING: 7,
    STARTING: 3
  }
} as const;

/**
 * Consistent date formatting across all widgets
 * Replaces 4+ different date formatting implementations
 */
export const formatRelativeDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Consistent time formatting for events and activities
 * Replaces multiple time formatting implementations in widgets
 */
export const formatDisplayTime = (dateTimeString: string | Date): string => {
  const date = typeof dateTimeString === 'string' ? new Date(dateTimeString) : dateTimeString;
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Standardized progress calculation
 * Replaces 3+ different progress calculation patterns across components
 */
export const calculateCompletionProgress = (completed: number, total: number) => ({
  completed,
  total,
  percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  isComplete: completed === total && total > 0,
  isEmpty: total === 0,
  remainingCount: Math.max(0, total - completed)
});

/**
 * Consistent habit streak calculation
 * Handles the inconsistent API naming (current_streak vs streak_count)
 * Replaces duplicate logic across multiple components
 */
export const calculateHabitStreak = (habit: { 
  current_streak?: number; 
  streak_count?: number;
  id: number;
  name: string;
}): number => {
  return habit.current_streak ?? habit.streak_count ?? 0;
};

/**
 * Safe text truncation with semantic ellipsis
 * Provides consistent text truncation across all widget displays
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Standardized date range calculations for widgets
 * Eliminates duplicate date range logic
 */
export const getDateRanges = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    today: today.toISOString().split('T')[0],
    tomorrow: tomorrow.toISOString().split('T')[0],
    yesterday: yesterday.toISOString().split('T')[0],
    startOfWeek: startOfWeek.toISOString().split('T')[0],
    endOfWeek: endOfWeek.toISOString().split('T')[0],
    startOfMonth: startOfMonth.toISOString().split('T')[0],
    endOfMonth: endOfMonth.toISOString().split('T')[0],
    // Date objects for comparison
    todayDate: today,
    tomorrowDate: tomorrow,
    yesterdayDate: yesterday
  };
};

/**
 * Format duration in a human-readable way
 * Used across multiple components for time tracking
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Determine if a date is today, yesterday, or tomorrow
 * Used for consistent date labeling across components
 */
export const getDateRelation = (date: string | Date): 'today' | 'yesterday' | 'tomorrow' | 'other' => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const { todayDate, tomorrowDate, yesterdayDate } = getDateRanges();
  
  if (targetDate.toDateString() === todayDate.toDateString()) return 'today';
  if (targetDate.toDateString() === tomorrowDate.toDateString()) return 'tomorrow';
  if (targetDate.toDateString() === yesterdayDate.toDateString()) return 'yesterday';
  return 'other';
};

/**
 * Sort items by priority for consistent ordering
 * Used across task and habit components
 */
export const sortByPriority = <T extends { priority?: string }>(items: T[]): T[] => {
  const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1, 'urgent': 4 };
  
  return [...items].sort((a, b) => {
    const aPriority = priorityOrder[a.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority?.toLowerCase() as keyof typeof priorityOrder] || 0;
    return bPriority - aPriority;
  });
};

/**
 * Generate consistent aria labels for interactive elements
 * Improves accessibility across components
 */
export const generateAriaLabel = {
  taskToggle: (taskTitle: string, isCompleted: boolean) => 
    `${isCompleted ? 'Mark' : 'Unmark'} "${taskTitle}" as ${isCompleted ? 'incomplete' : 'complete'}`,
  
  habitToggle: (habitName: string, isCompleted: boolean) =>
    `${isCompleted ? 'Unmark' : 'Mark'} "${habitName}" as completed for today`,
  
  progressBar: (label: string, value: number, max: number = 100) =>
    `${label} progress: ${value} of ${max}`,
  
  scoreDisplay: (score: number, maxScore: number, label: string) =>
    `${label}: ${score} out of ${maxScore}`
};

/**
 * Debounce function for search and filter operations
 * Prevents excessive API calls during user input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Safe number parsing with fallback
 * Used for user input validation across forms
 */
export const safeParseNumber = (value: string | number, fallback: number = 0): number => {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Check if an object is empty (no own properties)
 * Used for conditional rendering in components
 */
export const isEmpty = (obj: any): boolean => {
  if (!obj) return true;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};