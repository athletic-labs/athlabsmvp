import { NextRequest, NextResponse } from 'next/server';
import { getConnectionPoolStats } from '@/lib/supabase/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get connection pool statistics
    const poolStats = getConnectionPoolStats();
    
    // Test database connectivity
    const startTime = Date.now();
    const supabase = createSupabaseServerClient();
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return NextResponse.json({
        status: 'unhealthy',
        database: {
          connected: false,
          error: error.message,
          responseTime,
        },
        connectionPool: poolStats,
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }
    
    // Determine overall health status
    const isHealthy = poolStats.health === 'healthy' && responseTime < 1000;
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      database: {
        connected: true,
        responseTime,
        performance: responseTime < 500 ? 'excellent' : 
                    responseTime < 1000 ? 'good' : 'poor',
      },
      connectionPool: {
        ...poolStats,
        utilization: (poolStats.total || 0) / poolStats.max,
        recommendations: getPoolRecommendations(poolStats),
      },
      timestamp: new Date().toISOString(),
    }, { 
      status: isHealthy ? 200 : 206,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('[Health Check] Database check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      connectionPool: getConnectionPoolStats(),
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}

function getPoolRecommendations(stats: any) {
  const recommendations = [];
  
  if (stats.utilization > 0.8) {
    recommendations.push('High connection pool utilization - consider scaling');
  }
  
  if (stats.health === 'at-capacity') {
    recommendations.push('Connection pool at capacity - increase max connections');
  }
  
  if (stats.idle > stats.active * 2) {
    recommendations.push('Many idle connections - consider reducing idle timeout');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Connection pool operating optimally');
  }
  
  return recommendations;
}