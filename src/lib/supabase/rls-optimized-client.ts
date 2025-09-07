/**
 * RLS-Optimized Supabase Client
 * Provides enhanced Supabase client with RLS policy result caching
 * and performance optimizations for server-side operations
 */

import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';
import { RLSPolicyCache } from './rls-cache';

interface OptimizedClientConfig {
  userId?: string;
  enableCache?: boolean;
  cacheConfig?: {
    defaultTtl?: number;
    maxSize?: number;
  };
}

/**
 * Create RLS-optimized Supabase client for server-side usage
 * with caching and performance enhancements
 */
export function createRLSOptimizedSupabaseClient(config: OptimizedClientConfig = {}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    }
  );

  // Initialize RLS cache if enabled
  let rlsCache: RLSPolicyCache | null = null;
  if (config.enableCache !== false) {
    rlsCache = new RLSPolicyCache(supabase, config.cacheConfig);
  }

  // Enhanced client with RLS optimizations
  const enhancedClient = {
    ...supabase,
    
    /**
     * Optimized query method with RLS caching
     */
    async cachedQuery<T>(
      queryFn: () => Promise<{ data: T | null; error: any }>,
      cacheKey?: string,
      ttl?: number
    ): Promise<{ data: T | null; error: any }> {
      if (!rlsCache || !cacheKey) {
        return queryFn();
      }

      // Try cache first
      const cached = rlsCache.getCachedQueryResult<T>(cacheKey, {});
      if (cached) {
        return { data: cached, error: null };
      }

      // Execute query
      const result = await queryFn();
      
      // Cache successful results
      if (!result.error && result.data) {
        rlsCache.cacheQueryResult(cacheKey, {}, result.data, ttl);
      }

      return result;
    },

    /**
     * Get user's team with caching
     */
    getUserTeam: cache(async (userId: string) => {
      if (!userId) return null;

      try {
        // Use optimized function
        const { data, error } = await supabase.rpc('auth_user_team_id');
        
        if (error) {
          console.warn('Failed to get user team:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Error getting user team:', error);
        return null;
      }
    }),

    /**
     * Get user's role with caching
     */
    getUserRole: cache(async (userId: string) => {
      if (!userId) return null;

      try {
        // Use optimized function
        const { data, error } = await supabase.rpc('auth_user_role');
        
        if (error) {
          console.warn('Failed to get user role:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Error getting user role:', error);
        return null;
      }
    }),

    /**
     * Check team permission with caching
     */
    hasTeamPermission: cache(async (permission: string) => {
      try {
        if (rlsCache) {
          const session = await supabase.auth.getSession();
          const userId = session.data.session?.user?.id;
          
          if (userId) {
            // Use cached version
            const result = await rlsCache.hasTeamPermission(userId, '', permission);
            return result;
          }
        }

        // Fallback to direct query
        const { data, error } = await supabase.rpc('auth_has_team_permission', {
          permission_name: permission
        });
        
        if (error) {
          console.warn('Failed to check team permission:', error);
          return false;
        }

        return Boolean(data);
      } catch (error) {
        console.error('Error checking team permission:', error);
        return false;
      }
    }),

    /**
     * Check team access with caching
     */
    canAccessTeam: cache(async (teamId: string) => {
      if (!teamId) return false;

      try {
        const { data, error } = await supabase.rpc('auth_can_access_team', {
          target_team_id: teamId
        });
        
        if (error) {
          console.warn('Failed to check team access:', error);
          return false;
        }

        return Boolean(data);
      } catch (error) {
        console.error('Error checking team access:', error);
        return false;
      }
    }),

    /**
     * Optimized templates query with caching
     */
    async getTemplates(filters: any = {}) {
      const cacheKey = `templates:${JSON.stringify(filters)}`;
      
      return this.cachedQuery(
        () => supabase
          .from('saved_templates')
          .select(`
            id,
            name,
            description,
            items,
            times_used,
            last_used_at,
            is_favorite,
            created_at,
            updated_at,
            profiles:created_by (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false }),
        cacheKey,
        5 * 60 * 1000 // 5 minutes
      );
    },

    /**
     * Optimized orders query with caching
     */
    async getOrders(filters: any = {}) {
      const cacheKey = `orders:${JSON.stringify(filters)}`;
      
      return this.cachedQuery(
        () => supabase
          .from('orders')
          .select(`
            id,
            order_number,
            status,
            contact_name,
            delivery_date,
            delivery_time,
            estimated_guests,
            subtotal,
            total_amount,
            is_rush_order,
            created_at,
            profiles:created_by (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false }),
        cacheKey,
        2 * 60 * 1000 // 2 minutes
      );
    },

    /**
     * Get team analytics with caching
     */
    async getTeamAnalytics(teamId: string) {
      const cacheKey = `analytics:${teamId}`;
      
      return this.cachedQuery(
        () => supabase
          .from('team_order_analytics')
          .select('*')
          .eq('team_id', teamId)
          .single(),
        cacheKey,
        15 * 60 * 1000 // 15 minutes
      );
    },

    /**
     * Invalidate cache for specific patterns
     */
    invalidateCache: (pattern?: string) => {
      if (rlsCache) {
        if (pattern) {
          rlsCache.invalidateByPattern(pattern);
        } else {
          rlsCache.clearAll();
        }
      }
    },

    /**
     * Get cache performance metrics
     */
    getCacheMetrics: () => {
      return rlsCache?.getMetrics() || null;
    },

    /**
     * Get RLS performance statistics
     */
    async getRLSPerformanceStats() {
      try {
        const { data: performanceStats, error: perfError } = await supabase
          .rpc('analyze_rls_performance');
        
        const { data: cacheStats, error: cacheError } = await supabase
          .rpc('get_rls_cache_stats');

        const { data: monitoringStats, error: monitorError } = await supabase
          .rpc('monitor_rls_performance');

        return {
          performance: performanceStats || [],
          cache: cacheStats || [],
          monitoring: monitoringStats || [],
          errors: {
            performance: perfError,
            cache: cacheError,
            monitoring: monitorError
          }
        };
      } catch (error) {
        console.error('Error getting RLS performance stats:', error);
        return null;
      }
    },

    /**
     * Refresh materialized views
     */
    async refreshAnalyticsCache() {
      try {
        await supabase.rpc('refresh_team_analytics');
        await supabase.rpc('refresh_user_auth_context');
        
        // Invalidate related cache entries
        if (rlsCache) {
          rlsCache.invalidateByPattern('analytics:.*');
          rlsCache.invalidateByPattern('auth_context:.*');
        }

        return { success: true };
      } catch (error) {
        console.error('Error refreshing analytics cache:', error);
        return { success: false, error };
      }
    }
  };

  return enhancedClient;
}

/**
 * Create optimized Supabase client with user context
 */
export function createSupabaseServerClientOptimized(userId?: string) {
  return createRLSOptimizedSupabaseClient({
    userId,
    enableCache: true,
    cacheConfig: {
      defaultTtl: 5 * 60 * 1000, // 5 minutes
      maxSize: 1000
    }
  });
}

/**
 * Get cached user authentication context
 */
export const getUserAuthContext = cache(async (userId: string) => {
  if (!userId) return null;

  const supabase = createSupabaseServerClientOptimized(userId);
  
  try {
    const { data, error } = await supabase
      .from('user_auth_context')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.warn('Failed to get user auth context:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting user auth context:', error);
    return null;
  }
});

/**
 * Optimized team access check
 */
export const checkTeamAccess = cache(async (userId: string, teamId: string) => {
  if (!userId || !teamId) return false;

  const supabase = createSupabaseServerClientOptimized(userId);
  
  try {
    const canAccess = await supabase.canAccessTeam(teamId);
    return canAccess;
  } catch (error) {
    console.error('Error checking team access:', error);
    return false;
  }
});

/**
 * Optimized permission check
 */
export const checkPermission = cache(async (permission: string) => {
  const supabase = createSupabaseServerClientOptimized();
  
  try {
    const hasPermission = await supabase.hasTeamPermission(permission);
    return hasPermission;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
});

export default createRLSOptimizedSupabaseClient;