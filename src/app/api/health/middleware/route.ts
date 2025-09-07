import { NextRequest, NextResponse } from 'next/server';
import { middlewareCacheManager } from '@/lib/middleware/cache-manager';

export async function GET(request: NextRequest) {
  try {
    // Get middleware cache statistics
    const middlewareStats = middlewareCacheManager.getStats();
    const insights = middlewareCacheManager.getPerformanceInsights();
    
    return NextResponse.json({
      status: 'healthy',
      middleware: {
        cache: {
          totalEntries: middlewareStats.totalEntries,
          hitRate: `${(middlewareStats.hitRate * 100).toFixed(1)}%`,
          hits: middlewareStats.hits,
          misses: middlewareStats.misses,
          memoryUsage: `${(middlewareStats.memoryEstimate / 1024).toFixed(1)}KB`,
          maxSize: middlewareStats.maxSize,
          ttl: `${middlewareStats.ttl / 1000}s`,
        },
        performance: {
          insights,
          optimizations: [
            'Database queries reduced from 4-5 to 1-2 per request',
            'In-memory caching with 5-minute TTL',
            'Asynchronous audit logging',
            'Connection pooling enabled',
          ],
        },
      },
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('[Health Check] Middleware check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      middleware: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

