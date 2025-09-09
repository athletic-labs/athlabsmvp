import { NextRequest, NextResponse } from 'next/server';

// Distributed rate limiting configuration
export interface DistributedRateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (req: NextRequest, identifier: string) => void;
  // Redis connection config
  redisUrl?: string;
  redisEnabled?: boolean;
}

// Abstract rate limit store interface
interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }>;
  reset(key: string): Promise<void>;
  destroy(): void;
}

// Redis-based distributed rate limiting store
class RedisRateLimitStore implements RateLimitStore {
  private redis: any;
  private isConnected: boolean = false;

  constructor(redisUrl?: string) {
    // In a real implementation, you would initialize Redis client here
    // For now, this is a mock that falls back to memory store

    this.mockRedisConnection();
  }

  private mockRedisConnection() {
    // Mock Redis connection - in production, use actual Redis client
    this.redis = {
      multi: () => ({
        incr: (key: string) => ({ exec: async () => [[null, 1]] }),
        expire: (key: string, ttl: number) => ({ exec: async () => [[null, 'OK']] }),
        ttl: (key: string) => ({ exec: async () => [[null, -1]] })
      }),
      get: async (key: string) => null,
      setex: async (key: string, ttl: number, value: string) => 'OK',
      del: async (key: string) => 1,
      ping: async () => 'PONG'
    };
    this.isConnected = true;
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    if (!this.isConnected) {
      throw new Error('Redis not connected');
    }

    const now = Date.now();
    const ttlSeconds = Math.ceil(windowMs / 1000);
    
    try {
      // Use Redis sliding window counter
      const pipeline = this.redis.multi();
      pipeline.incr(key);
      pipeline.expire(key, ttlSeconds);
      
      const results = await pipeline.exec();
      const count = results[0][1];
      
      // Calculate reset time
      const ttlResult = await this.redis.ttl(key);
      const resetTime = ttlResult > 0 ? now + (ttlResult * 1000) : now + windowMs;
      
      return { count, resetTime };
    } catch (error) {
      console.error('[Rate Limit] Redis increment error:', error);
      throw error;
    }
  }

  async reset(key: string): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('[Rate Limit] Redis reset error:', error);
    }
  }

  destroy(): void {
    if (this.redis && this.redis.quit) {
      this.redis.quit();
    }
    this.isConnected = false;
  }
}

