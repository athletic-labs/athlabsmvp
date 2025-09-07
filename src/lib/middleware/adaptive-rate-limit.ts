import { NextRequest, NextResponse } from 'next/server';
import { createDistributedRateLimit, productionApiRateLimit, productionStrictRateLimit, productionAuthRateLimit, productionUserRateLimit, productionBurstRateLimit } from './distributed-rate-limit';
import { generalApiRateLimit, strictApiRateLimit, authRateLimit, userApiRateLimit, placesApiRateLimit, highFrequencyRateLimit } from './rate-limit';

// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const hasRedis = Boolean(process.env.REDIS_URL);
const isDistributedDeployment = Boolean(process.env.VERCEL_URL || process.env.RAILWAY_URL || process.env.RENDER_URL || process.env.KUBERNETES_SERVICE_HOST);

// Adaptive rate limiting configuration
export interface AdaptiveRateLimitConfig {
  endpoint: 'api' | 'auth' | 'strict' | 'user' | 'places' | 'burst' | 'custom';
  customConfig?: {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: NextRequest) => string;
  };
  // Override automatic detection
  forceDistributed?: boolean;
  forceMemory?: boolean;
}

// Smart rate limiter selection based on environment
export function createAdaptiveRateLimit(config: AdaptiveRateLimitConfig) {
  const shouldUseDistributed = config.forceDistributed || 
    (!config.forceMemory && (isProduction || hasRedis || isDistributedDeployment));

  console.log(`[Rate Limit] Using ${shouldUseDistributed ? 'distributed' : 'memory'} rate limiting for ${config.endpoint} endpoint`);
  
  // Select appropriate rate limiter
  if (shouldUseDistributed) {
    return selectProductionRateLimit(config);
  } else {
    return selectDevelopmentRateLimit(config);
  }
}

function selectProductionRateLimit(config: AdaptiveRateLimitConfig) {
  switch (config.endpoint) {
    case 'api':
      return productionApiRateLimit;
    case 'strict':
      return productionStrictRateLimit;
    case 'auth':
      return productionAuthRateLimit;
    case 'user':
      return productionUserRateLimit;
    case 'burst':
      return productionBurstRateLimit;
    case 'places':
      // Places API gets special treatment due to Google quotas
      return createDistributedRateLimit({
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
        redisEnabled: hasRedis,
        redisUrl: process.env.REDIS_URL,
        onLimitReached: (req, identifier) => {
          console.warn(`[Rate Limit] Places API production limit exceeded: ${identifier}`);
        }
      });
    case 'custom':
      if (!config.customConfig) {
        throw new Error('Custom rate limit config required when endpoint is "custom"');
      }
      return createDistributedRateLimit({
        ...config.customConfig,
        redisEnabled: hasRedis,
        redisUrl: process.env.REDIS_URL,
      });
    default:
      return productionApiRateLimit;
  }
}

function selectDevelopmentRateLimit(config: AdaptiveRateLimitConfig) {
  switch (config.endpoint) {
    case 'api':
      return generalApiRateLimit;
    case 'strict':
      return strictApiRateLimit;
    case 'auth':
      return authRateLimit;
    case 'user':
      return userApiRateLimit;
    case 'places':
      return placesApiRateLimit;
    case 'burst':
      return highFrequencyRateLimit;
    case 'custom':
      if (!config.customConfig) {
        throw new Error('Custom rate limit config required when endpoint is "custom"');
      }
      // Use development rate limiter with custom config
      return createDistributedRateLimit({
        ...config.customConfig,
        redisEnabled: false, // Force memory for custom development configs
      });
    default:
      return generalApiRateLimit;
  }
}

// Middleware wrapper that automatically selects appropriate rate limiter
export function withAdaptiveRateLimit(config: AdaptiveRateLimitConfig) {
  const rateLimitMiddleware = createAdaptiveRateLimit(config);
  
  return function <T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse>>(handler: T): T {
    return (async (req: NextRequest, ...args: any[]) => {
      // Add request context for better debugging
      const requestId = crypto.randomUUID();
      
      try {
        return await rateLimitMiddleware(req, async (req) => {
          // Add request tracking
          req.headers.set('x-request-id', requestId);
          return handler(req, ...args);
        });
      } catch (error) {
        console.error(`[Rate Limit] Error in adaptive rate limiting (${requestId}):`, error);
        // Fail open - execute handler without rate limiting
        return handler(req, ...args);
      }
    }) as T;
  };
}

