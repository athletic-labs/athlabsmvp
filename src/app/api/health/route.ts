import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
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
      return NextResponse.json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: 'fail',
            latency: dbLatency,
            error: error.message,
          },
        },
      }, { status: 503 });
    }

    // Check if response time is acceptable
    const isHealthy = dbLatency < 1000; // 1 second threshold

    return NextResponse.json({
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
    }, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 503 });
  }
}