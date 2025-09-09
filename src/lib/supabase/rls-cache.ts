'use client';

/**
 * RLS Policy Result Caching
 * Implements client-side caching for Row Level Security policy results
 * to reduce database load and improve query performance
 */

import { createClient } from '@supabase/supabase-js';

interface UserAuthContext {
  user_id: string;
  team_id: string | null;
  role: string;
  is_active: boolean;
  can_create_orders: boolean;
  can_view_all_orders: boolean;
  can_edit_orders: boolean;
  can_delete_orders: boolean;
  can_manage_team: boolean;
  can_view_analytics: boolean;
  last_refreshed: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface RLSCacheConfig {
  /**
   * Cache TTL in milliseconds
   */
  defaultTtl: number;
  
  /**
   * Maximum cache size (number of entries)
   */
  maxSize: number;
  
  /**
   * Enable performance monitoring
   */
  enableMonitoring: boolean;
  
  /**
   * Cache invalidation strategy
   */
  invalidationStrategy: 'ttl' | 'manual' | 'hybrid';
}

export class RLSPolicyCache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: RLSCacheConfig;
  private hitCount = 0;
  private missCount = 0;
  private supabase: any;

  constructor(supabaseClient: any, config: Partial<RLSCacheConfig> = {}) {
    this.supabase = supabaseClient;
    this.config = {
      defaultTtl: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000,
      enableMonitoring: true,
      invalidationStrategy: 'hybrid',
      ...config
    };

    // Clean up expired entries periodically
    setInterval(() => this.cleanupExpiredEntries(), 60000); // Every minute
  }

  /**
   * Get cached user authentication context
   */
  async getUserAuthContext(userId: string): Promise<UserAuthContext | null> {
    const cacheKey = `auth_context:${userId}`;
    
    // Try cache first
    const cached = this.get<UserAuthContext>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Fetch from materialized view for better performance
      const { data, error } = await this.supabase
        .from('user_auth_context')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('Failed to fetch user auth context:', error);
        return null;
      }

      // Cache the result
      this.set(cacheKey, data, this.config.defaultTtl);
      return data;
    } catch (error) {
      console.error('Error fetching user auth context:', error);
      return null;
    }
  }

  /**
   * Check if user has specific team permission (with caching)
   */
  async hasTeamPermission(
    userId: string, 
    teamId: string, 
    permission: string
  ): Promise<boolean> {
    const cacheKey = `team_permission:${userId}:${teamId}:${permission}`;
    
    // Try cache first
    const cached = this.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      // Use optimized RLS function
      const { data, error } = await this.supabase.rpc('auth_has_team_permission', {
        permission_name: permission
      });

      if (error) {
        console.warn('Failed to check team permission:', error);
        return false;
      }

      const hasPermission = Boolean(data);
      
      // Cache the result with shorter TTL for permissions
      this.set(cacheKey, hasPermission, this.config.defaultTtl / 2);
      return hasPermission;
    } catch (error) {
      console.error('Error checking team permission:', error);
      return false;
    }
  }

  /**
   * Check if user can access team data (with caching)
   */
  async canAccessTeam(userId: string, teamId: string): Promise<boolean> {
    const cacheKey = `team_access:${userId}:${teamId}`;
    
    // Try cache first
    const cached = this.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const { data, error } = await this.supabase.rpc('auth_can_access_team', {
        target_team_id: teamId
      });

      if (error) {
        console.warn('Failed to check team access:', error);
        return false;
      }

      const canAccess = Boolean(data);
      
      // Cache the result
      this.set(cacheKey, canAccess, this.config.defaultTtl);
      return canAccess;
    } catch (error) {
      console.error('Error checking team access:', error);
      return false;
    }
  }

  /**
   * Cache a query result with RLS context
   */
  cacheQueryResult<T>(
    query: string, 
    params: Record<string, any>, 
    result: T,
    ttl?: number
  ): void {
    const cacheKey = this.generateQueryKey(query, params);
    this.set(cacheKey, result, ttl || this.config.defaultTtl);
  }

  /**
   * Get cached query result
   */
  getCachedQueryResult<T>(
    query: string, 
    params: Record<string, any>
  ): T | null {
    const cacheKey = this.generateQueryKey(query, params);
    return this.get<T>(cacheKey);
  }

  /**
   * Generic cache get with TTL check
   */
  private get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.recordCacheMiss();
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.recordCacheMiss();
      return null;
    }

    this.recordCacheHit();
    return entry.data as T;
  }

  /**
   * Generic cache set with TTL
   */
  private set<T>(key: string, data: T, ttl: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldestEntries();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of Array.from(this.cache.keys())) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Invalidate user-specific cache entries
   */
  invalidateUserCache(userId: string): void {
    this.invalidateByPattern(`.*:${userId}:.*|.*:${userId}$`);
  }

  /**
   * Invalidate team-specific cache entries
   */
  invalidateTeamCache(teamId: string): void {
    this.invalidateByPattern(`.*:${teamId}:.*|.*:${teamId}$`);
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    this.cache.clear();
    this.resetMetrics();
  }

  /**
   * Get cache performance metrics
   */
  getMetrics() {
    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0;

    return {
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheSize: this.cache.size,
      maxSize: this.config.maxSize,
      utilizationRate: Math.round((this.cache.size / this.config.maxSize) * 100),
    };
  }

  /**
   * Generate cache key for queries
   */
  private generateQueryKey(query: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = params[key];
        return sorted;
      }, {} as Record<string, any>);

    return `query:${query}:${JSON.stringify(sortedParams)}`;
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.timestamp + entry.ttl) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (this.config.enableMonitoring && keysToDelete.length > 0) {

    }
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toEvict = Math.floor(this.config.maxSize * 0.1); // Evict 10% of entries
    
    for (let i = 0; i < toEvict && entries.length > 0; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private recordCacheHit(): void {
    this.hitCount++;
  }

  private recordCacheMiss(): void {
    this.missCount++;
  }

  private resetMetrics(): void {
    this.hitCount = 0;
    this.missCount = 0;
  }
}

/**
 * Global RLS cache instance
 */
let rlsCacheInstance: RLSPolicyCache | null = null;

/**
 * Initialize RLS cache with Supabase client
 */
export function initializeRLSCache(
  supabaseClient: any, 
  config?: Partial<RLSCacheConfig>
): RLSPolicyCache {
  if (rlsCacheInstance) {
    return rlsCacheInstance;
  }

  rlsCacheInstance = new RLSPolicyCache(supabaseClient, config);
  
  // Set up automatic invalidation on authentication changes
  supabaseClient.auth.onAuthStateChange((event: string, session: any) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
      rlsCacheInstance?.clearAll();
    } else if (event === 'SIGNED_IN' && session?.user?.id) {
      // Clear any stale user-specific cache
      rlsCacheInstance?.invalidateUserCache(session.user.id);
    }
  });

  return rlsCacheInstance;
}

/**
 * Get RLS cache instance
 */
export function getRLSCache(): RLSPolicyCache | null {
  return rlsCacheInstance;
}

/**
 * Hook for React components to use RLS cache
 */
export function useRLSCache() {
  if (!rlsCacheInstance) {
    throw new Error('RLS cache not initialized. Call initializeRLSCache first.');
  }
  
  return rlsCacheInstance;
}

export default RLSPolicyCache;