// Layered rate limiting - apply multiple rate limits
export function withLayeredRateLimit(...configs: AdaptiveRateLimitConfig[]) {
  const rateLimiters = configs.map(config => createAdaptiveRateLimit(config));
  
  return function <T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse>>(handler: T): T {
    return (async (req: NextRequest, ...args: any[]) => {
      // Apply rate limiters in sequence
      let currentHandler = (req: NextRequest) => handler(req, ...args);
      
      // Build middleware chain in reverse order
      for (let i = rateLimiters.length - 1; i >= 0; i--) {
        const rateLimiter = rateLimiters[i];
        const nextHandler = currentHandler;
        currentHandler = (req: NextRequest) => rateLimiter(req, nextHandler);
      }
      
      return currentHandler(req);
    }) as T;
  };
}

// Circuit breaker for rate limiting failures
class RateLimitCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly maxFailures = 5;
  private readonly resetTimeMs = 60000; // 1 minute

  shouldBypass(): boolean {
    const now = Date.now();
    
    // Reset if enough time has passed
    if (now - this.lastFailureTime > this.resetTimeMs) {
      this.failures = 0;
    }
    
    return this.failures >= this.maxFailures;
  }

  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.maxFailures) {
      console.warn(`[Rate Limit] Circuit breaker opened after ${this.failures} failures`);
    }
  }

  recordSuccess(): void {
    if (this.failures > 0) {
      this.failures = Math.max(0, this.failures - 1);
    }
  }
}

const circuitBreaker = new RateLimitCircuitBreaker();

// Resilient rate limiting with circuit breaker
export function withResilientRateLimit(config: AdaptiveRateLimitConfig) {
  const rateLimitMiddleware = createAdaptiveRateLimit(config);
  
  return function <T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse>>(handler: T): T {
    return (async (req: NextRequest, ...args: any[]) => {
      // Check circuit breaker
      if (circuitBreaker.shouldBypass()) {
        console.warn(`[Rate Limit] Circuit breaker open, bypassing rate limiting`);
        return handler(req, ...args);
      }
      
      try {
        const response = await rateLimitMiddleware(req, (req) => handler(req, ...args));
        circuitBreaker.recordSuccess();
        return response;
      } catch (error) {
        console.error(`[Rate Limit] Error in resilient rate limiting:`, error);
        circuitBreaker.recordFailure();
        
        // Fail open
        return handler(req, ...args);
      }
    }) as T;
  };
}

// Rate limiting health check endpoint
export async function createRateLimitHealthCheck(): Promise<NextResponse> {
  const checks = {
    environment: {
      isProduction,
      hasRedis,
      isDistributedDeployment,
      redisUrl: process.env.REDIS_URL ? '***configured***' : 'not configured'
    },
    circuitBreaker: {
      failures: (circuitBreaker as any).failures || 0,
      isOpen: circuitBreaker.shouldBypass()
    },
    timestamp: new Date().toISOString()
  };

  return NextResponse.json({
    status: 'healthy',
    rateLimiting: checks,
    version: '2.0-adaptive'
  });
}

// Usage examples and presets
export const adaptivePresets = {
  // Standard API endpoint
  api: { endpoint: 'api' as const },
  
  // Authentication endpoints
  auth: { endpoint: 'auth' as const },
  
  // Sensitive operations
  strict: { endpoint: 'strict' as const },
  
  // User-specific operations
  user: { endpoint: 'user' as const },
  
  // External API integrations
  places: { endpoint: 'places' as const },
  
  // High-frequency operations
  burst: { endpoint: 'burst' as const },
  
  // Multi-layered protection for critical endpoints
  critical: [
    { endpoint: 'burst' as const },  // Short-term burst protection
    { endpoint: 'strict' as const }  // Long-term rate limiting
  ],
  
  // Development-friendly settings
  development: {
    endpoint: 'custom' as const,
    customConfig: {
      windowMs: 60 * 1000,
      maxRequests: 1000  // Very permissive for development
    },
    forceMemory: true
  },
  
  // Production-ready settings
  production: {
    endpoint: 'api' as const,
    forceDistributed: true
  }
} as const;

// Export environment info for debugging
export const rateLimitEnvironment = {
  isProduction,
  hasRedis,
  isDistributedDeployment,
  selectedStrategy: isProduction || hasRedis || isDistributedDeployment ? 'distributed' : 'memory',
  version: '2.0-adaptive'
};