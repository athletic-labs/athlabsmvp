// Middleware cache management and monitoring utilities

interface CacheStats {
  hits: number;
  misses: number;
  totalEntries: number;
  maxSize: number;
  ttl: number;
  memoryEstimate: number;
}

interface CachedUserData {
  profile: {
    id: string;
    role: string;
    team_id: string | null;
    is_active: boolean;
  };
  team?: {
    is_active: boolean;
  };
  permissions?: Record<string, boolean>;
  expires: number;
}

class MiddlewareCacheManager {
  private cache = new Map<string, CachedUserData>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalEntries: 0,
    maxSize: 1000,
    ttl: 5 * 60 * 1000, // 5 minutes
    memoryEstimate: 0,
  };
  
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute

  constructor() {
    // Start periodic cleanup
    this.startCleanup();
  }

  get(userId: string): CachedUserData | null {
    const cached = this.cache.get(userId);
    
    if (cached && cached.expires > Date.now()) {
      this.stats.hits++;
      return cached;
    }
    
    if (cached) {
      // Expired entry
      this.cache.delete(userId);
    }
    
    this.stats.misses++;
    return null;
  }

  set(userId: string, data: CachedUserData): void {
    // Check size limit and evict if necessary
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldest();
    }

    this.cache.set(userId, data);
    this.updateStats();
  }

  delete(userId: string): boolean {
    const deleted = this.cache.delete(userId);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.updateStats();
  }

  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    
    return {
      ...this.stats,
      hitRate,
      totalEntries: this.cache.size,
    };
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    const entries = Array.from(this.cache.entries());
    for (const [key, data] of entries) {
      if (data.expires < oldestTime) {
        oldestTime = data.expires;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    // Rough estimate: ~1KB per cache entry
    this.stats.memoryEstimate = this.cache.size * 1024;
  }

  private startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;
      
      const entries = Array.from(this.cache.entries());
      for (const [userId, data] of entries) {
        if (data.expires < now) {
          this.cache.delete(userId);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        this.updateStats();
        console.log(`[Middleware Cache] Cleaned ${cleanedCount} expired entries`);
      }
    }, this.CLEANUP_INTERVAL);
  }

  // Get performance insights
  getPerformanceInsights(): string[] {
    const stats = this.getStats();
    const insights = [];
    
    if (stats.hitRate < 0.7) {
      insights.push('Low cache hit rate - consider increasing TTL or optimizing cache keys');
    }
    
    if (stats.totalEntries > this.MAX_CACHE_SIZE * 0.9) {
      insights.push('Cache near capacity - consider increasing max size or reducing TTL');
    }
    
    if (stats.memoryEstimate > 10 * 1024 * 1024) { // 10MB
      insights.push('High memory usage - monitor for memory leaks');
    }
    
    if (insights.length === 0) {
      insights.push('Cache performance is optimal');
    }
    
    return insights;
  }
}

// Export singleton instance
export const middlewareCacheManager = new MiddlewareCacheManager();

// Export types for use in middleware
export type { CachedUserData };