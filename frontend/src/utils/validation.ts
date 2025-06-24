import { z } from 'zod';
import { Priority, DateString, TimestampString } from '../../../shared/types';

// Base validation schemas
export const prioritySchema = z.enum(['high', 'medium', 'low']);
export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');
export const timestampStringSchema = z.string().datetime('Invalid timestamp format');

// Task validation schemas
export const taskSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  priority: prioritySchema.default('medium'),
  due_date: dateStringSchema.optional(),
  completed: z.boolean().default(false),
  category_id: z.number().positive().optional(),
  notes: z.string().max(2000, 'Notes too long').optional(),
  estimated_minutes: z.number().positive().max(1440, 'Estimated time cannot exceed 24 hours').optional(),
  parent_task_id: z.number().positive().optional(),
  tag_ids: z.array(z.number().positive()).optional(),
});

export const createTaskSchema = taskSchema.omit({ id: true });
export const updateTaskSchema = taskSchema.partial().extend({
  id: z.number().positive(),
});

// Habit validation schemas
export const habitFrequencySchema = z.enum(['daily', 'weekly', 'monthly']);
export const habitCompletionTypeSchema = z.enum(['boolean', 'count', 'duration']);

export const habitSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Habit name is required').max(100, 'Habit name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  frequency_type: habitFrequencySchema.default('daily'),
  target_value: z.number().positive().max(1000, 'Target value too large').default(1),
  target_unit: z.string().max(20, 'Unit name too long').default('times'),
  completion_type: habitCompletionTypeSchema.default('boolean'),
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)').optional(),
  is_active: z.boolean().default(true),
});

export const createHabitSchema = habitSchema.omit({ id: true });
export const updateHabitSchema = habitSchema.partial().extend({
  id: z.number().positive(),
});

// Mood validation schemas
export const moodScoreSchema = z.number().min(1, 'Mood score must be at least 1').max(5, 'Mood score cannot exceed 5');
export const energyLevelSchema = z.number().min(1, 'Energy level must be at least 1').max(5, 'Energy level cannot exceed 5');
export const stressLevelSchema = z.number().min(1, 'Stress level must be at least 1').max(5, 'Stress level cannot exceed 5');

export const moodSchema = z.object({
  id: z.number().optional(),
  date: dateStringSchema,
  primary_mood: z.string().min(1, 'Primary mood is required').max(50, 'Primary mood too long'),
  secondary_mood: z.string().max(50, 'Secondary mood too long').optional(),
  mood_score: moodScoreSchema,
  energy_level: energyLevelSchema.optional(),
  stress_level: stressLevelSchema.optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  triggers: z.array(z.string().max(100)).optional(),
  location: z.string().max(100, 'Location too long').optional(),
  weather: z.string().max(50, 'Weather too long').optional(),
});

export const createMoodSchema = moodSchema.omit({ id: true });
export const updateMoodSchema = moodSchema.partial().extend({
  id: z.number().positive(),
});

// Calendar event validation schemas
export const calendarEventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Event title is required').max(200, 'Event title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  start_datetime: timestampStringSchema,
  end_datetime: timestampStringSchema.optional(),
  is_all_day: z.boolean().default(false),
  location: z.string().max(200, 'Location too long').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  recurrence_rule: z.string().max(500, 'Recurrence rule too long').optional(),
  task_id: z.number().positive().optional(),
}).refine(
  (data) => {
    if (data.end_datetime && !data.is_all_day) {
      return new Date(data.end_datetime) > new Date(data.start_datetime);
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['end_datetime'],
  }
);

export const createEventSchema = calendarEventSchema.omit({ id: true });
export const updateEventSchema = calendarEventSchema.partial().extend({
  id: z.number().positive(),
});

// Data export validation schemas
export const dataExportSchema = z.object({
  domains: z.array(z.enum(['tasks', 'habits', 'mood', 'calendar', 'preferences'])).min(1, 'At least one domain must be selected'),
  format: z.enum(['json', 'csv']),
  start_date: dateStringSchema.optional(),
  end_date: dateStringSchema.optional(),
  include_deleted: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.start_date && data.end_date) {
      return new Date(data.end_date) >= new Date(data.start_date);
    }
    return true;
  },
  {
    message: 'End date must be after or equal to start date',
    path: ['end_date'],
  }
);

// Theme validation schemas
export const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format (must be hex)');

export const customThemeSchema = z.object({
  id: z.string().min(1, 'Theme ID is required'),
  name: z.string().min(1, 'Theme name is required').max(50, 'Theme name too long'),
  colors: z.object({
    primary: colorSchema,
    secondary: colorSchema,
    accent: colorSchema,
    background: colorSchema,
    foreground: colorSchema,
    muted: colorSchema,
    border: colorSchema,
  }),
  font_size: z.enum(['small', 'medium', 'large', 'extra-large']),
  font_family: z.enum(['system', 'serif', 'monospace']),
  high_contrast: z.boolean(),
  reduce_motion: z.boolean(),
  created_at: timestampStringSchema,
  updated_at: timestampStringSchema,
});

// Utility functions for validation
export const validateFormData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

export const validatePartialFormData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: Partial<T> } | { success: false; errors: string[] } => {
  try {
    const partialSchema = schema.partial();
    const validatedData = partialSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
};

// Field-specific validators
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return { valid: errors.length === 0, errors };
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end >= start;
  } catch {
    return false;
  }
};

export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .substring(0, 1000); // Limit length
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace invalid characters with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
};

// Cross-domain validation
export const validateProductivityData = z.object({
  date: dateStringSchema,
  tasks: z.object({
    total: z.number().nonnegative(),
    completed: z.number().nonnegative(),
    overdue: z.number().nonnegative(),
  }),
  habits: z.object({
    total: z.number().nonnegative(),
    completed: z.number().nonnegative(),
    streak_count: z.number().nonnegative(),
  }),
  mood: z.object({
    score: z.number().min(1).max(5).optional(),
    energy_level: z.number().min(1).max(5).optional(),
    stress_level: z.number().min(1).max(5).optional(),
  }),
  events: z.object({
    total: z.number().nonnegative(),
    duration_minutes: z.number().nonnegative(),
  }),
  productivity_score: z.number().min(0).max(100),
});

// Error types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiValidationError {
  type: 'validation';
  errors: ValidationError[];
  message: string;
}

export const createValidationError = (field: string, message: string, code?: string): ValidationError => ({
  field,
  message,
  code,
});

export const createApiValidationError = (errors: ValidationError[]): ApiValidationError => ({
  type: 'validation',
  errors,
  message: `Validation failed for ${errors.length} field${errors.length > 1 ? 's' : ''}`,
});