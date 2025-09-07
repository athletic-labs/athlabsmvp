import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseConfig } from '@/lib/config/env';

// Connection pool configuration
const CONNECTION_POOL_CONFIG = {
  // Maximum number of connections in the pool
  max: 20,
  // Minimum number of connections to maintain
  min: 2,
  // Maximum time a connection can be idle before being released (30 seconds)
  idleTimeoutMillis: 30000,
  // Maximum time to wait for a connection from the pool (5 seconds)
  connectionTimeoutMillis: 5000,
  // How often to run idle cleanup (10 seconds)
  reapIntervalMillis: 10000,
  // Enable connection validation
  validate: true,
  // Maximum lifetime of a connection (30 minutes)
  maxLifetimeSeconds: 30 * 60,
};

// Global connection pool for server-side connections
let serverClientPool: Map<string, { client: any; lastUsed: number; created: number }> | null = null;

function initializePool() {
  if (!serverClientPool) {
    serverClientPool = new Map();
    
    // Cleanup idle connections every 10 seconds
    setInterval(() => {
      if (!serverClientPool) return;
      
      const now = Date.now();
      const entries = Array.from(serverClientPool.entries());
      
      entries.forEach(([key, { lastUsed, created }]) => {
        const idleTime = now - lastUsed;
        const lifetime = now - created;
        
        // Remove idle connections or those that have exceeded max lifetime
        if (idleTime > CONNECTION_POOL_CONFIG.idleTimeoutMillis || 
            lifetime > CONNECTION_POOL_CONFIG.maxLifetimeSeconds * 1000) {
          serverClientPool?.delete(key);
        }
      });
      
      // Log pool stats in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DB Pool] Active connections: ${serverClientPool.size}/${CONNECTION_POOL_CONFIG.max}`);
      }
    }, CONNECTION_POOL_CONFIG.reapIntervalMillis);
  }
}

export function createSupabaseServerClient() {
  // For server components, we still need to create fresh clients due to cookies dependency
  return createServerComponentClient({ 
    cookies,
  });
}

// Optimized server client for API routes and server actions
export function createSupabaseServerClientOptimized(sessionId?: string) {
  initializePool();
  
  if (!serverClientPool) {
    throw new Error('Connection pool not initialized');
  }
  
  // Use session ID as key, or fallback to 'default'
  const poolKey = sessionId || 'default';
  
  // Check if we have a valid pooled connection
  const pooled = serverClientPool.get(poolKey);
  if (pooled) {
    const now = Date.now();
    const idleTime = now - pooled.lastUsed;
    const lifetime = now - pooled.created;
    
    // Return pooled connection if it's still valid
    if (idleTime < CONNECTION_POOL_CONFIG.idleTimeoutMillis && 
        lifetime < CONNECTION_POOL_CONFIG.maxLifetimeSeconds * 1000) {
      pooled.lastUsed = now;
      return pooled.client;
    } else {
      // Remove expired connection
      serverClientPool.delete(poolKey);
    }
  }
  
  // Check pool size limit
  if (serverClientPool.size >= CONNECTION_POOL_CONFIG.max) {
    // Remove oldest connection
    let oldestKey = '';
    let oldestTime = Date.now();
    
    const entries = Array.from(serverClientPool.entries());
    for (const [key, { lastUsed }] of entries) {
      if (lastUsed < oldestTime) {
        oldestTime = lastUsed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      serverClientPool.delete(oldestKey);
    }
  }
  
  // Create new connection
  const client = createServerComponentClient({ 
    cookies,
  });
  
  // Add to pool
  const now = Date.now();
  serverClientPool.set(poolKey, {
    client,
    lastUsed: now,
    created: now,
  });
  
  return client;
}

// Health check function for monitoring
export function getConnectionPoolStats() {
  if (!serverClientPool) {
    return {
      active: 0,
      max: CONNECTION_POOL_CONFIG.max,
      health: 'uninitialized'
    };
  }
  
  const now = Date.now();
  let activeConnections = 0;
  let idleConnections = 0;
  
  const values = Array.from(serverClientPool.values());
  for (const { lastUsed } of values) {
    const idleTime = now - lastUsed;
    if (idleTime < CONNECTION_POOL_CONFIG.idleTimeoutMillis) {
      activeConnections++;
    } else {
      idleConnections++;
    }
  }
  
  return {
    active: activeConnections,
    idle: idleConnections,
    total: serverClientPool.size,
    max: CONNECTION_POOL_CONFIG.max,
    health: serverClientPool.size < CONNECTION_POOL_CONFIG.max ? 'healthy' : 'at-capacity'
  };
}