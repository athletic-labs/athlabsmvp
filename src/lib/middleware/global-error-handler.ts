import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { createErrorResponse, generateRequestId } from '@/lib/validation/api-middleware';

// Global error types
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends Error {
  constructor(
    message: string, 
    public service: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context for logging and monitoring
export interface ErrorContext {
  requestId: string;
  userId?: string;
  teamId?: string;
  endpoint: string;
  method: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  severity: ErrorSeverity;
  tags?: string[];
}

// Error logging service (would integrate with monitoring system)
export class ErrorLogger {
  static async logError(
    error: Error,
    context: ErrorContext,
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    const errorData = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
      additionalData,
    };

    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 API Error:', errorData);
    } else {
      // In production, this would send to monitoring service (Sentry, DataDog, etc.)
      console.error(`[${context.severity.toUpperCase()}] ${context.requestId}:`, {
        error: error.message,
        endpoint: context.endpoint,
        userId: context.userId,
        timestamp: context.timestamp,
      });
    }

    // TODO: Integrate with monitoring service
    // Examples:
    // - Sentry.captureException(error, { contexts: { errorContext: context } });
    // - DataDog.increment('api.errors', 1, [`severity:${context.severity}`, `endpoint:${context.endpoint}`]);
    // - Custom analytics service
  }

  static async logWarning(
    message: string,
    context: Partial<ErrorContext>,
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    const warningData = {
      level: 'warning',
      message,
      context,
      additionalData,
    };

    console.warn('⚠️ API Warning:', warningData);
  }
}

// Determine error severity based on error type and context
export function determineErrorSeverity(
  error: Error,
  endpoint: string
): ErrorSeverity {
  // Critical endpoints that require high priority
  const criticalEndpoints = ['/api/v1/orders', '/api/health'];
  
  if (criticalEndpoints.some(ep => endpoint.includes(ep))) {
    if (error instanceof DatabaseError) {
      return ErrorSeverity.CRITICAL;
    }
    if (error instanceof ExternalServiceError) {
      return ErrorSeverity.HIGH;
    }
  }

  // Error type based severity
  if (error instanceof ZodError) {
    return ErrorSeverity.LOW; // Client validation errors
  }

  if (error instanceof DatabaseError) {
    return ErrorSeverity.HIGH;
  }

  if (error instanceof ExternalServiceError) {
    return ErrorSeverity.MEDIUM;
  }

  if (error instanceof BusinessLogicError) {
    return ErrorSeverity.MEDIUM;
  }

  // Rate limiting and authentication errors
  if (error.name === 'RateLimitError') {
    return ErrorSeverity.LOW;
  }

  if (error.name === 'AuthenticationError') {
    return ErrorSeverity.LOW;
  }

  if (error.name === 'AuthorizationError') {
    return ErrorSeverity.LOW;
  }

  // Default to medium severity for unknown errors
  return ErrorSeverity.MEDIUM;
}

// Extract error context from request
export function extractErrorContext(
  request: NextRequest,
  error: Error,
  additionalTags?: string[]
): ErrorContext {
  const url = new URL(request.url);
  
  return {
    requestId: generateRequestId(),
    userId: request.headers.get('x-user-id') || undefined,
    teamId: request.headers.get('x-team-id') || undefined,
    endpoint: url.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent') || undefined,
    ip: getClientIP(request),
    timestamp: new Date().toISOString(),
    severity: determineErrorSeverity(error, url.pathname),
    tags: additionalTags,
  };
}

// Get client IP address
function getClientIP(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const clientIp = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  return realIp || clientIp || request.ip || undefined;
}

// Global error handler middleware
export function withGlobalErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options?: {
    tags?: string[];
    customSeverity?: ErrorSeverity;
  }
): T {
  return (async (...args: any[]) => {
    const request = args[0] as NextRequest;
    
    try {
      return await handler(...args);
    } catch (error) {
      const errorInstance = error instanceof Error ? error : new Error(String(error));
      const context = extractErrorContext(request, errorInstance, options?.tags);
      
      // Override severity if specified
      if (options?.customSeverity) {
        context.severity = options.customSeverity;
      }

      // Log the error
      await ErrorLogger.logError(errorInstance, context);

      // Map error to appropriate HTTP response
      if (errorInstance instanceof ZodError) {
        return createErrorResponse(
          'Validation failed',
          'VALIDATION_ERROR',
          400,
          {
            issues: errorInstance.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
              code: issue.code,
            })),
          }
        );
      }

      if (errorInstance instanceof DatabaseError) {
        return createErrorResponse(
          'Database operation failed',
          'DATABASE_ERROR',
          500,
          process.env.NODE_ENV === 'development' ? { originalError: errorInstance.originalError } : undefined
        );
      }

      if (errorInstance instanceof ExternalServiceError) {
        return createErrorResponse(
          `${errorInstance.service} service unavailable`,
          'EXTERNAL_SERVICE_ERROR',
          503,
          process.env.NODE_ENV === 'development' ? { service: errorInstance.service } : undefined
        );
      }

      if (errorInstance instanceof BusinessLogicError) {
        return createErrorResponse(
          errorInstance.message,
          errorInstance.code || 'BUSINESS_LOGIC_ERROR',
          400
        );
      }

      // Generic error handling
      const isProduction = process.env.NODE_ENV === 'production';
      
      return createErrorResponse(
        isProduction ? 'Internal server error' : errorInstance.message,
        'INTERNAL_ERROR',
        500,
        isProduction ? undefined : { 
          stack: errorInstance.stack,
          name: errorInstance.name,
        }
      );

    }
  }) as T;
}

// Specific error handlers for common scenarios

export function withDatabaseErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return withGlobalErrorHandler(handler, {
    tags: ['database'],
    customSeverity: ErrorSeverity.HIGH,
  });
}

export function withExternalServiceErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  serviceName: string
): T {
  return withGlobalErrorHandler(handler, {
    tags: ['external-service', serviceName],
    customSeverity: ErrorSeverity.MEDIUM,
  });
}

export function withBusinessLogicErrorHandler<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return withGlobalErrorHandler(handler, {
    tags: ['business-logic'],
    customSeverity: ErrorSeverity.LOW,
  });
}

// Health check for error handling system
export async function performErrorHandlingHealthCheck(): Promise<{
  status: 'healthy' | 'degraded';
  checks: Record<string, { status: 'pass' | 'fail'; message?: string }>;
}> {
  const checks: Record<string, { status: 'pass' | 'fail'; message?: string }> = {};

  // Test error logging
  try {
    const testError = new Error('Test error for health check');
    const testContext: ErrorContext = {
      requestId: 'health-check',
      endpoint: '/api/health',
      method: 'GET',
      timestamp: new Date().toISOString(),
      severity: ErrorSeverity.LOW,
    };
    
    await ErrorLogger.logError(testError, testContext);
    checks.errorLogging = { status: 'pass' };
  } catch (error) {
    checks.errorLogging = { status: 'fail', message: 'Error logging failed' };
  }

  // Check if monitoring service is connected (when implemented)
  checks.monitoring = { status: 'pass', message: 'Monitoring service not configured yet' };

  const hasFailures = Object.values(checks).some(check => check.status === 'fail');
  
  return {
    status: hasFailures ? 'degraded' : 'healthy',
    checks,
  };
}

// All exports are already defined above - removing duplicate export statement