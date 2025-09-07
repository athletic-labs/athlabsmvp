/**
 * Comprehensive CORS configuration for Athletic Labs SaaS
 * Production-ready security configuration
 */

import { NextRequest, NextResponse } from 'next/server';
import { appConfig } from '@/lib/config/env';

export interface CorsOptions {
  origin: string[] | string | boolean | ((origin: string | undefined) => boolean);
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

// Production CORS configuration
const PRODUCTION_CORS: CorsOptions = {
  origin: [
    'https://athletic-labs.vercel.app',
    'https://www.athletic-labs.com',
    'https://app.athletic-labs.com',
    // Add your actual production domains here
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Accept',
    'Accept-Version',
    'Authorization',
    'Content-Length',
    'Content-MD5',
    'Content-Type',
    'Date',
    'X-Requested-With',
    'X-Api-Version',
    'X-CSRF-Token',
    'X-Client-Version',
    'User-Agent',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID',
    'X-Response-Time',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204, // 204 for legacy browser support
};

// Development CORS configuration (more permissive)
const DEVELOPMENT_CORS: CorsOptions = {
  origin: (origin) => {
    if (!origin) return true; // Allow requests with no origin (e.g., mobile apps)
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
    
    // Allow local development
    if (allowedOrigins.includes(origin)) return true;
    
    // Allow Vercel preview deployments
    if (origin.endsWith('.vercel.app')) return true;
    
    return false;
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Accept',
    'Accept-Version',
    'Authorization',
    'Content-Length',
    'Content-MD5',
    'Content-Type',
    'Date',
    'X-Requested-With',
    'X-Api-Version',
    'X-CSRF-Token',
    'X-Client-Version',
    'User-Agent',
    'Cache-Control',
    'Pragma',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID',
    'X-Response-Time',
  ],
  credentials: true,
  maxAge: 300, // 5 minutes in development
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

// Get appropriate CORS config based on environment
export function getCorsConfig(): CorsOptions {
  return appConfig.isProduction ? PRODUCTION_CORS : DEVELOPMENT_CORS;
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | undefined, corsConfig: CorsOptions): boolean {
  const { origin: allowedOrigins } = corsConfig;

  if (allowedOrigins === true) {
    return true;
  }

  if (allowedOrigins === false) {
    return false;
  }

  if (typeof allowedOrigins === 'function') {
    return allowedOrigins(origin);
  }

  if (typeof allowedOrigins === 'string') {
    return origin === allowedOrigins;
  }

  if (Array.isArray(allowedOrigins)) {
    return allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
      }
      return false;
    });
  }

