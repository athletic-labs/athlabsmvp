import { createClient, RedisClientType } from 'redis';
import { redisConfig } from '@/lib/config/env';

/**
 * Redis client for API caching
 */
class RedisCache {
  private static instance: RedisCache;
  private client: RedisClientType | null = null;
  private isConnected = false;

  private constructor() {}

  static getInstance(): RedisCache {
    if (!RedisCache.instance) {
      RedisCache.instance = new RedisCache();
    }
    return RedisCache.instance;
  }

  async connect(): Promise<void> {
    if (this.isConnected || !redisConfig.enabled) {
      return;
    }

    try {
      this.client = createClient({
        url: redisConfig.url,
        socket: redisConfig.tls ? {
          tls: true,
          rejectUnauthorized: false,
        } : undefined,
      });

      this.client.on('error', (error) => {
        console.error('[Redis] Connection error:', error);
        this.isConnected = false;
      });

      this.client.on('connect', () => {

        this.isConnected = true;
      });

      this.client.on('disconnect', () => {
        console.warn('[Redis] Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('[Redis] Failed to connect:', error);
      this.client = null;
      this.isConnected = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
      this.isConnected = false;
    }
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  getClient(): RedisClientType | null {
    return this.client;
  }
}

// Global Redis instance
export const redisCache = RedisCache.getInstance();

/**
 * Cache key generator for consistent naming
 */
export const cacheKeys = {
  // Orders cache
  orders: (teamId: string, filters?: Record<string, any>) => 
    `orders:${teamId}:${JSON.stringify(filters || {})}`,
  orderById: (orderId: string) => `order:${orderId}`,
  orderAnalytics: (teamId: string) => `analytics:orders:${teamId}`,

  // Templates cache
  templates: (teamId: string, filters?: Record<string, any>) =>
    `templates:${teamId}:${JSON.stringify(filters || {})}`,
  templateById: (templateId: string) => `template:${templateId}`,
  templatesFavorites: (teamId: string) => `templates:favorites:${teamId}`,

  // Dashboard cache
  dashboardMetrics: (teamId: string) => `dashboard:metrics:${teamId}`,
  
  // User cache
  userProfile: (userId: string) => `user:profile:${userId}`,
  userPermissions: (userId: string, teamId: string) => `user:permissions:${userId}:${teamId}`,

  // Places API cache
  placesAutocomplete: (query: string) => `places:autocomplete:${encodeURIComponent(query)}`,
} as const;

/**
 * Cache configuration with TTL settings
 */
export const cacheConfig = {
  // Short-lived cache (1-5 minutes) - for frequently changing data
  orders: { ttl: 120 }, // 2 minutes
  dashboardMetrics: { ttl: 180 }, // 3 minutes
  
  // Medium-lived cache (5-30 minutes) - for semi-static data
  templates: { ttl: 900 }, // 15 minutes
  userProfile: { ttl: 1800 }, // 30 minutes
  
  // Long-lived cache (30+ minutes) - for rarely changing data
  userPermissions: { ttl: 3600 }, // 1 hour
  placesAutocomplete: { ttl: 86400 }, // 24 hours (places rarely change)
  
  // Single items cache
  orderById: { ttl: 300 }, // 5 minutes
  templateById: { ttl: 1800 }, // 30 minutes
} as const;

/**
 * Cache utility functions
 */
export class CacheManager {
  private static instance: CacheManager;
  private cache = redisCache;

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.cache.isReady()) {
      return null;
    }

    try {
      const client = this.cache.getClient();
      if (!client) return null;

      const cached = await client.get(key);
      if (!cached) return null;

      return JSON.parse(cached) as T;
    } catch (error) {
      console.error(`[Cache] Get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  async set(key: string, value: any, ttl: number): Promise<boolean> {
    if (!this.cache.isReady()) {
      return false;
    }

    try {
      const client = this.cache.getClient();
      if (!client) return false;

      const serialized = JSON.stringify(value);
      await client.setEx(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`[Cache] Set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete cached data
   */
  async del(key: string | string[]): Promise<boolean> {
    if (!this.cache.isReady()) {
      return false;
    }

    try {
      const client = this.cache.getClient();
      if (!client) return false;

      const keys = Array.isArray(key) ? key : [key];
      await client.del(keys);
      return true;
    } catch (error) {
      console.error(`[Cache] Delete error:`, error);
      return false;
    }
  }

  /**
   * Delete by pattern
   */
  async delPattern(pattern: string): Promise<boolean> {
    if (!this.cache.isReady()) {
      return false;
    }

    try {
      const client = this.cache.getClient();
      if (!client) return false;

      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error(`[Cache] Delete pattern error:`, error);
      return false;
    }
  }

  /**
   * Cache-aside pattern with fallback
   */
  async cacheAside<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Not in cache, fetch from source
    const data = await fetcher();
    
    // Store in cache for next time (fire and forget)
    this.set(key, data, ttl).catch(error => 
      console.warn(`[Cache] Failed to cache key ${key}:`, error)
    );

    return data;
  }

  /**
   * Bulk operations
   */
  async multiGet<T>(keys: string[]): Promise<Array<T | null>> {
    if (!this.cache.isReady()) {
      return new Array(keys.length).fill(null);
    }

    try {
      const client = this.cache.getClient();
      if (!client) return new Array(keys.length).fill(null);

      const values = await client.mGet(keys);
      return values.map(val => val ? JSON.parse(val) : null);
    } catch (error) {
      console.error('[Cache] Multi-get error:', error);
      return new Array(keys.length).fill(null);
    }
  }

  /**
   * Cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    totalKeys: number;
    memoryUsage?: string;
  }> {
    const stats = {
      connected: this.cache.isReady(),
      totalKeys: 0,
      memoryUsage: undefined as string | undefined,
    };

    if (!this.cache.isReady()) {
      return stats;
    }

    try {
      const client = this.cache.getClient();
      if (!client) return stats;

      const info = await client.info('memory');
      const keyspace = await client.info('keyspace');
      
      // Parse total keys from keyspace info
      const keyspaceMatch = keyspace.match(/keys=(\d+)/);
      if (keyspaceMatch) {
        stats.totalKeys = parseInt(keyspaceMatch[1], 10);
      }

      // Parse memory usage
      const memoryMatch = info.match(/used_memory_human:(.+)/);
      if (memoryMatch) {
        stats.memoryUsage = memoryMatch[1].trim();
      }
    } catch (error) {
      console.error('[Cache] Stats error:', error);
    }

    return stats;
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

// Initialize Redis connection on module load
if (redisConfig.enabled) {
  redisCache.connect().catch(error => 
    console.warn('[Redis] Initial connection failed:', error)
  );
}

// Graceful shutdown
process.on('SIGINT', async () => {

  await redisCache.disconnect();
});

process.on('SIGTERM', async () => {

  await redisCache.disconnect();
});