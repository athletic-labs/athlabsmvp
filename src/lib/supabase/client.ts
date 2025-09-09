import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabaseConfig } from '@/lib/config/env';

// Client-side connection pool configuration
const CLIENT_POOL_CONFIG = {
  max: 5, // Smaller pool for client-side
  idleTimeoutMillis: 60000, // 1 minute for client-side
  maxLifetimeSeconds: 10 * 60, // 10 minutes max lifetime
};

// Global client pool for browser-side connections
let clientPool: Map<string, { client: any; lastUsed: number; created: number }> | null = null;

function initializeClientPool() {
  if (typeof window === 'undefined') return; // Server-side guard
  
  if (!clientPool) {
    clientPool = new Map();
    
    // Client-side cleanup interval
    setInterval(() => {
      if (!clientPool) return;
      
      const now = Date.now();
      const entries = Array.from(clientPool.entries());
      
      entries.forEach(([key, { lastUsed, created }]) => {
        const idleTime = now - lastUsed;
        const lifetime = now - created;
        
        if (idleTime > CLIENT_POOL_CONFIG.idleTimeoutMillis || 
            lifetime > CLIENT_POOL_CONFIG.maxLifetimeSeconds * 1000) {
          clientPool?.delete(key);
        }
      });
      
      // Development logging
      if (process.env.NODE_ENV === 'development') {

      }
    }, 30000); // Check every 30 seconds
  }
}

export const createSupabaseClient = () => {
  return createClientComponentClient({
    supabaseUrl: supabaseConfig.url,
    supabaseKey: supabaseConfig.anonKey,
  });
};

// Optimized client for heavy operations (file uploads, bulk operations)
export const createSupabaseClientOptimized = (userId?: string) => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return createSupabaseClient();
  }
  
  initializeClientPool();
  
  if (!clientPool) {
    return createSupabaseClient(); // Fallback if pool init fails
  }
  
  // Use user ID as pool key, or fallback to 'anonymous'
  const poolKey = userId || 'anonymous';
  
  // Check for valid pooled connection
  const pooled = clientPool.get(poolKey);
  if (pooled) {
    const now = Date.now();
    const idleTime = now - pooled.lastUsed;
    const lifetime = now - pooled.created;
    
    if (idleTime < CLIENT_POOL_CONFIG.idleTimeoutMillis && 
        lifetime < CLIENT_POOL_CONFIG.maxLifetimeSeconds * 1000) {
      pooled.lastUsed = now;
      return pooled.client;
    } else {
      clientPool.delete(poolKey);
    }
  }
  
  // Pool size management
  if (clientPool.size >= CLIENT_POOL_CONFIG.max) {
    // Remove oldest connection
    let oldestKey = '';
    let oldestTime = Date.now();
    
    const entries = Array.from(clientPool.entries());
    for (const [key, { lastUsed }] of entries) {
      if (lastUsed < oldestTime) {
        oldestTime = lastUsed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      clientPool.delete(oldestKey);
    }
  }
  
  // Create optimized client
  const client = createClientComponentClient({
    supabaseUrl: supabaseConfig.url,
    supabaseKey: supabaseConfig.anonKey,
  });
  
  // Add to pool
  const now = Date.now();
  clientPool.set(poolKey, {
    client,
    lastUsed: now,
    created: now,
  });
  
  return client;
};

export function useSupabase() {
  const supabase = createSupabaseClient();
  return { supabase };
}

// Hook for optimized client (for heavy operations)
export function useSupabaseOptimized(userId?: string) {
  const supabase = createSupabaseClientOptimized(userId);
  return { supabase };
}

// Client-side pool stats
export function getClientPoolStats() {
  if (typeof window === 'undefined' || !clientPool) {
    return {
      active: 0,
      max: CLIENT_POOL_CONFIG.max,
      health: 'client-side-only'
    };
  }
  
  const now = Date.now();
  let activeConnections = 0;
  let idleConnections = 0;
  
  const values = Array.from(clientPool.values());
  for (const { lastUsed } of values) {
    const idleTime = now - lastUsed;
    if (idleTime < CLIENT_POOL_CONFIG.idleTimeoutMillis) {
      activeConnections++;
    } else {
      idleConnections++;
    }
  }
  
  return {
    active: activeConnections,
    idle: idleConnections,
    total: clientPool.size,
    max: CLIENT_POOL_CONFIG.max,
    health: clientPool.size < CLIENT_POOL_CONFIG.max ? 'healthy' : 'at-capacity'
  };
}