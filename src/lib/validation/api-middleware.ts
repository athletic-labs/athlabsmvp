import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema, z } from 'zod';

// Standard API response interfaces
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    version: string;
  };
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: unknown;
}

// Custom error classes
export class ValidationError extends Error {
  constructor(
    message: string, 
    public details: z.ZodError | unknown,
    public status: number = 400
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Validation middleware wrapper
export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, validatedData: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let data: unknown;
      
      // Parse request data based on method
      if (request.method === 'GET') {
        // For GET requests, parse search params
        const searchParams = new URL(request.url).searchParams;
        const params: Record<string, string | string[]> = {};
        
        Array.from(searchParams.entries()).forEach(([key, value]) => {
          if (params[key]) {
            // Handle multiple values for the same key
            if (Array.isArray(params[key])) {
              (params[key] as string[]).push(value);
            } else {
              params[key] = [params[key] as string, value];
            }
          } else {
            params[key] = value;
          }
        });
        data = params;
      } else {
        // For POST/PUT/PATCH requests, parse JSON body
        try {
          data = await request.json();
        } catch (error) {
          return createErrorResponse(
            'Invalid JSON in request body',
            'INVALID_JSON',
            400,
            error
          );
        }
      }

      // Validate data against schema
      const validatedData = schema.parse(data);
      
      // Call the actual handler with validated data
      return await handler(request, validatedData);
      
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Query validation specifically for GET requests
export function withQueryValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, query: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const searchParams = new URL(request.url).searchParams;
      const query: Record<string, string> = {};
      
      Array.from(searchParams.entries()).forEach(([key, value]) => {
        query[key] = value;
      });

      const validatedQuery = schema.parse(query);
      return await handler(request, validatedQuery);
      
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Body validation for POST/PUT/PATCH requests
export function withBodyValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, body: T) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      let body: unknown;
      
      try {
        body = await request.json();
      } catch (error) {
        return createErrorResponse(
          'Invalid JSON in request body',
          'INVALID_JSON',
          400,
          error
        );
      }

      const validatedBody = schema.parse(body);
      return await handler(request, validatedBody);
      
    } catch (error) {
      return handleApiError(error);
    }
  };
}

// Error handling helper
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  if (error instanceof z.ZodError) {
    return createErrorResponse(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      {
        issues: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      }
    );
  }

  if (error instanceof ValidationError) {
    return createErrorResponse(
      error.message,
      'VALIDATION_ERROR',
      error.status,
      error.details
    );
  }

  if (error instanceof AuthenticationError) {
    return createErrorResponse(
      error.message,
      'AUTHENTICATION_ERROR',
      401
    );
  }

  if (error instanceof AuthorizationError) {
    return createErrorResponse(
      error.message,
      'AUTHORIZATION_ERROR',
      403
    );
  }

  if (error instanceof NotFoundError) {
    return createErrorResponse(
      error.message,
      'NOT_FOUND',
      404
    );
  }

  if (error instanceof RateLimitError) {
    return createErrorResponse(
      error.message,
      'RATE_LIMIT_EXCEEDED',
      429
    );
  }

  // Generic error handling
  if (error instanceof Error) {
    return createErrorResponse(
      process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      'INTERNAL_ERROR',
      500,
      process.env.NODE_ENV === 'development' ? error.stack : undefined
    );
  }

  // Unknown error
  return createErrorResponse(
    'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500
  );
}

// Success response helper
export function createSuccessResponse<T>(
  data: T, 
  status: number = 200,
  meta?: Partial<ApiResponse<T>['meta']>
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...meta,
    },
  };

  return NextResponse.json(response, { status });
}

// Error response helper
export function createErrorResponse(
  message: string,
  code: string,
  status: number,
  details?: unknown
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
    },
  };

  return NextResponse.json(response, { status });
}

// Request ID generation for tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Sanitize error messages for production
export function sanitizeError(error: unknown): string {
  if (process.env.NODE_ENV === 'development') {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  // In production, return generic messages for security
  if (error instanceof ValidationError || error instanceof z.ZodError) {
    return 'Invalid request data';
  }

  if (error instanceof AuthenticationError) {
    return 'Authentication required';
  }

  if (error instanceof AuthorizationError) {
    return 'Access denied';
  }

  if (error instanceof NotFoundError) {
    return 'Resource not found';
  }

  return 'Internal server error';
}

// Rate limiting helper (to be implemented with Redis)
export async function checkRateLimit(
  identifier: string,
  windowMs: number = 60000,
  maxRequests: number = 100
): Promise<boolean> {
  // TODO: Implement with Redis
  // For now, return true (no rate limiting)
  // This will be implemented in the next step
  return true;
}