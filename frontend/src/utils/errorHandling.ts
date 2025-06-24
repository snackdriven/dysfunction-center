import { AxiosError } from 'axios';
import { ApiValidationError, ValidationError } from './validation';

// Error types
export interface ApiError {
  type: 'api' | 'network' | 'validation' | 'unauthorized' | 'forbidden' | 'not_found' | 'server' | 'unknown';
  message: string;
  code?: string;
  details?: any;
  statusCode?: number;
}

export interface NetworkError extends ApiError {
  type: 'network';
  isOffline: boolean;
}

export interface UnauthorizedError extends ApiError {
  type: 'unauthorized';
  requiresLogin: boolean;
}

export interface ValidationErrorResponse extends ApiError {
  type: 'validation';
  validationErrors: ValidationError[];
}

// Error factory functions
export const createApiError = (
  type: ApiError['type'],
  message: string,
  code?: string,
  details?: any,
  statusCode?: number
): ApiError => ({
  type,
  message,
  code,
  details,
  statusCode,
});

export const createNetworkError = (message: string, isOffline: boolean = false): NetworkError => ({
  type: 'network',
  message,
  isOffline,
});

export const createUnauthorizedError = (message: string, requiresLogin: boolean = true): UnauthorizedError => ({
  type: 'unauthorized',
  message,
  requiresLogin,
});

export const createValidationError = (message: string, validationErrors: ValidationError[]): ValidationErrorResponse => ({
  type: 'validation',
  message,
  validationErrors,
});

// Error parsing from API responses
export const parseApiError = (error: any): ApiError => {
  // Handle Axios errors
  if (error.isAxiosError) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data as any;

    // Network error (no response)
    if (!axiosError.response) {
      return createNetworkError(
        'Network error: Unable to connect to server',
        !navigator.onLine
      );
    }

    // Handle specific status codes
    switch (status) {
      case 400:
        // Check if it's a validation error
        if (data?.errors && Array.isArray(data.errors)) {
          return createValidationError(
            data.message || 'Validation failed',
            data.errors
          );
        }
        return createApiError('api', data?.message || 'Bad request', 'BAD_REQUEST', data, status);

      case 401:
        return createUnauthorizedError(
          data?.message || 'Authentication required',
          true
        );

      case 403:
        return createApiError('forbidden', data?.message || 'Access forbidden', 'FORBIDDEN', data, status);

      case 404:
        return createApiError('not_found', data?.message || 'Resource not found', 'NOT_FOUND', data, status);

      case 422:
        return createValidationError(
          data?.message || 'Validation failed',
          data?.errors || []
        );

      case 429:
        return createApiError('api', data?.message || 'Too many requests', 'RATE_LIMITED', data, status);

      case 500:
      case 502:
      case 503:
      case 504:
        return createApiError('server', data?.message || 'Server error', 'SERVER_ERROR', data, status);

      default:
        return createApiError('api', data?.message || 'An error occurred', 'API_ERROR', data, status);
    }
  }

  // Handle generic JavaScript errors
  if (error instanceof Error) {
    return createApiError('unknown', error.message, 'JS_ERROR', error);
  }

  // Handle unknown error types
  return createApiError('unknown', 'An unknown error occurred', 'UNKNOWN', error);
};

// Error logging
export interface ErrorLogEntry {
  timestamp: string;
  error: ApiError;
  context?: {
    userId?: string;
    page?: string;
    action?: string;
    userAgent?: string;
    url?: string;
  };
  stackTrace?: string;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100;

