import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password', '/request-access'];
const adminPaths = ['/admin'];
const onboardingPath = '/onboarding';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();

  const isPublicPath = publicPaths.some(path => req.nextUrl.pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => req.nextUrl.pathname.startsWith(path));
  const isOnboardingPath = req.nextUrl.pathname.startsWith(onboardingPath);

  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (session && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (session && !isOnboardingPath && !isPublicPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed, role')
      .eq('id', session.user.id)
      .single();

    if (profile && !profile.onboarding_completed) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    if (isAdminPath) {
      const isAdmin = profile?.role === 'athletic_labs_admin' || profile?.role === 'athletic_labs_staff';
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};