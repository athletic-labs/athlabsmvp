import { NextRequest, NextResponse } from 'next/server';
import { getCorsConfig, validateCorsConfig, isOriginAllowed } from '@/lib/middleware/cors-config';

export async function GET(request: NextRequest) {
  try {
    const corsConfig = getCorsConfig();
    const validation = validateCorsConfig(corsConfig);
    const origin = request.headers.get('origin') || 'no-origin';
    const isCurrentOriginAllowed = origin !== 'no-origin' ? isOriginAllowed(origin, corsConfig) : false;

    const healthData = {
      status: validation.isValid ? 'healthy' : 'warning',
      cors: {
        config: {
          origins: Array.isArray(corsConfig.origin) ? corsConfig.origin.length : corsConfig.origin,
          methods: corsConfig.methods.length,
          allowedHeaders: corsConfig.allowedHeaders.length,
          exposedHeaders: corsConfig.exposedHeaders.length,
          credentials: corsConfig.credentials,
          maxAge: corsConfig.maxAge,
        },
        validation: {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
        },
        currentRequest: {
          origin,
          isOriginAllowed: isCurrentOriginAllowed,
          method: request.method,
          userAgent: request.headers.get('user-agent')?.substring(0, 100) || 'unknown',
        },
      },
      timestamp: new Date().toISOString(),
    };

    // Generate recommendations
    const recommendations = [];
    
    if (validation.errors.length > 0) {
      recommendations.push('CRITICAL: CORS configuration has errors that must be fixed');
    }
    
    if (validation.warnings.length > 0) {
      recommendations.push('WARNING: CORS configuration has security warnings');
    }
    
    if (!isCurrentOriginAllowed && origin !== 'no-origin') {
      recommendations.push(`Current origin (${origin}) is not allowed by CORS policy`);
    }
    
    if (corsConfig.credentials && typeof corsConfig.origin === 'boolean' && corsConfig.origin) {
      recommendations.push('CRITICAL: Credentials with wildcard origin is not secure');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('CORS configuration is secure and properly configured');
    }

    return NextResponse.json({
      ...healthData,
      recommendations,
    }, { 
      status: validation.isValid ? 200 : 400,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('[Health Check] CORS health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      cors: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: new Date().toISOString(),
      recommendations: [
        'CRITICAL: CORS system is experiencing issues',
        'Check CORS configuration and middleware setup',
      ],
    }, { status: 500 });
  }
}

// Handle preflight for this endpoint
export async function OPTIONS(request: NextRequest) {
  const corsConfig = getCorsConfig();
  const origin = request.headers.get('origin');
  
  const response = new NextResponse(null, { status: 204 });
  
  // Test CORS functionality
  if (origin && isOriginAllowed(origin, corsConfig)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Access-Control-Max-Age', '300');
    
    if (corsConfig.credentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }
  
  return response;
}