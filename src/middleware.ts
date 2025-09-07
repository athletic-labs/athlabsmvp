import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { createSupabaseServerClientOptimized } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { middlewareCacheManager, type CachedUserData } from '@/lib/middleware/cache-manager';
import { corsMiddleware } from '@/lib/middleware/cors-middleware';
import { inputSanitizer } from '@/lib/security/input-sanitizer';

// Define protected routes and their required permissions
const PROTECTED_ROUTES = {
  '/dashboard': { requiresAuth: true, roles: ['team_staff', 'team_admin', 'athletic_labs_admin', 'athletic_labs_staff'] },
  '/new-order': { requiresAuth: true, roles: ['team_staff', 'team_admin'], permissions: ['can_create_orders'] },
  '/saved-templates': { requiresAuth: true, roles: ['team_staff', 'team_admin'] },
  '/calendar': { requiresAuth: true, roles: ['team_staff', 'team_admin'] },
  '/order-history': { requiresAuth: true, roles: ['team_staff', 'team_admin'] },
  '/settings': { requiresAuth: true, roles: ['team_staff', 'team_admin', 'athletic_labs_admin', 'athletic_labs_staff'] },
  '/admin': { requiresAuth: true, roles: ['athletic_labs_admin'] },
  '/team-management': { requiresAuth: true, roles: ['team_admin', 'athletic_labs_admin'], permissions: ['can_manage_team'] },
  '/analytics': { requiresAuth: true, roles: ['team_admin', 'athletic_labs_admin'], permissions: ['can_view_analytics'] },
} as const;

// API routes that require authentication
const PROTECTED_API_ROUTES = {
  '/api/orders': { requiresAuth: true, roles: ['team_staff', 'team_admin'] },
  '/api/templates': { requiresAuth: true, roles: ['team_staff', 'team_admin'] },
  '/api/teams': { requiresAuth: true, roles: ['team_admin', 'athletic_labs_admin'] },
  '/api/analytics': { requiresAuth: true, roles: ['team_admin', 'athletic_labs_admin'] },
  '/api/admin': { requiresAuth: true, roles: ['athletic_labs_admin'] },
} as const;

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/client-ip',
  '/api/health',
];

