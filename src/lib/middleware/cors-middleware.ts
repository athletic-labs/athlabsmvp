/**
 * CORS middleware wrapper for API routes
 * Automatically applies CORS headers and handles preflight requests
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  CorsOptions, 
  getCorsConfig, 
  addCorsHeaders, 
  handleCorsPreflightRequest, 
  API_CORS_CONFIGS 
} from './cors-config';

type ApiHandler = (request: NextRequest, context?: any) => Promise<NextResponse> | NextResponse;
type CorsConfigType = keyof typeof API_CORS_CONFIGS | CorsOptions;

interface WithCorsOptions {
  corsConfig?: CorsConfigType;
  handlePreflight?: boolean;
}

/**
 * Higher-order function to wrap API handlers with CORS
 */
export function withCors(
  handler: ApiHandler,
  options: WithCorsOptions = {}
): (request: NextRequest, context?: any) => Promise<NextResponse> {
  const { 
    corsConfig = 'authenticated', 
    handlePreflight = true 
  } = options;

  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Get CORS configuration
    let corsOptions: CorsOptions;
    if (typeof corsConfig === 'string') {
      corsOptions = API_CORS_CONFIGS[corsConfig];
    } else {
      corsOptions = corsConfig;
    }

    // Handle preflight OPTIONS requests
    if (request.method === 'OPTIONS' && handlePreflight) {
      return handleCorsPreflightRequest(request, corsOptions);
    }

    try {
      // Execute the original handler
      let response = await handler(request, context);

      // Add CORS headers to the response
      response = addCorsHeaders(response, request, corsOptions);

      // Add additional security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');

      return response;

    } catch (error) {
      // Even error responses need CORS headers
      console.error('[CORS Middleware] Handler error:', error);
      
      const errorResponse = new NextResponse(
        JSON.stringify({
          error: 'Internal Server Error',
          message: process.env.NODE_ENV === 'development' 
            ? (error as Error).message 
            : 'An error occurred',
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      return addCorsHeaders(errorResponse, request, corsOptions);
    }
  };
}

/**
 * Specific CORS wrappers for different API types
 */
export const withPublicCors = (handler: ApiHandler) => 
  withCors(handler, { corsConfig: 'public' });

export const withAuthenticatedCors = (handler: ApiHandler) => 
  withCors(handler, { corsConfig: 'authenticated' });

export const withAdminCors = (handler: ApiHandler) => 
  withCors(handler, { corsConfig: 'admin' });

export const withWebhookCors = (handler: ApiHandler) => 
  withCors(handler, { corsConfig: 'webhook', handlePreflight: false });

/**
 * CORS middleware for Next.js middleware.ts
 */
export function corsMiddleware(request: NextRequest): NextResponse | undefined {
  // Skip CORS for non-API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return undefined;
  }

  // Get appropriate CORS config based on route
  let corsConfig: CorsOptions;
  
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    corsConfig = API_CORS_CONFIGS.authenticated;
  } else if (request.nextUrl.pathname.startsWith('/api/admin/')) {
    corsConfig = API_CORS_CONFIGS.admin;
  } else if (request.nextUrl.pathname.startsWith('/api/webhook/')) {
    corsConfig = API_CORS_CONFIGS.webhook;
  } else if (request.nextUrl.pathname.startsWith('/api/public/')) {
    corsConfig = API_CORS_CONFIGS.public;
  } else {
    corsConfig = getCorsConfig();
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return handleCorsPreflightRequest(request, corsConfig);
  }

  // For other requests, return undefined to continue processing
  return undefined;
}

/**
 * Utility to check if a request origin is allowed
 */
export function validateRequestOrigin(
  request: NextRequest,
  corsConfig: CorsConfigType = 'authenticated'
): { isAllowed: boolean; origin: string | null; reason?: string } {
  const origin = request.headers.get('origin');
  
  if (!origin) {
    return { isAllowed: true, origin: null, reason: 'No origin header (same-origin request)' };
  }

  let corsOptions: CorsOptions;
  if (typeof corsConfig === 'string') {
    corsOptions = API_CORS_CONFIGS[corsConfig];
  } else {
    corsOptions = corsConfig;
  }

  const { isOriginAllowed } = require('./cors-config');
  const isAllowed = isOriginAllowed(origin, corsOptions);

  return {
    isAllowed,
    origin,
    reason: isAllowed ? undefined : 'Origin not in allowed list',
  };
}

/**
 * Custom CORS wrapper with additional security checks
 */
export function withSecureCors(
  handler: ApiHandler,
  options: WithCorsOptions & {
    requireSecureOrigin?: boolean;
    logRequests?: boolean;
  } = {}
) {
  const { requireSecureOrigin = true, logRequests = false } = options;

  return withCors(async (request: NextRequest, context?: any) => {
    const origin = request.headers.get('origin');

    // Security checks
    if (requireSecureOrigin && origin && !origin.startsWith('https://') && 
        !origin.startsWith('http://localhost') && !origin.startsWith('http://127.0.0.1')) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Insecure origin not allowed',
          message: 'HTTPS is required for cross-origin requests'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Optional request logging
    if (logRequests) {

    }

    // Rate limiting based on origin (simple implementation)
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const requestKey = `${origin || 'same-origin'}:${request.nextUrl.pathname}`;
    
    // Call original handler
    return await handler(request, context);
  }, options);
}