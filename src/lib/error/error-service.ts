import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

// Forward reference for ErrorFallback - will be imported from error-boundary.tsx
let ErrorFallback: React.ComponentType<any>;

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  userId?: string;
  requestId?: string;
}

export interface ErrorContext {
  userId?: string;
  teamId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export class ErrorService {
  private static supabase = createClientComponentClient();

  // Error types
  static readonly ERROR_TYPES = {
    AUTHENTICATION: 'AUTH_ERROR',
    AUTHORIZATION: 'AUTHZ_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    NETWORK: 'NETWORK_ERROR',
    DATABASE: 'DATABASE_ERROR',
    BUSINESS_LOGIC: 'BUSINESS_ERROR',
    SYSTEM: 'SYSTEM_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR',
  } as const;

  // Create structured error
  static createError(
    type: string,
    message: string,
    details?: Record<string, any>,
    context?: ErrorContext
  ): AppError {
    return {
      code: type,
      message,
      details: {
        ...details,
        context,
      },
      timestamp: new Date().toISOString(),
      userId: context?.userId,
      requestId: this.generateRequestId(),
    };
  }

  // Log error to various services
  static async logError(error: AppError | Error, context?: ErrorContext): Promise<void> {
    try {
      const structuredError = error instanceof Error 
        ? this.createError(this.ERROR_TYPES.UNKNOWN, error.message, { stack: error.stack }, context)
        : error;

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', structuredError);
      }

      // Log to database
      await this.logToDatabase(structuredError);

      // Log to external monitoring (Sentry, etc.) in production
      if (process.env.NODE_ENV === 'production') {
        await this.logToMonitoring(structuredError);
      }

      // Send critical alerts if needed
      if (this.isCriticalError(structuredError)) {
        await this.sendCriticalAlert(structuredError);
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  // Handle specific error types
  static handleAuthenticationError(error: any, context?: ErrorContext): AppError {
    const appError = this.createError(
      this.ERROR_TYPES.AUTHENTICATION,
      this.getAuthErrorMessage(error),
      { originalError: error.message },
      context
    );

    this.logError(appError, context);
    return appError;
  }

  static handleAuthorizationError(action: string, context?: ErrorContext): AppError {
    const appError = this.createError(
      this.ERROR_TYPES.AUTHORIZATION,
      `You don't have permission to ${action}`,
      { action },
      context
    );

    this.logError(appError, context);
    return appError;
  }

  static handleValidationError(errors: Record<string, string[]>, context?: ErrorContext): AppError {
    const appError = this.createError(
      this.ERROR_TYPES.VALIDATION,
      'Please correct the following errors',
      { validationErrors: errors },
      context
    );

    this.logError(appError, context);
    return appError;
  }

  static handleNetworkError(error: any, context?: ErrorContext): AppError {
    const appError = this.createError(
      this.ERROR_TYPES.NETWORK,
      'Network error occurred. Please check your connection.',
      { originalError: error.message },
      context
    );

    this.logError(appError, context);
    return appError;
  }

  static handleDatabaseError(error: any, context?: ErrorContext): AppError {
    const appError = this.createError(
      this.ERROR_TYPES.DATABASE,
      'A database error occurred. Please try again.',
      { originalError: error.message, hint: error.hint },
      context
    );

    this.logError(appError, context);
    return appError;
  }

  // Recovery strategies
  static async attemptRecovery(error: AppError, maxRetries: number = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        
        // Implement recovery strategy based on error type
        switch (error.code) {
          case this.ERROR_TYPES.NETWORK:
            // Retry network operation
            return await this.retryNetworkOperation(error);
          case this.ERROR_TYPES.DATABASE:
            // Retry database operation
            return await this.retryDatabaseOperation(error);
          default:
            return false;
        }
      } catch (retryError) {
        console.warn(`Recovery attempt ${attempt} failed:`, retryError);
        
        if (attempt === maxRetries) {
          await this.logError(
            this.createError(
              this.ERROR_TYPES.SYSTEM,
              'All recovery attempts failed',
              { originalError: error, attempts: maxRetries }
            )
          );
        }
      }
    }
    
    return false;
  }

  // Utility methods
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static async logToDatabase(error: AppError): Promise<void> {
    try {
      // Note: You might want to create an error_logs table for this
      await this.supabase
        .from('audit_logs')
        .insert({
          user_id: error.userId,
          action: 'error',
          resource_type: 'system',
          resource_id: error.requestId,
          metadata: {
            error_code: error.code,
            error_message: error.message,
            error_details: error.details,
            timestamp: error.timestamp,
          },
        });
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }
  }

  private static async logToMonitoring(error: AppError): Promise<void> {
    try {
      // Integration point for external monitoring services
      // Example: Sentry, DataDog, New Relic, etc.
      
      if (typeof window !== 'undefined' && (window as any).__SENTRY__) {
        // Sentry integration example
        // Sentry.captureException(new Error(error.message), {
        //   tags: { errorCode: error.code },
        //   extra: error.details,
        //   user: { id: error.userId },
        // });
      }
      
      // Could also send to custom monitoring endpoint
      await fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      }).catch(() => {}); // Fail silently
    } catch (monitoringError) {
      console.error('Failed to log to monitoring service:', monitoringError);
    }
  }

  private static isCriticalError(error: AppError): boolean {
    const criticalCodes = [
      this.ERROR_TYPES.SYSTEM,
      this.ERROR_TYPES.DATABASE,
    ];
    
    return criticalCodes.includes(error.code as any) || 
           error.message.toLowerCase().includes('critical');
  }

  private static async sendCriticalAlert(error: AppError): Promise<void> {
    try {
      // Send alert to admin notification system
      await fetch('/api/alerts/critical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error,
          alert_level: 'critical',
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {}); // Fail silently
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
  }

  private static getAuthErrorMessage(error: any): string {
    switch (error?.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password';
      case 'Email not confirmed':
        return 'Please check your email and click the confirmation link';
      case 'Too many requests':
        return 'Too many login attempts. Please try again later';
      default:
        return 'Authentication failed. Please try again';
    }
  }

  private static async retryNetworkOperation(error: AppError): Promise<boolean> {
    // Implement network retry logic based on error context
    return false; // Placeholder
  }

  private static async retryDatabaseOperation(error: AppError): Promise<boolean> {
    // Implement database retry logic based on error context
    return false; // Placeholder
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Simple error boundary wrapper - use ErrorBoundary component from error-boundary.tsx instead
export function logComponentError(error: Error, componentName: string, errorInfo?: any): void {
  ErrorService.logError(error, {
    component: componentName,
    metadata: errorInfo,
  });
}

// Hook for handling async errors in components
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: ErrorContext) => {
    ErrorService.logError(error, context);
  }, []);

  const handleAsyncError = React.useCallback(async (
    asyncFn: () => Promise<any>,
    context?: ErrorContext
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      throw error; // Re-throw to allow component to handle
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
}