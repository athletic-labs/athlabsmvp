import { NextRequest, NextResponse } from 'next/server';
import { cacheManager } from '@/lib/cache/redis-client';

export async function GET(request: NextRequest) {
  try {
    // Get cache statistics
    const stats = await cacheManager.getStats();
    
    // Test cache functionality
    const testKey = `health-check:${Date.now()}`;
    const testValue = { timestamp: new Date().toISOString(), test: true };
    
    // Test set operation
    const setSuccess = await cacheManager.set(testKey, testValue, 60);
    
    // Test get operation
    const retrieved = await cacheManager.get(testKey);
    
    // Test delete operation
    const deleteSuccess = await cacheManager.del(testKey);
    
    // Determine overall health
    const isHealthy = stats.connected && setSuccess && retrieved && deleteSuccess;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      cache: {
        connected: stats.connected,
        totalKeys: stats.totalKeys,
        memoryUsage: stats.memoryUsage,
        operations: {
          set: setSuccess,
          get: !!retrieved,
          delete: deleteSuccess,
        },
        testResults: {
          setValue: testValue,
          retrievedValue: retrieved,
          valuesMatch: JSON.stringify(testValue) === JSON.stringify(retrieved),
        },
      },
      timestamp: new Date().toISOString(),
    };

    // Generate recommendations based on health
    const recommendations = [];
    
    if (!stats.connected) {
      recommendations.push('CRITICAL: Redis connection failed - check Redis configuration');
    }
    
    if (stats.totalKeys > 10000) {
      recommendations.push('WARNING: High number of cached keys - consider cache cleanup');
    }
    
    if (stats.memoryUsage && parseFloat(stats.memoryUsage.replace(/[^\d.]/g, '')) > 100) {
      recommendations.push('WARNING: High Redis memory usage - monitor memory consumption');
    }
    
    if (!setSuccess || !retrieved || !deleteSuccess) {
      recommendations.push('ERROR: Cache operations failing - check Redis permissions and connectivity');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Cache is operating optimally');
    }

    return NextResponse.json({
      ...healthData,
      recommendations,
    }, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('[Health Check] Cache health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      cache: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
      recommendations: [
        'CRITICAL: Cache system is completely unavailable',
        'Check Redis configuration and connectivity',
        'Verify REDIS_URL environment variable',
      ],
    }, { status: 503 });
  }
}