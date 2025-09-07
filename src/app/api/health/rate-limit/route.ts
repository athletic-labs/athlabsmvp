import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitHealthCheck, rateLimitEnvironment } from '@/lib/middleware/adaptive-rate-limit';
import { checkRateLimitHealth } from '@/lib/middleware/distributed-rate-limit';

export async function GET(request: NextRequest) {
  try {
    // Test distributed rate limit health
    const distributedHealth = await checkRateLimitHealth();
    
    // Get environment info
    const environment = rateLimitEnvironment;
    
    // Test basic functionality
    const testResults = {
      distributedRateLimit: distributedHealth,
      environment: {
        strategy: environment.selectedStrategy,
        isProduction: environment.isProduction,
        hasRedis: environment.hasRedis,
        isDistributed: environment.isDistributedDeployment,
        version: environment.version
      },
      timestamp: new Date().toISOString()
    };

    // Determine overall health
    const isHealthy = distributedHealth.status === 'healthy';
    const overallStatus = isHealthy ? 'healthy' : 
      distributedHealth.status === 'degraded' ? 'degraded' : 'unhealthy';

    return NextResponse.json({
      status: overallStatus,
      rateLimiting: testResults,
      recommendations: generateRecommendations(testResults),
    }, { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('[Health Check] Rate limit health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      rateLimiting: {
        error: error instanceof Error ? error.message : 'Unknown error',
        environment: rateLimitEnvironment,
        timestamp: new Date().toISOString()
      }
    }, { status: 503 });
  }
}

function generateRecommendations(testResults: any): string[] {
  const recommendations: string[] = [];
  
  if (!testResults.environment.isProduction && !testResults.environment.hasRedis) {
    recommendations.push('Consider setting up Redis for development testing of distributed rate limiting');
  }
  
  if (testResults.environment.isProduction && !testResults.environment.hasRedis) {
    recommendations.push('CRITICAL: Set up Redis for production distributed rate limiting');
  }
  
  if (testResults.distributedRateLimit.status === 'degraded') {
    recommendations.push('Rate limiting response time is elevated - monitor performance');
  }
  
  if (testResults.distributedRateLimit.status === 'unhealthy') {
    recommendations.push('URGENT: Rate limiting system is experiencing issues - check logs and connections');
  }
  
  if (testResults.environment.strategy === 'memory' && testResults.environment.isDistributed) {
    recommendations.push('Using memory-based rate limiting on distributed deployment - consider Redis');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Rate limiting system is operating optimally');
  }
  
  return recommendations;
}