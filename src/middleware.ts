import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal public routes
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/debug',
  '/login-simple',
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

    // Create Supabase middleware client
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });

    // Get session
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession();

    // Redirect to login if no session
    if (sessionError || !session?.user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Allow access for authenticated users
    return NextResponse.next();

  } catch (error) {
    // On any error, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};