// Optimized function to get user data with caching
async function getCachedUserData(userId: string, supabase: any): Promise<CachedUserData | null> {
  // Check cache first
  const cached = middlewareCacheManager.get(userId);
  if (cached) {
    return cached;
  }

  try {
    // Single optimized query with JOIN for better performance
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        team_id,
        is_active,
        teams!inner (
          is_active
        )
      `)
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    // Cache the result
    const userData: CachedUserData = {
      profile: {
        id: data.id,
        role: data.role,
        team_id: data.team_id,
        is_active: data.is_active,
      },
      team: data.teams ? { is_active: data.teams.is_active } : undefined,
      expires: Date.now() + (5 * 60 * 1000), // 5 minutes
    };

    middlewareCacheManager.set(userId, userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Helper function to perform basic threat detection on request data
async function performThreatDetection(request: NextRequest): Promise<{ threats: string[]; severity: 'low' | 'medium' | 'high' | 'critical'; isClean: boolean } | null> {
  try {
    // Check URL parameters
    const searchParams = request.nextUrl.searchParams;
    const entries = Array.from(searchParams.entries());
    for (const [key, value] of entries) {
      const threatResult = inputSanitizer.detectThreats(value);
      if (!threatResult.isClean) {
        return threatResult;
      }
    }

    // Check request body for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.clone().text();
        if (body) {
          const threatResult = inputSanitizer.detectThreats(body);
          if (!threatResult.isClean) {
            return threatResult;
          }
        }
      } catch {
        // If body parsing fails, continue without checking
      }
    }

    return { threats: [], severity: 'low', isClean: true };
  } catch (error) {
    console.error('Error in threat detection:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  try {
    // Handle CORS for API routes first
    const corsResponse = corsMiddleware(request);
    if (corsResponse) {
      return corsResponse;
    }

    // Apply input sanitization for API routes with potential threats
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/api/') && request.method !== 'GET') {
      const threatCheck = await performThreatDetection(request);
      if (threatCheck && !threatCheck.isClean) {
        console.warn('[Security] Threat detected in middleware:', {
          path: pathname,
          method: request.method,
          threats: threatCheck.threats,
          severity: threatCheck.severity,
          ip: getClientIP(request),
        });
        
        if (threatCheck.severity === 'critical' || threatCheck.severity === 'high') {
          return new NextResponse(
            JSON.stringify({
              error: 'Request blocked due to security concerns',
              code: 'THREAT_DETECTED',
              timestamp: new Date().toISOString(),
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                'X-Security-Block': 'threat-detected',
              },
            }
          );
        }
      }
    }

    // Skip middleware for static files and Next.js internals
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.includes('.') ||
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next();
    }

    // Check if route is public
    if (PUBLIC_ROUTES.includes(pathname)) {
      return NextResponse.next();
    }

    // Create optimized Supabase client with connection pooling
    const supabase = createSupabaseServerClientOptimized();

    // Get session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    // Handle session errors
    if (sessionError) {
      console.error('Session error in middleware:', sessionError);
      return redirectToLogin(request);
    }

    // Check if user is authenticated
    if (!session?.user) {
      console.log(`No session for ${pathname}, redirecting to login`);
      return redirectToLogin(request);
    }

    console.log(`Middleware: authenticated user ${session.user.id} accessing ${pathname}`);

    // Get cached user data (single optimized query)
    const userData = await getCachedUserData(session.user.id, supabase);
    
    if (!userData) {
      console.error('Could not fetch user profile');
      return redirectToLogin(request);
    }

    const { profile, team } = userData;

    // Check if user account is active
    if (!profile.is_active) {
      return redirectToError(request, 'account-suspended');
    }

    // Check if user's team is active (if they have a team)
    if (profile.team_id && team && !team.is_active) {
      return redirectToError(request, 'team-suspended');
    }

    // Check route-specific permissions
    const routeConfig = getRouteConfig(pathname);
    if (routeConfig) {
      // Check role requirements
      if (routeConfig.roles && !routeConfig.roles.includes(profile.role as never)) {
        return redirectToError(request, 'insufficient-permissions');
      }

      // Check specific permissions if required
      const permissions = (routeConfig as any).permissions;
      if (permissions && profile.team_id) {
        const hasPermission = await checkUserPermissionsOptimized(
          supabase,
          session.user.id,
          profile.team_id,
          permissions,
          userData
        );

        if (!hasPermission) {
          return redirectToError(request, 'insufficient-permissions');
        }
      }
    }

    // Log access asynchronously (don't block the request)
    logAccessAsync(supabase, {
      userId: session.user.id,
      teamId: profile.team_id,
      path: pathname,
      method: request.method,
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
    }).catch(error => {
      // Log but don't block
      console.error('Async audit log failed:', error);
    });

    // Add user context to headers for downstream consumption
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.user.id);
    requestHeaders.set('x-user-role', profile.role);
    if (profile.team_id) {
      requestHeaders.set('x-team-id', profile.team_id);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Middleware error:', error);
    return redirectToError(request, 'system-error');
  }
}

// Helper functions
function getRouteConfig(pathname: string) {
  // Check exact matches first
  if (PROTECTED_ROUTES[pathname as keyof typeof PROTECTED_ROUTES]) {
    return PROTECTED_ROUTES[pathname as keyof typeof PROTECTED_ROUTES];
  }

  // Check API routes
  for (const [route, config] of Object.entries(PROTECTED_API_ROUTES)) {
    if (pathname.startsWith(route)) {
      return config;
    }
  }

  // Check dynamic routes
  for (const [route, config] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route.split('[')[0])) {
      return config;
    }
  }

  return null;
}

async function checkUserPermissionsOptimized(
  supabase: any,
  userId: string,
  teamId: string,
  requiredPermissions: string[],
  userData: CachedUserData
): Promise<boolean> {
  try {
    // Check if permissions are already cached
    if (userData.permissions) {
      return requiredPermissions.every(permission => {
        return userData.permissions![permission] === true;
      });
    }

    // Fetch permissions if not cached
    const { data: permissions, error } = await supabase
      .from('team_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('team_id', teamId)
      .single();

    if (error || !permissions) {
      return false;
    }

    // Cache permissions for future use
    userData.permissions = permissions;
    middlewareCacheManager.set(userId, userData);

    // Check if user has all required permissions
    return requiredPermissions.every(permission => {
      return permissions[permission] === true;
    });
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

// Async function for non-blocking audit logging
async function logAccessAsync(
  supabase: any,
  accessLog: {
    userId: string;
    teamId: string | null;
    path: string;
    method: string;
    ip: string | null;
    userAgent: string | null;
  }
): Promise<void> {
  // Use a separate connection for audit logging to avoid blocking main request
  const auditSupabase = createSupabaseServerClientOptimized();
  
  try {
    await auditSupabase
      .from('audit_logs')
      .insert({
        user_id: accessLog.userId,
        team_id: accessLog.teamId,
        action: 'access',
        resource_type: 'route',
        resource_id: accessLog.path,
        metadata: {
          method: accessLog.method,
          ip_address: accessLog.ip,
          user_agent: accessLog.userAgent,
        },
      });
  } catch (error) {
    // Don't block requests if audit logging fails
    console.error('Failed to log access:', error);
  }
}

function getClientIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');
  
  return forwarded 
    ? forwarded.split(',')[0].trim()
    : realIP || clientIP || request.ip || null;
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function redirectToError(request: NextRequest, errorType: string) {
  const errorUrl = new URL('/error', request.url);
  errorUrl.searchParams.set('type', errorType);
  return NextResponse.redirect(errorUrl);
}

// Configure which paths should be processed by middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};