  log(error: ApiError, context?: ErrorLogEntry['context']): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      error,
      context: {
        page: window.location.pathname,
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...context,
      },
      stackTrace: error.details?.stack,
    };

    this.logs.unshift(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.type.toUpperCase()} Error`);
      console.error('Message:', error.message);
      console.error('Code:', error.code);
      console.error('Details:', error.details);
      console.error('Context:', context);
      console.groupEnd();
    }

    // In production, you might want to send errors to a logging service
    if (process.env.NODE_ENV === 'production' && error.type !== 'validation') {
      this.sendToLoggingService(entry);
    }
  }

  private async sendToLoggingService(entry: ErrorLogEntry): Promise<void> {
    try {
      // Example: Send to your logging service
      // await fetch('/api/logs/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry),
      // });
    } catch (loggingError) {
      console.error('Failed to send error to logging service:', loggingError);
    }
  }

  getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getLogsByType(type: ApiError['type']): ErrorLogEntry[] {
    return this.logs.filter(log => log.error.type === type);
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const errorLogger = new ErrorLogger();

// Error recovery strategies
export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  exponentialBackoff: boolean;
  retryCondition?: (error: ApiError) => boolean;
}

export const defaultRetryOptions: RetryOptions = {
  maxAttempts: 3,
  delay: 1000,
  exponentialBackoff: true,
  retryCondition: (error) => {
    // Retry on network errors and server errors, but not on client errors
    return error.type === 'network' || error.type === 'server' || 
           (error.statusCode !== undefined && error.statusCode >= 500);
  },
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: ApiError;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = parseApiError(error);
      
      // Log the error
      errorLogger.log(lastError, { action: 'retry_attempt', page: `attempt_${attempt}` });

      // Check if we should retry
      if (attempt === opts.maxAttempts || !opts.retryCondition?.(lastError)) {
        throw lastError;
      }

      // Calculate delay
      const delay = opts.exponentialBackoff 
        ? opts.delay * Math.pow(2, attempt - 1)
        : opts.delay;

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Circuit breaker pattern for preventing cascading failures
export class CircuitBreaker {
  private failures = 0;
  private nextAttempt = Date.now();
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw createApiError(
          'api',
          'Circuit breaker is open - service temporarily unavailable',
          'CIRCUIT_BREAKER_OPEN'
        );
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.threshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  getState(): { state: string; failures: number; nextAttempt?: Date } {
    return {
      state: this.state,
      failures: this.failures,
      nextAttempt: this.state === 'open' ? new Date(this.nextAttempt) : undefined,
    };
  }

  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.nextAttempt = Date.now();
  }
}

// Error boundary helpers
export const handleAsyncError = (error: any, context?: string): void => {
  const apiError = parseApiError(error);
  errorLogger.log(apiError, { action: context || 'async_error' });
  
  // You can add additional handling here, such as:
  // - Showing user notifications
  // - Redirecting on auth errors
  // - Triggering error reporting
};

// User-friendly error messages
export const getUserFriendlyMessage = (error: ApiError): string => {
  switch (error.type) {
    case 'network':
      return navigator.onLine 
        ? 'Unable to connect to the server. Please check your internet connection and try again.'
        : 'You appear to be offline. Please check your internet connection.';
    
    case 'unauthorized':
      return 'Your session has expired. Please log in again.';
    
    case 'forbidden':
      return 'You don\'t have permission to perform this action.';
    
    case 'not_found':
      return 'The requested resource could not be found.';
    
    case 'validation':
      return error.message || 'Please check your input and try again.';
    
    case 'server':
      return 'The server is experiencing issues. Please try again later.';
    
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

// Hook for error boundary context
export const getErrorRecoveryActions = (error: ApiError): Array<{ label: string; action: () => void }> => {
  const actions: Array<{ label: string; action: () => void }> = [];

  // Always allow retry
  actions.push({
    label: 'Try Again',
    action: () => window.location.reload(),
  });

  // Specific recovery actions based on error type
  switch (error.type) {
    case 'unauthorized':
      actions.push({
        label: 'Log In',
        action: () => window.location.href = '/login',
      });
      break;
    
    case 'network':
      actions.push({
        label: 'Check Connection',
        action: () => {
          if ('onLine' in navigator) {
            alert(navigator.onLine ? 'Connection appears to be working' : 'You are offline');
          }
        },
      });
      break;
    
    case 'not_found':
      actions.push({
        label: 'Go Home',
        action: () => window.location.href = '/',
      });
      break;
  }

  return actions;
};