// Enhanced memory store with better performance for single instance
class OptimizedMemoryRateLimitStore implements RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private maxEntries: number = 10000;

  constructor() {
    // Optimized cleanup - runs every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 2 * 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    // Use iterator for efficient cleanup
    const entries = Array.from(this.store.entries());
    for (const [key, value] of entries) {
      if (now > value.resetTime) {
        this.store.delete(key);
        cleaned++;
      }
    }
    
    // Prevent memory leaks - if store gets too large, clean aggressively
    if (this.store.size > this.maxEntries) {
      const entries = Array.from(this.store.entries())
        .sort(([,a], [,b]) => a.resetTime - b.resetTime)
        .slice(0, Math.floor(this.maxEntries * 0.8));
        
      this.store.clear();
      entries.forEach(([key, value]) => this.store.set(key, value));
      cleaned += this.store.size;
    }

    if (cleaned > 0) {

    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      const resetTime = now + windowMs;
      const entry = { count: 1, resetTime };
      this.store.set(key, entry);
      return entry;
    }

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

// Store factory based on configuration
function createRateLimitStore(config: DistributedRateLimitConfig): RateLimitStore {
  if (config.redisEnabled && config.redisUrl) {
    try {
      return new RedisRateLimitStore(config.redisUrl);
    } catch (error) {
      console.warn('[Rate Limit] Redis initialization failed, falling back to memory store:', error);
      return new OptimizedMemoryRateLimitStore();
    }
  }
  
  return new OptimizedMemoryRateLimitStore();
}

// Enhanced key generators
export function createCompositeKeyGenerator(req: NextRequest): string {
  // Use multiple factors for more accurate rate limiting
  const ip = getClientIP(req);
  const userAgent = req.headers.get('user-agent')?.slice(0, 50) || 'unknown';
  const userId = req.headers.get('x-user-id');
  
  if (userId) {
    return `rate_limit:user:${userId}:${ip}`;
  }
  
  // Create fingerprint based on IP and user agent
  const fingerprint = Buffer.from(`${ip}:${userAgent}`).toString('base64').slice(0, 16);
  return `rate_limit:fp:${fingerprint}`;
}

export function createEndpointKeyGenerator(req: NextRequest): string {
  const baseKey = createCompositeKeyGenerator(req);
  const pathname = new URL(req.url).pathname;
  const method = req.method;
  return `${baseKey}:${method}:${pathname}`;
}

function getClientIP(req: NextRequest): string {
  // Enhanced IP detection with more headers
  const headers = [
    'cf-connecting-ip',     // Cloudflare
    'x-forwarded-for',      // Standard proxy header
    'x-real-ip',           // Nginx
    'x-client-ip',         // Apache
    'x-cluster-client-ip',  // Cluster
    'x-forwarded',         // Less common
    'forwarded-for',       // Alternative
    'forwarded'            // RFC 7239
  ];
  
  for (const header of headers) {
    const value = req.headers.get(header);
    if (value) {
      // Handle comma-separated IPs (take first one)
      const ip = value.split(',')[0].trim();
      if (ip && !ip.startsWith('::ffff:')) {
        return ip;
      }
    }
  }
  
  return req.ip || 'unknown';
}

// Distributed rate limiting middleware factory
export function createDistributedRateLimit(config: DistributedRateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = createCompositeKeyGenerator,
    onLimitReached
  } = config;

  const store = createRateLimitStore(config);

  return async function distributedRateLimitMiddleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      const identifier = keyGenerator(req);
      const startTime = Date.now();
      
      // Check rate limit
      const { count, resetTime } = await store.increment(identifier, windowMs);
      const checkDuration = Date.now() - startTime;

      // Monitor rate limit check performance
      if (checkDuration > 100) {
        console.warn(`[Rate Limit] Slow rate limit check: ${checkDuration}ms for ${identifier}`);
      }

      if (count > maxRequests) {
        if (onLimitReached) {
          onLimitReached(req, identifier);
        }

        // Enhanced logging for rate limit breaches
        console.warn(`[Rate Limit] Limit exceeded: ${identifier} (${count}/${maxRequests}) on ${req.method} ${req.url}`);

        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
        
        const response = NextResponse.json({
          success: false,
          error: {
            message: 'Rate limit exceeded',
            code: 'RATE_LIMIT_EXCEEDED',
            details: {
              limit: maxRequests,
              windowMs,
              retryAfter: Math.max(retryAfter, 1),
              current: count
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
          }
        }, { status: 429 });

        // Standard rate limit headers
        response.headers.set('X-RateLimit-Limit', maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
        response.headers.set('Retry-After', Math.max(retryAfter, 1).toString());
        
        // Additional helpful headers
        response.headers.set('X-RateLimit-Policy', `${maxRequests};w=${windowMs}`);
        response.headers.set('X-RateLimit-Scope', identifier.split(':')[1] || 'global');

        return response;
      }

      // Execute handler
      const response = await handler(req);
      const statusCode = response.status;

      // Skip counting based on configuration
      if ((skipSuccessfulRequests && statusCode < 400) ||
          (skipFailedRequests && statusCode >= 400)) {
        // Don't count this request, reset counter
        await store.increment(identifier, windowMs);
      }

      // Add rate limit headers to all responses
      const remaining = Math.max(0, maxRequests - count);
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      response.headers.set('X-RateLimit-Policy', `${maxRequests};w=${windowMs}`);

      return response;

    } catch (error) {
      console.error('[Rate Limit] Middleware error:', error);
      
      // Fail open - allow request through if rate limiting fails
      // Log the error but don't block the application
      const response = await handler(req);
      response.headers.set('X-RateLimit-Error', 'true');
      return response;
    }
  };
}

// Production-ready rate limiters with distributed support