  return false;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(
  request: NextRequest,
  corsConfig: CorsOptions = getCorsConfig()
): NextResponse {
  const origin = request.headers.get('origin');
  const requestMethod = request.headers.get('access-control-request-method');
  const requestHeaders = request.headers.get('access-control-request-headers');

  // Check if origin is allowed
  const isAllowed = origin ? isOriginAllowed(origin, corsConfig) : false;

  const response = new NextResponse(null, { 
    status: corsConfig.optionsSuccessStatus 
  });

  // Set CORS headers
  if (isAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  if (corsConfig.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Set allowed methods
  if (requestMethod && corsConfig.methods.includes(requestMethod)) {
    response.headers.set('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  }

  // Set allowed headers
  if (requestHeaders) {
    const requestedHeaders = requestHeaders.split(',').map(h => h.trim());
    const allowedRequestHeaders = requestedHeaders.filter(header =>
      corsConfig.allowedHeaders.some(allowed =>
        allowed.toLowerCase() === header.toLowerCase()
      )
    );
    
    if (allowedRequestHeaders.length > 0) {
      response.headers.set('Access-Control-Allow-Headers', allowedRequestHeaders.join(', '));
    }
  } else {
    response.headers.set('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
  }

  // Set max age
  response.headers.set('Access-Control-Max-Age', corsConfig.maxAge.toString());

  // Additional security headers for preflight
  response.headers.set('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');

  return response;
}

/**
 * Add CORS headers to actual requests
 */
export function addCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  corsConfig: CorsOptions = getCorsConfig()
): NextResponse {
  const origin = request.headers.get('origin');

  // Check if origin is allowed
  const isAllowed = origin ? isOriginAllowed(origin, corsConfig) : false;

  if (isAllowed && origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }

  if (corsConfig.credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Set exposed headers
  if (corsConfig.exposedHeaders.length > 0) {
    response.headers.set('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
  }

  // Add Vary header for caching
  const existingVary = response.headers.get('Vary') || '';
  const varyHeaders = new Set([
    ...existingVary.split(',').map(h => h.trim()).filter(Boolean),
    'Origin',
  ]);
  response.headers.set('Vary', Array.from(varyHeaders).join(', '));

  return response;
}

/**
 * CORS middleware function
 */
export function corsMiddleware(
  request: NextRequest,
  corsConfig: CorsOptions = getCorsConfig()
): NextResponse | null {
  // Handle OPTIONS requests (preflight)
  if (request.method === 'OPTIONS') {
    return handleCorsPreflightRequest(request, corsConfig);
  }

  // For non-OPTIONS requests, CORS headers will be added in the response
  return null;
}

/**
 * Validate CORS configuration
 */
export function validateCorsConfig(config: CorsOptions): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check origins
  if (config.origin === true && appConfig.isProduction) {
    errors.push('CORS origin should not be set to true (*) in production');
  }

  if (Array.isArray(config.origin) && config.origin.length === 0) {
    errors.push('CORS origin array cannot be empty');
  }

  if (Array.isArray(config.origin)) {
    config.origin.forEach((origin, index) => {
      if (typeof origin === 'string') {
        if (origin === '*') {
          warnings.push(`Wildcard origin (*) at index ${index} is not secure`);
        }
        if (!origin.startsWith('http') && origin !== 'null') {
          warnings.push(`Origin at index ${index} should use HTTPS in production`);
        }
      }
    });
  }

  // Check methods
  if (config.methods.length === 0) {
    errors.push('CORS methods cannot be empty');
  }

  const dangerousMethods = ['TRACE', 'CONNECT'];
  const foundDangerousMethods = config.methods.filter(method => 
    dangerousMethods.includes(method.toUpperCase())
  );
  if (foundDangerousMethods.length > 0) {
    warnings.push(`Potentially dangerous HTTP methods found: ${foundDangerousMethods.join(', ')}`);
  }

  // Check credentials + origin
  if (config.credentials && config.origin === true) {
    errors.push('CORS credentials cannot be used with wildcard origin (*)');
  }

  // Check max age
  if (config.maxAge < 0) {
    errors.push('CORS maxAge must be non-negative');
  }

  if (config.maxAge > 86400 * 7) { // 1 week
    warnings.push('CORS maxAge is very high (> 1 week), consider reducing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * CORS configuration for specific API routes
 */
export const API_CORS_CONFIGS: Record<string, CorsOptions> = {
  // Public APIs (more restrictive)
  public: {
    ...getCorsConfig(),
    credentials: false,
    maxAge: 300, // 5 minutes
  },

  // Authenticated APIs (standard config)
  authenticated: getCorsConfig(),

  // Admin APIs (most restrictive)
  admin: {
    ...getCorsConfig(),
    origin: appConfig.isProduction 
      ? ['https://admin.athletic-labs.com', 'https://athletic-labs.vercel.app']
      : ['http://localhost:3000', 'http://localhost:3001'],
    maxAge: 0, // No caching for admin endpoints
  },

  // Webhook endpoints (no CORS - server-to-server)
  webhook: {
    origin: false,
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: false,
    maxAge: 0,
    preflightContinue: false,
    optionsSuccessStatus: 405, // Method Not Allowed
  },
};