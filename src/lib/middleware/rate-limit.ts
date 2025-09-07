import { NextRequest, NextResponse } from 'next/server';
import { RateLimitError } from '@/lib/validation/api-middleware';

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
  onLimitReached?: (req: NextRequest, identifier: string) => void;
}

// In-memory rate limiting store (for development/simple production)
// In production, this should be replaced with Redis
class MemoryRateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 10 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      Array.from(this.store.entries()).forEach(([key, value]) => {
        if (now > value.resetTime) {
          this.store.delete(key);
        }
      });
    }, 10 * 60 * 1000);
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      // Create new or reset expired entry
      const resetTime = now + windowMs;
      this.store.set(key, { count: 1, resetTime });
      return { count: 1, resetTime };
    }

    // Increment existing entry
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Singleton store instance
const rateLimitStore = new MemoryRateLimitStore();

// Default key generator - uses IP address with fallback
function defaultKeyGenerator(req: NextRequest): string {
  // Try to get IP from various headers (in order of preference)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const clientIp = req.headers.get('x-client-ip');
  
  let ip = 'unknown';
  
  if (forwarded) {
    ip = forwarded.split(',')[0].trim();
  } else if (realIp) {
    ip = realIp;
  } else if (clientIp) {
    ip = clientIp;
  } else if (req.ip) {
    ip = req.ip;
  }

  return `rate_limit:${ip}`;
}

// User-based key generator (requires authentication)
export function userBasedKeyGenerator(req: NextRequest): string {
  const userId = req.headers.get('x-user-id');
  if (userId) {
    return `rate_limit:user:${userId}`;
  }
  // Fallback to IP-based limiting
  return defaultKeyGenerator(req);
}

// API endpoint-specific key generator
export function endpointBasedKeyGenerator(req: NextRequest): string {
  const ip = defaultKeyGenerator(req);
  const pathname = new URL(req.url).pathname;
  return `${ip}:${pathname}`;
}

// Rate limiting middleware factory
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = defaultKeyGenerator,
    onLimitReached
  } = config;

  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const identifier = keyGenerator(req);
      const { count, resetTime } = await rateLimitStore.increment(identifier, windowMs);

      // Check if limit exceeded
      if (count > maxRequests) {
        if (onLimitReached) {
          onLimitReached(req, identifier);
        }

        console.warn(`Rate limit exceeded for ${identifier}: ${count}/${maxRequests}`);

        const response = NextResponse.json(
          {
            success: false,
            error: {
              message: 'Too many requests',
              code: 'RATE_LIMIT_EXCEEDED',
              details: {
                limit: maxRequests,
                windowMs,
                retryAfter: Math.ceil((resetTime - Date.now()) / 1000),
              },
            },
            meta: {
              timestamp: new Date().toISOString(),
              version: '1.0',
            },
          },
          { status: 429 }
        );

        // Add rate limiting headers
        response.headers.set('X-RateLimit-Limit', maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
        response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());

        return response;
      }

      // Execute the handler
      const response = await handler(req);

      // Add rate limiting headers to successful responses
      const remaining = Math.max(0, maxRequests - count);
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

      return response;

    } catch (error) {
      console.error('Rate limiting error:', error);
      // If rate limiting fails, allow the request through
      // This prevents rate limiting issues from breaking the application
      return handler(req);
    }
  };
}

// Pre-configured rate limiters for common use cases

// General API rate limiting - 100 requests per minute
export const generalApiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
  keyGenerator: defaultKeyGenerator,
  onLimitReached: (req, identifier) => {
    console.warn(`General API rate limit exceeded for ${identifier}`);
  },
});

// Strict API rate limiting for sensitive endpoints - 20 requests per minute
export const strictApiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  keyGenerator: endpointBasedKeyGenerator,
  onLimitReached: (req, identifier) => {
    console.warn(`Strict API rate limit exceeded for ${identifier} on ${req.url}`);
  },
});

// Authentication rate limiting - 5 attempts per minute
export const authRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  keyGenerator: defaultKeyGenerator,
  onLimitReached: (req, identifier) => {
    console.warn(`Auth rate limit exceeded for ${identifier}`);
  },
});

// User-specific rate limiting - 200 requests per minute per user
export const userApiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 200,
  keyGenerator: userBasedKeyGenerator,
  onLimitReached: (req, identifier) => {
    console.warn(`User API rate limit exceeded for ${identifier}`);
  },
});

// Places API rate limiting - 60 requests per minute (Google Places has quotas)
export const placesApiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
  keyGenerator: endpointBasedKeyGenerator,
  onLimitReached: (req, identifier) => {
    console.warn(`Places API rate limit exceeded for ${identifier}`);
  },
});

// High-frequency endpoint rate limiting - 10 requests per second
export const highFrequencyRateLimit = createRateLimit({
  windowMs: 1000, // 1 second
  maxRequests: 10,
  keyGenerator: defaultKeyGenerator,
  onLimitReached: (req, identifier) => {
    console.warn(`High frequency rate limit exceeded for ${identifier}`);
  },
});

// Rate limiting wrapper for API routes
export function withRateLimit(
  rateLimit: (req: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) => Promise<NextResponse>
) {
  return function <T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse>>(handler: T): T {
    return (async (req: NextRequest, ...args: any[]) => {
      return rateLimit(req, (req) => handler(req, ...args));
    }) as T;
  };
}

// Cleanup function for graceful shutdown
export function cleanupRateLimitStore(): void {
  rateLimitStore.destroy();
}

// Export types
export type RateLimitMiddleware = (
  req: NextRequest, 
  handler: (req: NextRequest) => Promise<NextResponse>
) => Promise<NextResponse>;