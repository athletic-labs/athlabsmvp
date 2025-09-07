import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

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

    // Create Supabase client
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });

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
      return redirectToLogin(request);
    }

    // Get user profile with role and team information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        team_id,
        is_active,
        teams:team_id (
          id,
          name,
          is_active
        )
      `)
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error in middleware:', profileError);
      return redirectToLogin(request);
    }

    // Check if user account is active
    if (!profile.is_active) {
      return redirectToError(request, 'account-suspended');
    }

    // Check if user's team is active (if they have a team)
    if (profile.team_id && profile.teams && !profile.teams.is_active) {
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
        const hasPermission = await checkUserPermissions(
          supabase,
          session.user.id,
          profile.team_id,
          permissions
        );

        if (!hasPermission) {
          return redirectToError(request, 'insufficient-permissions');
        }
      }
    }

    // Log access for audit purposes
    await logAccess(supabase, {
      userId: session.user.id,
      teamId: profile.team_id,
      path: pathname,
      method: request.method,
      ip: getClientIP(request),
      userAgent: request.headers.get('user-agent'),
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

async function checkUserPermissions(
  supabase: any,
  userId: string,
  teamId: string,
  requiredPermissions: string[]
): Promise<boolean> {
  try {
    const { data: permissions, error } = await supabase
      .from('team_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('team_id', teamId)
      .single();

    if (error || !permissions) {
      return false;
    }

    // Check if user has all required permissions
    return requiredPermissions.every(permission => {
      return permissions[permission] === true;
    });
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

async function logAccess(
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
  try {
    await supabase
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