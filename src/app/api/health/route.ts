import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { generalApiRateLimit, withRateLimit } from '@/lib/middleware/rate-limit';
import { createSuccessResponse, createErrorResponse } from '@/lib/validation/api-middleware';

export const GET = withRateLimit(generalApiRateLimit)(async (request: NextRequest) => {
  try {
    const startTime = Date.now();
    
    // Check database connectivity
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    const dbLatency = Date.now() - startTime;

    if (error) {
      return createErrorResponse(
        'Health check failed',
        'HEALTH_CHECK_FAILED',
        503,
        {
          checks: {
            database: {
              status: 'fail',
              latency: dbLatency,
              error: error.message,
            },
          },
        }
      );
    }

    // Check if response time is acceptable
    const isHealthy = dbLatency < 1000; // 1 second threshold

    const healthData = {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'pass',
          latency: dbLatency,
        },
        memory: {
          status: 'pass',
          usage: process.memoryUsage(),
        },
      },
    };

    const response = isHealthy 
      ? createSuccessResponse(healthData, 200)
      : createErrorResponse('System degraded', 'DEGRADED_PERFORMANCE', 503, healthData);

    // Add cache control headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return response;

  } catch (error) {
    return createErrorResponse(
      'Health check failed',
      'HEALTH_CHECK_ERROR',
      503,
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    );
  }
});