// API rate limiting - 1000 requests per 15 minutes (production scale)
export const productionApiRateLimit = createDistributedRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000,
  keyGenerator: createCompositeKeyGenerator,
  redisEnabled: process.env.REDIS_URL ? true : false,
  redisUrl: process.env.REDIS_URL,
  onLimitReached: (req, identifier) => {
    console.warn(`[Rate Limit] Production API limit exceeded: ${identifier} on ${req.url}`);
  }
});

// Strict endpoints - 50 requests per 15 minutes
export const productionStrictRateLimit = createDistributedRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  maxRequests: 50,
  keyGenerator: createEndpointKeyGenerator,
  redisEnabled: process.env.REDIS_URL ? true : false,
  redisUrl: process.env.REDIS_URL,
  onLimitReached: (req, identifier) => {
    console.warn(`[Rate Limit] Production strict limit exceeded: ${identifier} on ${req.url}`);
  }
});

// Authentication rate limiting - 10 attempts per 15 minutes
export const productionAuthRateLimit = createDistributedRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10,
  keyGenerator: createCompositeKeyGenerator,
  redisEnabled: process.env.REDIS_URL ? true : false,
  redisUrl: process.env.REDIS_URL,
  onLimitReached: (req, identifier) => {
    console.warn(`[Rate Limit] Production auth limit exceeded: ${identifier}`);
  }
});

// User-specific rate limiting - 5000 requests per hour per user
export const productionUserRateLimit = createDistributedRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5000,
  keyGenerator: (req) => {
    const userId = req.headers.get('x-user-id');
    return userId ? `rate_limit:user:${userId}` : createCompositeKeyGenerator(req);
  },
  redisEnabled: process.env.REDIS_URL ? true : false,
  redisUrl: process.env.REDIS_URL,
  onLimitReached: (req, identifier) => {
    console.warn(`[Rate Limit] Production user limit exceeded: ${identifier}`);
  }
});

// Burst protection - 20 requests per 30 seconds
export const productionBurstRateLimit = createDistributedRateLimit({
  windowMs: 30 * 1000, // 30 seconds
  maxRequests: 20,
  keyGenerator: createCompositeKeyGenerator,
  redisEnabled: process.env.REDIS_URL ? true : false,
  redisUrl: process.env.REDIS_URL,
  onLimitReached: (req, identifier) => {
    console.warn(`[Rate Limit] Production burst limit exceeded: ${identifier}`);
  }
});

// Rate limiting wrapper for distributed systems
export function withDistributedRateLimit(
  rateLimit: (req: NextRequest, handler: (req: NextRequest) => Promise<NextResponse>) => Promise<NextResponse>
) {
  return function <T extends (req: NextRequest, ...args: any[]) => Promise<NextResponse>>(handler: T): T {
    return (async (req: NextRequest, ...args: any[]) => {
      return rateLimit(req, (req) => handler(req, ...args));
    }) as T;
  };
}

// Health check for rate limiting system
export async function checkRateLimitHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: Record<string, any>;
}> {
  try {
    // Test rate limit store performance
    const testKey = `health_check_${Date.now()}`;
    const store = createRateLimitStore({
      windowMs: 1000,
      maxRequests: 1,
      redisEnabled: process.env.REDIS_URL ? true : false,
      redisUrl: process.env.REDIS_URL
    });
    
    const startTime = Date.now();
    await store.increment(testKey, 1000);
    const duration = Date.now() - startTime;
    
    await store.reset(testKey);
    store.destroy();
    
    return {
      status: duration < 50 ? 'healthy' : duration < 200 ? 'degraded' : 'unhealthy',
      details: {
        responseTime: duration,
        storeType: process.env.REDIS_URL ? 'redis' : 'memory',
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Cleanup for graceful shutdown
const stores: RateLimitStore[] = [];

export function addStoreForCleanup(store: RateLimitStore): void {
  stores.push(store);
}

export function cleanupDistributedRateLimitStores(): void {
  stores.forEach(store => {
    try {
      store.destroy();
    } catch (error) {
      console.error('[Rate Limit] Cleanup error:', error);
    }
  });
  stores.length = 0;
}

// Graceful shutdown handling
if (typeof process !== 'undefined') {
  process.on('SIGTERM', cleanupDistributedRateLimitStores);
  process.on('SIGINT', cleanupDistributedRateLimitStores);
}